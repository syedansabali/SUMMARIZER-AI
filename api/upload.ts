import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';

function chunkText(text: string, size = 1000, overlap = 200) {
  const chunks: {text: string, index: number}[] = [];
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { fileBase64, filename, userId } = req.body;
    if (!fileBase64) return res.status(400).json({ error: 'No file data received' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

    const jobId = uuidv4();

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: fileBase64 } },
          { text: 'Extract ALL text from this PDF completely and accurately. Preserve headings and structure.' },
        ],
      }],
    });

    const extractedText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!extractedText || extractedText.length < 10) {
      return res.status(500).json({ error: 'Text extraction failed - PDF may be scanned image' });
    }

    const chunks = chunkText(extractedText);

    res.json({ 
      jobId, 
      status: 'completed', 
      text: extractedText, 
      chunks,
      filename: filename || 'document.pdf',
      userId: userId || 'anonymous'
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
}
