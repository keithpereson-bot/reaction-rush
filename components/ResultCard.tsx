import Link from "next/link";
import { ScoreDisplay } from "./ScoreDisplay";
import { ShareButton } from "./ShareButton";
import { PersonalBest } from "./PersonalBest";
import { SITE } from "@/config/game";

interface ResultCardProps {
  ms: number;
  personalBest: number | null;
  isNewBest: boolean;
  onPlayAgain: () => void;
}

export function ResultCard({ ms, personalBest, isNewBest, onPlayAgain }: ResultCardProps) {
  return (
    <div className="animate-pop-in rounded-3xl border border-white/5 bg-base-800 p-8 text-center sm:p-10">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">{SITE.name}</div>
      <div className="mt-4">
        <ScoreDisplay ms={ms} />
      </div>

      <div className="mt-6 flex justify-center">
        <PersonalBest ms={personalBest} isNewBest={isNewBest} />
      </div>

      {!isNewBest && personalBest !== null && ms > personalBest && (
        <p className="mt-4 text-sm text-white/60">
          You&rsquo;re {ms - personalBest} ms away from your personal best.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-base-950 transition-transform hover:scale-105"
        >
          Play again
        </button>
        <ShareButton ms={ms} variant="challenge" />
        <ShareButton ms={ms} variant="share" />
      </div>
      <Link href="/stats" className="mt-5 inline-block text-xs text-white/40 underline hover:text-white/70">
        View your stats
      </Link>
    </div>
  );
}
