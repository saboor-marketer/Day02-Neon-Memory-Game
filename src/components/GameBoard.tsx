import { Brain } from "lucide-react";
import { PADS, type GameStatus } from "../game/constants";
import type { PadActivation } from "../game/useSimonGame";
import { ColorPad } from "./ColorPad";

interface GameBoardProps {
  status: GameStatus;
  level: number;
  sequenceLength: number;
  playerIndex: number;
  activePad: PadActivation | null;
  errorPad: number | null;
  canInteract: boolean;
  shake: boolean;
  onPadPress: (id: number) => void;
}

const CENTER_LABEL: Record<GameStatus, string> = {
  ready: "Level",
  watching: "Watch",
  input: "Repeat",
  success: "Perfect",
  gameover: "Final",
};

export function GameBoard({
  status,
  level,
  sequenceLength,
  playerIndex,
  activePad,
  errorPad,
  canInteract,
  shake,
  onPadPress,
}: GameBoardProps) {
  const showDots = status === "input" || status === "success";

  return (
    <div className="relative w-full max-w-[min(88vw,440px)] sm:max-w-[460px] lg:max-w-[500px] mx-auto">
      {/* ambient halo behind the board */}
      <div
        aria-hidden="true"
        className="absolute -inset-10 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.14) 0%, rgba(168,85,247,0.10) 40%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />

      <div
        className={`board-ring aspect-square ${shake ? "is-shaking" : ""}`}
        data-status={status}
        role="group"
        aria-label="Simon game board"
      >
        <div className="grid grid-cols-2 grid-rows-2 gap-[clamp(8px,2vw,14px)] w-full h-full">
          {PADS.map((pad, i) => (
            <ColorPad
              key={pad.id}
              pad={pad}
              position={i as 0 | 1 | 2 | 3}
              active={activePad?.id === pad.id}
              error={errorPad === pad.id}
              enabled={canInteract}
              onPress={onPadPress}
            />
          ))}
        </div>

        {/* central level display */}
        <div className="center-display" aria-live="polite">
          <span className="text-[0.55rem] sm:text-[0.65rem] font-mono tracking-[0.3em] uppercase text-slate-400">
            {CENTER_LABEL[status]}
          </span>
          {status === "ready" && level === 0 ? (
            <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 mt-1 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          ) : (
            <span key={level} className="level-number">
              {String(level).padStart(2, "0")}
            </span>
          )}
          {showDots && sequenceLength <= 24 && (
            <div className="progress-dots" aria-hidden="true">
              {Array.from({ length: sequenceLength }).map((_, i) => (
                <span
                  key={i}
                  className={`progress-dot ${
                    i < playerIndex ? "done" : i === playerIndex && status === "input" ? "next" : ""
                  }`}
                />
              ))}
            </div>
          )}
          {showDots && sequenceLength > 24 && (
            <span className="mt-1 font-mono text-[0.6rem] text-lime-300">
              {playerIndex}/{sequenceLength}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
