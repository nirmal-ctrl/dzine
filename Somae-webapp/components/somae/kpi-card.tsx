import { Sparkles, ChartColumn, TrendingUp, Lightbulb } from "lucide-react";
import { Sparkline } from "./sparkline";

const toneStyles: Record<
  string,
  { icon: React.ReactNode; tile: string; delta: string }
> = {
  blue: {
    icon: <ChartColumn className="size-4" />,
    tile: "bg-[#e0ecff] text-[#2b5ce6]",
    delta: "text-[#0d9d63]",
  },
  violet: {
    icon: <TrendingUp className="size-4" />,
    tile: "bg-[#efe6ff] text-[#7c3aed]",
    delta: "text-[#0d9d63]",
  },
  green: {
    icon: <Sparkles className="size-4" />,
    tile: "bg-[#dcf5e9] text-[#047857]",
    delta: "text-[#0d9d63]",
  },
  amber: {
    icon: <Lightbulb className="size-4" />,
    tile: "bg-[#ffedd5] text-[#b45309]",
    delta: "text-[#b45309]",
  },
};

export function KpiCard({
  label,
  value,
  delta,
  tone,
  series,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "blue" | "violet" | "green" | "amber";
  series: number[];
}) {
  const t = toneStyles[tone];
  return (
    <div className="card-interactive rounded-[24px] bg-white p-5 shadow-soft ring-1 ring-[#e9f0fb]">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-[#5c6b8a]">{label}</p>
        <span className={`flex size-8 items-center justify-center rounded-xl ${t.tile}`}>
          {t.icon}
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-[32px] font-semibold leading-none tracking-[-0.02em] text-[#101c3d]">
            {value}
          </p>
          <p className={`mt-2 text-[12px] font-semibold ${t.delta}`}>{delta}</p>
        </div>
        <Sparkline data={series} tone={tone} className="h-10 w-24 shrink-0" />
      </div>
    </div>
  );
}
