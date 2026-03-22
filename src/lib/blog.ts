export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: 'game-guide' | 'tips';
  readingTime: string;
  content: string; // HTML string
}

export const BLOG_POSTS: BlogPost[] = [
  // ─── SEO Articles ───────────────────────────────────────────
  {
    slug: 'best-free-browser-games-2026',
    title: 'Best Free Browser Games 2026',
    description: 'The best free browser games you can play right now — no download, no sign-up, no cost. Quick, fun, and mobile-friendly.',
    date: '2026-03-18',
    category: 'tips',
    readingTime: '4 min',
    content: `
<p>Looking for great free browser games in 2026? You're in the right place. No app store, no install, no account — just open your browser and play.</p>

<p>Here are the best free browser games available right now, all playable on desktop and mobile.</p>

<h2>1. Color Match</h2>
<p>A fast-paced color recognition game. You're shown a target color and need to tap matching tiles before 60 seconds run out. Simple to learn, surprisingly hard to master. Great for hand-eye coordination and a quick mental reset.</p>
<p><a href="/games/color-match">Play Color Match →</a></p>

<h2>2. Memory Flip</h2>
<p>The classic card-matching game, refreshed. Flip cards to find all 8 pairs before the clock hits zero. A calm, focused game that genuinely exercises short-term memory. Perfect for a 2-minute break.</p>
<p><a href="/games/memory-flip">Play Memory Flip →</a></p>

<h2>3. Number Rush</h2>
<p>Tap numbers 1 through 25 in order, as fast as you can. Sounds trivial — it's not. Numbers are scattered randomly and your time is on the clock. This is one of the most satisfying speed games in the browser.</p>
<p><a href="/games/number-rush">Play Number Rush →</a></p>

<h2>4. Pattern Echo</h2>
<p>Watch a color sequence light up, then repeat it. Each round the sequence grows. A modern take on Simon Says that starts gentle and gets genuinely challenging. Tests memory, focus, and patience.</p>
<p><a href="/games/pattern-echo">Play Pattern Echo →</a></p>

<h2>5. Word Scramble</h2>
<p>Unscramble as many words as you can in 60 seconds. Letters are shuffled; you type the correct word. A vocabulary game that rewards quick thinking over extensive word knowledge. Great for a mental warm-up.</p>
<p><a href="/games/word-scramble">Play Word Scramble →</a></p>

<h2>Why Browser Games?</h2>
<p>App installs create friction. Browser games don't. You get the fun without storage used, no update prompts, and no account to manage. In 2026, browser games have matured — smooth animations, fast load times, and genuinely good design are table stakes.</p>

<p>TinyJoy is built specifically for this format: short sessions, zero friction, and games that are actually satisfying to play.</p>

<h2>Play Now</h2>
<p>All five games are free, mobile-friendly, and live at <a href="/">TinyJoy</a>. No download. No sign-up. Just play.</p>
    `.trim(),
  },
  {
    slug: 'quick-games-to-play-on-your-phone',
    title: 'Quick Games to Play on Your Phone (No App Required)',
    description: 'The best quick games to play on your phone — no app download, no install, runs in any mobile browser. Play in 60 seconds or less.',
    date: '2026-03-18',
    category: 'tips',
    readingTime: '3 min',
    content: `
<p>Your phone is always in your pocket, but downloading a new game app for a 2-minute wait feels like too much. These games run entirely in your mobile browser — no app store, no install, no storage used.</p>

<h2>Games That Work Great on Your Phone</h2>

<p>The best mobile browser games are touch-friendly, load fast, and fit in the time you have. All of these are playable at <a href="/">TinyJoy</a>:</p>

<h2>Color Match — 60 seconds</h2>
<p>Tap tiles that match a target color before time runs out. Works perfectly with a thumb. Sessions are exactly 60 seconds — no more, no less. Great for a line at the coffee shop.</p>

<h2>Number Rush — 30 seconds</h2>
<p>Tap numbers 1–25 in order, as fast as possible. The grid is small enough for one-handed play and the challenge is real. Beat your personal best in under a minute.</p>

<h2>Memory Flip — 60 seconds</h2>
<p>Flip cards to match pairs. The card grid is optimized for phone screens. A genuinely calming game when you need to decompress for 60 seconds.</p>

<h2>Pattern Echo — any length</h2>
<p>Repeat a growing color sequence. No time pressure in the early rounds. Gets harder as you go. Play as long or as short as you want.</p>

<h2>Word Scramble — 60 seconds</h2>
<p>Unscramble words using a keyboard. Works great on mobile with the native keyboard. A small mental challenge that wakes up your brain.</p>

<h2>Why No App?</h2>
<p>Apps take storage, require updates, and need permissions. Browser games skip all of that. Open your browser, go to <a href="https://tinyjoy.app">tinyjoy.app</a>, tap a game. Done.</p>

<p>Bookmark the site and you've got a collection of quick games always one tap away — no space used, no install required.</p>
    `.trim(),
  },
  {
    slug: 'games-to-play-when-bored',
    title: 'Games to Play When Bored — Free, No Download',
    description: 'The best games to play when bored — free browser games that start instantly, no download or sign-up. Play for 60 seconds or 20 minutes.',
    date: '2026-03-22',
    category: 'tips',
    readingTime: '3 min',
    content: `
<p>Boredom hits fast. The best fix is a game that starts just as fast — no app store, no install, no account creation. Just open your browser and go.</p>

<p>Here are the best games to play when bored, all free and ready in seconds.</p>

<h2>Number Rush — 30 seconds to a minute</h2>
<p>Tap numbers 1–25 in order, as fast as you can. Sounds trivial. It isn't. The numbers are scattered randomly and your personal best mocks you from the top of the screen. Dangerously replayable.</p>
<p><a href="/games/number-rush">Play Number Rush →</a></p>

<h2>Reaction Time — pure reflex</h2>
<p>A color change. You tap. How fast are you? Average human reaction time is 250ms — most people are slower than they think. This is the game you'll play 10 times in a row trying to prove yourself.</p>
<p><a href="/games/reaction-time">Play Reaction Time →</a></p>

<h2>Color Match — 60 seconds of flow</h2>
<p>A target color, a grid of tiles, and 60 seconds. Tap everything that matches. When it clicks, it enters a satisfying flow state that makes the time disappear.</p>
<p><a href="/games/color-match">Play Color Match →</a></p>

<h2>Typing Speed Test — find out how fast you type</h2>
<p>Type a passage as fast and accurately as you can. Your WPM score at the end is oddly motivating. Most people discover they're slower than they thought — and immediately want to try again.</p>
<p><a href="/games/typing-speed">Play Typing Speed Test →</a></p>

<h2>Pattern Echo — meditative memory</h2>
<p>Watch a growing color sequence. Repeat it. Get it right, the sequence grows by one. There's no time pressure — just you and the pattern. Weirdly calming for a memory challenge.</p>
<p><a href="/games/pattern-echo">Play Pattern Echo →</a></p>

<h2>Memory Flip — classic card matching</h2>
<p>16 cards, 8 pairs, 60 seconds. A classic for a reason. The satisfying click of finding a match never gets old, and finishing a full board with time to spare feels genuinely good.</p>
<p><a href="/games/memory-flip">Play Memory Flip →</a></p>

<h2>Word Scramble — quick mental workout</h2>
<p>Scrambled letters appear; you type the word. 60 seconds to solve as many as possible. It's the fastest way to feel smart — most words take under 3 seconds once your brain locks on.</p>
<p><a href="/games/word-scramble">Play Word Scramble →</a></p>

<h2>Why browser games beat apps when you're bored</h2>
<p>Installing an app to cure boredom takes longer than the boredom lasts. Browser games are different: instant, friction-free, and gone the moment you close the tab. No storage used, no notifications, no guilt.</p>

<p>All seven games are free at <a href="/">TinyJoy</a>. Pick one and play.</p>
    `.trim(),
  },
  {
    slug: 'free-typing-speed-test-online',
    title: 'Free Typing Speed Test Online — How Fast Do You Type?',
    description: 'Take a free online typing speed test and find out your WPM. No sign-up, no download — test your typing speed in your browser right now.',
    date: '2026-03-22',
    category: 'tips',
    readingTime: '3 min',
    content: `
<p>The average person types around 40 words per minute. Professional typists hit 70–80 WPM. Fast coders and writers often clock 90–110. Where do you land?</p>

<p>TinyJoy's <a href="/games/typing-speed">free typing speed test</a> gives you an answer in under two minutes — no account, no download, no email required.</p>

<h2>How the typing test works</h2>
<p>A passage of common English words appears on screen. Type it as fast and accurately as you can. When you finish, you get your WPM (words per minute) and accuracy percentage. That's it.</p>

<p><a href="/games/typing-speed">Take the free typing test →</a></p>

<h2>What's a good typing speed?</h2>
<ul>
<li><strong>Under 30 WPM</strong> — slow; most tasks take noticeably longer than they should</li>
<li><strong>30–50 WPM</strong> — average; comfortable for everyday use</li>
<li><strong>50–70 WPM</strong> — above average; typing doesn't slow you down</li>
<li><strong>70–90 WPM</strong> — fast; you're ahead of most people</li>
<li><strong>90+ WPM</strong> — very fast; likely a developer, writer, or dedicated touch typist</li>
</ul>

<h2>How to improve your typing speed</h2>

<h3>Touch type — all fingers, no looking</h3>
<p>The single biggest speed unlock is proper touch typing: all ten fingers on the home row, no looking at the keyboard. If you hunt-and-peck with two fingers, you're leaving 30+ WPM on the table. It takes a few uncomfortable weeks to retrain, but it's permanent.</p>

<h3>Prioritize accuracy over speed</h3>
<p>Counter-intuitive but true: type slower with fewer errors and your real-world speed goes up. Every correction costs more time than the mistake saved. Aim for 98%+ accuracy first; speed follows naturally.</p>

<h3>Test regularly, not obsessively</h3>
<p>A quick test every week or two is enough to track progress. More frequent testing becomes a performance anxiety loop. Use the test to measure, then practice away from the test.</p>

<h2>Why test your typing speed?</h2>
<p>Typing speed compounds. A developer who types 80 WPM vs. 40 WPM will produce code faster, write clearer commit messages, and communicate more easily in async tools. For anyone who works at a keyboard — which is most people — it's one of the highest-return skills to improve.</p>

<h2>Take the test</h2>
<p>TinyJoy's typing speed test is free, runs entirely in your browser, and takes under two minutes. <a href="/games/typing-speed">Try it now</a>.</p>
    `.trim(),
  },
  {
    slug: 'casual-games-no-download-required',
    title: 'Casual Games No Download Required',
    description: 'Play casual games instantly in your browser — no download, no account, no friction. Free casual browser games that load in seconds.',
    date: '2026-03-18',
    category: 'tips',
    readingTime: '3 min',
    content: `
<p>The best casual games are ones you can actually play — no installation, no loading screen, no tutorial you can't skip. Just open and go.</p>

<p>Here's what that looks like in practice.</p>

<h2>What Makes a Good Casual Game?</h2>
<p>A good casual game has three things:</p>
<ul>
<li><strong>Low entry cost.</strong> You understand it in 10 seconds.</li>
<li><strong>Short sessions.</strong> A satisfying round in under 2 minutes.</li>
<li><strong>Genuine replayability.</strong> You want to beat your score.</li>
</ul>

<p>The games at TinyJoy are built around these principles.</p>

<h2>Color Match</h2>
<p>Target color shown at the top. Tap matching tiles. 60 seconds. The rules take 5 seconds to understand; the score-chasing keeps you coming back.</p>
<p><a href="/games/color-match">Play Color Match →</a></p>

<h2>Memory Flip</h2>
<p>8 pairs of cards face-down. Flip two at a time. Match all pairs before time runs out. Classic memory game, no friction, no tutorial needed.</p>
<p><a href="/games/memory-flip">Play Memory Flip →</a></p>

<h2>Number Rush</h2>
<p>25 numbers scattered on screen. Tap them in order 1→25. Time yourself. This is the platonic ideal of a casual game: one rule, infinite replay value.</p>
<p><a href="/games/number-rush">Play Number Rush →</a></p>

<h2>Pattern Echo</h2>
<p>Simon Says, but smoother. A color sequence plays; you repeat it. Each correct round extends the sequence by one. Go until you miss.</p>
<p><a href="/games/pattern-echo">Play Pattern Echo →</a></p>

<h2>Word Scramble</h2>
<p>Scrambled letters. Type the correct word. 60 seconds to get as many as you can. Each word is common English — you know them all, it's just about seeing them fast.</p>
<p><a href="/games/word-scramble">Play Word Scramble →</a></p>

<h2>No Download, Ever</h2>
<p>TinyJoy is web-first. Every game runs in your browser on any device. No app to install, no account to create, no notification permissions to manage. Just games.</p>
<p>Start playing at <a href="/">tinyjoy.app</a>.</p>
    `.trim(),
  },

  // ─── Game Guides ────────────────────────────────────────────
  {
    slug: 'how-to-play-color-match',
    title: 'How to Play Color Match — Tips & Strategies',
    description: 'Learn how to play Color Match on TinyJoy. Tips, strategies, and tricks to beat your high score in this free 60-second color game.',
    date: '2026-03-18',
    category: 'game-guide',
    readingTime: '3 min',
    content: `
<p>Color Match is one of TinyJoy's fastest games. You've got 60 seconds, a target color, and a grid of colored tiles. Tap every tile that matches. Simple — but the score ceiling is surprisingly high.</p>

<p><a href="/games/color-match">Play Color Match now →</a></p>

<h2>How It Works</h2>
<ul>
<li>A target color is shown at the top of the screen.</li>
<li>Below it is a grid of colored tiles in various colors.</li>
<li>Tap every tile that matches the target color.</li>
<li>The grid refreshes with new tiles as you clear matches.</li>
<li>You have 60 seconds. Score as many correct taps as possible.</li>
</ul>

<h2>Tips to Improve Your Score</h2>

<h3>Scan the whole grid first</h3>
<p>Before tapping, spend half a second scanning the full grid. Your eyes can pick up all matching tiles at once; your finger just needs to follow. Reactive tapping beats sequential tapping.</p>

<h3>Don't second-guess similar shades</h3>
<p>Some colors are close to each other — orange vs. red, teal vs. blue. If you're unsure, trust your first instinct and move on. Hesitating costs more time than an occasional wrong tap.</p>

<h3>Stay calm when the grid refreshes</h3>
<p>After clearing matches, the grid resets with new tiles. New players often freeze here. Keep your eyes moving immediately — there's always something to tap.</p>

<h3>Use both thumbs on mobile</h3>
<p>On a phone, use both thumbs. Alternating hands halves your travel time between taps. On desktop, use your mouse confidently — no need to hover, just click.</p>

<h2>What's a Good Score?</h2>
<p>A first-time player will typically score 15–25. With a few rounds of practice, 35–50 is very achievable. Top scores push past 60. The jump from novice to competent mostly comes from eliminating hesitation, not from going physically faster.</p>

<h2>Play Now</h2>
<p>Color Match is free, no account required. <a href="/games/color-match">Open it in your browser</a> and go.</p>
    `.trim(),
  },
  {
    slug: 'how-to-play-memory-flip',
    title: 'How to Play Memory Flip — Tips & Strategies',
    description: 'Learn how to play Memory Flip on TinyJoy. Tips for improving your memory card game score in this free 60-second matching game.',
    date: '2026-03-18',
    category: 'game-guide',
    readingTime: '3 min',
    content: `
<p>Memory Flip is TinyJoy's take on the classic card-matching game. 8 pairs of cards, all face-down. Flip two cards at a time; match all 16 before the 60-second timer runs out. It looks simple. It's satisfying to get good at.</p>

<p><a href="/games/memory-flip">Play Memory Flip now →</a></p>

<h2>How It Works</h2>
<ul>
<li>16 cards are laid face-down in a 4×4 grid.</li>
<li>Tap any card to flip it over and see what's underneath.</li>
<li>Tap a second card. If they match, both stay face-up.</li>
<li>If they don't match, both flip back face-down.</li>
<li>Match all 8 pairs before 60 seconds to win.</li>
</ul>

<h2>Tips to Improve Your Score</h2>

<h3>Remember positions, not just cards</h3>
<p>When you flip a card and it doesn't match, remember where it is. The key skill in Memory Flip is building a mental map of card positions, not just the symbols. Think in grid coordinates: "the star is in the top-right corner."</p>

<h3>Be systematic on first flips</h3>
<p>In the opening phase, flip cards in a pattern (left-to-right, row-by-row). This builds your mental map faster than random flipping and reduces the chance you'll forget what you already revealed.</p>

<h3>Match early, scan later</h3>
<p>If you see a card and immediately know its match from memory, grab it. Don't delay a known match to "explore" more of the board. Speed counts — the clock is always running.</p>

<h3>Stay calm when you miss</h3>
<p>A mismatched flip isn't a mistake if you remember both positions. You've just added two more locations to your mental map. Treat every flip as information gathering.</p>

<h2>What's a Good Score?</h2>
<p>Completing all 8 pairs in under 60 seconds is the goal. Beginners often don't finish in time. With practice, finishing with 15–20 seconds remaining is very achievable. The best players finish in under 40 seconds total.</p>

<h2>Play Now</h2>
<p>Memory Flip is free at TinyJoy. <a href="/games/memory-flip">Open it in your browser</a> — no download, no account.</p>
    `.trim(),
  },
  {
    slug: 'how-to-play-number-rush',
    title: 'How to Play Number Rush — Tips & Strategies',
    description: 'Learn how to play Number Rush on TinyJoy. Tips and strategies to tap 1–25 faster and beat your best time in this free speed game.',
    date: '2026-03-18',
    category: 'game-guide',
    readingTime: '3 min',
    content: `
<p>Number Rush sounds absurdly simple: tap numbers 1 through 25 in order. But once you play it, you'll understand why people get hooked chasing their personal best. It's a pure test of visual scanning speed and coordination.</p>

<p><a href="/games/number-rush">Play Number Rush now →</a></p>

<h2>How It Works</h2>
<ul>
<li>25 numbers (1–25) are scattered randomly across the screen.</li>
<li>Start the timer by tapping 1.</li>
<li>Tap 2, then 3, then 4… all the way to 25.</li>
<li>Your final time is your score. Lower is better.</li>
<li>Every new game, the numbers are in a different layout.</li>
</ul>

<h2>Tips to Improve Your Time</h2>

<h3>Scan ahead, don't search after</h3>
<p>The biggest time-sink is pausing to find the next number after you've already tapped one. While your finger is moving to the current tap, your eyes should already be locating the next number. Build the habit of scanning ahead by 2–3 numbers.</p>

<h3>Divide the grid into zones</h3>
<p>Instead of scanning the whole screen, mentally divide it into quadrants. For each number, know which zone it's in before you start looking for it. This narrows your search area and reduces random eye movement.</p>

<h3>Don't panic at random layouts</h3>
<p>Every game has a different number layout, and some are genuinely harder than others. If your first scan doesn't find the next number instantly, take one breath and scan methodically. Panic-scrolling adds seconds.</p>

<h3>Play on a bigger screen when you can</h3>
<p>Numbers are easier to spot on a tablet or desktop than a small phone screen. If you're trying to set a personal best, a larger screen gives you more visual breathing room.</p>

<h2>What's a Good Time?</h2>
<p>A first attempt usually lands around 40–60 seconds. With practice, 20–30 seconds is realistic for most players. Sub-20 seconds is considered fast. The all-time obsessives aim for sub-15.</p>

<h2>Play Now</h2>
<p>Number Rush is free at TinyJoy. <a href="/games/number-rush">Open it in your browser</a> — no download required.</p>
    `.trim(),
  },
  {
    slug: 'how-to-play-pattern-echo',
    title: 'How to Play Pattern Echo — Tips & Strategies',
    description: 'Learn how to play Pattern Echo on TinyJoy. Tips for mastering the Simon Says color sequence memory game — free, no download.',
    date: '2026-03-18',
    category: 'game-guide',
    readingTime: '3 min',
    content: `
<p>Pattern Echo is TinyJoy's memory sequence game — a thoughtful, modern take on Simon Says. A color flashes; you repeat it. Then two colors; you repeat the sequence. The sequence grows one step at a time until you miss. How far can you go?</p>

<p><a href="/games/pattern-echo">Play Pattern Echo now →</a></p>

<h2>How It Works</h2>
<ul>
<li>The game shows a sequence of colored flashes.</li>
<li>After the sequence plays, you repeat it by tapping the colors in the same order.</li>
<li>Each round, one more color is added to the sequence.</li>
<li>Miss a color or tap in the wrong order and the game ends.</li>
<li>Your score is the length of the longest sequence you successfully completed.</li>
</ul>

<h2>Tips to Improve Your Score</h2>

<h3>Narrate the sequence aloud (or in your head)</h3>
<p>As the sequence plays, say the colors to yourself: "red, blue, red, green." Converting visual input to verbal memory activates a second memory channel and makes longer sequences much easier to retain.</p>

<h3>Chunk longer sequences</h3>
<p>At 6+ steps, break the sequence into chunks of 3. "Red-blue-green / yellow-red-blue" is far easier to hold in memory than a single 6-item list. This is the same technique used for phone numbers.</p>

<h3>Watch the whole sequence before repeating</h3>
<p>Wait for the full sequence to finish playing before you start tapping your response. Impatient early tapping often leads to losing track of your position in the sequence.</p>

<h3>Slow down on your response</h3>
<p>There's no time limit on your response. Tap at a pace that lets you mentally check off each color as you go. Speed during the response phase is irrelevant — accuracy is everything.</p>

<h2>What's a Good Score?</h2>
<p>First-time players typically reach 5–7. With practice, 10–12 is achievable for most people. Anything above 15 requires genuine focus and technique. The human short-term memory cap is around 7 ± 2 items — beat it consistently and you're doing something right.</p>

<h2>Play Now</h2>
<p>Pattern Echo is free at TinyJoy. <a href="/games/pattern-echo">Open it in your browser</a> — no download, no sign-up.</p>
    `.trim(),
  },
  {
    slug: 'how-to-play-typing-speed',
    title: 'How to Play Typing Speed Test — Tips to Type Faster',
    description: 'Learn how the TinyJoy Typing Speed Test works and get practical tips to improve your WPM. Free typing test in your browser, no sign-up.',
    date: '2026-03-22',
    category: 'game-guide',
    readingTime: '3 min',
    content: `
<p>The Typing Speed Test on TinyJoy measures how many words per minute (WPM) you can type, and how accurately. It's one of the more useful games on the site — your score directly reflects a real skill that affects everyday work.</p>

<p><a href="/games/typing-speed">Take the Typing Speed Test →</a></p>

<h2>How It Works</h2>
<ul>
<li>A passage of common English words appears on screen.</li>
<li>Start typing — the timer begins automatically on your first keystroke.</li>
<li>Type each word, then press space to advance to the next.</li>
<li>Finish the full passage as fast and accurately as possible.</li>
<li>Your WPM and accuracy are shown when you complete the test.</li>
</ul>

<h2>How WPM Is Calculated</h2>
<p>WPM is calculated as the number of characters typed divided by 5 (the standard "word" length), divided by the time in minutes. Errors are factored into your accuracy score. A 95 WPM gross speed with 90% accuracy is a worse result than 75 WPM with 99% accuracy.</p>

<h2>Tips to Improve Your Score</h2>

<h3>Slow down to speed up</h3>
<p>The most reliable way to raise your WPM is to reduce errors, not to type faster. Every backspace correction costs more time than the speed "saved" by rushing. Type at the edge of your comfort zone — not beyond it.</p>

<h3>Keep your eyes on the text, not your fingers</h3>
<p>Looking at the keyboard breaks your reading rhythm and forces you to find your place again on screen. Trust your fingers to find the keys. Even if you're not a full touch typist, training yourself not to look is an immediate speed boost.</p>

<h3>Relax your hands</h3>
<p>Tension in your hands and wrists slows you down and causes errors. Shake out your hands before the test. Keep your wrists level. Relaxed muscles move faster than tense ones.</p>

<h3>Read ahead of where you're typing</h3>
<p>Your eyes should always be 1–2 words ahead of where your fingers are. This eliminates the micro-pause between words and keeps your rhythm consistent.</p>

<h2>What's a Good Score?</h2>
<p>The average adult types 40–50 WPM. If you're comfortable at a keyboard but not trained, expect 50–70 WPM. Touch typists with practice typically score 70–100 WPM. Above 100 WPM requires deliberate training — it's fast, but achievable.</p>

<h2>Take the Test</h2>
<p>Typing Speed Test is free at TinyJoy. <a href="/games/typing-speed">Open it in your browser</a> — no sign-up, no download.</p>
    `.trim(),
  },
  {
    slug: 'how-to-play-reaction-time',
    title: 'How to Play Reaction Time — Tips to Test Your Reflexes',
    description: 'Learn how the TinyJoy Reaction Time test works and what your score means. Measure your reflexes in milliseconds — free, no download.',
    date: '2026-03-22',
    category: 'game-guide',
    readingTime: '3 min',
    content: `
<p>Reaction Time is TinyJoy's pure reflex test. A signal appears — you tap as fast as you can. Your time in milliseconds is your score. Simple, honest, and surprisingly hard to accept when it's slower than you expected.</p>

<p><a href="/games/reaction-time">Test your reaction time →</a></p>

<h2>How It Works</h2>
<ul>
<li>The screen shows a "wait" state.</li>
<li>After a random delay, the signal changes.</li>
<li>Tap (or click) as fast as possible when it changes.</li>
<li>Your reaction time in milliseconds is shown immediately.</li>
<li>Play multiple rounds to get an average — single results vary more than you'd expect.</li>
</ul>

<h2>What's a Good Reaction Time?</h2>
<p>Human reaction time follows a predictable distribution:</p>
<ul>
<li><strong>Under 150ms</strong> — exceptionally fast; likely an anticipation guess, not a true reaction</li>
<li><strong>150–200ms</strong> — elite; top-tier athletes and gamers</li>
<li><strong>200–250ms</strong> — very good; above average</li>
<li><strong>250–300ms</strong> — average for a healthy adult</li>
<li><strong>300–400ms</strong> — slightly below average; normal variation</li>
<li><strong>Above 400ms</strong> — tired, distracted, or the random delay was very long</li>
</ul>
<p>The average is right around 250ms. Don't be surprised if you land there — it's where most people do.</p>

<h2>Tips for a Cleaner Test</h2>

<h3>Don't anticipate — wait for the signal</h3>
<p>The delay before the signal is randomized to prevent anticipation guessing. If you tap before the signal changes, it records a false start. Wait. A real 240ms reaction is better than a guessed 100ms that gets flagged.</p>

<h3>Use a mouse on desktop, not a trackpad</h3>
<p>Trackpad clicks have slightly more travel than a mouse button. On desktop, a real mouse click is physically faster. On mobile, a direct screen tap is ideal.</p>

<h3>Take 5+ rounds and average them</h3>
<p>Single reaction time measurements are noisy — there's real variance round to round. For an accurate picture of your baseline, play 5–10 rounds and average the results. Ignore your outlier worst and best.</p>

<h3>Test at your best, not your worst</h3>
<p>Reaction time is genuinely affected by fatigue, caffeine, and distraction. Test when you're awake and focused for the most accurate baseline. Testing half-asleep isn't representative.</p>

<h2>Why Reaction Time Matters</h2>
<p>Reaction time is a component of many real skills: driving, sports, gaming, and even catching things you knock off a table. It's not purely genetic — consistent sleep, exercise, and deliberate practice on reflex games like this one can improve it over time.</p>

<h2>Play Now</h2>
<p>Reaction Time is free at TinyJoy. <a href="/games/reaction-time">Open it in your browser</a> — no download, no account.</p>
    `.trim(),
  },
  {
    slug: 'how-to-play-word-scramble',
    title: 'How to Play Word Scramble — Tips & Strategies',
    description: 'Learn how to play Word Scramble on TinyJoy. Tips to unscramble words faster and beat your high score in this free 60-second word game.',
    date: '2026-03-18',
    category: 'game-guide',
    readingTime: '3 min',
    content: `
<p>Word Scramble is TinyJoy's vocabulary speed game. Scrambled letters appear on screen; you type the correct word. 60 seconds to solve as many as possible. It's a calm, mental game that rewards pattern recognition over word knowledge.</p>

<p><a href="/games/word-scramble">Play Word Scramble now →</a></p>

<h2>How It Works</h2>
<ul>
<li>A scrambled word appears on screen.</li>
<li>Type the correct unscrambled word and press enter.</li>
<li>Each correct word scores a point and a new scramble appears.</li>
<li>Skip a word you're stuck on — no penalty, just move on.</li>
<li>You have 60 seconds. Score as many words as possible.</li>
</ul>

<h2>Tips to Improve Your Score</h2>

<h3>Look for common word shapes</h3>
<p>Most words follow patterns: consonant clusters (str-, -ght, -tion), common endings (-ing, -ed, -er, -ly). Train yourself to spot these patterns in the scrambled letters rather than trying each possible letter combination.</p>

<h3>Say the letters aloud</h3>
<p>Saying scrambled letters out loud (or in your head) engages a different part of your brain than reading them visually. You'll often "hear" the word before you can see it in the letters.</p>

<h3>Skip fast, return never</h3>
<p>If a word doesn't click in 3 seconds, skip it. Don't go back. Moving to a fresh scramble is almost always faster than continuing to stare at a hard one. High scores come from fast, confident guesses — not from wrestling with one difficult word.</p>

<h3>Type confidently</h3>
<p>Don't erase and retype unless you're sure. On mobile, use autocomplete as a hint — if your first few letters suggest a word, trust it. The words in Word Scramble are all common English words you already know.</p>

<h2>What's a Good Score?</h2>
<p>First-time players typically solve 5–8 words in 60 seconds. With practice, 12–18 is very achievable. High scores push past 20. The ceiling is mostly about typing speed and confidence, not vocabulary.</p>

<h2>Play Now</h2>
<p>Word Scramble is free at TinyJoy. <a href="/games/word-scramble">Open it in your browser</a> — no download, no account needed.</p>
    `.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
