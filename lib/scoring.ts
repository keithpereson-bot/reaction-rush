export function average(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round(sum / values.length);
}

export function best(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}
