export type Difficulty = "easy" | "normal" | "hard";

export type GameStatus =
  | "ready"
  | "watching"
  | "input"
  | "success"
  | "gameover";

export interface PadConfig {
  id: number;
  name: string;
  /** base color used for glow + gradients */
  color: string;
  /** lighter highlight */
  light: string;
  /** Web Audio frequency (Hz) */
  frequency: number;
  /** keyboard shortcut */
  key: string;
}

export const PADS: PadConfig[] = [
  { id: 0, name: "Cyan", color: "#22d3ee", light: "#a5f3fc", frequency: 329.63, key: "1" },
  { id: 1, name: "Purple", color: "#a855f7", light: "#e9d5ff", frequency: 392.0, key: "2" },
  { id: 2, name: "Lime", color: "#a3e635", light: "#ecfccb", frequency: 261.63, key: "3" },
  { id: 3, name: "Coral", color: "#fb7185", light: "#fecdd3", frequency: 523.25, key: "4" },
];

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  description: string;
  /** how long a pad stays lit during playback (ms) */
  lightOn: number;
  /** pause between pads during playback (ms) */
  gap: number;
  /** delay before the computer starts showing a new sequence (ms) */
  leadIn: number;
  /** score multiplier */
  multiplier: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: "easy",
    label: "Easy",
    description: "Slow & steady playback",
    lightOn: 620,
    gap: 320,
    leadIn: 900,
    multiplier: 1,
  },
  normal: {
    id: "normal",
    label: "Normal",
    description: "Moderate tempo",
    lightOn: 420,
    gap: 200,
    leadIn: 750,
    multiplier: 2,
  },
  hard: {
    id: "hard",
    label: "Hard",
    description: "Fast flashes, short gaps",
    lightOn: 240,
    gap: 110,
    leadIn: 600,
    multiplier: 3,
  },
};

export const DIFFICULTY_ORDER: Difficulty[] = ["easy", "normal", "hard"];

/** how long a pad lights up when the player presses it */
export const PLAYER_FLASH_MS = 220;
/** pause after a successful round before next sequence */
export const SUCCESS_PAUSE_MS = 650;

export const STORAGE_KEY = "memory-lab:best:v1";

export interface BestRecord {
  score: number;
  level: number;
  difficulty: Difficulty;
}

export const MOTIVATION_IDLE = [
  "One more round?",
  "Your neurons are warmed up. Let's go.",
  "Patterns don't memorize themselves.",
  "Ready to beat your best?",
];

export const MOTIVATION_GAMEOVER = [
  "Close one. Your memory is sharper than you think.",
  "Every run trains the pattern-recognition muscle.",
  "The sequence got you this time. Not next time.",
  "Shake it off — the lab is always open.",
];

export const MOTIVATION_RECORD = [
  "Record shattered. Your brain just leveled up.",
  "New personal best. The lab is impressed.",
  "That's a new ceiling. Now raise it again.",
];
