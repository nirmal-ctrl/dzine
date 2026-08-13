import {
  Target,
  Eye,
  Users,
  MessageSquare,
  Layers,
  Store,
  Palette,
  Type,
  Sparkles,
  Pencil,
} from "lucide-react";
import { DashboardHeader } from "@/components/somae/dashboard-header";
import { brandDna, brandColors } from "@/lib/mock-data";

const dnaIcons: Record<string, React.ReactNode> = {
  mission: <Target className="size-4" />,
  vision: <Eye className="size-4" />,
  audience: <Users className="size-4" />,
  tone: <MessageSquare className="size-4" />,
  pillars: <Layers className="size-4" />,
  competitors: <Store className="size-4" />,
};

export default function BrandIntelligencePage() {
  return (
    <div className="mx-auto max-w-[980px] px-1 pb-10 pt-2">
      <DashboardHeader
        title="Brand Intelligence"
        subtitle="Your brand's complete DNA, understood by AI."
      />

      {/* Hero summary */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#2b5ce6] to-[#4a8dff] p-7 shadow-lift">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-16 select-none font-serif italic text-[220px] leading-none text-white/10"
          style={{ fontFamily: "Georgia, serif" }}
        >
          æ
        </span>
        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
            <Sparkles className="size-4.5" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-white">Brand Overview</p>
            <p className="text-[12px] font-medium text-white/75">Last analyzed 2 days ago · Confidence 96%</p>
          </div>
          <span className="ml-auto hidden items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-[12px] font-semibold text-white ring-1 ring-white/25 sm:flex">
            <span className="size-2 rounded-full bg-[#b6f500]" />
            Brand DNA active
          </span>
        </div>
        <p className="relative mt-4 max-w-[560px] text-[13.5px] font-medium leading-relaxed text-white/85">
          Somae has read your website, socials and content history to build a living model of your
          brand. Every suggestion, post and image is guided by this DNA.
        </p>
      </section>

      {/* DNA cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {brandDna.map((d) => (
          <article
            key={d.key}
            className="card-interactive group rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-[#e9f0fb]"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2b5ce6]">
                {dnaIcons[d.key]}
              </span>
              <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] text-[#101c3d]">
                {d.title}
              </h3>
              <button
                className="ml-auto flex size-7 items-center justify-center rounded-full text-[#c9dbfa] opacity-0 transition-all duration-300 hover:bg-[#f2f6fd] hover:text-[#2b5ce6] group-hover:opacity-100"
                aria-label={`Edit ${d.title}`}
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
            <p className="mt-3.5 text-[13.5px] font-medium leading-relaxed text-[#3d4c6d]">
              {d.body}
            </p>
          </article>
        ))}
      </div>

      {/* Colors + Typography */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="card-interactive rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-[#e9f0fb]">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2b5ce6]">
              <Palette className="size-4" />
            </span>
            <h3 className="text-[15.5px] font-semibold text-[#101c3d]">Brand Colors</h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {brandColors.map((c) => (
              <div key={c.hex} className="group cursor-pointer text-center">
                <div
                  className="size-14 rounded-2xl shadow-soft ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105"
                  style={{ background: c.hex }}
                />
                <p className="mt-2 text-[10.5px] font-semibold text-[#3d4c6d]">{c.name}</p>
                <p className="text-[9.5px] font-medium uppercase text-[#8fa1c7]">{c.hex}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card-interactive rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-[#e9f0fb]">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2b5ce6]">
              <Type className="size-4" />
            </span>
            <h3 className="text-[15.5px] font-semibold text-[#101c3d]">Typography</h3>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#101c3d]">
                Open Sans SemiBold
              </p>
              <p className="mt-1.5 text-[11px] font-medium text-[#8fa1c7]">Headings · 600</p>
            </div>
            <div className="h-px bg-[#eef4ff]" />
            <div>
              <p className="text-[16px] font-medium text-[#3d4c6d]">Open Sans Medium — body copy that stays calm and readable.</p>
              <p className="mt-1.5 text-[11px] font-medium text-[#8fa1c7]">Body · 500</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
