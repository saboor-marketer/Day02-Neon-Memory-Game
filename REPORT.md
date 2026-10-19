# Memory Lab — Project Report

**Project:** Simon Says Memory Game
**Theme:** "Neon Memory Lab" — futuristic arcade / indie game
**Stack:** React 19, TypeScript, Vite 7, Tailwind CSS v4, lucide-react, Web Audio API, localStorage
**Status:** Complete, type-checked, production build verified
**Repo root:** `/` (entry point `src/App.tsx`)

---

## 1. Objective

Build a showcase-quality Simon Says game that goes far beyond the usual tutorial implementation. Success meant four things at once:

1. **Correctness** — a deterministic game loop with no overlapping sequences, stale state, orphaned timers, or double-fire input.
2. **Identity** — a "Neon Memory Lab" visual system that feels like a polished indie title rather than a bootstrap demo.
3. **Feel** — responsive pad feedback, synthesised audio, celebratory and failure moments that make retrying irresistible.
4. **Craft** — accessible semantics, reduced-motion support, responsive layout from 320 px to widescreen, and documented code.

The extra "Beat Your Best" requirement is treated as a first-class feature, not a single number in a corner.

---

## 2. Design Direction

### 2.1 Palette

| Token | Hex | Role |
| --- | --- | --- |
| Midnight base | `#050816` / `#070b1d` | Page background, board housing |
| Navy panel | `#0a1026` – `#141c3d` | Board ring, center display |
| Electric cyan | `#22d3ee` | Pad 1, active-input accent, primary CTA |
| Neon purple | `#a855f7` | Pad 2, best-score accent |
| Lime green | `#a3e635` | Pad 3, success, new-record celebration |
| Vibrant coral | `#fb7185` | Pad 4, error state, failure copy |

Supporting neutrals are slate (`#94a3b8`, `#cbd5e1`, `#e2e8f0`) so neon accents stay dominant and the layout never becomes noisy.

### 2.2 Typography

- **Space Grotesk** for headings, body, and buttons — geometric, modern, slightly technical.
- **JetBrains Mono** for labels, stats, badges, keycaps, and numeric readouts — reinforces the lab/arcade instrument-panel feel.
- Tight tracking on the hero heading, wide uppercase tracking with monospace on micro-labels.

### 2.3 Layout

```
┌───────────────────────────────────────────────────────────┐
│ [⬢ MEMORY LAB]                                   [READY]   │
│                  Train Your Brain.                        │
│      Watch the pattern. Remember the sequence…            │
│                                                           │
│    ┌───────────────────┐      ┌─────────────────────────┐ │
│    │                   │      │ Score  Best  Accuracy   │ │
│    │   circular board  │      ├─────────────────────────┤ │
│    │  (4 neon pads +   │      │ Beat Your Best tracker  │ │
│    │  central level)   │      ├─────────────────────────┤ │
│    │                   │      │ Start / Play Again      │ │
│    └───────────────────┘      │ Difficulty + Sound      │ │
│                               └─────────────────────────┘ │
│               "One more round?" (motivational)            │
│   How to play: 01 Watch · 02 Repeat · 03 Level Up · 04 …  │
└───────────────────────────────────────────────────────────┘
```

- **Mobile:** single column — header, board, stats, controls, instructions. Board is `min(88vw, 440px)` and centered.
- **Desktop (≥1024 px):** two-column grid with the board on the left (`1.1fr`) and the control stack on the right (`1fr`), constrained to a `max-w-6xl` canvas.

### 2.4 Signature visual elements

- **Circular board** with asymmetric quarter-ring pads (`border-radius` per quadrant) so four squares compose a vivid ring around a central display.
- **Conic ring border** that rotates continuously and accelerates while the computer is playing.
- **Ambient depth layers:** fixed radial-gradient orbs, a mask-faded grid, and 28 floating particles with staggered delays.
- **Glass panels:** translucent white gradient, 1 px light border, inset highlight, and 18 px backdrop blur.
- **Central display:** level number with cyan glow and pop animation, plus progress dots representing the current sequence.

