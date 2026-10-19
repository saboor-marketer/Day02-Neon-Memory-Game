# 🧠 Memory Lab — Simon Says Memory Game

A premium, fully playable **Simon Says** memory game with a **"Neon Memory Lab"** identity — midnight navy gradients, glassmorphism panels, glowing arcade pads, and sound synthesised entirely in the browser with the Web Audio API.

Built with **React 19 + TypeScript + Vite + Tailwind CSS v4** and `lucide-react` icons. No backend, no database, no audio assets.

![Status](https://img.shields.io/badge/build-passing-22d3ee)
![React](https://img.shields.io/badge/React-19-a855f7)
![Vite](https://img.shields.io/badge/Vite-7-a3e635)
![License](https://img.shields.io/badge/license-MIT-fb7185)

---

## ✨ Features

| Area | Details |
| --- | --- |
| **Core loop** | Watch a random sequence, repeat it exactly, earn a point and one extra step per completed round. One wrong pad ends the run. |
| **Game states** | `ready → watching → input → success → gameover`, plus restart/abort. Board input is hard-locked while the computer plays. |
| **Difficulty** | **Easy** (620 ms flashes / 320 ms gaps / ×1), **Normal** (420 / 200 / ×2), **Hard** (240 / 110 / ×3). Locked mid-round. |
| **Beat Your Best** | Dedicated tracker with a progress bar, live "N to go" counter, and a pulsing **NEW RECORD** chip the instant you pass your record. |
| **Persistence** | Best score, record level, record difficulty, and sound preference are stored in `localStorage`. |
| **Game Over** | Premium overlay — "PATTERN BROKEN!" plus final level, score, best, accuracy, gap to record, motivational copy, and **TRY AGAIN**. Beating the record triggers **"NEW HIGH SCORE!"** with confetti. |
| **Audio** | Distinct layered tone per pad (sine + triangle octave), error buzz, success arpeggio, and a record fanfare. Mutable and persisted. |
| **Feedback** | Glow/scale on activation, red flash + board shake on error, animated level and stat numbers, progress dots. |
| **Keyboard** | `1`–`4` press the four pads, `Enter` retries on the game-over modal, `Esc` closes it. |
| **Accessibility** | Semantic landmarks, `aria-live` status, descriptive pad labels, visible focus rings, focus management in the modal, and full `prefers-reduced-motion` support. |
| **Responsive** | Board clamped to the viewport, centered layout, tap-friendly pads, no horizontal scrolling. Stacked on mobile, two-column on desktop. |

---

## 🚀 Getting started

**Requirements:** Node.js 18+ and npm.

```bash
# 1. install dependencies
npm install

# 2. start the dev server (http://localhost:5173)
npm run dev

# 3. production build into dist/
npm run build

# 4. preview the production build
npm run preview
```

> Sound starts on your first interaction (browser autoplay policy). Use the **Sound on / Muted** toggle in the controls panel.

---

## 🎮 How to play

1. Pick a difficulty (optional) and press **Start Game**.
2. Watch the pads flash one by one — the status badge shows **WATCH**.
3. When it changes to **YOUR TURN**, repeat the sequence by tapping the pads (or pressing `1`–`4`).
4. Complete the sequence and one more random step is added. The level badge in the center ticks up.
5. A single wrong pad breaks the pattern → review your run → **TRY AGAIN**.
6. Beat your record to set a new personal best that survives refreshes.

---

## 🧮 Scoring

| Action | Points |
| --- | --- |
| Correct pad press | `10 × difficulty multiplier` |
| Completed round bonus | `level × 5 × difficulty multiplier` |
| Accuracy | `correct taps ÷ total taps × 100` (100% before the first tap) |

The high score is compared by **score**, and the record's level and difficulty are stored alongside it.

---

## 🗂 Project structure

```
.
├─ index.html                  # title, meta, favicon, Google Fonts
├─ src/
│  ├─ App.tsx                  # layout, modal orchestration, motivational copy
│  ├─ index.css                # Neon Memory Lab theme, board/pad effects, animations
│  ├─ main.tsx                 # React entry point
│  ├─ game/
│  │  ├─ constants.ts          # pad definitions, difficulties, scoring, copy, types
│  │  ├─ useSimonGame.ts       # game state machine, timers, scoring, persistence
│  │  ├─ useAudio.ts           # Web Audio synth + sound preference
│  │  └─ usePrefersReducedMotion.ts
│  └─ components/
│     ├─ GameBoard.tsx         # circular board, central level display, progress dots
│     ├─ ColorPad.tsx          # accessible, quadrant-shaped neon pad
│     ├─ ScorePanel.tsx        # score / best / accuracy + Beat Your Best tracker
│     ├─ GameControls.tsx      # start/restart/abort, difficulty switch, sound toggle
│     ├─ GameOverModal.tsx     # Pattern Broken / New High Score overlay
│     ├─ Confetti.tsx          # lightweight CSS confetti
│     ├─ Header.tsx            # logo, heading, subtitle, status badge
│     ├─ StatusBadge.tsx       # READY / WATCH / YOUR TURN / GAME OVER pill
│     ├─ Instructions.tsx      # how-to-play panel + motivational footer
│     └─ Background.tsx        # ambient orbs, grid, particles
└─ REPORT.md                   # full engineering & design report
```

---

## 🛠 Tech stack

- **React 19** — functional components and hooks only
- **TypeScript** — typed game states, pad configs, and props
- **Vite 7** — dev server and production build
- **Tailwind CSS v4** — utility layout plus a custom CSS layer for the neon theme
- **lucide-react** — icons
- **Web Audio API** — runtime sound synthesis
- **localStorage** — best score and sound preference

---

## 🔍 Implementation notes

- Timers are **run-scoped**: a monotonically increasing `runId` invalidates callbacks from previous games, so restarting never leaves a stray sequence playing.
- The current sequence, player index, score, and difficulty live in **refs mirrored to state**, so timeouts always read fresh values without stale-closure bugs.
- Input is blocked by both a status check (`status !== "input"`) and an `inputLockRef` guard, and a press token prevents overlapping clear/press animations.
- Audio nodes are created per tone and stopped after their envelope completes; the `AudioContext` is created lazily on the first user gesture.
- All game copy, scoring constants, and difficulty timings are centralised in `src/game/constants.ts`.

---

## ♿ Accessibility & motion

- Every pad is a real `<button>` with an `aria-label` such as "Cyan pad (key 1)".
- The status pill uses `role="status"` with `aria-live="polite"`, so screen readers announce WATCH / YOUR TURN / GAME OVER.
- The game-over dialog uses `role="dialog"`, `aria-modal`, initial focus on **TRY AGAIN**, Esc to close, and Enter to retry.
- The Beat Your Best bar exposes `role="progressbar"` with `aria-valuenow`.
- `prefers-reduced-motion: reduce` disables confetti, shaking, spinning rings, sheens, and particle drift.
- Focus-visible outlines remain visible on all interactive controls.

---

## ✅ Manual QA checklist

- [x] Start → sequence plays → input unlocks only afterwards
- [x] Correct full sequence increments level and appends exactly one step
- [x] Wrong pad triggers red flash, shake, buzz, and game-over modal
- [x] Restart during playback cancels every pending timer
- [x] Best score and sound preference persist across refreshes
- [x] Difficulty changes tempo and is locked mid-round
- [x] New-record path shows confetti and the celebration copy
- [x] Keyboard `1`–`4`, `Enter`, `Esc` all work
- [x] Muted mode makes no sound while visuals continue
- [x] Layout works from 320 px phones up to desktop
- [x] `npm run build` completes with zero TypeScript errors

---

## 📌 Possible next steps

Daily challenge sequences, a two-player pass-and-play mode, a global leaderboard (requires a backend), an "echo" mode with reversed order, and haptic feedback via `navigator.vibrate` on supported devices.

---

## 📄 License

MIT — free to use, remix, and showcase.
