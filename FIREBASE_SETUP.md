# Firebase Console Setup — ZAROORI STEPS

## Step 1: Google Auth Enable Karo

1. https://console.firebase.google.com par jao
2. Project: **sonorous-backup-1cf5x** select karo
3. Left menu → **Authentication** → **Sign-in method**
4. **Google** par click karo → **Enable** toggle on karo
5. Support email select karo (tumhari Gmail)
6. **Save** karo

## Step 2: Authorized Domains Add Karo

1. Authentication → **Settings** tab → **Authorized domains**
2. Yeh domains ADD karo:
   - `localhost` (already hoga usually)
   - `summarizer-ai.vercel.app` (ya jo bhi tumhara Vercel URL hai)

## Step 3: .env.local File Check karo

File mein sirf yeh hona chahiye:
```
GEMINI_API_KEY=tumhari_actual_key_yahan
```

> **Note:** File ka naam `.env.local` hona chahiye (`.env` nahi)

## Agar Popup Band Hojata Hai

Yeh usually in wajahaat se hota hai:
1. Firebase mein Google Auth enable nahi hai → Step 1 karo
2. `localhost` authorized domains mein nahi → Step 2 karo  
3. Browser popup blocker → Allow karo

Code mein ab popup + redirect dono handle hain automatically.
