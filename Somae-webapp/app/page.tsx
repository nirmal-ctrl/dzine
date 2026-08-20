import Link from "next/link";
import {
  ArrowRight,
  Play,
  Sparkles,
  Brain,
  SquarePen,
  CalendarDays,
  ChartColumn,
  Image as ImageIcon,
} from "lucide-react";
import { MarketingNav } from "@/components/somae/marketing-nav";
import { DashboardPreview } from "@/components/somae/dashboard-preview";
import { AeMark, SomaeLogo } from "@/components/somae/logo";
import { trustedBrands } from "@/lib/mock-data";

const features = [
  {
    icon: Brain,
    title: "Brand Intelligence",
    body: "Somae reads your website, audience and voice — then builds a living brand DNA that guides every word and pixel.",
  },
  {
    icon: SquarePen,
    title: "Content Studio",
    body: "From Instagram posts to long-form blogs, generate on-brand content in seconds with a prompt that feels like magic.",
  },
  {
    icon: CalendarDays,
    title: "Content Calendar",
    body: "Plan, schedule and publish across every platform from one calm, beautiful timeline your whole team will love.",
  },
  {
    icon: ImageIcon,
    title: "AI Images",
    body: "On-brand visuals generated in your exact palette and style — no stock photos, no off-brand compromises.",
  },
  {
    icon: ChartColumn,
    title: "Analytics",
    body: "Clean, honest analytics with AI insights that tell you what to do next — not just what happened.",
  },
  {
    icon: Sparkles,
    title: "Always-on Assistant",
    body: "A quiet copilot that surfaces opportunities, drafts ideas and keeps your brand consistent everywhere.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#eaf3ff]">
      {/* ── Hero canvas ─────────────────────────────── */}
      <div className="bg-somae-hero absolute inset-x-0 top-0 h-[1080px]" />
      <div className="bg-blueprint-grid absolute inset-x-0 top-0 h-[1080px]" />

      {/* floating light orbs */}
      <div className="animate-aurora pointer-events-none absolute left-[8%] top-[30%] size-[420px] rounded-full bg-white/10 blur-[110px]" />
      <div className="animate-aurora-slow pointer-events-none absolute right-[4%] top-[12%] size-[380px] rounded-full bg-[#7fb3ff]/25 blur-[100px]" />
      <div className="pointer-events-none absolute left-[45%] top-[58%] size-[300px] rounded-full bg-white/15 blur-[90px]" />

      {/* faded æ watermark */}
      <AeMark className="ae-watermark pointer-events-none absolute -right-24 top-[8%] hidden text-[560px] leading-none md:block" />

      <MarketingNav />

      {/* ── Hero copy ───────────────────────────────── */}
      <section className="relative mx-auto max-w-[1200px] px-6 pt-40 text-center md:pt-44">
        <div className="animate-rise-in mx-auto flex w-fit items-center gap-2 rounded-full bg-white/12 px-5 py-2 ring-1 ring-white/25 backdrop-blur-md">
          <Sparkles className="size-3.5 text-white" />
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white">
            AI-Powered Brand Assistant
          </span>
        </div>

        <h1
          className="animate-rise-in mt-8 text-[52px] font-semibold leading-[1.04] tracking-[-0.035em] text-white md:text-[72px]"
          style={{ animationDelay: "0.08s" }}
        >
          Your Brand.
          <br />
          Understood by AI.
        </h1>

        <p
          className="animate-rise-in mx-auto mt-6 max-w-[560px] text-[17px] font-medium leading-relaxed text-white/85"
          style={{ animationDelay: "0.16s" }}
        >
          Somae reads your brand, creates content that connects,
          and helps you grow across every platform.
        </p>

        <div
          className="animate-rise-in mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: "0.24s" }}
        >
          <Link
            href="/onboarding"
            className="group flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-[#101c3d] shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:brightness-[1.03] hover:shadow-hero active:scale-[0.98]"
          >
            Start Creating Free
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <button className="group flex items-center gap-2.5 rounded-full bg-white/10 px-8 py-4 text-[15px] font-semibold text-white ring-1 ring-white/35 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/18 active:scale-[0.98]">
            Watch Demo
            <Play className="size-4 fill-current" />
          </button>
        </div>

        {/* social proof pill */}
        <div
          className="animate-rise-in mt-16 hidden w-fit items-center gap-3 rounded-2xl bg-white/12 px-4 py-3 ring-1 ring-white/25 backdrop-blur-md md:flex"
          style={{ animationDelay: "0.32s" }}
        >
          <div className="flex -space-x-2.5">
            {["from-[#ffd9c0] to-[#e5989b]", "from-[#bcd7ff] to-[#4a8dff]", "from-[#dcf5e9] to-[#7fb3ff]"].map(
              (g, i) => (
                <span
                  key={i}
                  className={`size-8 rounded-full bg-gradient-to-br ${g} ring-2 ring-white/70`}
                />
              )
            )}
          </div>
          <p className="text-left text-[12px] font-semibold leading-tight text-white">
            Loved by 2,500+
            <br />
            <span className="font-medium text-white/80">brands worldwide</span>
          </p>
        </div>
      </section>

      {/* ── Product preview ─────────────────────────── */}
      <section id="product" className="relative mx-auto max-w-[1080px] px-6 pb-10 pt-14">
        <div className="animate-rise-in" style={{ animationDelay: "0.15s" }}>
          <DashboardPreview />
        </div>
      </section>

      {/* ── Trusted by ──────────────────────────────── */}
      <section className="relative mx-auto max-w-[1080px] px-6 pb-24 pt-8 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5c6b8a]">
          Trusted by amazing brands
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {trustedBrands.map((b) => (
            <div key={b.name} className="select-none text-center opacity-70 transition-opacity duration-300 hover:opacity-100">
              <p className="font-serif text-[19px] tracking-[0.08em] text-[#101c3d]" style={{ fontFamily: "Georgia, serif" }}>
                {b.name}
              </p>
              {b.sub && (
                <p className="text-[8.5px] font-semibold uppercase tracking-[0.3em] text-[#8fa1c7]">
                  {b.sub}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section id="use-cases" className="relative mx-auto max-w-[1080px] px-6 pb-28">
        <div className="text-center">
          <h2 className="text-[36px] font-semibold tracking-[-0.025em] text-[#101c3d] md:text-[44px]">
            One workspace for your whole brand
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[15.5px] font-medium leading-relaxed text-[#5c6b8a]">
            Everything a modern brand team needs — designed with care, powered quietly by AI.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-interactive rounded-[24px] bg-white p-7 shadow-soft ring-1 ring-[#e9f0fb]"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2b5ce6]">
                <f.icon className="size-5" strokeWidth={1.9} />
              </span>
              <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.01em] text-[#101c3d]">
                {f.title}
              </h3>
              <p className="mt-2.5 text-[13.5px] font-medium leading-relaxed text-[#5c6b8a]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA band ────────────────────────────────── */}
      <section className="relative mx-auto max-w-[1080px] px-6 pb-28">
        <div className="bg-somae-hero relative overflow-hidden rounded-[32px] px-8 py-16 text-center shadow-hero md:py-20">
          <div className="bg-blueprint-grid absolute inset-0" />
          <AeMark className="ae-watermark pointer-events-none absolute -right-10 -top-24 text-[320px]" />
          <h2 className="relative text-[34px] font-semibold tracking-[-0.025em] text-white md:text-[44px]">
            Let AI understand your brand
          </h2>
          <p className="relative mx-auto mt-4 max-w-[440px] text-[15px] font-medium leading-relaxed text-white/85">
            Share your website and watch Somae build your brand strategy in under a minute.
          </p>
          <Link
            href="/onboarding"
            className="group relative mt-9 inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-[#101c3d] shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hero active:scale-[0.98]"
          >
            Start Free Trial
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="relative border-t border-[#dce9ff] bg-white/60">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
          <SomaeLogo className="text-[20px] text-[#101c3d]" />
          <div className="flex items-center gap-7 text-[13px] font-medium text-[#5c6b8a]">
            <Link href="/#product" className="transition-colors hover:text-[#2b5ce6]">Product</Link>
            <Link href="/pricing" className="transition-colors hover:text-[#2b5ce6]">Pricing</Link>
            <Link href="/auth/signin" className="transition-colors hover:text-[#2b5ce6]">Login</Link>
            <Link href="/privacy" className="transition-colors hover:text-[#2b5ce6]">Privacy Policy</Link>

          </div>
          <p className="text-[12px] font-medium text-[#8fa1c7]">
            © 2026 Somae. Your brand, understood.
          </p>
        </div>
      </footer>
    </div>
  );
}
