# Compound

A personal knowledge engine. Capture thoughts, store them locally, and use AI to suggest the best topic from your list. Offline-first for storage; AI classification requires internet.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build   # Uses --webpack for PWA/next-pwa compatibility
npm start
```

## Environment Variables

### OPENAI_API_KEY (required for AI classification)

- **Local:** Create `.env.local` and add `OPENAI_API_KEY=sk-your-key`
- **Vercel:** In your Vercel project → Settings → Environment Variables, add `OPENAI_API_KEY` with your OpenAI API key. Apply to Production, Preview, and Development.

## Install as PWA

1. Open the app in Chrome (desktop or Android) or Safari (iOS)
2. **Chrome/Android:** Click the install icon in the address bar, or Menu → "Install Compound"
3. **Safari iOS:** Tap Share → "Add to Home Screen"

The app works offline for viewing and adding notes. AI classification requires an internet connection.

## Data Storage

All notes and topics are stored **locally** in your browser using IndexedDB. Nothing is sent to a server except for AI classification requests (note text + topic list). Your data never leaves your device for storage.

## Tech Stack

- Next.js (App Router) + TypeScript + Tailwind
- Dexie (IndexedDB)
- PWA (manifest + service worker)
- OpenAI API for topic classification
