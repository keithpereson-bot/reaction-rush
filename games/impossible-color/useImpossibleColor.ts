"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { now } from "@/lib/timing";
import { COLOR_OPTIONS, IMPOSSIBLE_COLOR_CONFIG, type ColorOption } from "@/config/game";

export type RoundOutcome = { correct: boolean; ms: number };
export type ColorRoundState = "idle" | "playing" | "round-result" | "finished";

interface RoundData {
  word: ColorOption; // the color name shown as text
  ink: ColorOption; // the actual font color — this is the correct answer
  choices: ColorOption[]; // shuffled swatch options shown to the player
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildRound(): RoundData {
  const [word, ink] = shuffle(COLOR_OPTIONS).slice(0, 2); // guaranteed distinct
  const distractors = shuffle(COLOR_OPTIONS.filter((c) => c.name !== ink.name)).slice(
    0,
    IMPOSSIBLE_COLOR_CONFIG.SWATCH_COUNT - 1
  );
  const choices = shuffle([ink, ...distractors]);
  return { word, ink, choices };
}

export function useImpossibleColor() {
  const [state, setState] = useState<ColorRoundState>("idle");
  const [round, setRound] = useState<RoundData | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<RoundOutcome[]>([]);
  const [lastOutcome, setLastOutcome] = useState<RoundOutcome | null>(null);

  const stimulusTimestampRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    setOutcomes([]);
    setRoundIndex(0);
    setLastOutcome(null);
    setRound(buildRound());
    stimulusTimestampRef.current = now();
    setState("playing");
  }, []);

  const advanceOrFinish = useCallback((outcome: RoundOutcome) => {
    setOutcomes((prev) => {
      const next = [...prev, outcome];
      return next;
    });
    setLastOutcome(outcome);
    setState("round-result");
  }, []);

  // Called when the player taps a swatch during "playing".
  const choose = useCallback(
    (choice: ColorOption) => {
      if (state !== "playing" || !round || stimulusTimestampRef.current === null) return;
      clearPendingTimeout();
      const ms = Math.round(now() - stimulusTimestampRef.current);
      const correct = choice.name === round.ink.name;
      advanceOrFinish({ correct, ms });
    },
    [state, round, clearPendingTimeout, advanceOrFinish]
  );

  // Auto-timeout if the player doesn't respond in time — counts as a miss.
  useEffect(() => {
    if (state !== "playing") return;
    timeoutRef.current = setTimeout(() => {
      advanceOrFinish({ correct: false, ms: IMPOSSIBLE_COLOR_CONFIG.MAX_RESPONSE_MS });
    }, IMPOSSIBLE_COLOR_CONFIG.MAX_RESPONSE_MS);
    return () => clearPendingTimeout();
  }, [state, advanceOrFinish, clearPendingTimeout]);

  const nextRound = useCallback(() => {
    const nextIndex = roundIndex + 1;
    if (nextIndex >= IMPOSSIBLE_COLOR_CONFIG.ROUND_COUNT) {
      setState("finished");
      return;
    }
    setRoundIndex(nextIndex);
    setRound(buildRound());
    stimulusTimestampRef.current = now();
    setState("playing");
  }, [roundIndex]);

  const reset = useCallback(() => {
    clearPendingTimeout();
    setState("idle");
    setRound(null);
    setRoundIndex(0);
    setOutcomes([]);
    setLastOutcome(null);
  }, [clearPendingTimeout]);

  useEffect(() => {
    return () => clearPendingTimeout();
  }, [clearPendingTimeout]);

  return {
    state,
    round,
    roundIndex,
    outcomes,
    lastOutcome,
    startGame,
    choose,
    nextRound,
    reset,
  };
}
