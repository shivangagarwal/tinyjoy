# CrazyGames Submission — Ready to Upload (TIN-87 unblocked)

Videos are produced and in this folder. Remaining steps are account actions
(human-only):

1. Go to https://developer.crazygames.com → your TinyJoy submission.
2. Upload `tinyjoy-landscape.mp4` → Landscape video field (required).
3. Upload `tinyjoy-portrait.mp4` → Portrait video field (optional, done).
4. Covers already in this folder (`cover-*.png`).
5. Paste the copy below, review, submit.

## Video assets

| File | Size | Specs |
|---|---|---|
| `tinyjoy-landscape.mp4` | 1920×1080, 14.9s, H.264, muted, ~560KB | homepage → Minesweeper → 2048 → Guess My Drawing (AI guesses + success confetti) → end card |
| `tinyjoy-portrait.mp4` | 1080×1920, 15.0s, H.264, muted, ~920KB | same flow, mobile layout |

Re-record any time: `node marketing/crazygames/record.mjs landscape takes/`
(needs `npm i --no-save playwright` + `npx playwright install chromium`; convert
with ffmpeg per the commands in git history). The recorder retries are cheap —
prefer takes where the Guess My Drawing segment ends in confetti
(`"matched":true` in the output JSON).

## Updated submission copy (2026-08)

```
Name: TinyJoy
URL: https://tinyjoy.app
Category: Casual / Puzzle / Educational
Tags: free, browser game, no download, casual, kids, AI game, drawing game,
puzzle, word game, snake, solitaire, sudoku, minesweeper, 2048

Short description:
TinyJoy is a collection of 21 free casual browser games. No download, no
sign-up, no account. Instant play in any browser — desktop or mobile.

New: AI games that teach kids how AI works — by playing. In Guess My Drawing,
a friendly AI guesses your doodles live as you draw. In Doodle World, your
doodles become 3D objects in a world you build and explore. All AI runs
entirely in the browser: no accounts, and nothing kids make ever leaves
their device.

Plus 19 classics: Color Match, Memory Flip, Number Rush, Pattern Echo, Word
Scramble, Typing Speed, Reaction Time, Whack-a-Mole, Word Guess, Hangman,
Snake, Flappy Jump, Brick Breaker, Sudoku, Minesweeper, 2048, Tic-Tac-Toe,
Connect Four, Solitaire.

All free, mobile-friendly, loads in under 2 seconds.
```
