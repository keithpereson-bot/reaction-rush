"use client";

import { useEffect, useState } from "react";
import { useReactionRound } from "@/games/reaction/useReactionRound";
import { ReactionStage } from "@/components/ReactionStage";
import { getTodaysTargetMs, localDateKey } from "@/config/game";
import { getDailyProgress, recordDailyAttempt, type DailyProgress } from "@/lib/storage";
import { recordHistory } from "@/lib/history";
import { track } from "@/lib/analytics";

export function DailyChallenge() {
  const { state, resultMs, startRound, registerInteraction, reset } = useReactionRound();
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [justPassed, setJustPassed] = useState(false);

  useEffect(() => {
    const today = new Date();
    const key = localDateKey(today);
    const t = getTodaysTargetMs(today);
    setDateKey(key);
    setTarget(t);
    setProgress(getDailyProgress(key, t));
  }, []);

  useEffect(() => {
    if (state !== "result" || resultMs === null || !dateKey || target === null) return;

    const wasCompleted = progress?.completed ?? false;
    const updated = recordDailyAttempt(dateKey, resultMs, target);
    setProgress(updated);
    recordHistory("reaction-rounds", { ms: resultMs, mode: 3 });
    track("daily_challenge_started");
    track("game_completed", { ms: resultMs, mode: "daily" });

    if (!wasCompleted && updated.completed) {
      setJustPassed(true);
      track("daily_challenge_completed", { ms: resultMs, target });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function handleStart() {
    setJustPassed(false);
    track("game_started", { mode: "daily" });
    startRound();
  }

  if (target === null) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-white/50">Loading today&rsquo;s target&hellip;</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
          Today&rsquo;s challenge
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">
          Can you get under {target} ms?
        </h1>
        <div className="mt-4 flex justify-center gap-8 text-sm text-white/60">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/40">Your best today</div>
            <div className="mt-1 text-lg font-semibold text-white">
              {progress?.bestMs ?? "—"} {progress?.bestMs ? "ms" : ""}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-white/40">Attempts</div>
            <div className="mt-1 text-lg font-semibold text-white">{progress?.attempts ?? 0}</div>
          </div>
        </div>
      </div>

      {state === "result" && resultMs !== null ? (
        <div className="rounded-3xl border border-white/5 bg-base-800 p-8 text-center">
          <div className="font-display text-5xl font-bold text-white">{resultMs} ms</div>
          {justPassed ? (
            <div className="mt-4 animate-pop-in rounded-full bg-accent px-4 py-1 text-sm font-bold uppercase tracking-wide text-base-950 inline-block">
              Challenge complete!
            </div>
          ) : (
            <p className="mt-4 text-white/60">
              {resultMs <= target ? "Nice — under target!" : `${resultMs - target} ms over target. Try again?`}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              reset();
              handleStart();
            }}
            className="mt-6 rounded-full bg-accent px-6 py-3 text-sm font-bold text-base-950"
          >
            Try again
          </button>
        </div>
      ) : (
        <ReactionStage state={state} onInteract={registerInteraction} onStart={handleStart} />
      )}

      {state === "too-soon" && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleStart}
            className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-base-950"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
