import { FlaskConical } from "lucide-react";
import type { GameStatus } from "../game/constants";
import { StatusBadge } from "./StatusBadge";

export function Header({ status }: { status: GameStatus }) {
  return (
    <header className="fade-up flex flex-col items-center text-center gap-4">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/30 to-purple-500/30 border border-white/15 shadow-[0_0_24px_-4px_rgba(34,211,238,0.7)]">
            <FlaskConical className="w-4.5 h-4.5 text-cyan-200" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,1)]" />
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold tracking-[0.32em] text-slate-200">
            MEMORY LAB
          </span>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-2 sm:mt-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
          Train Your{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-rose-300 bg-clip-text text-transparent">
            Brain.
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-md mx-auto">
          Watch the pattern. Remember the sequence. Beat your best.
        </p>
      </div>
    </header>
  );
}
