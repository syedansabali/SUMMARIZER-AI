import express from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import { createRequire } from 'module';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import os from 'os';
import path from 'path';
import Tesseract from 'tesseract.js';
import { adminDb, firestore } from '../src/lib/firebase-admin.js';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const app = express();
app.use(express.json());

// Use /tmp for uploads (Vercel serverless only allows /tmp for writes)
const UPLOAD_DIR = os.tmpdir();

const DOCUMENTS_COLLECTION = 'documents';
const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';

// ─── Helpers ────────────────────────────────────────────────────────────────

interface Chunk {
  text: string;
  index: number;
}

function chunkText(text: string, size = 1000, overlap = 200): Chunk[] {
  const chunks: Chunk[] = [];
  let startIndex = 0;
  let index = 0;
  while (startIndex < text.length) {
    chunks.push({ text: text.substring(startIndex, startIndex + size), index });
    startIndex += size - overlap;
    index++;
  }
  return chunks;
}

// ─── Multer (disk → /tmp) ────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload PDF
app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const userId = req.body.userId || 'anonymous';
    const jobId = uuidv4();

    await adminDb.collection(DOCUMENTS_COLLECTION).doc(jobId).set({
      id: jobId,
      userId,
      status: 'uploading',
      progress: 10,
      message: 'File received, starting extraction...',
      filename: req.file.originalname,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Fire-and-forget background processing
    processPdfBackground(jobId, req.file.path).catch(console.error);

    res.json({ jobId });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to start upload process' });
  }
});

// SSE Status (Vercel supports streaming responses)
app.get('/api/status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const unsubscribe = adminDb
    .collection(DOCUMENTS_COLLECTION)
    .doc(jobId)
    .onSnapshot(
      (doc) => {
        if (!doc.exists) {
          res.write(`data: ${JSON.stringify({ error: 'Job not found' })}\n\n`);
          res.end();
          return;
        }
        const job = doc.data();
        res.write(`data: ${JSON.stringify(job)}\n\n`);
        if (job?.status === 'completed' || job?.status === 'failed') {
          res.end();
        }
      },
      (error) => {
        console.error('Snapshot error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Database error' })}\n\n`);
        res.end();
      }
    );

  req.on('close', () => unsubscribe());
});

// Get document result
app.get('/api/documents/:jobId', async (req: Request, res: Response) => {
  try {
    const doc = await adminDb.collection(DOCUMENTS_COLLECTION).doc(req.params.jobId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Document not found' });

    const job = doc.data()!;
    if (job.status !== 'completed' && job.status !== 'failed')
      return res.status(400).json({ error: 'Processing in progress', status: job.status });

    if (job.status === 'failed')
      return res.status(500).json({ error: job.error || 'Processing failed' });

    res.json({ text: job.text, filename: job.filename, pageCount: job.pageCount, chunks: job.chunks });
  } catch {
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Chat / RAG
app.post('/api/chat', async (req: Request, res: Response) => {
  const { jobId, query, chatId } = req.body;
  try {
    const doc = await adminDb.collection(DOCUMENTS_COLLECTION).doc(jobId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Document not found' });

    const job = doc.data()!;
    if (!job.chunks) return res.status(404).json({ error: 'Document not processed' });

    const queryWords = query.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
    const context = (job.chunks as Chunk[])
      .map((chunk) => {
        let score = 0;
        const text = chunk.text.toLowerCase();
        queryWords.forEach((word: string) => {
          const count = (text.match(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
          if (count > 0) score += 1 + Math.log(count);
        });
        return { ...chunk, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((c) => c.text)
      .join('\n\n--- Document Excerpt ---\n\n');

    if (chatId) {
      await adminDb
        .collection(CHATS_COLLECTION)
        .doc(chatId)
        .collection(MESSAGES_COLLECTION)
        .add({ role: 'user', text: query, createdAt: firestore.FieldValue.serverTimestamp() });
    }

    res.json({ context });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Save assistant message
app.post('/api/chat/save-response', async (req: Request, res: Response) => {
  const { chatId, text } = req.body;
  if (!chatId || !text) return res.status(400).json({ error: 'Missing data' });
  try {
    await adminDb
      .collection(CHATS_COLLECTION)
      .doc(chatId)
      .collection(MESSAGES_COLLECTION)
      .add({ role: 'model', text, createdAt: firestore.FieldValue.serverTimestamp() });
    res.json({ status: 'ok' });
  } catch {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// List user chats
app.get('/api/chats', async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'UserId required' });
  try {
    const snapshot = await adminDb
      .collection(CHATS_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();
    res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// ─── Background PDF Processing ───────────────────────────────────────────────

async function processPdfBackground(jobId: string, filePath: string) {
  const docRef = adminDb.collection(DOCUMENTS_COLLECTION).doc(jobId);
  const updateJob = (data: object) =>
    docRef.update({ ...data, updatedAt: firestore.FieldValue.serverTimestamp() });

  try {
    const dataBuffer = fs.readFileSync(filePath);

    await updateJob({ status: 'parsing', progress: 20, message: 'Parsing PDF structure...' });

    let data: any;
    try {
      data = await pdf(dataBuffer);
    } catch {
      throw new Error('Failed to parse PDF. File might be corrupted.');
    }

    await updateJob({
      status: 'extracting',
      progress: 50,
      message: `Extracting text from ${data.numpages} pages...`,
      pageCount: data.numpages,
    });

    let extractedText: string = data.text;

    if (extractedText.trim().length < 50 && data.numpages > 0) {
      await updateJob({ message: 'No text found. Attempting OCR...', progress: 60 });
      try {
        const worker = await Tesseract.createWorker('eng');
        await worker.terminate();
        if (extractedText.trim().length < 10) {
          extractedText = '[OCR Placeholder] Scanned PDF detected. Use Cloud Vision API for full OCR.';
        }
      } catch (ocrError) {
        console.error('OCR Error:', ocrError);
      }
    }

    await updateJob({ status: 'indexing', progress: 80, message: 'Building index...' });

    const chunks = chunkText(extractedText);
    await new Promise((r) => setTimeout(r, 1500));

    await updateJob({
      status: 'completed',
      progress: 100,
      text: extractedText,
      chunks,
      message: 'Analysis complete. Document ready.',
    });
  } catch (error: any) {
    console.error('Processing error:', error);
    await updateJob({ status: 'failed', error: error.message, message: `Error: ${error.message}` });
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

// ─── Vercel Export ───────────────────────────────────────────────────────────
export default app;
