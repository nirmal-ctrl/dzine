import { useId } from "react";

/** Elegant two-series area chart — thin lines, soft gradients, minimal grid. */
export function AreaChart({
  labels,
  series,
  height = 260,
}: {
  labels: string[];
  series: { name: string; color: string; data: number[] }[];
  height?: number;
}) {
  const id = useId();
  const w = 720;
  const h = height;
  const padX = 36;
  const padTop = 20;
  const padBottom = 34;
  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all) * 1.15;
  const stepX = (w - padX * 2) / (labels.length - 1);

  const toPoints = (data: number[]) =>
    data.map((v, i) => [padX + i * stepX, padTop + (1 - v / max) * (h - padTop - padBottom)] as const);

  const toPath = (pts: readonly (readonly [number, number])[]) =>
    pts.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(" ");

  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => padTop + f * (h - padTop - padBottom));

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Analytics chart">
        <defs>
          {series.map((s, si) => (
            <linearGradient key={si} id={`area-${id}-${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.16" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* grid */}
        {gridLines.map((y, i) => (
          <line key={i} x1={padX} x2={w - padX} y1={y} y2={y} stroke="#e9f0fb" strokeWidth="1" strokeDasharray={i === gridLines.length - 1 ? "0" : "3 6"} />
        ))}

        {series.map((s, si) => {
          const pts = toPoints(s.data);
          const line = toPath(pts);
          const area = `${line} L ${w - padX},${h - padBottom} L ${padX},${h - padBottom} Z`;
          return (
            <g key={si}>
              <path d={area} fill={`url(#area-${id}-${si})`} />
              <path d={line} fill="none" stroke={s.color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
              {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4 : 0} fill={s.color} stroke="#fff" strokeWidth="2" />
              ))}
            </g>
          );
        })}

        {/* x labels */}
        {labels.map((l, i) => (
          <text
            key={l}
            x={padX + i * stepX}
            y={h - 10}
            textAnchor="middle"
            fontSize="11"
            fontWeight="500"
            fill="#8fa1c7"
          >
            {l}
          </text>
        ))}
      </svg>

      {/* legend */}
      <div className="mt-1 flex items-center gap-5 px-2">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-2 text-[12px] font-medium text-[#5c6b8a]">
            <span className="size-2 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
