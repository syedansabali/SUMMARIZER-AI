import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

// Load configuration
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let config: any;

if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.error("Error parsing firebase-applet-config.json:", e);
  }
}

let app: admin.app.App;

if (!admin.apps.length) {
  try {
    const options: admin.AppOptions = {
      credential: admin.credential.applicationDefault(),
    };
    
    if (config?.projectId) {
      options.projectId = config.projectId;
    }
    
    app = admin.initializeApp(options);
    console.log(`Firebase Admin initialized with project ID: ${app.options.projectId || 'ambient'}`);
  } catch (error) {
    console.error("Firebase Admin initialization failed, falling back to ambient defaults:", error);
    app = admin.initializeApp();
  }
} else {
  app = admin.app();
}

// Initialize Firestore with specific database ID if provided
let adminDb: admin.firestore.Firestore;
const dbId = config?.firestoreDatabaseId;

try {
  if (dbId) {
    console.log(`Targeting Firestore database: ${dbId}`);
    adminDb = getFirestore(app, dbId);
  } else {
    adminDb = getFirestore(app);
  }
} catch (dbError) {
  console.warn(`Could not initialize Firestore with databaseId ${dbId}, using default database.`, dbError);
  adminDb = getFirestore(app);
}

const adminAuth = admin.auth(app);

export { adminDb, adminAuth, app };
export const firestore = admin.firestore;
