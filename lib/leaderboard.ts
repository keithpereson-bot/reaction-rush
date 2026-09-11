// Leaderboard data access layer.
//
// This module is the single place the UI talks to for leaderboard data.
// Right now it returns clearly-labeled demo data because no backend is
// configured. To go live, implement `fetchLeaderboardFromBackend` and
// `submitScoreToBackend` against Supabase/Postgres (see README) and flip
// `BACKEND_CONFIGURED` to true — no UI code needs to change.

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  scoreMs: number;
  mode: "quick" | "five-round";
  timestamp: string; // ISO
}

const BACKEND_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

// Deterministic demo dataset — clearly not real user submissions.
const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { id: "demo-1", displayName: "Demo — Nova", scoreMs: 162, mode: "quick", timestamp: "2026-09-01T10:00:00Z" },
  { id: "demo-2", displayName: "Demo — Kai", scoreMs: 178, mode: "quick", timestamp: "2026-09-02T10:00:00Z" },
  { id: "demo-3", displayName: "Demo — Wren", scoreMs: 191, mode: "five-round", timestamp: "2026-09-03T10:00:00Z" },
  { id: "demo-4", displayName: "Demo — Sable", scoreMs: 205, mode: "quick", timestamp: "2026-09-04T10:00:00Z" },
  { id: "demo-5", displayName: "Demo — Rowan", scoreMs: 212, mode: "five-round", timestamp: "2026-09-05T10:00:00Z" },
  { id: "demo-6", displayName: "Demo — Ivy", scoreMs: 228, mode: "quick", timestamp: "2026-09-06T10:00:00Z" },
  { id: "demo-7", displayName: "Demo — Orion", scoreMs: 241, mode: "quick", timestamp: "2026-09-07T10:00:00Z" },
  { id: "demo-8", displayName: "Demo — Fen", scoreMs: 255, mode: "five-round", timestamp: "2026-09-08T10:00:00Z" },
];

export async function fetchLeaderboard(limit = 20): Promise<{
  entries: LeaderboardEntry[];
  isLive: boolean;
}> {
  if (BACKEND_CONFIGURED) {
    try {
      const entries = await fetchLeaderboardFromBackend(limit);
      return { entries, isLive: true };
    } catch {
      // Fail gracefully to demo data rather than breaking the page.
      return { entries: DEMO_LEADERBOARD.slice(0, limit), isLive: false };
    }
  }
  return { entries: DEMO_LEADERBOARD.slice(0, limit), isLive: false };
}

export async function submitScore(entry: Omit<LeaderboardEntry, "id" | "timestamp">): Promise<boolean> {
  if (!BACKEND_CONFIGURED) return false;
  try {
    await submitScoreToBackend(entry);
    return true;
  } catch {
    return false;
  }
}

// --- Backend seam -----------------------------------------------------
// Implement these two functions against Supabase when ready. Suggested
// schema (see /supabase/schema.sql):
//
//   create table scores (
//     id uuid primary key default gen_random_uuid(),
//     player_id uuid not null,        -- anonymous, generated client-side
//     display_name text,
//     score_ms integer not null check (score_ms > 0 and score_ms < 5000),
//     mode text not null check (mode in ('quick', 'five-round')),
//     created_at timestamptz not null default now()
//   );
//
// Basic anti-cheat for the API route that would sit in front of this:
//   - Reject score_ms outside a plausible human range (e.g. < 80ms or > 3000ms).
//   - Rate-limit submissions per anonymous player_id (e.g. 1 per few seconds).
//   - Never trust a score without a server-side sanity check; the client is
//     not a trusted source of truth.

async function fetchLeaderboardFromBackend(_limit: number): Promise<LeaderboardEntry[]> {
  throw new Error("Backend not implemented yet — see lib/leaderboard.ts");
}

async function submitScoreToBackend(
  _entry: Omit<LeaderboardEntry, "id" | "timestamp">
): Promise<void> {
  throw new Error("Backend not implemented yet — see lib/leaderboard.ts");
}
