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
export function playTone(frequency: number, durationMs = 90) {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + durationMs / 1000);
    oscillator.onended = () => ctx.close();
  } catch {
    // ignore — sound is a non-essential enhancement
  }
}
