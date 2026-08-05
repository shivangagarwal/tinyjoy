# CrazyGames Video Assets — Spec & Recording Guide

**Task:** TIN-87
**Required for:** CrazyGames developer portal submission
**Deadline:** Submit ASAP (landscape video is blocking submission)

---

## Requirements (from CrazyGames portal)

| Asset | Required? | Format | Max Length |
|---|---|---|---|
| Landscape video | **YES** (blocked submission) | MP4 or MOV | 20 seconds |
| Portrait video | Optional | MP4 or MOV | 20 seconds |

> "Game videos will be displayed when players hover over your game cover. A compelling game video is crucial — it's often the first impression that captures attention and drives players to click and play."

---

## Landscape Video Spec

**Dimensions:** 1920×1080 (or at minimum 1280×720)
**Duration:** 10–15 seconds
**Format:** MP4 (H.264)

### Content Flow

| Time | Action |
|---|---|
| 0–2s | TinyJoy homepage — shows the game grid, brand feel |
| 2–6s | Quick gameplay clip: Minesweeper or Solitaire (recognizable, fast-paced) |
| 6–10s | Quick gameplay clip: 2048 or Snake (shows tile-sliding or movement) |
| 10–13s | Quick gameplay clip: Color Match or Word Scramble (colorful, energetic) |
| 13–15s | End card: tinyjoy.app URL + tagline "Free browser games. Play instantly." |

### Recording Instructions

1. Open Chrome in full screen (1920×1080 if possible)
2. Use **QuickTime Player** (Mac) → File → New Screen Recording → select browser area
   - OR use **OBS** (free) for cleaner recording
3. Navigate to https://tinyjoy.app — let the homepage load
4. Start recording, then:
   - Show homepage for 2 seconds (scroll slightly to show game grid)
   - Click into Minesweeper and play for ~4 seconds (click a few tiles)
   - Click Back, open 2048, make a few swipes
   - Click Back, open Color Match, tap a few colored tiles
5. Stop recording
6. Trim to 10–15 seconds in QuickTime (Edit → Trim) or iMovie
7. Export as MP4

**Tips for best results:**
- Clear browser bookmarks bar before recording (cleaner look)
- Use a fast mouse — hesitation looks slow on video
- Do NOT record with sound (CrazyGames videos autoplay muted)
- Make sure games are loaded before recording starts

---

## Portrait Video Spec (Optional but Recommended)

**Dimensions:** 1080×1920 (or 9:16 ratio)
**Duration:** 10–15 seconds
**Format:** MP4 (H.264)

### Recording Instructions

1. Open Chrome DevTools (F12) → Toggle device toolbar → Select iPhone 14 Pro (390×844)
2. Zoom in to fill the viewport
3. Record using QuickTime screen capture
4. Same content flow as landscape but focused on mobile gameplay

### Alternative: Phone Recording

- Open https://tinyjoy.app on your iPhone/Android
- Use native screen recording (Control Center → Screen Record on iPhone)
- Play a game for 10–15 seconds
- Trim and export

---

## Games to Feature (Priority Order)

Best games for video showcase — recognizable, visually engaging:

1. **Minesweeper** — universally known, satisfying reveals
2. **Solitaire** — classic card game, instantly recognizable
3. **2048** — sliding tiles look great on video
4. **Snake** — movement-heavy, dynamic
5. **Color Match** — colorful, fast-paced, eye-catching

Avoid for video: Number Rush, Word Guess, Typing Speed — less visually dynamic.

---

## File Naming & Upload

- `tinyjoy-landscape.mp4` → upload to Landscape video field
- `tinyjoy-portrait.mp4` → upload to Portrait video field (optional)

Upload at: https://developer.crazygames.com (your game submission page)

---

*Created: 2026-04-07 | Task: TIN-87*
