import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BestRecord,
  DIFFICULTIES,
  Difficulty,
  GameStatus,
  PADS,
  PLAYER_FLASH_MS,
  STORAGE_KEY,
  SUCCESS_PAUSE_MS,
} from "./constants";
import { useAudio } from "./useAudio";

export interface PadActivation {
  id: number;
  source: "cpu" | "player";
}

function loadBest(): BestRecord {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BestRecord>;
      if (typeof parsed.score === "number" && typeof parsed.level === "number") {
        return {
          score: parsed.score,
          level: parsed.level,
          difficulty: (parsed.difficulty as Difficulty) ?? "normal",
        };
      }
    }
  } catch {
    /* ignore */
  }
  return { score: 0, level: 0, difficulty: "normal" };
}

function randomPad(): number {
  return Math.floor(Math.random() * PADS.length);
}

export function useSimonGame() {
  const audio = useAudio();

  const [difficulty, setDifficultyState] = useState<Difficulty>("normal");
  const [status, setStatus] = useState<GameStatus>("ready");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activePad, setActivePad] = useState<PadActivation | null>(null);
  const [errorPad, setErrorPad] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState({ correct: 0, total: 0 });
  const [best, setBest] = useState<BestRecord>(() => loadBest());
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [recordBeatenThisRun, setRecordBeatenThisRun] = useState(false);
  const [roundFlash, setRoundFlash] = useState(0);
  const [shake, setShake] = useState(false);

  // ---- mutable refs (avoid stale closures in timers) ----
  const statusRef = useRef<GameStatus>("ready");
  const sequenceRef = useRef<number[]>([]);
  const playerIndexRef = useRef(0);
  const scoreRef = useRef(0);
  const bestRef = useRef(best);
  const difficultyRef = useRef<Difficulty>("normal");
  const timersRef = useRef<Set<number>>(new Set());
  const runIdRef = useRef(0);
  const inputLockRef = useRef(false);
  const recordBeatenRef = useRef(false);
  const pressTokenRef = useRef(0);

  useEffect(() => {
    bestRef.current = best;
  }, [best]);

  const updateStatus = useCallback((s: GameStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const runId = runIdRef.current;
    const id = window.setTimeout(() => {
      timersRef.current.delete(id);
      // ignore timers that belong to an older run
      if (runId !== runIdRef.current) return;
      fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current.clear();
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // ---- persistence ----
  const persistBest = useCallback((record: BestRecord) => {
    bestRef.current = record;
    setBest(record);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      /* ignore */
    }
  }, []);

  // ---- sequence playback ----
  const playSequence = useCallback(() => {
    const cfg = DIFFICULTIES[difficultyRef.current];
    const seq = sequenceRef.current;
    updateStatus("watching");
    setActivePad(null);
    inputLockRef.current = true;

    let t = cfg.leadIn;
    seq.forEach((padId) => {
      schedule(() => {
        setActivePad({ id: padId, source: "cpu" });
        audio.playPad(padId, cfg.lightOn);
      }, t);
      schedule(() => setActivePad(null), t + cfg.lightOn);
      t += cfg.lightOn + cfg.gap;
    });

    schedule(() => {
      playerIndexRef.current = 0;
      setPlayerIndex(0);
      inputLockRef.current = false;
      updateStatus("input");
    }, t + 40);
  }, [audio, schedule, updateStatus]);

  const extendSequence = useCallback(() => {
    const next = [...sequenceRef.current, randomPad()];
    sequenceRef.current = next;
    setSequence(next);
  }, []);

  // ---- public actions ----
  const startGame = useCallback(() => {
    audio.unlock();
    clearTimers();
    runIdRef.current += 1;

    sequenceRef.current = [];
    playerIndexRef.current = 0;
    scoreRef.current = 0;
    recordBeatenRef.current = false;

    setSequence([]);
    setPlayerIndex(0);
    setScore(0);
    setTaps({ correct: 0, total: 0 });
    setErrorPad(null);
    setActivePad(null);
    setIsNewRecord(false);
    setRecordBeatenThisRun(false);
    setShake(false);

    extendSequence();
    playSequence();
  }, [audio, clearTimers, extendSequence, playSequence]);

  const resetToReady = useCallback(() => {
    clearTimers();
    runIdRef.current += 1;
    sequenceRef.current = [];
    playerIndexRef.current = 0;
    scoreRef.current = 0;
    inputLockRef.current = false;
    setSequence([]);
    setPlayerIndex(0);
    setScore(0);
    setTaps({ correct: 0, total: 0 });
    setErrorPad(null);
    setActivePad(null);
    setIsNewRecord(false);
    setRecordBeatenThisRun(false);
    setShake(false);
    updateStatus("ready");
  }, [clearTimers, updateStatus]);

  const setDifficulty = useCallback(
    (d: Difficulty) => {
      if (statusRef.current === "watching" || statusRef.current === "input" || statusRef.current === "success") {
        return; // locked mid-game
      }
      difficultyRef.current = d;
      setDifficultyState(d);
      audio.playClick();
    },
    [audio]
  );

  const endGame = useCallback(
    (wrongPad: number) => {
      inputLockRef.current = true;
      updateStatus("gameover");
      setErrorPad(wrongPad);
      setShake(true);
      audio.playError();

      const finalLevel = sequenceRef.current.length;
      const finalScore = scoreRef.current;
      const prev = bestRef.current;
      const beat = finalScore > prev.score;
      if (beat) {
        persistBest({
          score: finalScore,
          level: finalLevel,
          difficulty: difficultyRef.current,
        });
        setIsNewRecord(true);
        schedule(() => audio.playRecord(), 500);
      }

      schedule(() => {
        setErrorPad(null);
        setShake(false);
      }, 700);
    },
    [audio, persistBest, schedule, updateStatus]
  );

  const pressPad = useCallback(
    (padId: number) => {
      if (statusRef.current !== "input") return;
      if (inputLockRef.current) return;

      const seq = sequenceRef.current;
      const idx = playerIndexRef.current;
      const expected = seq[idx];
      const cfg = DIFFICULTIES[difficultyRef.current];

      // visual + audio feedback for the press
      const token = ++pressTokenRef.current;
      // release then re-light on the next frame so repeated taps on the same pad visibly re-flash
      setActivePad(null);
      requestAnimationFrame(() => {
        if (pressTokenRef.current === token) {
          setActivePad({ id: padId, source: "player" });
        }
      });
      audio.playPad(padId, PLAYER_FLASH_MS + 60);
      schedule(() => {
        // only clear if no newer press has happened since
        if (pressTokenRef.current === token) {
          setActivePad((cur) => (cur && cur.source === "player" ? null : cur));
        }
      }, PLAYER_FLASH_MS);

      if (padId !== expected) {
        setTaps((t) => ({ correct: t.correct, total: t.total + 1 }));
        endGame(padId);
        return;
      }

      // correct press
      const gained = 10 * cfg.multiplier;
      scoreRef.current += gained;
      setScore(scoreRef.current);
      setTaps((t) => ({ correct: t.correct + 1, total: t.total + 1 }));

      if (!recordBeatenRef.current && bestRef.current.score > 0 && scoreRef.current > bestRef.current.score) {
        recordBeatenRef.current = true;
        setRecordBeatenThisRun(true);
      }

      const nextIdx = idx + 1;
      playerIndexRef.current = nextIdx;
      setPlayerIndex(nextIdx);

      if (nextIdx >= seq.length) {
        // round complete
        inputLockRef.current = true;
        const bonus = seq.length * 5 * cfg.multiplier;
        scoreRef.current += bonus;
        setScore(scoreRef.current);
        updateStatus("success");
        setRoundFlash((n) => n + 1);
        schedule(() => audio.playSuccess(), PLAYER_FLASH_MS);

        schedule(() => {
          extendSequence();
          playSequence();
        }, SUCCESS_PAUSE_MS + PLAYER_FLASH_MS);
      }
    },
    [audio, endGame, extendSequence, playSequence, schedule, updateStatus]
  );

  // ---- keyboard support (1-4 keys) ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const pad = PADS.find((p) => p.key === e.key);
      if (pad) {
        e.preventDefault();
        pressPad(pad.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pressPad]);

  const level = sequence.length;
  const accuracy = useMemo(
    () => (taps.total === 0 ? 100 : Math.round((taps.correct / taps.total) * 100)),
    [taps]
  );
  const canInteract = status === "input";
  const isBusy = status === "watching" || status === "input" || status === "success";

  return {
    // state
    difficulty,
    status,
    sequence,
    level,
    playerIndex,
    activePad,
    errorPad,
    score,
    best,
    accuracy,
    taps,
    isNewRecord,
    recordBeatenThisRun,
    roundFlash,
    shake,
    canInteract,
    isBusy,
    // actions
    startGame,
    resetToReady,
    pressPad,
    setDifficulty,
    // audio
    soundEnabled: audio.enabled,
    toggleSound: audio.toggle,
  };
}