---

## 3. Architecture

```
App
├─ Background
├─ Header ── StatusBadge
├─ GameBoard ── ColorPad ×4 (+ central level display, progress dots)
├─ ScorePanel            (score / best / accuracy + Beat Your Best tracker)
├─ GameControls          (start / retry / abort, difficulty switch, sound toggle)
├─ Instructions          (4-step guide + motivational footer)
└─ GameOverModal ── Confetti (only on a new record)
```

### 3.1 State ownership

All gameplay state lives in one custom hook, `useSimonGame()`. Components are presentational and receive typed props, which keeps game rules in exactly one place.

| Concern | Owner |
| --- | --- |
| Sequence, level, player index | `useSimonGame` (refs + mirrored state) |
| Status machine | `useSimonGame` |
| Score, accuracy, best record | `useSimonGame` |
| Audio synthesis + mute preference | `useAudio` |
| Reduced-motion detection | `usePrefersReducedMotion` |
| Modal open timing, motivational copy | `App` |

### 3.2 File map

| File | Responsibility |
| --- | --- |
| `src/game/constants.ts` | Pad configs, difficulties, timing constants, scoring/copy, storage keys, types |
| `src/game/useSimonGame.ts` | State machine, timer scheduler, input validation, scoring, persistence, keyboard handling |
| `src/game/useAudio.ts` | Lazy `AudioContext`, tone/envelope synthesis, mute persistence |
| `src/game/usePrefersReducedMotion.ts` | Reactive media-query hook |
| `src/components/*` | Board, pads, score panel, controls, modal, confetti, header, badge, instructions, background |
| `src/index.css` | Tailwind import, theme tokens, neon effects, animations, reduced-motion overrides |

---

## 4. Game Logic

### 4.1 State machine

```
        ┌─────────┐  Start Game   ┌────────────┐  playback ends  ┌──────────┐
        │  ready  │ ────────────▶ │  watching  │ ──────────────▶ │  input   │
        └─────────┘               └────────────┘                 └────┬─────┘
             ▲                          ▲                             │
             │ Abort / restart          │ +1 random pad     sequence  │ correct tap
             │                          │                   complete  ▼
        ┌────┴─────┐                    └────────────────────────── ┌──────────┐
        │ restart  │                                                 │ success  │
        └──────────┘                                                 └──────────┘
             ▲                                                             │
             │                     wrong pad                             │ pause
             └─────────────── ┌────────────┐ ◀──────────────────────────┘
                              │  gameover  │
                              └────────────┘
```

Rules enforced:

- Playback begins with a difficulty-specific lead-in, then flashes each pad (`lightOn`), clearing it before the next (`gap`).
- **Input is unlocked only after the final scheduled callback**, via `updateStatus("input")` plus `inputLockRef = false`.
- The board is disabled whenever `canInteract` (i.e. `status === "input"`) is false; pads also expose `aria-disabled`.
- `pressPad` re-checks both `statusRef` and `inputLockRef`, so rapid taps, double events, and stale handlers cannot register extra presses.
- Completing the sequence locks input, awards the round bonus, shows the success state briefly, then appends exactly one random pad and replays the full sequence.
- A wrong pad records the failed tap, triggers error feedback, stops input, and ends the run.

### 4.2 Concurrency & stale-state strategy

- **Run scoping:** every start/abort increments `runIdRef`. Scheduled callbacks capture the id at scheduling time and return early if it no longer matches. This makes restart-while-playing safe.
- **Timer registry:** every timeout id is stored in a `Set` and cleared on start, abort, and unmount.
- **Refs first:** `sequenceRef`, `playerIndexRef`, `scoreRef`, `difficultyRef`, `bestRef`, and `recordBeatenRef` are the sources of truth inside timers; state mirrors them for rendering. This avoids the classic "setState inside setTimeout closes over an old sequence" bug.
- **Press token:** each press increments `pressTokenRef`. The token gates both the next animation frame that lights the pad and the timeout that clears it, so rapid same-pad taps each re-flash instead of cancelling each other.
- **Previous-record snapshot:** the "new high score" decision compares the new score with the record loaded before the run and is written once, preventing repeated writes.

