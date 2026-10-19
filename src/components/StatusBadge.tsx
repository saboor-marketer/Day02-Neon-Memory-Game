import type { GameStatus } from "../game/constants";

const CONFIG: Record<GameStatus, { label: string; className: string }> = {
  ready: {
    label: "Ready",
    className: "text-slate-300 border-slate-500/40 bg-slate-500/10",
  },
  watching: {
    label: "Watch",
    className: "text-cyan-300 border-cyan-400/40 bg-cyan-400/10",
  },
  input: {
    label: "Your Turn",
    className: "text-lime-300 border-lime-400/40 bg-lime-400/10",
  },
  success: {
    label: "Nice!",
    className: "text-lime-200 border-lime-300/60 bg-lime-300/15",
  },
  gameover: {
    label: "Game Over",
    className: "text-rose-300 border-rose-400/50 bg-rose-400/10",
  },
};

export function StatusBadge({ status }: { status: GameStatus }) {
  const cfg = CONFIG[status];
  return (
    <span
      className={`status-badge ${cfg.className}`}
      data-status={status}
      role="status"
      aria-live="polite"
    >
      <span className="status-dot" />
      {cfg.label}
    </span>
  );
}
