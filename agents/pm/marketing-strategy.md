# TinyJoy Marketing Strategy
**Author:** PM
**Date:** 2026-03-24
**Status:** Ready for CMO execution
**Related issue:** TIN-50

---

## 1. Current Position

**What we have:**
- 19 games across 5 categories (Quick Hits, Word, Arcade, Puzzle, Classics)
- 30 SEO blog posts targeting long-tail keywords
- Strong technical SEO: canonical URLs, Open Graph, Twitter Cards, JSON-LD schema (VideoGame + BreadcrumbList), sitemap, robots.txt
- GA4 analytics tracking
- AdSense integration installed (pending Google activation — requires sufficient traffic)
- Hosted at tinyjoy.app (Vercel, fast load times)

**The problem:**
- ~15 page views/day. Nowhere near the ~10,000 page views/month needed for AdSense to generate meaningful revenue.
- Zero backlinks. Zero social presence. Zero community engagement.
- 30 blog posts probably not indexed yet — site is ~1 week old.
- No distribution mechanism: no social sharing in games, no score-sharing, no return-visit hook.

**The diagnosis:**
We have a solid product (19 polished games) and the right content foundation (30 SEO posts). But we've built in isolation — no one knows we exist. The bottleneck is pure distribution. Every marketing action must get us indexed, linked to, or directly in front of players.

---

## 2. Target User Personas

### Persona A: The Bored Breaker
- **Who:** Office worker, student, commuter — age 20-40
- **Need:** 2–5 minute mental reset during downtime
- **Search intent:** "games to play when bored", "quick games no download", "free browser games"
- **Best games for them:** Number Rush, Reaction Time, Typing Speed, Whack-a-Mole
- **Why they share:** Beat their own score, challenge a friend

### Persona B: The Word Lover
- **Who:** Vocabulary/puzzle enthusiast, age 25-45
- **Need:** Satisfying word challenge in a quick session
- **Search intent:** "word scramble online", "free word games", "word guess online"
- **Best games for them:** Word Scramble, Word Guess (Wordle-style), Hangman
- **Why they share:** "Try this word game" — it's social by nature

### Persona C: The Nostalgic
- **Who:** 25-40, grew up on flash games (Miniclip, Newgrounds era)
- **Need:** Classic game, zero friction, no account
- **Search intent:** "snake game online", "2048 game", "free solitaire", "minesweeper"
- **Best games for them:** Snake, 2048, Solitaire, Minesweeper, Tic-Tac-Toe
- **Why they share:** "It's the real thing, just works" — nostalgia and quality

### Persona D: The Brain Trainer
- **Who:** Health-conscious adult, 30-50, parent or professional
- **Need:** Quick mental exercise that feels productive
- **Search intent:** "brain training games", "memory games online", "improve typing speed"
- **Best games for them:** Memory Flip, Pattern Echo, Typing Speed, Sudoku
- **Why they share:** It's something they're proud of doing (self-improvement framing)

---

## 3. Acquisition Channel Prioritization

Ranked by: (traffic potential) × (likelihood of success) ÷ (effort + cost)

### Priority 1: SEO — Baseline Indexing & Quick Wins
**Timeline:** Immediate (Week 1)
**Owner:** Engineer + CMO
**Cost:** Free
**Traffic potential:** High (months 2-6)

The 30 blog posts and 19 game pages are our best long-term asset. But they can't rank if Google hasn't crawled them.

**Actions:**
1. Submit sitemap to Google Search Console (`https://tinyjoy.app/sitemap.xml`) — **Engineer/board**
2. Submit to Bing Webmaster Tools — **Engineer/board**
3. Request indexing for all 49 pages via Search Console — **Engineer/board**
4. Add FAQ schema to top 5 blog posts targeting high-volume queries (for featured snippet eligibility) — **CMO**
5. Audit internal linking: every blog post should link to 2-3 game pages, every game page should link to related blog posts — **CMO**
6. Fix: homepage title/description should include "free online games" + key game names — currently too vague for Google to understand relevance — **CMO**

**Why this first:** We're leaving the biggest free traffic channel unactivated. With good content already written, we just need Google to know it exists.

---

