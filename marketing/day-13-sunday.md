# Day 13 — Sunday, April 6, 2026

> **Goal today:** Submit TinyJoy to Google Search Console + prepare week 3 Reddit posts.
> **Time budget:** ~30 minutes total.
> **Priority:** If you only have 10 minutes → do #1 (Search Console setup) only.

---

## Morning Checklist

- [ ] 1. Set up Google Search Console (15 min)
- [ ] 2. Write/queue week 3 Reddit posts (15 min)

---

## Task 1 — Google Search Console Setup

This is critical for organic SEO visibility. Takes 15 min to set up, pays off for months.

**URL:** https://search.google.com/search-console/welcome

Steps:
1. Add property: `https://tinyjoy.app`
2. Verify ownership — use the HTML tag method or the DNS method
   - HTML tag: add `<meta name="google-site-verification" content="...">` to your site's `<head>` — ask your engineer to do this if you can't deploy
   - DNS method: add a TXT record to your domain DNS settings
3. Submit your sitemap: `https://tinyjoy.app/sitemap.xml` (if it exists) or `https://tinyjoy.app/sitemap`

After setup, click "URL Inspection" and inspect `https://tinyjoy.app` — request indexing if not already indexed.

**Time:** ~15 min

---

## Task 2 — Queue Week 3 Reddit Posts

Write these posts now while you have time. Post them Monday through Wednesday.

**Post A — r/Entrepreneur (post Monday):**

Title: `6 weeks building a free browser game site from 0 traffic — what worked and what didn't`

Body:
```
I launched TinyJoy (tinyjoy.app) — 19 free casual browser games (Minesweeper, Solitaire, Snake, 2048, Typing Speed, and more). No revenue yet (AdSense pending), but traffic has been growing from community posts.

Here's what I've tried and what actually drove traffic:

**Worked:**
- Reddit posts with specific game descriptions (not just "check out my site")
- Hacker News Show HN (got ~X visitors in first 24h)
- itch.io listing

**Didn't work (yet):**
- Tweeting without an audience
- General "check out my site" posts without a hook

**Still waiting on:**
- CrazyGames, Poki review (submitted, pending)
- Organic SEO (takes 4-8 weeks to kick in)

If anyone else has launched a zero-budget web app recently — what drove your first real traffic spike?
```

---

**Post B — r/learnprogramming (post Tuesday):**

Title: `Made a typing speed test as a coding project — turns out it's the most popular game on my site`

Body:
```
I added a typing speed test (WPM counter) to TinyJoy (tinyjoy.app/games/typing-speed) as a quick project — took maybe 2 hours.

It ended up being the game people spend the most time on. Turns out everyone wants to know their WPM but most sites are either ugly or require sign-up.

Implementation was simple: track characters per minute, calculate WPM at end, compare to average (average is ~40 WPM, not the 70-80 people expect).

For anyone learning JavaScript and looking for a project: a typing speed test is a great one. Key pieces: character-by-character comparison, real-time timer, result display.

Anyone else made a "quick feature" that became unexpectedly popular?
```

---

**Post C — r/tipofmytongue (post Wednesday — only if Word Guess gains traction):**

Note: r/tipofmytongue is for "that game/movie/etc I can't remember." You can engage there when someone asks about a Wordle-like game.

**Strategy:** Search the subreddit for recent posts asking about "Wordle-like games" or "daily word games" and reply naturally mentioning Word Guess.

**Time:** ~15 min

---

## Tonight: Prepare for Week 3

Re-read your analytics from Day 12. Based on what worked, adjust Week 3 focus:
- High Reddit traffic → more Reddit
- High HN traffic → second Show HN
- High direct traffic → word-of-mouth is working, keep creating content people share
