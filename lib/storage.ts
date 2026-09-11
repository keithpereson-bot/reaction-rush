// A small safe wrapper around localStorage. Private browsing modes, disabled
// storage, or storage quota errors should never crash the game — they should
// just mean personal best / daily-challenge progress isn't remembered.

const PERSONAL_BEST_KEY = "rr_personal_best_ms";
const DAILY_PROGRESS_PREFIX = "rr_daily_"; // + date key

function isStorageAvailable(): boolean {
  try {
    const testKey = "__rr_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getPersonalBest(): number | null {
  if (typeof window === "undefined" || !isStorageAvailable()) return null;
  const raw = window.localStorage.getItem(PERSONAL_BEST_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

// Returns true if this score is a new personal best.
export function maybeSetPersonalBest(ms: number): boolean {
  if (typeof window === "undefined" || !isStorageAvailable()) return false;
  const current = getPersonalBest();
  if (current === null || ms < current) {
    window.localStorage.setItem(PERSONAL_BEST_KEY, String(ms));
    return true;
  }
  return false;
}

export interface DailyProgress {
  bestMs: number | null;
  attempts: number;
  targetMs: number;
  completed: boolean;
}

export function getDailyProgress(dateKey: string, targetMs: number): DailyProgress {
  const fallback: DailyProgress = { bestMs: null, attempts: 0, targetMs, completed: false };
  if (typeof window === "undefined" || !isStorageAvailable()) return fallback;
  const raw = window.localStorage.getItem(DAILY_PROGRESS_PREFIX + dateKey);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as DailyProgress;
    return { ...fallback, ...parsed, targetMs };
  } catch {
    return fallback;
  }
}

export function recordDailyAttempt(dateKey: string, ms: number, targetMs: number): DailyProgress {
  const progress = getDailyProgress(dateKey, targetMs);
  const bestMs = progress.bestMs === null ? ms : Math.min(progress.bestMs, ms);
  const updated: DailyProgress = {
    bestMs,
    attempts: progress.attempts + 1,
    targetMs,
    completed: bestMs <= targetMs,
  };
  if (typeof window !== "undefined" && isStorageAvailable()) {
    window.localStorage.setItem(DAILY_PROGRESS_PREFIX + dateKey, JSON.stringify(updated));
  }
  return updated;
}
