"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { now, randomBetween } from "@/lib/timing";
import { REACTION_CONFIG } from "@/config/game";

export type RoundState = "idle" | "waiting" | "go" | "too-soon" | "result";

interface UseReactionRoundOptions {
  minWaitMs?: number;
  maxWaitMs?: number;
}

export function useReactionRound(options: UseReactionRoundOptions = {}) {
  const minWaitMs = options.minWaitMs ?? REACTION_CONFIG.MIN_WAIT_MS;
  const maxWaitMs = options.maxWaitMs ?? REACTION_CONFIG.MAX_WAIT_MS;

  const [state, setState] = useState<RoundState>("idle");
  const [resultMs, setResultMs] = useState<number | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goTimestampRef = useRef<number | null>(null);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Start a fresh round: enter WAIT, then after a random delay flip to GO.
  const startRound = useCallback(() => {
    clearPendingTimeout();
    setResultMs(null);
    setState("waiting");
    const delay = randomBetween(minWaitMs, maxWaitMs);
    timeoutRef.current = setTimeout(() => {
      goTimestampRef.current = now();
      setState("go");
    }, delay);
  }, [minWaitMs, maxWaitMs, clearPendingTimeout]);

  // The single interaction handler used for click / tap / spacebar.
  const registerInteraction = useCallback(() => {
    if (state === "idle" || state === "result" || state === "too-soon") {
      return; // interaction is handled elsewhere for these states (e.g. "start")
    }
    if (state === "waiting") {
      clearPendingTimeout();
      setState("too-soon");
      return;
    }
    if (state === "go" && goTimestampRef.current !== null) {
      const reaction = Math.round(now() - goTimestampRef.current);
      setResultMs(reaction);
      setState("result");
    }
  }, [state, clearPendingTimeout]);

  const reset = useCallback(() => {
    clearPendingTimeout();
    goTimestampRef.current = null;
    setResultMs(null);
    setState("idle");
  }, [clearPendingTimeout]);

  useEffect(() => {
    return () => clearPendingTimeout();
  }, [clearPendingTimeout]);

  return { state, resultMs, startRound, registerInteraction, reset };
}
