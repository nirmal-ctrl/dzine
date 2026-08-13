import Link from "next/link";
import { Camera, Newspaper, Mail, Plus, ArrowRight } from "lucide-react";
import { DashboardHeader } from "@/components/somae/dashboard-header";
import { KpiCard } from "@/components/somae/kpi-card";
import { kpis, upcomingContent, user } from "@/lib/mock-data";

const platformTile: Record<string, { bg: string; icon: React.ReactNode }> = {
  instagram: { bg: "bg-[#ffe4ef] text-[#e1306c]", icon: <Camera className="size-4" /> },
  linkedin: { bg: "bg-[#e0ecff] text-[#0a66c2]", icon: <Newspaper className="size-4" /> },
  email: { bg: "bg-[#dcf5e9] text-[#047857]", icon: <Mail className="size-4" /> },
};

export default function DashboardOverview() {
  return (
    <div className="mx-auto max-w-[980px] px-1 pb-10 pt-2">
      <DashboardHeader
        title={
          <>
            Good morning, {user.name} <span aria-hidden>👋</span>
          </>
        }
        subtitle="Here's what's happening with your brand today."
      />

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Upcoming content */}
      <section className="mt-6 rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-[#e9f0fb]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[#101c3d]">
              Upcoming Content
            </h2>
            <p className="mt-0.5 text-[12.5px] font-medium text-[#8fa1c7]">
              Your content calendar for the next 7 days.
            </p>
          </div>
          <Link
            href="/dashboard/content-calendar"
            className="rounded-full bg-[#eef4ff] px-4 py-2 text-[12.5px] font-semibold text-[#2b5ce6] transition-all duration-300 hover:bg-[#e0ecff] hover:shadow-soft"
          >
            View Calendar
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {upcomingContent.map((c) => (
            <article
              key={c.title}
              className="card-interactive group cursor-pointer overflow-hidden rounded-[20px] bg-white ring-1 ring-[#eef4ff]"
            >
              <div className="p-3.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${platformTile[c.platform]?.bg}`}
                  >
                    {platformTile[c.platform]?.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-semibold text-[#101c3d]">
                      {c.platformLabel}
                    </p>
                    <p className="text-[10.5px] font-medium text-[#8fa1c7]">{c.date}</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-medium text-[#3d4c6d]">{c.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      c.status === "Scheduled"
                        ? "bg-[#ffedd5] text-[#b45309]"
                        : "bg-[#f2f6fd] text-[#5c6b8a]"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>
              <div className={`h-24 bg-gradient-to-br ${c.art}`} />
            </article>
          ))}

          {/* Add new */}
          <Link
            href="/dashboard/content-studio"
            className="group flex min-h-[172px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#c9dbfa] bg-[#fafdff] p-4 text-center transition-all duration-300 hover:border-[#2e6bff]/40 hover:bg-[#f2f7ff]"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2b5ce6] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2e6bff] group-hover:text-white group-hover:shadow-glow">
              <Plus className="size-5" />
            </span>
            <p className="mt-3 text-[13.5px] font-semibold text-[#101c3d]">Add new content</p>
            <p className="mt-0.5 text-[11.5px] font-medium text-[#8fa1c7]">Create something amazing</p>
          </Link>
        </div>
      </section>

      {/* AI insight banner */}
      <section className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[24px] bg-gradient-to-r from-[#2b5ce6] to-[#4a8dff] p-6 shadow-lift md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <span className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
            ✦
            <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-[#b6f500] ring-2 ring-[#3b76ee]" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-white">AI Insight of the day</p>
            <p className="mt-1 max-w-[520px] text-[13px] font-medium leading-relaxed text-white/85">
              Your audience engages 2.3× more with behind-the-scenes content. Consider scheduling
              two more studio posts this week — Thursday 10 AM performs best.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/content-studio"
          className="group flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-[#2b5ce6] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.98]"
        >
          Create post
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </section>
    </div>
  );
}
