# Day 6 — Sunday, March 30, 2026

> **Goal today:** Write dev article for Dev.to. Also: review this week's analytics.
> **Time budget:** ~45 minutes total.
> **Priority:** If you only have 20 minutes → do #2 (analytics review) + #3 (Newgrounds submit) only.

---

## Morning Checklist

- [ ] 1. Write and publish Dev.to article (30 min)
- [ ] 2. Review week 1 analytics (10 min)
- [ ] 3. Submit to Newgrounds (10 min)

---

## Task 1 — Dev.to Article

**URL:** https://dev.to/new

**Title:**
```
I built 19 browser games in a weekend (here's what I learned)
```

**Tags:** javascript, webdev, gamedev, productivity

**Article to paste and publish:**

---

I wanted a quick game to play during a 2-minute break. Every option required an install, an account, or was so bloated with ads it wasn't worth it.

So I built my own.

[TinyJoy](https://tinyjoy.app) started as 5 games. It's now 19. Here's what I learned building it.

## The tech stack

Next.js 14 + Tailwind CSS, deployed on Vercel. All games run client-side — no backend, no server state, no database. Just React components doing math.

## Zero friction was the only rule

Every design decision went through one filter: does this create friction?

- No accounts (friction)
- No tutorial modals you can't skip (friction)
- No "loading..." screens longer than 500ms (friction)
- No confirmation dialogs to start a game (friction)

The result: open the site, click a game, playing in under 10 seconds.

## What I learned about casual games

**Simpler games have better retention.** Number Rush (tap 1–25 in order, as fast as possible) sounds trivially simple. It's the most addictive thing on the site. The complexity of knowing what to do is near zero; the challenge is pure execution speed.

**Reaction Time is a conversation starter.** Average human reaction time is ~250ms. Most people don't know this and are surprised to find they're slower. This makes the game inherently shareable — "test your reaction time" is something people send to friends.

**Classics convert better than originals.** When I added Minesweeper, Sudoku, Solitaire, and 2048, time-on-site went up immediately. People know what they're getting. No learning curve.

## The 19 games (if you want to try them)

Quick reflex: [Reaction Time](https://tinyjoy.app/games/reaction-time), [Number Rush](https://tinyjoy.app/games/number-rush), [Typing Speed](https://tinyjoy.app/games/typing-speed), [Whack-a-Mole](https://tinyjoy.app/games/whack-a-mole)

Memory: [Memory Flip](https://tinyjoy.app/games/memory-flip), [Pattern Echo](https://tinyjoy.app/games/pattern-echo), [Color Match](https://tinyjoy.app/games/color-match)

Word games: [Word Scramble](https://tinyjoy.app/games/word-scramble), [Hangman](https://tinyjoy.app/games/hangman), [Word Guess](https://tinyjoy.app/games/word-guess)

Classics: [Minesweeper](https://tinyjoy.app/games/minesweeper), [Sudoku](https://tinyjoy.app/games/sudoku), [Solitaire](https://tinyjoy.app/games/solitaire), [2048](https://tinyjoy.app/games/2048), [Connect Four](https://tinyjoy.app/games/connect-four)

Arcade: [Snake](https://tinyjoy.app/games/snake), [Brick Breaker](https://tinyjoy.app/games/brick-breaker), [Flappy Jump](https://tinyjoy.app/games/flappy-jump)

What would you add? I'm still building.

---

**After publishing:** Copy the URL. You'll cross-post to Medium and Hashnode later this week.

**Time:** ~30 min

---

## Task 2 — Review Week 1 Analytics

Open Vercel Analytics (vercel.com/dashboard → your project → Analytics).

Note these numbers:
- Total page views this week: ___
- Top traffic source: ___
- Top game played: ___
- Top landing page: ___

**Target after week 1: 30+ daily page views.** If you're not there, it means the Reddit/HN posts didn't land — try a different angle tomorrow.

**Time:** ~10 min

---

## Task 3 — Newgrounds

**URL:** https://www.newgrounds.com/upload/create-game

**Title:** TinyJoy
**Description:**
```
19 free casual browser games. No download, no sign-up. Play at tinyjoy.app.

Classics (Minesweeper, Sudoku, Solitaire, 2048), speed games (Reaction Time, Number Rush), word games (Hangman, Word Scramble), and arcade (Snake, Brick Breaker, Flappy Jump).
```

**Time:** ~10 min
