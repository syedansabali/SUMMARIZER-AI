import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin using env vars (NOT a file)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export const config = {
  api: { bodyParser: false }, // Required for file uploads
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 }); // 10MB — Vercel limit

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'File parse failed: ' + err.message });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    if (!file.mimetype?.includes('pdf'))
      return res.status(400).json({ error: 'Only PDF files are supported' });

    try {
      const pdfBuffer = fs.readFileSync(file.filepath);
      const base64Pdf = pdfBuffer.toString('base64');

      const jobId = uuidv4();
      const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId || 'anonymous';

      // Store PDF as base64 in Firestore (no disk storage needed)
      await db.collection('documents').doc(jobId).set({
        id: jobId,
        userId,
        status: 'processing',
        progress: 10,
        message: 'File received, processing...',
        filename: file.originalFilename,
        pdfBase64: base64Pdf,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      res.json({ jobId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
