"use client";

import { useCallback, useEffect, useState } from "react";

const SOUND_PREF_KEY = "rr_sound_enabled";

export function useSoundPreference() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SOUND_PREF_KEY);
      setEnabled(stored === "true");
    } catch {
      // ignore, default stays false
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SOUND_PREF_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { enabled, toggle };
}

// Tiny WebAudio blip generator so we don't need to ship audio assets.
export function playTone(frequency: number, durationMs = 90, delayMs = 0, type: OscillatorType = "sine") {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    const startAt = ctx.currentTime + delayMs / 1000;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.15, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationMs / 1000);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + durationMs / 1000 + 0.02);
    oscillator.onended = () => ctx.close();
  } catch {
    // ignore — sound is a non-essential enhancement
  }
}

// Named sound effects for specific game moments. Each is a short, distinct
// cue so players can tell events apart without looking at the screen.
export const sfx = {
  go: () => playTone(720, 90, 0, "square"),
  tooSoon: () => playTone(140, 220, 0, "sawtooth"),
  resultReveal: () => playTone(500, 90),
  correct: () => playTone(880, 100, 0, "triangle"),
  incorrect: () => playTone(180, 180, 0, "sawtooth"),
  personalBest: () => {
    // A quick three-note ascending chime.
    playTone(660, 90, 0);
    playTone(880, 90, 90);
    playTone(1100, 140, 180);
  },
  challengeComplete: () => {
    playTone(660, 100, 0);
    playTone(990, 160, 100);
  },
};

