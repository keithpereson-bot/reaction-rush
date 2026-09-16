"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useImpossibleColor } from "@/games/impossible-color/useImpossibleColor";
import { IMPOSSIBLE_COLOR_CONFIG, getAccuracyLabel, type ColorOption } from "@/config/game";
import { getPersonalBest, maybeSetPersonalBest } from "@/lib/storage";
import { recordHistory } from "@/lib/history";
import { PersonalBest } from "@/components/PersonalBest";
import { ShareButton } from "@/components/ShareButton";
import { track } from "@/lib/analytics";
import { sfx, useSoundPreference } from "@/lib/sound";
import { average } from "@/lib/scoring";

const GAME_KEY = "impossible-color";

export function ImpossibleColorGame() {
  const { state, round, roundIndex, outcomes, lastOutcome, startGame, choose, nextRound, reset } =
    useImpossibleColor();
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const sound = useSoundPreference();

  useEffect(() => {
    setPersonalBest(getPersonalBest(GAME_KEY));
  }, []);

  useEffect(() => {
    if (state !== "round-result" || !lastOutcome) return;
    recordHistory("color-rounds", { ms: lastOutcome.ms, correct: lastOutcome.correct });
    if (sound.enabled) {
      if (lastOutcome.correct) sfx.correct();
      else sfx.incorrect();
    }
  }, [state, lastOutcome, sound.enabled]);

  useEffect(() => {
    if (state !== "finished") return;
    const correctTimes = outcomes.filter((o) => o.correct).map((o) => o.ms);
    const correctCount = correctTimes.length;
    track("game_completed", { mode: GAME_KEY, correct: correctCount, total: outcomes.length });
    recordHistory("color-sessions", {
      accuracyPct: outcomes.length > 0 ? Math.round((correctCount / outcomes.length) * 100) : 0,
      avgCorrectMs: correctTimes.length > 0 ? average(correctTimes) : 0,
    });

    if (correctCount === outcomes.length && correctTimes.length > 0) {
      const avg = average(correctTimes);
      const gotNewBest = maybeSetPersonalBest(avg, GAME_KEY);
      setIsNewBest(gotNewBest);
      if (gotNewBest) {
        setPersonalBest(avg);
        track("personal_best", { mode: GAME_KEY, ms: avg });
        if (sound.enabled) sfx.personalBest();
      } else if (sound.enabled) {
        sfx.challengeComplete();
      }
    } else {
      setIsNewBest(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function handleStart() {
    track("game_started", { mode: GAME_KEY });
    startGame();
  }

  function handleRestart() {
    track("replay", { mode: GAME_KEY });
    reset();
  }

  if (state === "idle") {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Impossible Color</h1>
        <p className="mt-4 text-white/60">
          A word will appear, written in a color that doesn&rsquo;t match what it says. Tap the
          swatch matching the <span className="font-semibold text-white">ink color</span>, not
          the word. {IMPOSSIBLE_COLOR_CONFIG.ROUND_COUNT} rounds. Go fast, but not too fast.
        </p>
        <button
          type="button"
          onClick={handleStart}
          className="mt-8 rounded-full bg-accent px-8 py-4 text-base font-bold text-base-950 transition-transform hover:scale-105"
        >
          Start
        </button>
        {personalBest !== null && (
          <div className="mt-8 flex justify-center">
            <PersonalBest ms={personalBest} />
          </div>
        )}
      </div>
    );
  }

  if (state === "finished") {
    const correctCount = outcomes.filter((o) => o.correct).length;
    const correctTimes = outcomes.filter((o) => o.correct).map((o) => o.ms);
    const avg = correctTimes.length > 0 ? average(correctTimes) : null;
    const label = getAccuracyLabel(correctCount, outcomes.length);

    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="animate-pop-in rounded-3xl border border-white/5 bg-base-800 p-8 text-center sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            Impossible Color
          </div>
          <div className="mt-4 font-display text-5xl font-bold text-white">
            {correctCount}/{outcomes.length}
          </div>
          <div className="mt-2 text-lg font-medium text-accent">{label}</div>
          {avg !== null && (
            <p className="mt-4 text-sm text-white/60">
              Average response time on correct answers: <span className="text-white">{avg} ms</span>
            </p>
          )}

          <div className="mt-6 flex justify-center">
            <PersonalBest ms={personalBest} isNewBest={isNewBest} />
          </div>
          {personalBest !== null && correctCount < outcomes.length && (
            <p className="mt-2 text-xs text-white/40">
              Personal best only updates on a perfect round.
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-base-950 transition-transform hover:scale-105"
            >
              Play again
            </button>
            {avg !== null && <ShareButton ms={avg} variant="share" />}
          </div>
          <Link href="/stats" className="mt-5 inline-block text-xs text-white/40 underline hover:text-white/70">
            View your stats
          </Link>
        </div>
      </div>
    );
  }

  // state === "playing" or "round-result"
  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-white/50">
        Round {roundIndex + 1} of {IMPOSSIBLE_COLOR_CONFIG.ROUND_COUNT}
      </div>

      {state === "playing" && round && (
        <>
          <div
            key={roundIndex}
            className="animate-pop-in rounded-3xl border border-white/5 bg-base-800 py-16 text-center sm:py-20"
          >
            <div
              className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl"
              style={{ color: round.ink.hex }}
            >
              {round.word.name.toUpperCase()}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {round.choices.map((choice) => (
              <SwatchButton key={choice.name} choice={choice} onClick={() => choose(choice)} />
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-white/40">
            Tap the color the word is written in — not what it says.
          </p>
        </>
      )}

      {state === "round-result" && lastOutcome && (
        <div
          className={`animate-pop-in rounded-3xl border border-white/5 py-16 text-center sm:py-20 ${
            lastOutcome.correct ? "bg-go/10" : "bg-wait/10"
          }`}
        >
          <div
            className={`font-display text-4xl font-bold ${
              lastOutcome.correct ? "text-go" : "text-wait"
            }`}
          >
            {lastOutcome.correct ? "Correct" : "Missed it"}
          </div>
          <div className="mt-2 text-white/50">{lastOutcome.ms} ms</div>
          <button
            type="button"
            onClick={nextRound}
            className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-bold text-base-950"
          >
            {roundIndex + 1 >= IMPOSSIBLE_COLOR_CONFIG.ROUND_COUNT ? "See results" : "Next round"}
          </button>
        </div>
      )}
    </div>
  );
}

function SwatchButton({ choice, onClick }: { choice: ColorOption; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={choice.name}
      className="aspect-square w-full rounded-2xl border border-white/10 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white"
      style={{ backgroundColor: choice.hex }}
    />
  );
}