### 4.3 Difficulty

| Mode | Flash (`lightOn`) | Gap | Lead-in | Multiplier |
| --- | --- | --- | --- | --- |
| Easy | 620 ms | 320 ms | 900 ms | ×1 |
| Normal | 420 ms | 200 ms | 750 ms | ×2 |
| Hard | 240 ms | 110 ms | 600 ms | ×3 |

Difficulty is locked during `watching`, `input`, and `success` to prevent mid-sequence tempo changes; the control is visually disabled and annotated "locked during round".

### 4.4 Scoring and accuracy

- Correct tap: `10 × multiplier`
- Completed round: `level × 5 × multiplier`
- Accuracy: `round(correct / total × 100)`, defaulting to **100%** before the first tap.
- Failure is counted as an incorrect tap so accuracy reflects the miss.

### 4.5 Persistence

| Key | Value |
| --- | --- |
| `memory-lab:best:v1` | `{ score, level, difficulty }` — written only on a new record |
| `memory-lab:sound` | `"1"` or `"0"` — sound preference |

Reads are wrapped in `try/catch` with schema validation, and writes are guarded so private-mode or quota failures never break the game. The sound context is unlocked by the Start gesture, satisfying browser autoplay policies.

---

## 5. "Beat Your Best" Feature

Implemented in `ScorePanel` with state from `useSimonGame`:

- **Target framing:** the current best is the explicit target, with a progress bar toward it.
- **Live countdown:** shows `N to go` and updates with every point, or "Set your first record" for a fresh profile.
- **Instant celebration:** passing the record mid-run sets `recordBeatenThisRun`, which reveals a pulsing lime **NEW RECORD** chip and turns the bar lime before the run even ends.
- **Record context:** displays the record level and difficulty alongside the current run's mode and multiplier.
- **Saved outcome:** only a genuinely higher final score overwrites the record; the modal then switches to the "NEW HIGH SCORE!" celebration with confetti and the record fanfare.

Edge cases handled: no prior record (zero state), tie with the previous best (does not overwrite), record set on a different difficulty (still compares score), and aborting a run (no write).

---

## 6. Audio Design

- A single lazily created `AudioContext`, resumed on user gesture.
- Each pad has a distinct pitch: **Cyan E4 (329.63)**, **Purple G4 (392.00)**, **Lime C4 (261.63)**, **Coral C5 (523.25)**.
- Pad tone = sine fundamental + quiet triangle one octave above for sparkle.
- Envelopes use exponential ramps to avoid clicks; oscillators stop after their decay.
- Error = low sawtooth + detuned square; success = three-note arpeggio; record = five-note fanfare; UI click = short square blip.
- Mute is respected inside the synth (not just in the UI), persisted, and announced via `aria-pressed`.

---

## 7. Motion & Feedback

| Moment | Treatment |
| --- | --- |
| Pad active | brightness/saturation boost, `scale(1.04)`, double-layer neon glow |
| Player press | immediate `pointerdown` response + 220 ms flash |
| Wrong pad | red override, wobble animation, board shake, error buzz |
| Level change | keyed number with pop animation |
| Stats change | keyed stat values with bump animation |
| Round perfect | lime center glow, "NICE!" badge, success chime |
| New record | confetti, animated gradient title, record chip, fanfare |
| Ambient | slow orb drift, particle rise, conic ring rotation, CTA sheen |

`prefers-reduced-motion: reduce` collapses animation and transition durations, disables orbs/particles/ring/sheen/shake/confetti, and removes the active pad scale transform while preserving all state feedback via color and text.

---

## 8. Accessibility Review

