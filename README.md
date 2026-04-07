# CyberPugs

A small, fun single-page App for browsing fictional cyberpunk pug “AI companion” pug-bots: a hero, a roster of cards, a short link ceremony, and per-unit chat routes. **AI-powered chat is under construction.**
AI Images Generated w/GrokAI.

## What’s in the app

- **Home** — Catalog grid with pug-operator name, callsign, and stats.
- **Link ceremony** — Connect to a puggerino, then jump into the chat.
- **Chat** — Themed thread per unit at `/chat/:pugId`.

## Setup

Requires [Node.js](https://nodejs.org/) (LTS is fine).

```bash
npm install
npm run dev
```

Vite will print a local URL (often `http://localhost:5173`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the built output |
| `npm run lint` | ESLint |

## Stack

React, TypeScript, Vite, React Router.

## Adding a unit

Append a row to `src/data/cyberpugs.ts` using the `CyberPug` shape in `src/types.ts`. Add images under `public/` and reference them with root paths (e.g. `/media/your-image.png`).
