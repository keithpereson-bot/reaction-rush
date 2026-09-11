// Central configuration for game balance.
// Change numbers here rather than scattering magic values through the code.

export const REACTION_CONFIG = {
  MIN_WAIT_MS: 1500,
  MAX_WAIT_MS: 5000,
  NUMBER_OF_ROUNDS: 5,
};

// Entertainment-oriented labels. Not medical or scientific claims.
export const SCORE_THRESHOLDS: { max: number; label: string }[] = [
  { max: 150, label: "Lightning fast" },
  { max: 200, label: "Exceptional" },
  { max: 250, label: "Very fast" },
  { max: 300, label: "Fast" },
  { max: 400, label: "Good" },
  { max: 500, label: "Average" },
  { max: Infinity, label: "Keep practicing" },
];

export function getScoreLabel(ms: number): string {
  const match = SCORE_THRESHOLDS.find((t) => ms < t.max);
  return match ? match.label : "Keep practicing";
}

// Daily challenge targets by day of week (0 = Sunday ... 6 = Saturday).
// Kept simple and configurable; can be swapped for a server-driven schedule later.
export const DAILY_TARGETS_MS: number[] = [
  260, // Sunday
  250, // Monday
  240, // Tuesday
  200, // Wednesday
  230, // Thursday
  220, // Friday
  210, // Saturday
];

export function getTodaysTargetMs(date: Date = new Date()): number {
  return DAILY_TARGETS_MS[date.getDay()];
}

// Local date key (YYYY-MM-DD) used for daily challenge storage, based on the
// player's own device clock/timezone rather than a server date.
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const SITE = {
  name: "Reaction Rush",
  tagline: "Quick games. Real scores. Can you beat yours?",
  url: "https://reactionrush.example.com",
};
