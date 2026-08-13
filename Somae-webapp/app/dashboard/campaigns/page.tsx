import { Plus, Megaphone, TrendingUp, Layers } from "lucide-react";
import { DashboardHeader } from "@/components/somae/dashboard-header";
import { campaigns } from "@/lib/mock-data";

const statusStyle: Record<string, string> = {
  Active: "bg-[#dcf5e9] text-[#047857]",
  Scheduled: "bg-[#e0ecff] text-[#2b5ce6]",
  Draft: "bg-[#f2f6fd] text-[#5c6b8a]",
  Completed: "bg-[#efe6ff] text-[#7c3aed]",
};

export default function CampaignsPage() {
  return (
    <div className="mx-auto max-w-[980px] px-1 pb-10 pt-2">
      <DashboardHeader
        title="Campaigns"
        subtitle="Plan, launch and track multi-channel campaigns."
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {["All", "Active", "Scheduled", "Draft"].map((f, i) => (
            <button
              key={f}
              className={`rounded-full px-4 py-2 text-[12.5px] font-semibold transition-all duration-300 ${
                i === 0
                  ? "bg-[#2e6bff] text-white shadow-soft"
                  : "bg-white text-[#5c6b8a] ring-1 ring-[#e9f0fb] hover:text-[#2b5ce6]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 rounded-full bg-[#2e6bff] px-5 py-2.5 text-[13px] font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-glow active:scale-[0.98]">
          <Plus className="size-4" />
          New Campaign
        </button>
      </div>

      {/* Table card */}
      <section className="overflow-hidden rounded-[24px] bg-white shadow-soft ring-1 ring-[#e9f0fb]">
        <div className="grid grid-cols-[1.6fr_1fr_0.7fr_0.8fr_0.8fr] gap-4 border-b border-[#eef4ff] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8fa1c7] max-md:hidden">
          <span>Campaign</span>
          <span>Channels</span>
          <span>Posts</span>
          <span>Reach</span>
          <span>Engagement</span>
        </div>
        {campaigns.map((c) => (
          <div
            key={c.name}
            className="grid grid-cols-[1.6fr_1fr_0.7fr_0.8fr_0.8fr] items-center gap-4 px-7 py-5 transition-colors duration-300 hover:bg-[#f7faff] max-md:grid-cols-2"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2b5ce6]">
                <Megaphone className="size-4" />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-[#101c3d]">{c.name}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${statusStyle[c.status]}`}
                >
                  {c.status}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.channels.map((ch) => (
                <span
                  key={ch}
                  className="rounded-full bg-[#f2f6fd] px-2.5 py-1 text-[10.5px] font-semibold text-[#5c6b8a]"
                >
                  {ch}
                </span>
              ))}
            </div>
            <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[#3d4c6d]">
              <Layers className="size-3.5 text-[#8fa1c7]" />
              {c.posts}
            </p>
            <p className="text-[13.5px] font-semibold text-[#3d4c6d]">{c.reach}</p>
            <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[#3d4c6d]">
              {c.engagement !== "—" && <TrendingUp className="size-3.5 text-[#0d9d63]" />}
              {c.engagement}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
