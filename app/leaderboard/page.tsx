import type { Metadata } from "next";
import { fetchLeaderboard } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "See the fastest reaction times on Reaction Rush.",
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const { entries, isLive } = await fetchLeaderboard(20);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Leaderboard</h1>

      {!isLive && (
        <p className="mt-3 rounded-lg bg-white/5 px-4 py-3 text-sm text-white/60">
          This is demo data — no live global leaderboard is connected yet. See the README for
          how to wire up a real backend.
        </p>
      )}

      <ol className="mt-6 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5">
        {entries
          .slice()
          .sort((a, b) => a.scoreMs - b.scoreMs)
          .map((entry, i) => (
            <li key={entry.id} className="flex items-center justify-between bg-base-800 px-5 py-4">
              <div className="flex items-center gap-4">
                <span className="w-6 text-right font-display font-bold text-white/40">{i + 1}</span>
                <span className="font-medium text-white">{entry.displayName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wide text-white/30">
                  {entry.mode === "five-round" ? "5-round" : "quick"}
                </span>
                <span className="font-display font-bold text-accent">{entry.scoreMs} ms</span>
              </div>
            </li>
          ))}
      </ol>
    </div>
  );
}
