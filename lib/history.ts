"use client";

// Records a rolling history of attempts per game so the stats page can chart
// trends over time. Everything stays local to the player's device — no
// backend involved. Capped so localStorage never grows unbounded.

const MAX_ENTRIES = 200;

export type HistoryEntry = { ts: number } & Record<string, number | boolean>;

function historyKey(streamKey: string): string {
  return `rr_history_${streamKey}`;
}

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

export function recordHistory(streamKey: string, entry: Omit<HistoryEntry, "ts">): void {
  if (typeof window === "undefined" || !isStorageAvailable()) return;
  const existing = getHistory(streamKey);
  const next = [...existing, { ts: Date.now(), ...entry }].slice(-MAX_ENTRIES);
  try {
    window.localStorage.setItem(historyKey(streamKey), JSON.stringify(next));
  } catch {
    // ignore — history is a non-essential enhancement
  }
}

export function getHistory(streamKey: string): HistoryEntry[] {
  if (typeof window === "undefined" || !isStorageAvailable()) return [];
  const raw = window.localStorage.getItem(historyKey(streamKey));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearHistory(streamKey: string): void {
  if (typeof window === "undefined" || !isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(historyKey(streamKey));
  } catch {
    // ignore
  }
}
