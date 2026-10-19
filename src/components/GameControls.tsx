import { Play, RotateCcw, Volume2, VolumeX, Gauge } from "lucide-react";
import {
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  type Difficulty,
  type GameStatus,
} from "../game/constants";

interface GameControlsProps {
  status: GameStatus;
  difficulty: Difficulty;
  soundEnabled: boolean;
  onStart: () => void;
  onReset: () => void;
  onDifficulty: (d: Difficulty) => void;
  onToggleSound: () => void;
}

export function GameControls({
  status,
  difficulty,
  soundEnabled,
  onStart,
  onReset,
  onDifficulty,
  onToggleSound,
}: GameControlsProps) {
  const inRound = status === "watching" || status === "input" || status === "success";
  const idx = DIFFICULTY_ORDER.indexOf(difficulty);

  return (
    <section aria-label="Game controls" className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm sm:text-base"
          onClick={onStart}
          disabled={inRound}
          aria-label={status === "ready" ? "Start game" : "Play again"}
        >
          {inRound ? (
            <>
              <Gauge className="w-5 h-5 animate-pulse" />
              Round in progress
            </>
          ) : status === "gameover" ? (
            <>
              <RotateCcw className="w-5 h-5" />
              Play Again
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              Start Game
            </>
          )}
        </button>

        {inRound && (
          <button
            type="button"
            className="btn-ghost px-4 flex items-center gap-2 text-sm"
            onClick={onReset}
            aria-label="Abort round"
            title="Abort round"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Abort</span>
          </button>
        )}
      </div>

      <div className="glass rounded-2xl p-3 sm:p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[0.68rem] font-mono uppercase tracking-[0.18em] text-slate-300">
            Difficulty
          </div>
          <button
            type="button"
            className="btn-ghost inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            {soundEnabled ? "Sound on" : "Muted"}
          </button>
        </div>

        <div
          className="seg"
          role="group"
          aria-label="Select difficulty"
          data-locked={inRound}
        >
          <span
            className="seg-thumb"
            aria-hidden="true"
            style={{ transform: `translateX(${idx * 100}%)` }}
          />
          {DIFFICULTY_ORDER.map((d) => (
            <button
              key={d}
              type="button"
              className="seg-btn"
              aria-pressed={difficulty === d}
              disabled={inRound}
              onClick={() => onDifficulty(d)}
              title={DIFFICULTIES[d].description}
            >
              {DIFFICULTIES[d].label}
            </button>
          ))}
        </div>

        <p className="text-[0.7rem] text-slate-500 leading-snug">
          <span className="text-slate-300 font-semibold">
            {DIFFICULTIES[difficulty].label}:
          </span>{" "}
          {DIFFICULTIES[difficulty].description} · flashes{" "}
          {DIFFICULTIES[difficulty].lightOn}ms
          {inRound && " · locked during round"}
        </p>
      </div>
    </section>
  );
}
