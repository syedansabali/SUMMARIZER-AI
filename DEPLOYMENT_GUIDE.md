# Summarizer AI — GitHub + Vercel Deployment Guide

## Bugs Jo Fix Kiye Gaye ✅

1. **Login redirect bug** — `login()` ka return type `Promise<void>` tha, ab `Promise<User | null>` hai. Is wajah se login ke baad dashboard redirect nahi hota tha.
2. **Navbar double-login bug** — Login hone ke baad bhi `login()` call ho raha tha. Ab check karta hai pehle.
3. **PDF upload window nahi khulti thi** — `handleUploadClick` mein login ke baad `fileInputRef.click()` nahi ho raha tha. Ab `setTimeout` se fix hai.
4. **Upload errors silently fail** — Ab error banner show hota hai red color mein.
5. **Drag & Drop** — Drop zone ab actually drag & drop support karta hai.
6. **popup-closed-by-user error** — Jab user Google popup band kare toh error console mein nahi aata.

---

## Step 1: Firebase Console Setup (Zaroori!)

Pehle Firebase Console mein jao (`console.firebase.google.com`):

1. **Authentication > Sign-in method** mein **Google** enable karo
2. **Authentication > Settings > Authorized domains** mein apna Vercel domain add karo:
   - `your-app.vercel.app`
   - `localhost` (development ke liye)
3. **Firestore Database** rules check karo — `firestore.rules` file already hai

---

## Step 2: Environment Variables

`.env.example` file ko copy karo:
```bash
cp .env.example .env
```

`.env` file mein apni Gemini API key daalo:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** `firebase-applet-config.json` already hai project mein — wahan kuch change karne ki zaroorat nahi.

---

## Step 3: GitHub Par Upload Karna

### Pehli baar (naya repo banana):

```bash
# Project folder mein jao
cd summarizer-ai

# Git initialize karo
git init

# Sab files add karo
git add .

# Pehla commit
git commit -m "Initial commit - Summarizer AI"

# GitHub par naya repo banao (github.com par jakar)
# Phir yeh command chalao:
git remote add origin https://github.com/YOUR_USERNAME/summarizer-ai.git

# Push karo
git branch -M main
git push -u origin main
```

### Updates ke liye (baad mein):

```bash
git add .
git commit -m "Fixed auth and upload bugs"
git push
```

---

## Step 4: Vercel Par Deploy Karna

### Option A: Vercel Website se (Easy)

1. **vercel.com** par jao, login karo
2. **"New Project"** click karo
3. GitHub repo select karo
4. **Framework Preset**: `Vite` select karo
5. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Environment Variables** section mein add karo:
   - `GEMINI_API_KEY` = your key
7. **Deploy** click karo

### Option B: Vercel CLI se

```bash
# Vercel CLI install karo
npm install -g vercel

# Deploy karo
vercel

# Production deploy
vercel --prod
```

---

## Step 5: Vercel mein API Routes ka Issue

Is project mein `server.ts` Express server hai jo `/api/upload`, `/api/status`, etc. handle karta hai. **Yeh Vercel par seedha kaam nahi karta** kyunki Vercel static hosting + serverless functions use karta hai.

### Solution: `vercel.json` banana

Project root mein `vercel.json` file banao:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

---

## Step 6: Local Development Test

```bash
# Dependencies install karo
npm install

# Dev server chalao
npm run dev

# Browser mein kholo
# http://localhost:3000
```

---

## Common Errors aur Solutions

| Error | Solution |
|-------|----------|
| `auth/unauthorized-domain` | Firebase Console mein domain add karo |
| `auth/popup-blocked` | Browser mein popup allow karo |
| PDF upload nahi hota | `GEMINI_API_KEY` set hai check karo |
| Dashboard par redirect nahi hota | Firebase Google Auth enable karo |
| `firebase-applet-config.json not found` | File project root mein honi chahiye |

---

## Important Files

```
summarizer-ai/
├── firebase-applet-config.json  ← Firebase config (already set)
├── firestore.rules              ← Database security rules
├── server.ts                    ← Backend API (Express)
├── src/
│   ├── components/
│   │   └── AuthProvider.tsx     ← FIXED: login() return type
│   ├── pages/
│   │   └── Dashboard.tsx       ← FIXED: upload + drag & drop
│   └── components/layout/
│       └── Navbar.tsx          ← FIXED: auth button logic
└── .env                        ← Apni API key yahan daalo
```
