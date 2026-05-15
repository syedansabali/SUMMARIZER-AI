import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Try to load from environment or config file
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let config;

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

let credentials: any = null;

// 1. Try FIREBASE_SERVICE_ACCOUNT environment variable (for Vercel/Lambda)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('✓ Using Firebase credentials from FIREBASE_SERVICE_ACCOUNT env var');
  } catch (e) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
  }
}

// 2. Try firebase-service-account.json file (for local development)
if (!credentials) {
  const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    try {
      credentials = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      console.log('✓ Using Firebase credentials from firebase-service-account.json');
    } catch (e) {
      console.error('❌ Failed to read firebase-service-account.json:', e);
    }
  }
}

// 3. Fallback to Application Default Credentials
if (!credentials) {
  console.log('ℹ Attempting to use Application Default Credentials (Google Cloud)');
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  if (credentials) {
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId: credentials.project_id || config?.projectId,
    });
    console.log('✓ Firebase Admin SDK initialized with service account credentials');
  } else if (config?.projectId) {
    // Fallback: Use applicationDefault if no credentials provided
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: config.projectId,
    });
    console.log('✓ Firebase Admin SDK initialized with Application Default Credentials');
  } else {
    console.error('❌ No valid Firebase credentials found. Background persistence will not work correctly.');
    console.error('   Set FIREBASE_SERVICE_ACCOUNT env var or place firebase-service-account.json in project root');
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const firestore = admin.firestore;
