import { useEffect, useMemo, useRef } from "react";
import { RotateCcw, Trophy, X, Layers, Zap, Crown } from "lucide-react";
import {
  DIFFICULTIES,
  MOTIVATION_GAMEOVER,
  MOTIVATION_RECORD,
  type BestRecord,
  type Difficulty,
} from "../game/constants";
import { Confetti } from "./Confetti";
import { usePrefersReducedMotion } from "../game/usePrefersReducedMotion";

interface GameOverModalProps {
  open: boolean;
  level: number;
  score: number;
  best: BestRecord;
  difficulty: Difficulty;
  accuracy: number;
  isNewRecord: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export function GameOverModal({
  open,
  level,
  score,
  best,
  difficulty,
  accuracy,
  isNewRecord,
  onRetry,
  onClose,
}: GameOverModalProps) {
  const reducedMotion = usePrefersReducedMotion();
  const retryRef = useRef<HTMLButtonElement>(null);

  const message = useMemo(() => {
    const pool = isNewRecord ? MOTIVATION_RECORD : MOTIVATION_GAMEOVER;
    return pool[Math.floor(Math.random() * pool.length)];
    // regenerate every time the modal opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isNewRecord]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => retryRef.current?.focus(), 350);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Enter retries unless a button already has focus (its native click handles it)
      if (e.key === "Enter" && !(document.activeElement instanceof HTMLButtonElement)) {
        onRetry();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, onRetry]);

  if (!open) return null;

  const gap = Math.max(0, best.score - score);

  return (
    <>
      {isNewRecord && !reducedMotion && <Confetti />}
      <div
        className="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gameover-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-card glass relative w-full max-w-md rounded-3xl p-6 sm:p-8 text-center">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost absolute right-3 top-3 p-2"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {isNewRecord ? (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-lime-400/15 border border-lime-300/40 shadow-[0_0_40px_-5px_rgba(163,230,53,0.7)]">
                <Crown className="w-7 h-7 text-lime-300" />
              </div>
              <p className="font-mono text-[0.65rem] tracking-[0.3em] uppercase text-lime-300 mb-1">
                Pattern broken, but…
              </p>
              <h2
                id="gameover-title"
                className="record-title text-3xl sm:text-4xl font-extrabold tracking-tight"
              >
                NEW HIGH SCORE!
              </h2>
            </>
          ) : (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-400/15 border border-rose-300/40 shadow-[0_0_40px_-5px_rgba(251,113,133,0.7)]">
                <Zap className="w-7 h-7 text-rose-300" />
              </div>
              <h2
                id="gameover-title"
                className="glitch-title text-3xl sm:text-4xl font-extrabold tracking-tight"
              >
                PATTERN BROKEN!
              </h2>
            </>
          )}

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">{message}</p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center justify-center gap-1 text-[0.6rem] font-mono uppercase tracking-widest text-slate-400">
                <Layers className="w-3 h-3" /> Level
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-cyan-300">
                {level}
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center justify-center gap-1 text-[0.6rem] font-mono uppercase tracking-widest text-slate-400">
                <Zap className="w-3 h-3" /> Score
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-white">
                {score}
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center justify-center gap-1 text-[0.6rem] font-mono uppercase tracking-widest text-slate-400">
                <Trophy className="w-3 h-3" /> Best
              </div>
              <div
                className={`mt-1 font-mono text-2xl font-bold ${
                  isNewRecord ? "text-lime-300" : "text-purple-300"
                }`}
              >
                {best.score}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.68rem] font-mono text-slate-500">
            <span>
              Mode <span className="text-slate-300">{DIFFICULTIES[difficulty].label}</span>
            </span>
            <span>·</span>
            <span>
              Accuracy <span className="text-slate-300">{accuracy}%</span>
            </span>
            {!isNewRecord && best.score > 0 && (
              <>
                <span>·</span>
                <span>
                  <span className="text-rose-300">{gap}</span> short of your best
                </span>
              </>
            )}
          </div>

          <button
            ref={retryRef}
            type="button"
            onClick={onRetry}
            className={`btn-primary ${isNewRecord ? "" : "danger"} mt-6 w-full flex items-center justify-center gap-2`}
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
          <p className="mt-3 text-[0.65rem] text-slate-500">
            Press <span className="kbd">Enter</span> to retry ·{" "}
            <span className="kbd">Esc</span> to close
          </p>
        </div>
      </div>
    </>
  );
}
