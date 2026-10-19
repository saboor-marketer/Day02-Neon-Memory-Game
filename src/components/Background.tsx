import { useMemo } from "react";

interface Particle {
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export function Background() {
  const particles = useMemo<Particle[]>(() => {
    const seed = 28;
    return Array.from({ length: seed }, (_, i) => ({
      left: (i * 37 + 11) % 100,
      delay: (i * 1.7) % 14,
      duration: 14 + ((i * 3) % 12),
      size: 2 + (i % 3),
    }));
  }, []);

  return (
    <div className="lab-bg" aria-hidden="true">
      <div className="lab-grid" />
      <div
        className="lab-orb"
        style={{
          width: 420,
          height: 420,
          left: "-8%",
          top: "-10%",
          background: "rgba(168, 85, 247, 0.5)",
        }}
      />
      <div
        className="lab-orb"
        style={{
          width: 380,
          height: 380,
          right: "-6%",
          top: "10%",
          background: "rgba(34, 211, 238, 0.45)",
          animationDelay: "-6s",
        }}
      />
      <div
        className="lab-orb"
        style={{
          width: 360,
          height: 360,
          left: "35%",
          bottom: "-15%",
          background: "rgba(251, 113, 133, 0.35)",
          animationDelay: "-11s",
        }}
      />
      {particles.map((p, i) => (
        <span
          key={i}
          className="lab-particle"
          style={{
            left: `${p.left}%`,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
