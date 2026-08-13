import { Globe, Link2, RefreshCw, CircleCheck, ArrowUpRight } from "lucide-react";
import { DashboardHeader } from "@/components/somae/dashboard-header";

const pages = [
  { path: "/", title: "Home", status: "Synced", visits: "12.4K" },
  { path: "/about", title: "About", status: "Synced", visits: "3.1K" },
  { path: "/blog", title: "Blog", status: "Synced", visits: "8.7K" },
  { path: "/pricing", title: "Pricing", status: "Review", visits: "2.2K" },
];

export default function WebsitePage() {
  return (
    <div className="mx-auto max-w-[980px] px-1 pb-10 pt-2">
      <DashboardHeader
        title="Website"
        subtitle="Somae keeps your site in sync with your brand."
      />

      {/* Connected site */}
      <section className="rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-[#e9f0fb]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2b5ce6]">
            <Globe className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-[#101c3d]">
              yourbrand.com
              <span className="flex items-center gap-1.5 rounded-full bg-[#dcf5e9] px-2.5 py-0.5 text-[10.5px] font-semibold text-[#047857]">
                <span className="size-1.5 rounded-full bg-[#22c55e]" />
                Connected
              </span>
            </p>
            <p className="mt-0.5 text-[12px] font-medium text-[#8fa1c7]">
              Last synced 14 minutes ago · 24 pages indexed
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-2 rounded-full bg-[#f2f6fd] px-4 py-2.5 text-[12.5px] font-semibold text-[#5c6b8a] transition-all duration-300 hover:bg-[#e9f0fb] hover:text-[#2b5ce6]">
              <RefreshCw className="size-3.5" />
              Re-sync
            </button>
            <button className="flex items-center gap-2 rounded-full bg-[#2e6bff] px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-glow active:scale-[0.98]">
              <ArrowUpRight className="size-3.5" />
              Open site
            </button>
          </div>
        </div>
      </section>

      {/* Pages table */}
      <section className="mt-5 overflow-hidden rounded-[24px] bg-white shadow-soft ring-1 ring-[#e9f0fb]">
        <div className="border-b border-[#eef4ff] px-7 py-4">
          <h2 className="text-[15px] font-semibold text-[#101c3d]">Pages</h2>
          <p className="text-[12px] font-medium text-[#8fa1c7]">
            Brand consistency monitored across your site.
          </p>
        </div>
        {pages.map((p) => (
          <div
            key={p.path}
            className="flex items-center gap-4 px-7 py-4 transition-colors duration-300 hover:bg-[#f7faff]"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#f2f6fd] text-[#2b5ce6]">
              <Link2 className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-[#101c3d]">{p.title}</p>
              <p className="text-[11.5px] font-medium text-[#8fa1c7]">{p.path}</p>
            </div>
            <span className="hidden text-[12.5px] font-semibold text-[#5c6b8a] sm:block">
              {p.visits} visits
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
                p.status === "Synced"
                  ? "bg-[#dcf5e9] text-[#047857]"
                  : "bg-[#ffedd5] text-[#b45309]"
              }`}
            >
              {p.status === "Synced" && <CircleCheck className="size-3" />}
              {p.status}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
