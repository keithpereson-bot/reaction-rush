"use client";

import { useEffect, useState } from "react";
import { useReactionRound } from "@/games/reaction/useReactionRound";
import { ReactionStage } from "@/components/ReactionStage";
import { ResultCard } from "@/components/ResultCard";
import { REACTION_CONFIG } from "@/config/game";
import { average, best } from "@/lib/scoring";
import { getPersonalBest, maybeSetPersonalBest } from "@/lib/storage";
import { track } from "@/lib/analytics";
import { playTone, useSoundPreference } from "@/lib/sound";

type Mode = "quick" | "five-round";

export function ReactionGame() {
  const [mode, setMode] = useState<Mode>("quick");
  const { state, resultMs, startRound, registerInteraction, reset } = useReactionRound();
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [rounds, setRounds] = useState<number[]>([]);
  const sound = useSoundPreference();

  useEffect(() => {
    setPersonalBest(getPersonalBest("reaction"));
  }, []);

  // React to a completed round (result state) once per result.
  useEffect(() => {
    if (state !== "result" || resultMs === null) return;

    track("game_completed", { ms: resultMs, mode });
    if (sound.enabled) playTone(660, 120);

    if (mode === "quick") {
      const gotNewBest = maybeSetPersonalBest(resultMs);
      setIsNewBest(gotNewBest);
      if (gotNewBest) {
        setPersonalBest(resultMs);
        track("personal_best", { ms: resultMs });
        if (sound.enabled) playTone(880, 160);
      }
    } else {
      setRounds((prev) => {
        const next = [...prev, resultMs];
        if (next.length === REACTION_CONFIG.NUMBER_OF_ROUNDS) {
          track("five_round_completed", {
            average: average(next),
            best: best(next),
          });
          const gotNewBest = maybeSetPersonalBest(best(next));
          setIsNewBest(gotNewBest);
          if (gotNewBest) {
            setPersonalBest(best(next));
            track("personal_best", { ms: best(next) });
          }
        }
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (state === "too-soon") {
      track("false_start", { mode });
    }
  }, [state, mode]);

  function handleStart() {
    track("game_started", { mode });
    startRound();
  }

  function handleRetryAfterFalseStart() {
    track("replay", { mode, reason: "false_start" });
    startRound();
  }

  function handlePlayAgainQuick() {
    track("replay", { mode });
    reset();
  }

  function handleNextRound() {
    reset();
    startRound();
  }

  function handleRestartFiveRound() {
    track("replay", { mode });
    setRounds([]);
    reset();
  }

  function switchMode(next: Mode) {
    setMode(next);
    setRounds([]);
    reset();
  }

  const fiveRoundComplete = mode === "five-round" && rounds.length === REACTION_CONFIG.NUMBER_OF_ROUNDS;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex justify-center gap-2">
        <ModeButton active={mode === "quick"} onClick={() => switchMode("quick")}>
          Quick Test
        </ModeButton>
        <ModeButton active={mode === "five-round"} onClick={() => switchMode("five-round")}>
          5 Round Challenge
        </ModeButton>
      </div>

      {mode === "quick" && (
        <>
          {state === "result" && resultMs !== null ? (
            <ResultCard
              ms={resultMs}
              personalBest={personalBest}
              isNewBest={isNewBest}
              onPlayAgain={handlePlayAgainQuick}
            />
          ) : (
            <ReactionStage state={state} onInteract={registerInteraction} onStart={handleStart} />
          )}
          {state === "too-soon" && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleRetryAfterFalseStart}
                className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-base-950"
              >
                Try again
              </button>
            </div>
          )}
        </>
      )}

      {mode === "five-round" && (
        <>
          {fiveRoundComplete ? (
            <FiveRoundSummary
              rounds={rounds}
              personalBest={personalBest}
              isNewBest={isNewBest}
              onRestart={handleRestartFiveRound}
            />
          ) : (
            <>
              {state === "result" && resultMs !== null ? (
                <div className="rounded-3xl border border-white/5 bg-base-800 p-8 text-center">
                  <div className="text-sm uppercase tracking-widest text-white/50">
                    Round {rounds.length} of {REACTION_CONFIG.NUMBER_OF_ROUNDS}
                  </div>
                  <div className="mt-4 font-display text-5xl font-bold text-white">{resultMs} ms</div>
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="mt-6 rounded-full bg-accent px-6 py-3 text-sm font-bold text-base-950"
                  >
                    Next round
                  </button>
                </div>
              ) : (
                <ReactionStage
                  state={state}
                  onInteract={registerInteraction}
                  onStart={handleStart}
                  roundLabel={`Round ${rounds.length + 1} of ${REACTION_CONFIG.NUMBER_OF_ROUNDS}`}
                />
              )}
              {state === "too-soon" && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleRetryAfterFalseStart}
                    className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-base-950"
                  >
                    Retry this round
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <p className="mt-8 text-center text-xs text-white/30">
        Your score measures browser reaction time and can vary depending on your device and
        display. It&rsquo;s for fun, not a lab measurement.
      </p>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-white text-base-950" : "bg-white/5 text-white/60 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function FiveRoundSummary({
  rounds,
  personalBest,
  isNewBest,
  onRestart,
}: {
  rounds: number[];
  personalBest: number | null;
  isNewBest: boolean;
  onRestart: () => void;
}) {
  const avg = average(rounds);
  const top = best(rounds);

  return (
    <div className="animate-pop-in rounded-3xl border border-white/5 bg-base-800 p-8 text-center sm:p-10">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Round results</div>
      <ul className="mx-auto mt-6 max-w-xs space-y-2 text-left">
        {rounds.map((ms, i) => (
          <li key={i} className="flex justify-between text-white/70">
            <span>Round {i + 1}</span>
            <span className="font-semibold text-white">{ms} ms</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">Average</div>
          <div className="font-display text-3xl font-bold text-white">{avg} ms</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">Best</div>
          <div className="font-display text-3xl font-bold text-white">{top} ms</div>
        </div>
      </div>

      {isNewBest && (
        <div className="mt-6 inline-block animate-pop-in rounded-full bg-accent px-4 py-1 text-sm font-bold uppercase tracking-wide text-base-950">
          New personal best!
        </div>
      )}
      {personalBest !== null && (
        <p className="mt-4 text-sm text-white/60">Can you beat your average of {avg} ms?</p>
      )}

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-bold text-base-950 transition-transform hover:scale-105"
      >
        Try again
      </button>
    </div>
  );
}
