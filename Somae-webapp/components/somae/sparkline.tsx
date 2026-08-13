import { useId } from "react";

const toneMap: Record<string, string> = {
  blue: "#2e6bff",
  violet: "#8b5cf6",
  green: "#22c55e",
  amber: "#f59e0b",
};

export function Sparkline({
  data,
  tone = "blue",
  className,
  height = 40,
}: {
  data: number[];
  tone?: keyof typeof toneMap | string;
  className?: string;
  height?: number;
}) {
  const id = useId();
  const color = toneMap[tone] ?? tone;
  const w = 120;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => [
    i * step,
    h - 6 - ((v - min) / range) * (h - 12),
  ]);
  const line = points
    .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
    .join(" ");
  const area = `${line} L ${w},${h} L 0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r="3"
        fill={color}
        stroke="#fff"
        strokeWidth="1.5"
      />
    </svg>
  );
}
