"use client";

export interface ChessRecord {
  wins: number;
  losses: number;
  draws: number;
}

const KEY = "rr_chess_record_vs_ai";

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

export function getChessRecord(): ChessRecord {
  const fallback = { wins: 0, losses: 0, draws: 0 };
  if (typeof window === "undefined" || !isStorageAvailable()) return fallback;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function recordChessResult(outcome: "win" | "loss" | "draw"): ChessRecord {
  const current = getChessRecord();
  const next = {
    ...current,
    wins: current.wins + (outcome === "win" ? 1 : 0),
    losses: current.losses + (outcome === "loss" ? 1 : 0),
    draws: current.draws + (outcome === "draw" ? 1 : 0),
  };
  if (typeof window !== "undefined" && isStorageAvailable()) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
  return next;
}
