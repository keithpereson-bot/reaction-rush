import { getScoreLabel } from "@/config/game";

export function ScoreDisplay({ ms, big = true }: { ms: number; big?: boolean }) {
  return (
    <div className="text-center">
      <div
        className={`font-display font-bold tracking-tight text-white ${
          big ? "text-6xl sm:text-7xl" : "text-3xl"
        }`}
      >
        {ms} <span className="text-2xl font-medium text-white/60 sm:text-3xl">ms</span>
      </div>
      <div className="mt-2 text-lg font-medium text-accent">{getScoreLabel(ms)}</div>
    </div>
  );
}
