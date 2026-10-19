import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PADS } from "./constants";

const SOUND_KEY = "memory-lab:sound";

/**
 * Lightweight Web Audio synth. The AudioContext is created lazily on the
 * first user gesture so browsers don't block it.
 */
export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem(SOUND_KEY);
    return stored === null ? true : stored === "1";
  });
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
    try {
      window.localStorage.setItem(SOUND_KEY, enabled ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [enabled]);

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  /** Warm up the audio context on a user gesture */
  const unlock = useCallback(() => {
    getCtx();
  }, [getCtx]);

  const playTone = useCallback(
    (
      frequency: number,
      duration: number,
      options: {
        type?: OscillatorType;
        volume?: number;
        detune?: number;
        startAt?: number;
      } = {}
    ) => {
      if (!enabledRef.current) return;
      const ctx = getCtx();
      if (!ctx) return;
      const { type = "sine", volume = 0.18, detune = 0, startAt = 0 } = options;
      const t0 = ctx.currentTime + startAt;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, t0);
      osc.detune.setValueAtTime(detune, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration / 1000 + 0.05);
    },
    [getCtx]
  );

  const playPad = useCallback(
    (padId: number, duration = 300) => {
      const pad = PADS[padId];
      if (!pad) return;
      // layered: a clean sine with a soft triangle an octave up for sparkle
      playTone(pad.frequency, duration, { type: "sine", volume: 0.2 });
      playTone(pad.frequency * 2, duration * 0.6, {
        type: "triangle",
        volume: 0.05,
      });
    },
    [playTone]
  );

  const playError = useCallback(() => {
    playTone(110, 450, { type: "sawtooth", volume: 0.14 });
    playTone(82, 450, { type: "square", volume: 0.06, detune: 15 });
  }, [playTone]);

  const playSuccess = useCallback(() => {
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((n, i) =>
      playTone(n, 160, { type: "triangle", volume: 0.1, startAt: i * 0.07 })
    );
  }, [playTone]);

  const playRecord = useCallback(() => {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) =>
      playTone(n, 220, { type: "triangle", volume: 0.11, startAt: i * 0.09 })
    );
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(880, 60, { type: "square", volume: 0.04 });
  }, [playTone]);

  const toggle = useCallback(() => {
    setEnabled((e) => !e);
    unlock();
  }, [unlock]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => undefined);
    };
  }, []);

  return useMemo(
    () => ({
      enabled,
      toggle,
      unlock,
      playPad,
      playError,
      playSuccess,
      playRecord,
      playClick,
    }),
    [enabled, toggle, unlock, playPad, playError, playSuccess, playRecord, playClick]
  );
}
