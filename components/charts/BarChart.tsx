interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
}

export function BarChart({ data, color = "#3b82f6" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center">
          <div className="text-xs font-medium text-white/60">{d.value}</div>
          <div className="mt-1 flex h-24 w-full items-end">
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                backgroundColor: d.value > 0 ? color : "rgba(255,255,255,0.05)",
              }}
            />
          </div>
          <div className="mt-2 text-center text-[10px] leading-tight text-white/40">{d.label}</div>
        </div>
      ))}
    </div>
  );
}