### Priority 2: Reddit Community Posts
**Timeline:** Week 1
**Owner:** CMO writes copy, board executes (needs board's accounts)
**Cost:** Free
**Traffic potential:** Medium-high (immediate spike, some sustained)

Reddit is where our users actually are. r/WebGames has 200K+ members; r/indiegaming has 600K+. One good post with a real link can drive 500-2,000 visitors in 48 hours.

**Target subreddits:**
- r/WebGames (200K) — primary, dedicated to browser games
- r/indiegaming (600K) — broader indie game community
- r/CasualGaming (400K) — perfect fit for our "calm, quick" positioning
- r/puzzles (250K) — for word games and puzzle games specifically
- r/wordgames (50K) — Word Scramble, Word Guess, Hangman
- r/bored (1.8M) — "games to play when bored" — exact match to persona A

**Post templates CMO should write:**
1. **"I built 19 free browser games you can play instantly — no download, no account"** — r/WebGames, r/indiegaming (Show & Tell tone, honest, non-spammy)
2. **"Best games to play when you're bored at work [no download]"** — r/bored, r/CasualGaming (value-first framing)
3. **"Classic Snake / 2048 / Solitaire if anyone wants a quick hit"** — r/WebGames (specific game anchors)

**Rules:**
- One post per subreddit, spacing them out by 24-48 hours to avoid spam perception
- Respond to every comment promptly (builds trust, Reddit algorithm rewards engagement)
- Do NOT cross-post the same text verbatim

---

### Priority 3: Product Hunt Launch
**Timeline:** Week 2
**Owner:** Board (needs Product Hunt account), CMO writes all copy
**Cost:** Free
**Traffic potential:** High one-time spike (500-3,000 visitors in 24 hours)

Product Hunt is a single-day event that can generate significant press mentions, backlinks, and first users. We are a clear fit for "Games" category.

**What CMO needs to prepare:**
- Launch headline: "TinyJoy — 19 calm, quick browser games. No download, no account."
- Tagline: "Play in seconds. Games for every 2-minute break."
- 3-5 screenshots/GIFs of gameplay (animated GIFs outperform static screenshots)
- 300-word description emphasizing zero-friction play
- "Maker comment" for the board to post when live

**Best day to launch:** Tuesday or Wednesday (highest PH traffic days). Avoid Mondays (competition is highest).

**Upvote strategy:** Notify your personal network the day of launch. Product Hunt's algorithm favors early upvotes.

---

### Priority 4: Hacker News "Show HN"
**Timeline:** Week 2-3
**Owner:** Board (needs HN account), CMO writes copy
**Cost:** Free
**Traffic potential:** Medium-high (if it hits front page: 500-2,000 visitors)

HN readers skew technical and value no-BS indie products. A "Show HN: TinyJoy — 19 free browser games, no download" post with a genuine story (indie project, clean code, polished games) can resonate.

**What CMO prepares:**
- Short post: "Show HN: TinyJoy – 19 browser games, built in 1 week, no download or account required"
- Opening comment from the board explaining the backstory + what makes it different

**Important:** HN is unforgiving of self-promotion that feels commercial. Frame it as a maker sharing work, not a marketing push.

---

### Priority 5: On-Site Conversion & Retention (Engineering)
**Timeline:** Week 1-2
**Owner:** Founding Engineer
**Cost:** Free (internal work)
**Traffic potential:** Indirect — drives return visits and sharing

Our current games end and... just show a score. There's no hook to bring users back or share. This is a silent traffic leak.

**Required features:**
1. **Share score button** — "I scored 840 in Number Rush! Can you beat it? [link]" — creates free social distribution each time someone plays
2. **"Play again" + "Try [related game]" at game over** — increases pages-per-session (better for AdSense)
3. **Keyboard shortcut to restart** — reduces friction for users who want to replay

These are conversion optimizations that multiply the value of every user we acquire via other channels.

---

### Priority 6: Browser Game Directories
**Timeline:** Week 2-3
**Owner:** CMO
**Cost:** Free
**Traffic potential:** Low-Medium (steady trickle, good for backlinks)

Getting listed in browser game directories creates backlinks (good for SEO) and direct referral traffic.

**Target directories:**
- Itch.io (game jam community — create a page, link to tinyjoy.app)
- Crazy Games (submit games for listing)
- Y8 Games (submit)
- Lagged.com (submit)
- Addicting Games (submit)
- Browser.games directory
- Gameflare

**What CMO does:** Write a standard game submission description (100 words + screenshot) and submit to each directory.

---

### Priority 7: Social Media Setup (Low-effort, ongoing)
**Timeline:** Week 2+
**Owner:** CMO
**Cost:** Free

We don't need aggressive social media — just a presence for when people look us up and for occasional content drops.

**Channels to set up:**
- Twitter/X: @TinyJoyApp — post a daily "game of the day" with a 15-second clip
- TikTok: 15-second gameplay clips perform well in "quick games" / "boredom" niches

**Content cadence:**
- 1 tweet/day: "Game of the day: [Name]. Play in 2 minutes → [link]"
- 1 TikTok/week: screen recording + music + "no download browser game" text overlay

**Note:** Social will not drive significant traffic for months. Do not over-invest here until SEO and Reddit are working.

---

## 4. What We're NOT Doing (and why)

- **Paid ads:** We have zero revenue. AdSense isn't activated. No budget for paid acquisition.
- **Email newsletter:** We have no email capture mechanism. Building one is a future state.
- **New games:** Product is frozen. More games ≠ more users. Distribution is the bottleneck.
- **YouTube tutorials:** Too slow. Video SEO takes 3-6 months to index.
- **App stores:** Too much effort for a web-first product. Native app is a Q3 initiative at earliest.

---

## 5. Goals & Metrics

### North Star: Monthly Page Views (required for AdSense activation)
- **Today:** ~450/month (~15/day)
- **Target Day 30:** 3,000 page views/month (100/day)
- **Target Day 60:** 10,000 page views/month (333/day) — AdSense activation threshold
- **Target Day 90:** 30,000 page views/month (1,000/day) — meaningful revenue begins

### Supporting Metrics (track weekly in GA4)
| Metric | Now | 30-day target | 60-day target |
|--------|-----|---------------|----------------|
| Daily active users | ~15 | 100 | 333 |
| Pages per session | ~1.2 | 1.8 | 2.5 |
| Return visitor % | unknown | 20% | 35% |
| Organic search traffic | ~0 | 50/day | 200/day |
| Referral traffic (Reddit/PH) | 0 | spike events | 30/day steady |

### Revenue projection (once AdSense active)
- At 10,000 page views/month: ~$5-15/month (too low)
- At 100,000 page views/month: ~$50-150/month
- At 1,000,000 page views/month: ~$500-1,500/month

**Key insight:** AdSense economics require scale. Focus on traffic first. Revenue follows.

---

## 6. 4-Week Execution Plan for CMO

### Week 1: Foundation
- [ ] Verify Google Search Console is set up and sitemap submitted (requires board)
- [ ] Verify Bing Webmaster Tools set up (requires board)
- [ ] Audit internal linking: add links between all blog posts and game pages
- [ ] Write 3 Reddit post templates (for board to post with their accounts)
- [ ] Add FAQ schema to top 5 blog posts (CMO writes, Engineer adds schema markup)

### Week 2: Launch Events
- [ ] Post to r/WebGames with founder story
- [ ] Post to r/indiegaming 2 days later
- [ ] Write Product Hunt launch copy (board launches)
- [ ] Write HN "Show HN" copy (board posts)
- [ ] Submit TinyJoy to 5 browser game directories

### Week 3: Community & Social
- [ ] Post to r/CasualGaming, r/bored, r/wordgames
- [ ] Set up Twitter/X @TinyJoyApp account
- [ ] Start daily "game of the day" tweets
- [ ] Submit to remaining directories

### Week 4: SEO Double-Down
- [ ] Audit which blog posts got indexed (Search Console)
- [ ] Expand top 3 performing posts with more depth / FAQ sections
- [ ] Write 2 new SEO posts targeting underserved queries (identify via Search Console "queries" report)
- [ ] Review GA4: which games drive the most return visits? Feature them more prominently.

---

## 7. Handoff to CMO

CMO's immediate action list (in order):

1. **Write Reddit post copy** — 3 variations for r/WebGames, r/indiegaming, r/CasualGaming
2. **Write Product Hunt launch copy** — headline, description, maker comment
3. **Write HN Show HN copy**
4. **Audit + fix internal links** across all 30 blog posts
5. **Write FAQ schema content** for top 5 blog posts (Engineer adds markup)
6. **Submit to game directories** — write one standard description, submit to 7 directories

For all community posts (Reddit, HN, Product Hunt): prepare copy-paste ready content for the board to execute with their accounts.

---

*This document should be updated weekly as we learn what's working. The first metrics review is scheduled for Day 7 (2026-03-31).*
