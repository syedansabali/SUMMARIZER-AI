import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Try to load from environment or config file
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let config;

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} else {
  console.error("Firebase config not found. Background persistence will not work correctly.");
}

if (!admin.apps.length && config) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // This works in AI Studio containers
    projectId: config.projectId,
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const firestore = admin.firestore;
