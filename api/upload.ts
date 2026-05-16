import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.split('\\n').join('\n'),
    }),
  });
}

const db = getFirestore();

function chunkText(text: string, size = 1000, overlap = 200) {
  const chunks = [];
  let start = 0, index = 0;
  while (start < text.length) {
    chunks.push({ text: text.substring(start, start + size), index });
    start += size - overlap;
    index++;
  }
  return chunks;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { fileBase64, filename, userId } = req.body;
    if (!fileBase64) return res.status(400).json({ error: 'No file data received' });

    const jobId = uuidv4();

    await db.collection('documents').doc(jobId).set({
      id: jobId,
      userId: userId || 'anonymous',
      status: 'extracting',
      progress: 30,
      message: 'Extracting text using Gemini AI...',
      filename: filename || 'document.pdf',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: fileBase64 } },
          { text: 'Extract ALL text from this PDF completely and accurately.' },
        ],
      }],
    });

    const extractedText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!extractedText || extractedText.length < 10) {
      await db.collection('documents').doc(jobId).update({
        status: 'failed',
        message: 'Could not extract text from PDF.',
        updatedAt: FieldValue.serverTimestamp(),
      });
      return res.status(500).json({ error: 'Text extraction failed' });
    }

    await db.collection('documents').doc(jobId).update({
      status: 'completed',
      progress: 100,
      message: 'Document ready!',
      text: extractedText,
      chunks: chunkText(extractedText),
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({ jobId });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
}
