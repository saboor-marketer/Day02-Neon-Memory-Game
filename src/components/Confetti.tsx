import { useMemo } from "react";
import type { CSSProperties } from "react";

const COLORS = ["#22d3ee", "#a855f7", "#a3e635", "#fb7185", "#fde68a", "#ffffff"];

export function Confetti({ count = 70 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const duration = 2.6 + Math.random() * 1.8;
        const drift = (Math.random() - 0.5) * 240;
        const spin = 400 + Math.random() * 900;
        const color = COLORS[i % COLORS.length];
        const w = 6 + Math.random() * 6;
        const h = 10 + Math.random() * 8;
        return { left, delay, duration, drift, spin, color, w, h };
      }),
    [count]
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.h,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              borderRadius: i % 3 === 0 ? "9999px" : "2px",
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