- **Semantics:** `header`, `main`, `section`, `footer`, `ol`; pads are native buttons.
- **Labels:** each pad is labelled, e.g. *"Cyan pad (key 1)"*; controls have explicit accessible names.
- **Live regions:** status badge uses `role="status"` / `aria-live="polite"`; the center level display is also live so level changes are announced.
- **Dialog:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus moved to **TRY AGAIN**, Esc to close, Enter to retry, click-outside to dismiss.
- **Progress:** the Beat Your Best bar exposes `progressbar` semantics with min/max/now.
- **Keyboard:** `1`–`4` map to pads and `preventDefault` avoids page side effects; focus-visible rings remain on pads and buttons.
- **Contrast:** neon accents are used on near-black backgrounds with supporting white/slate text; decorative elements are `aria-hidden`.
- **Targets:** pads occupy roughly a quarter of a board that is at least ~280 px on the smallest supported phone; secondary controls use comfortable padding.

---

## 9. Performance

- **Small tree:** no routing, state library, or animation library; only `lucide-react` is added.
- **Timer hygiene:** no intervals; every timeout is tracked and cleared, and unmount closes the `AudioContext`.
- **Minimal re-render scope:** gameplay state changes re-render `App` and the presentational panels, while `useMemo`/`useCallback` stabilise audio handles and derived values; the background particles are computed once.
- **CSS-first animation:** transforms and opacity only, avoiding layout thrash; backdrop blur is limited to a few panels.
- **Production build:** single-file output ≈ **270 kB** (≈ **82 kB** gzipped), fonts loaded from Google Fonts with preconnect.
- **No runtime audio assets:** tones are generated, keeping the bundle lean.

---

## 10. Verification

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Pass, zero errors |
| `npm run build` | Pass — Vite 7, 1948 modules, inlined single-file bundle |
| Start → watch → input transition | Verified in logic review; input locked until playback callbacks finish |
| Restart during playback | All timers cleared, run id invalidated |
| Wrong pad path | Error pad, shake, buzz, status change, delayed modal |
| Record path | Record persisted once, chip + confetti + modal copy |
| Difficulty lock | Disabled during round; timer values read from the active mode |
| localStorage robustness | Guarded parse/validate and guarded writes |
| Keyboard handlers | `1`–`4`, Enter, Esc implemented with duplicate-prevention |
| Responsive layout | Fluid clamps, `min-h-dvh`, `overflow-x-hidden`, `viewport-fit=cover` |

Automated browser tests were not run (no headless browser in the environment); behaviour was validated by type-checking, production build, and a structured manual code review. A manual QA checklist is maintained in `README.md`.

---

## 11. Known Limitations

- The record is compared by **score**, not by level, so a high multiplier can set a score record at a lower level. The record's level and difficulty are stored and displayed for context.
- No backend means no cross-device sync or global leaderboard.
- iOS haptics are unavailable in Safari; no vibration feedback is shipped.
- Web Audio may remain silent if the browser blocks audio creation entirely; the UI still communicates state visually.
- Sound preference is per-browser because it lives in localStorage.
- The game is intentionally endless with no level cap; very long sequences make the progress dots switch to a numeric `x/y` readout.

---

## 12. Future Roadmap

1. **Daily Challenge** — deterministic sequence seeded by date, one attempt, shareable result.
2. **Pass & Play** — two-player duel with mirrored sequences.
3. **Reverse / Echo mode** — repeat the pattern backwards for a higher multiplier.
4. **Global leaderboard** — requires a small backend or serverless function.
5. **Haptics** — `navigator.vibrate` on supported Android devices.
6. **Themes** — alternate lab palettes ("Ultraviolet", "Bio Lab") unlocked by records.
7. **Test suite** — Vitest + React Testing Library coverage for the reducer-like hook, plus Playwright end-to-end runs with fake timers.
8. **PWA** — installable app with offline caching and an app icon.

---

## 13. Conclusion

Memory Lab delivers the complete Simon Says loop — random sequence generation, gated playback, exact input validation, progressive levels, mistake handling, and persisted best scores — inside a cohesive neon arcade interface. The engineering emphasis is on **timer safety, stale-state avoidance, and accessibility**, while the design emphasis is on **glow, depth, and satisfying feedback**. The "Beat Your Best" tracker turns the persisted high score into a visible, moment-to-moment goal, giving the game its replay loop.

**Run it locally**

```bash
npm install
npm run dev
```
