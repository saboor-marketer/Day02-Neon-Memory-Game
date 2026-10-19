import { Eye, Hand, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: Eye,
    title: "Watch",
    text: "The lab flashes a sequence of pads. Keep your eyes on the board.",
    accent: "text-cyan-300",
  },
  {
    icon: Hand,
    title: "Repeat",
    text: "Tap the pads in the exact same order. Keys 1–4 work too.",
    accent: "text-purple-300",
  },
  {
    icon: TrendingUp,
    title: "Level Up",
    text: "Nail it and one more step is added. Harder modes score more.",
    accent: "text-lime-300",
  },
  {
    icon: AlertTriangle,
    title: "Don't Slip",
    text: "One wrong pad breaks the pattern and ends the run.",
    accent: "text-rose-300",
  },
];

export function Instructions({ motivation }: { motivation: string }) {
  return (
    <footer className="fade-up flex flex-col gap-4" style={{ animationDelay: "0.2s" }}>
      <p className="flex items-center justify-center gap-2 text-center text-sm text-slate-300">
        <Sparkles className="w-4 h-4 text-purple-300" />
        <span className="italic">{motivation}</span>
      </p>

      <section
        aria-label="How to play"
        className="glass rounded-2xl p-4 sm:p-5"
      >
        <h2 className="mb-3 text-[0.68rem] font-mono uppercase tracking-[0.22em] text-slate-400">
          How to play
        </h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 ${s.accent}`}
              >
                <s.icon className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-100">
                  <span className="font-mono text-slate-500 mr-1.5">0{i + 1}</span>
                  {s.title}
                </div>
                <p className="text-xs text-slate-400 leading-snug mt-0.5">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-center text-[0.65rem] font-mono text-slate-600 tracking-wider">
        MEMORY LAB · built with React + Web Audio · best score saved locally
      </p>
    </footer>
  );
}
