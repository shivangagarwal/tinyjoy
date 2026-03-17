# TinyJoy

Calm, quick, delightful games for everyday moments. Web-first, mobile-friendly.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **HTML5 Canvas** for game rendering
- Static export deployed to **Vercel**
- `localStorage` for scores and preferences

## Project Structure

```
src/
  app/           # Next.js pages and layouts
  games/         # Individual game implementations
  lib/
    engine/      # Shared game framework (canvas, input, state, scoring)
    utils/       # Common utilities
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build & Deploy

```bash
npm run build   # Produces static output in /out
```

The `out/` directory is deployed to Vercel automatically on push to `main`.

## Development

- `npm run dev` — start the dev server
- `npm run build` — static export
- `npm run lint` — run linter
