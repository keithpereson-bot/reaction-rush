export function average(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round(sum / values.length);
}

export function best(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

// Compares the average of the first half of a history against the second
// half. For "lower is better" metrics (like ms), a positive percentage
// means the player got faster. Returns null when there isn't enough data
// for a meaningful comparison.
export function improvementPercent(valuesOldestFirst: number[], lowerIsBetter = true): number | null {
  if (valuesOldestFirst.length < 6) return null;
  const mid = Math.floor(valuesOldestFirst.length / 2);
  const firstHalf = valuesOldestFirst.slice(0, mid);
  const secondHalf = valuesOldestFirst.slice(mid);
  const firstAvg = average(firstHalf);
  const secondAvg = average(secondHalf);
  if (firstAvg === 0) return null;
  const rawChange = ((firstAvg - secondAvg) / firstAvg) * 100;
  return lowerIsBetter ? rawChange : -rawChange;
}
