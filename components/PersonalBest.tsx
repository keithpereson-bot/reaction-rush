export function PersonalBest({ ms, isNewBest }: { ms: number | null; isNewBest?: boolean }) {
  if (ms === null) return null;
  return (
    <div className="flex flex-col items-center gap-1">
      {isNewBest && (
        <div className="animate-pop-in rounded-full bg-accent px-4 py-1 text-sm font-bold uppercase tracking-wide text-base-950">
          New personal best!
        </div>
      )}
      <div className="text-sm uppercase tracking-widest text-white/50">Personal best</div>
      <div className="text-xl font-semibold text-white">{ms} ms</div>
    </div>
  );
}
