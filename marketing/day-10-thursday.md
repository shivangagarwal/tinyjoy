# Day 10 — Thursday, April 3, 2026

> **Goal today:** Post to r/webdev + Armor Games submission + submit to Kongregate.
> **Time budget:** ~35 minutes total.
> **Priority:** If you only have 10 minutes → do #1 (r/webdev) only.

---

## Morning Checklist

- [ ] 1. Post to r/webdev (10 min)
- [ ] 2. Submit to Armor Games (15 min)
- [ ] 3. Submit to Kongregate (10 min)

---

## Task 1 — Reddit: r/webdev

r/webdev has ~900k members and loves "I built this" posts from indie developers.

**URL:** https://www.reddit.com/r/webdev/submit

**Title:**
```
I built 19 browser games with Next.js — here's what made me add classics like Minesweeper and Solitaire
```

**Body:**
```
Started TinyJoy (tinyjoy.app) with 5 original games (Reaction Time, Number Rush, Color Match, Memory Flip, Word Scramble). Added Typing Speed, Pattern Echo, Whack-a-Mole, etc.

Then added the classics: Minesweeper, Sudoku, Solitaire, 2048, Connect Four, Tic-Tac-Toe.

What I noticed: classics convert dramatically better. People know what they're getting. The mental overhead of learning a new game is 0.

A few implementation notes for anyone curious:
- Sudoku puzzle generation: constraint propagation + backtracking
- Solitaire: full Klondike rules including tableau-to-foundation, foundation-to-tableau
- 2048: standard tile merge logic, smooth CSS transitions
- All client-side, no server state

Stack: Next.js 14, TypeScript, Tailwind CSS, Vercel.

Happy to share code snippets for any of the game implementations if useful.
```

**Time:** ~10 min

---

## Task 2 — Armor Games

**URL:** https://armorgames.com/upload or https://armorgames.com/developer

**Submission details:**
- Game: TinyJoy
- URL: https://tinyjoy.app
- Genre: Casual / Multiple
- Description:
```
TinyJoy is a collection of 19 free browser games. No download or sign-up required. Classics (Minesweeper, Sudoku, Solitaire, 2048), speed games (Reaction Time, Number Rush, Typing Speed), word games, memory games, and arcade. Mobile-friendly.
```

**Time:** ~15 min

---

## Task 3 — Kongregate

**URL:** https://www.kongregate.com/developer_center

Kongregate has a large browser game community. Submit for review.

Same description as above. Note: Kongregate's review process can take 1-2 weeks. Submit now, it'll come.

**Time:** ~10 min

---

## Notes

- r/webdev often rewards technical specificity. The post above leads with implementation details, which resonates with that community.
- After posting, hang around to answer any technical questions — this builds reputation and drives clicks to tinyjoy.app.
