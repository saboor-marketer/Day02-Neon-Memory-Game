import { Crosshair, Target, Trophy, Zap } from "lucide-react";
import type { BestRecord, Difficulty } from "../game/constants";
import { DIFFICULTIES } from "../game/constants";

interface ScorePanelProps {
  score: number;
  best: BestRecord;
  accuracy: number;
  level: number;
  difficulty: Difficulty;
  isPlaying: boolean;
}

function Stat({
  icon,
  label,
  value,
  accent,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
  suffix?: string;
}) {
  return (
    <div className="glass rounded-2xl p-3 sm:p-4 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center gap-1.5 text-[0.62rem] sm:text-[0.68rem] font-mono uppercase tracking-[0.18em] text-slate-400">
        <span className={accent}>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          key={String(value)}
          className={`stat-value text-2xl sm:text-3xl ${accent}`}
        >
          {value}
        </span>
        {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}

export function ScorePanel({
  score,
  best,
  accuracy,
  level,
  difficulty,
  isPlaying,
}: ScorePanelProps) {
  const target = best.score;
  const hasTarget = target > 0;
  const pct = hasTarget ? Math.min(100, Math.round((score / target) * 100)) : 0;
  const remaining = Math.max(0, target - score);
  const beaten = hasTarget && score > target;

  return (
    <section aria-label="Score panel" className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat
          icon={<Zap className="w-3.5 h-3.5" />}
          label="Score"
          value={score}
          accent="text-cyan-300"
        />
        <Stat
          icon={<Trophy className="w-3.5 h-3.5" />}
          label="Best"
          value={best.score}
          accent="text-purple-300"
        />
        <Stat
          icon={<Crosshair className="w-3.5 h-3.5" />}
          label="Accuracy"
          value={accuracy}
          suffix="%"
          accent="text-lime-300"
        />
      </div>

      {/* Beat Your Best tracker */}
      <div className="glass rounded-2xl p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 text-[0.68rem] font-mono uppercase tracking-[0.18em] text-slate-300">
            <Target className="w-3.5 h-3.5 text-rose-300" />
            Beat your best
          </div>
          {beaten ? (
            <span className="record-chip inline-flex items-center gap-1 rounded-full bg-lime-400/15 border border-lime-300/50 px-2.5 py-0.5 text-[0.62rem] font-mono font-bold uppercase tracking-widest text-lime-200">
              <Trophy className="w-3 h-3" /> New record
            </span>
          ) : hasTarget ? (
            <span className="text-[0.68rem] font-mono text-slate-400">
              <span className="text-white font-bold">{remaining}</span> to go
            </span>
          ) : (
            <span className="text-[0.68rem] font-mono text-slate-400">
              Set your first record
            </span>
          )}
        </div>

        <div
          className="beat-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={beaten ? 100 : pct}
          aria-label="Progress toward best score"
        >
          <div
            className={`beat-bar-fill ${beaten ? "beaten" : ""}`}
            style={{ width: `${hasTarget ? (beaten ? 100 : pct) : isPlaying ? 4 : 0}%` }}
          />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[0.66rem] font-mono text-slate-500">
          <span>
            Level <span className="text-slate-300">{level}</span>
            {hasTarget && (
              <>
                {" "}
                · Record Lv <span className="text-slate-300">{best.level}</span>
              </>
            )}
          </span>
          <span>
            Mode{" "}
            <span className="text-slate-300">{DIFFICULTIES[difficulty].label}</span>
            {" · "}×{DIFFICULTIES[difficulty].multiplier} pts
          </span>
        </div>
      </div>
    </section>
  );
}
