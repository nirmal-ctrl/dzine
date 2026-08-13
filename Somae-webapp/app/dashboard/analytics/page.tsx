import { TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { DashboardHeader } from "@/components/somae/dashboard-header";
import { AreaChart } from "@/components/somae/area-chart";
import { analyticsKpis, analyticsSeries } from "@/lib/mock-data";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[980px] px-1 pb-10 pt-2">
      <DashboardHeader title="Analytics" subtitle="Clean numbers, clear next steps." />

      {/* Range selector */}
      <div className="mb-6 flex justify-end">
        <div className="flex rounded-full bg-white p-1 shadow-soft ring-1 ring-[#e9f0fb]">
          {["Last 7 days", "Last 30 days", "Last 90 days"].map((r, i) => (
            <button
              key={r}
              className={`rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-all duration-300 ${
                i === 0 ? "bg-[#eef4ff] text-[#2b5ce6]" : "text-[#5c6b8a] hover:text-[#101c3d]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
        {/* Chart card */}
        <section className="rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-[#e9f0fb]">
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {analyticsKpis.map((k) => (
              <div key={k.label}>
                <p className="text-[12px] font-medium text-[#8fa1c7]">{k.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-[24px] font-semibold tracking-[-0.02em] text-[#101c3d]">
                    {k.value}
                  </p>
                  <span className="flex items-center gap-0.5 text-[11.5px] font-semibold text-[#0d9d63]">
                    <TrendingUp className="size-3" />
                    {k.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-[#f2f6fd] pt-5">
            <AreaChart
              labels={analyticsSeries.labels}
              series={[
                { name: "Reach", color: "#2e6bff", data: analyticsSeries.reach },
                { name: "Engagement", color: "#7fb3ff", data: analyticsSeries.engagement },
              ]}
            />
          </div>
        </section>

        {/* AI insight */}
        <aside className="flex flex-col rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-[#e9f0fb]">
          <div className="flex items-center gap-3">
            <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2b5ce6] to-[#4a8dff] text-white">
              <Sparkles className="size-4" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[#b6f500] ring-2 ring-white" />
            </span>
            <p className="text-[14.5px] font-semibold text-[#101c3d]">AI Insight</p>
          </div>
          <p className="mt-4 text-[13.5px] font-medium leading-relaxed text-[#3d4c6d]">
            Your audience loves educational content this week. Carousel posts drove{" "}
            <span className="font-semibold text-[#2b5ce6]">2.4× more saves</span> than single
            images, and Thursday mornings remain your strongest slot.
          </p>
          <p className="mt-3 text-[13.5px] font-medium leading-relaxed text-[#3d4c6d]">
            Consider publishing <span className="font-semibold text-[#2b5ce6]">2 more posts</span>{" "}
            in the &ldquo;AI trends&rdquo; series before Friday.
          </p>
          <button className="group mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[#2e6bff] px-5 py-3 pt-3 text-[13px] font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-glow active:scale-[0.98]">
            View Suggestions
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </aside>
      </div>
    </div>
  );
}
