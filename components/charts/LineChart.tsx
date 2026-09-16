interface LineChartProps {
  values: number[];
  // Set true for metrics where higher is better (e.g. accuracy %), so the
  // line trends upward when the player is improving. Leave false for
  // metrics like reaction time, where lower is better and "up" already
  // means faster since smaller values plot higher.
  invert?: boolean;
  height?: number;
  color?: string;
  unit?: string;
}

export function LineChart({ values, invert = false, height = 120, color = "#a3ff12", unit = "" }: LineChartProps) {
  if (values.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-white/30"
        style={{ height }}
      >
        Play a few rounds to see your trend
      </div>
    );
  }

  if (values.length === 1) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height }}>
        <div className="font-display text-2xl font-bold text-white">
          {values[0]}
          {unit}
        </div>
        <div className="mt-1 text-xs text-white/40">Play again to start a trend</div>
      </div>
    );
  }

  const width = 100;
  const padding = 12;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const t = (v - min) / range;
    const yT = invert ? 1 - t : t;
    const y = padding + yT * (height - padding * 2);
    return { x, y, v };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`Trend chart, ${values.length} data points, latest value ${values[values.length - 1]}${unit}`}
      >
        <path d={path} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 2.4 : 1.1}
            fill={i === points.length - 1 ? color : "rgba(255,255,255,0.35)"}
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-white/40">
        <span>
          Best: {invert ? max : min}
          {unit}
        </span>
        <span>
          Latest: {values[values.length - 1]}
          {unit}
        </span>
      </div>
    </div>
  );
}
