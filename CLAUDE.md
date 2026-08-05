# TinyJoy — Claude Context

Calm, quick, delightful browser games (tinyjoy.app). Next.js 15 App Router +
TypeScript + Tailwind, static export (`output: 'export'`) deployed to Vercel.
No backend, no accounts — scores and preferences live in `localStorage`.

## Product direction: AI-fluency games for kids

TinyJoy is moving toward **AI-fluency games for kids ages 5–10** — playful ways
to build intuition for what AI is, how it learns, and where it fails.

Rules for ALL AI games (non-negotiable):

- **Bounded interactions only.** No open-ended chat with a model, ever.
  Games expose fixed, game-shaped interactions (classify a drawing, pick the
  fake image, etc.).
- **Fully client-side or self-hosted inference.** Models are bundled as static
  assets (e.g., TF.js in `public/models/`) or served from our own
  infrastructure. No third-party inference APIs.
- **No accounts, no sign-up.**
- **No kid data stored or sent to third parties.** Drawings, guesses, and
  gameplay never leave the device. `localStorage` for scores only.

Roadmap:

1. **Guess My Drawing** (shipped) — kid draws a prompt, a bundled QuickDraw CNN
   (DoodleNet, MIT — see `public/models/doodlenet/README.md`) guesses live.
2. **Doodle World** (shipped) — kid draws a doodle, the same CNN recognizes it
   and spawns a matching procedural 3D model (PlayCanvas engine, MIT — models
   are built from primitives in `src/games/doodle-world/models/`, no external
   3D assets). Build/explore/save, all in-browser. Includes chainable land
   tiles (river/pond/bridge/fence/grass drawable; road palette-only since
   QuickDraw has no road class).
3. **Spot the Fake** — daily real-photo vs AI-image pick, Wordle-style cadence.

## Architecture

- `src/app/games/<slug>/page.tsx` — route: metadata + JSON-LD + game component
  + `RelatedGuides`. Follow an existing page (e.g. color-match) as template.
- `src/games/<slug>/<Name>Game.tsx` — `'use client'` game component.
- `src/lib/games.ts` — the game registry (`GAMES`); drives homepage sections,
  /games listing, sitemap, and best-score badges (`storageKey`/`scoreType`).
- `src/lib/engine/` — shared helpers: `ScoreTracker`, `SoundManager`
  (procedural WebAudio tones), `vibrate`, `GameCanvas`, `InputHandler`.
- `src/components/` — `GameNav` (`HomeLink`, `OtherGames`), `ShareButton`,
  `GameBestBadge`, `AdUnit`.
- OG images: `scripts/generate-og-images.js` → `public/og/<slug>.png`.

## Conventions

- Mobile portrait first, dark theme (`bg-zinc-950`), `max-w-sm` centered
  column, `min-h-svh`/`h-svh` layouts. Fill the viewport — no dead space.
- Kid/pre-reader UX for AI games: big emoji + short words, optional speech
  synthesis, icon buttons, thick touch targets.
- New games: add registry entry in `src/lib/games.ts`, page + component pair,
  OG image entry, and keep the hardcoded game count in `/games` metadata in
  sync.

## Commands

- `npm run dev` — dev server
- `npm run build` — static export to `out/`
- `node scripts/generate-og-images.js` — regenerate OG images (needs `sharp`)
