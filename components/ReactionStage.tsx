"use client";

import { useEffect } from "react";
import type { RoundState } from "@/games/reaction/useReactionRound";

interface ReactionStageProps {
  state: RoundState;
  onInteract: () => void;
  onStart: () => void;
  roundLabel?: string; // e.g. "Round 2 of 5"
}

const STAGE_STYLES: Record<RoundState, string> = {
  idle: "bg-base-800 hover:bg-base-700",
  waiting: "bg-wait/90",
  go: "bg-go",
  "too-soon": "bg-wait animate-shake",
  result: "bg-base-800",
};

export function ReactionStage({ state, onInteract, onStart, roundLabel }: ReactionStageProps) {
  // Spacebar support, without hijacking unrelated key presses.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "BUTTON", "A"].includes(target.tagName)) return;
      e.preventDefault();
      if (state === "idle") {
        onStart();
      } else if (state === "too-soon" || state === "result") {
        // no-op here; retry buttons handle these states explicitly
      } else {
        onInteract();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, onInteract, onStart]);

  function handleClick() {
    if (state === "idle") {
      onStart();
      return;
    }
    if (state === "waiting" || state === "go") {
      onInteract();
    }
  }

  const label = getStageLabel(state);
  const sub = getStageSubLabel(state);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={`relative w-full select-none overflow-hidden rounded-3xl border border-white/5 px-6 py-24 text-center transition-colors duration-150 focus-visible:outline focus-visible:outline-4 focus-visible:outline-accent sm:py-32 md:py-40 ${STAGE_STYLES[state]}`}
    >
      {state === "go" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-go-burst rounded-full bg-white/40"
        />
      )}
      {roundLabel && state !== "result" && (
        <div className="mb-4 text-sm font-medium uppercase tracking-widest text-white/50">
          {roundLabel}
        </div>
      )}
      <div
        className={`font-display text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl ${
          state === "waiting" ? "animate-pulse-soft" : ""
        }`}
      >
        {label}
      </div>
      {sub && <div className="mt-4 text-base text-white/70 sm:text-lg">{sub}</div>}
    </button>
  );
}

function getStageLabel(state: RoundState): string {
  switch (state) {
    case "idle":
      return "READY?";
    case "waiting":
      return "WAIT...";
    case "go":
      return "CLICK!";
    case "too-soon":
      return "TOO SOON!";
    case "result":
      return "";
  }
}

function getStageSubLabel(state: RoundState): string {
  switch (state) {
    case "idle":
      return "Click, tap, or press space to start";
    case "waiting":
      return "Wait for green";
    case "go":
      return "Click / tap / space — now!";
    case "too-soon":
      return "You reacted before the signal. Try again.";
    case "result":
      return "";
  }
}
