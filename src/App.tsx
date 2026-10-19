import { useEffect, useMemo, useState } from "react";
import { Background } from "./components/Background";
import { Header } from "./components/Header";
import { GameBoard } from "./components/GameBoard";
import { ScorePanel } from "./components/ScorePanel";
import { GameControls } from "./components/GameControls";
import { GameOverModal } from "./components/GameOverModal";
import { Instructions } from "./components/Instructions";
import { useSimonGame } from "./game/useSimonGame";
import { MOTIVATION_IDLE } from "./game/constants";

export default function App() {
  const game = useSimonGame();
  const [modalOpen, setModalOpen] = useState(false);
  const [motivationIdx, setMotivationIdx] = useState(0);

  // open the game-over modal slightly after the error flash so the player sees the red pad
  useEffect(() => {
    if (game.status === "gameover") {
      const t = window.setTimeout(() => setModalOpen(true), 750);
      return () => window.clearTimeout(t);
    }
    setModalOpen(false);
  }, [game.status]);

  // rotate the motivational line after each run
  useEffect(() => {
    if (game.status === "gameover") {
      setMotivationIdx((i) => (i + 1) % MOTIVATION_IDLE.length);
    }
  }, [game.status]);

  const motivation = useMemo(() => {
    if (game.status === "input") return "Your move. Trust your memory.";
    if (game.status === "watching") return "Focus… the pattern is unfolding.";
    if (game.status === "success") return "Perfect recall. Adding one more.";
    if (game.status === "gameover") return "One more round? Records are made on retries.";
    return MOTIVATION_IDLE[motivationIdx];
  }, [game.status, motivationIdx]);

  const handleRetry = () => {
    setModalOpen(false);
    game.startGame();
  };

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      <Background />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        <Header status={game.status} />

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="fade-up order-1" style={{ animationDelay: "0.05s" }}>
            <GameBoard
              status={game.status}
              level={game.level}
              sequenceLength={game.sequence.length}
              playerIndex={game.playerIndex}
              activePad={game.activePad}
              errorPad={game.errorPad}
              canInteract={game.canInteract}
              shake={game.shake}
              onPadPress={game.pressPad}
            />
          </div>

          <div
            className="fade-up order-2 flex flex-col gap-4 w-full max-w-xl mx-auto lg:max-w-none"
            style={{ animationDelay: "0.12s" }}
          >
            <ScorePanel
              score={game.score}
              best={game.best}
              accuracy={game.accuracy}
              level={game.level}
              difficulty={game.difficulty}
              isPlaying={game.isBusy}
            />
            <GameControls
              status={game.status}
              difficulty={game.difficulty}
              soundEnabled={game.soundEnabled}
              onStart={game.startGame}
              onReset={game.resetToReady}
              onDifficulty={game.setDifficulty}
              onToggleSound={game.toggleSound}
            />
          </div>
        </div>

        <Instructions motivation={motivation} />
      </main>

      <GameOverModal
        open={modalOpen}
        level={game.level}
        score={game.score}
        best={game.best}
        difficulty={game.difficulty}
        accuracy={game.accuracy}
        isNewRecord={game.isNewRecord}
        onRetry={handleRetry}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
