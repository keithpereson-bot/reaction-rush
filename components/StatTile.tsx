export function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-base-800 p-4 text-center">
      <div className="text-xs uppercase tracking-widest text-white/40">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-white/40">{sub}</div>}
    </div>
  );
}
