"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { StatTile } from "@/components/StatTile";
import { getHistory, clearHistory, type HistoryEntry } from "@/lib/history";
import { getPersonalBest } from "@/lib/storage";
import { average, improvementPercent } from "@/lib/scoring";
import { SCORE_THRESHOLDS, getScoreLabel } from "@/config/game";

const TREND_WINDOW = 30; // most recent N points shown on trend charts


export function StatsPage() {
  const [ready, setReady] = useState(false);
  const [reactionRounds, setReactionRounds] = useState<HistoryEntry[]>([]);
  const [reactionSessions, setReactionSessions] = useState<HistoryEntry[]>([]);
  const [colorRounds, setColorRounds] = useState<HistoryEntry[]>([]);
  const [colorSessions, setColorSessions] = useState<HistoryEntry[]>([]);
  const [reactionBest, setReactionBest] = useState<number | null>(null);
  const [colorBest, setColorBest] = useState<number | null>(null);

  function loadAll() {
    setReactionRounds(getHistory("reaction-rounds"));
    setReactionSessions(getHistory("reaction-sessions"));
    setColorRounds(getHistory("color-rounds"));
    setColorSessions(getHistory("color-sessions"));
    setReactionBest(getPersonalBest("reaction"));
    setColorBest(getPersonalBest("impossible-color"));
    setReady(true);
  }

  useEffect(() => {
    loadAll();
  }, []);

  if (!ready) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-white/50">Loading your stats&hellip;</div>;
  }

  const hasAnyData = reactionRounds.length > 0 || colorRounds.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Your Stats</h1>
        <p className="mt-2 text-white/50">Track your progress across every game on this device.</p>
      </div>

      {!hasAnyData && (
        <div className="rounded-2xl border border-white/5 bg-base-800 p-8 text-center text-white/50">
          No stats yet — play a round of{" "}
          <Link href="/reaction" className="text-accent underline">
            Reaction Rush
          </Link>{" "}
          or{" "}
          <Link href="/impossible-color" className="text-accent underline">
            Impossible Color
          </Link>{" "}
          to start tracking your progress.
        </div>
      )}

      {reactionRounds.length > 0 && (
        <ReactionStats
          rounds={reactionRounds}
          sessions={reactionSessions}
          best={reactionBest}
          onClear={() => {
            clearHistory("reaction-rounds");
            clearHistory("reaction-sessions");
            loadAll();
          }}
        />
      )}

      {colorRounds.length > 0 && (
        <ColorStats
          rounds={colorRounds}
          sessions={colorSessions}
          best={colorBest}
          onClear={() => {
            clearHistory("color-rounds");
            clearHistory("color-sessions");
            loadAll();
          }}
        />
      )}
    </div>
  );
}

function ReactionStats({
  rounds,
  sessions,
  best,
  onClear,
}: {
  rounds: HistoryEntry[];
  sessions: HistoryEntry[];
  best: number | null;
  onClear: () => void;
}) {
  const allTimes = rounds.map((r) => r.ms as number);
  const recentTimes = allTimes.slice(-TREND_WINDOW);
  const avgAll = average(allTimes);
  const avgRecent10 = average(allTimes.slice(-10));
  const improvement = improvementPercent(allTimes, true);

  const distribution = SCORE_THRESHOLDS.map((t) => ({
    label: t.label,
    value: allTimes.filter((ms) => getScoreLabel(ms) === t.label).length,
  }));

  const sessionAverages = sessions.map((s) => s.avgMs as number).slice(-TREND_WINDOW);

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white">Reaction Rush</h2>
        <button type="button" onClick={onClear} className="text-xs text-white/30 underline hover:text-white/60">
          Clear this data
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Attempts" value={String(allTimes.length)} />
        <StatTile label="Personal best" value={best !== null ? `${best} ms` : "—"} />
        <StatTile label="Average (all-time)" value={`${avgAll} ms`} />
        <StatTile label="Average (last 10)" value={`${avgRecent10} ms`} />
      </div>

      {improvement !== null && (
        <p className="mt-4 text-center text-sm text-white/60">
          {improvement > 0 ? (
            <>You&rsquo;ve gotten <span className="font-semibold text-go">{Math.abs(Math.round(improvement))}% faster</span> since you started.</>
          ) : improvement < 0 ? (
            <>Your average has slowed by <span className="font-semibold text-wait">{Math.abs(Math.round(improvement))}%</span> recently &mdash; a few focused rounds should bring it back.</>
          ) : (
            <>Your pace has been steady.</>
          )}
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-white/5 bg-base-800 p-5">
        <div className="mb-3 text-sm font-semibold text-white/70">Reaction time trend (ms, lower is better)</div>
        <LineChart values={recentTimes} unit=" ms" color="#a3ff12" />
      </div>

      {sessionAverages.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/5 bg-base-800 p-5">
          <div className="mb-3 text-sm font-semibold text-white/70">5-Round Challenge averages</div>
          <LineChart values={sessionAverages} unit=" ms" color="#3b82f6" />
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-white/5 bg-base-800 p-5">
        <div className="mb-3 text-sm font-semibold text-white/70">Where your scores land</div>
        <BarChart data={distribution} color="#a3ff12" />
      </div>
    </section>
  );
}

function ColorStats({
  rounds,
  sessions,
  best,
  onClear,
}: {
  rounds: HistoryEntry[];
  sessions: HistoryEntry[];
  best: number | null;
  onClear: () => void;
}) {
  const totalRounds = rounds.length;
  const correctRounds = rounds.filter((r) => r.correct === true);
  const accuracyOverall = totalRounds > 0 ? Math.round((correctRounds.length / totalRounds) * 100) : 0;
  const avgCorrectMs = correctRounds.length > 0 ? average(correctRounds.map((r) => r.ms as number)) : 0;

  const accuracyTrend = sessions.map((s) => s.accuracyPct as number).slice(-TREND_WINDOW);
  const speedTrend = sessions
    .map((s) => s.avgCorrectMs as number)
    .filter((v) => v > 0)
    .slice(-TREND_WINDOW);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white">Impossible Color</h2>
        <button type="button" onClick={onClear} className="text-xs text-white/30 underline hover:text-white/60">
          Clear this data
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Rounds played" value={String(totalRounds)} />
        <StatTile label="Accuracy" value={`${accuracyOverall}%`} />
        <StatTile label="Avg. correct response" value={avgCorrectMs > 0 ? `${avgCorrectMs} ms` : "—"} />
        <StatTile label="Best (perfect run)" value={best !== null ? `${best} ms` : "—"} />
      </div>

      {accuracyTrend.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/5 bg-base-800 p-5">
          <div className="mb-3 text-sm font-semibold text-white/70">Accuracy per session (%, higher is better)</div>
          <LineChart values={accuracyTrend} invert unit="%" color="#a855f7" />
        </div>
      )}

      {speedTrend.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/5 bg-base-800 p-5">
          <div className="mb-3 text-sm font-semibold text-white/70">
            Average response time on correct answers (ms, lower is better)
          </div>
          <LineChart values={speedTrend} unit=" ms" color="#22c55e" />
        </div>
      )}

      {accuracyTrend.length === 0 && (
        <p className="mt-4 text-center text-sm text-white/40">
          Finish a full 10-round game to start seeing session trends here.
        </p>
      )}
    </section>
  );
}
