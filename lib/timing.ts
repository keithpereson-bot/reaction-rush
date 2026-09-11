// Thin wrapper around performance.now() so every game measures time the same
// way, and so we have one place to fall back to Date.now() if performance
// timing is ever unavailable (very old browsers / odd embedded webviews).

export function now(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}

export function randomBetween(minMs: number, maxMs: number): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}
