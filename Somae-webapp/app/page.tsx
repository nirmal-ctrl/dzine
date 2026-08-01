import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Globe,
  Layers,
  LayoutDashboard,
  Plus,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Visual Workflows",
    description:
      "Compose powerful automations with a drag-and-drop editor. No code required — just describe what you want.",
    icon: Layers,
    large: true,
  },
  {
    title: "Bring Your Own Keys",
    description:
      "Use your own OpenAI, Anthropic, or Gemini API keys. Full control over providers, models, and spend.",
    icon: Zap,
  },
  {
    title: "AI-Powered Blocks",
    description:
      "Summarize, extract, rewrite, generate, and reason over any page content with pre-built AI blocks.",
    icon: Sparkles,
  },
  {
    title: "Private by Design",
    description:
      "Your data never touches our servers. Requests go straight from your browser to your chosen AI provider.",
    icon: Check,
  },
  {
    title: "Runs in Your Browser",
    description:
      "A native Chrome extension that works where you work. No context switching, no extra tabs, no copy-paste.",
    icon: Globe,
  },
];

const steps = [
  {
    step: "01",
    title: "Install the extension",
    description:
      "Add Huenxt to Chrome in one click and activate your lifetime license.",
  },
  {
    step: "02",
    title: "Connect your AI keys",
    description:
      "Paste your API keys — your keys stay local in your browser, never on our servers.",
  },
  {
    step: "03",
    title: "Automate anything",
    description:
      "Build workflows visually or let AI generate them for you, then run them on any page.",
  },
];

const testimonials = [
  {
    quote:
      "Huenxt replaced three different tools for me. I summarize research, extract data, and draft replies without ever leaving the tab I'm in.",
    name: "Sarah Chen",
    role: "Product Marketing Lead",
    initials: "SC",
    color: "bg-[#3984ff]",
  },
  {
    quote:
      "The fact that my API keys never leave my browser sold me instantly. It's the only AI tool our security team approved without a review.",
    name: "Marcus Webb",
    role: "Engineering Manager",
    initials: "MW",
    color: "bg-[#ff7442]",
  },
  {
    quote:
      "I built a competitor-monitoring workflow in 10 minutes. It now saves me around 6 hours every single week. Lifetime deal was a no-brainer.",
    name: "Priya Nair",
    role: "Founder",
    initials: "PN",
    color: "bg-[#0101db]",
  },
];

const faqs = [
  {
    question: "Do I need my own API keys?",
    answer:
      "Yes. Huenxt follows a bring-your-own-keys model. Connect OpenAI, Anthropic, or Gemini keys — they stay stored locally in your browser and are never sent to our servers.",
  },
  {
    question: "Is this really a one-time payment?",
    answer:
      "Absolutely. Pay once and get lifetime access, including every future update. No subscriptions, no seat licenses, no recurring fees — ever.",
  },
  {
    question: "How many devices can I use it on?",
    answer:
      "Every license includes 2 device activations. You can manage and deactivate devices yourself from the dashboard at any time.",
  },
  {
    question: "Does my browsing data leave my machine?",
    answer:
      "No. Page content is sent directly from your browser to the AI provider you configured. Huenxt never proxies, stores, or sees your data.",
  },
  {
    question: "Can I build workflows without coding?",
    answer:
      "Yes — the visual editor lets you compose blocks with drag and drop, and the AI generator can scaffold an entire workflow from a plain-English description.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-sans text-black">
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0865ff_0%,#0865ff_68%,#ffffff_100%)]">
        {/* Grid — fades out with the blue */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_92%)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.09)_1px,transparent_1px)] bg-[size:5.5rem_5.5rem]" />
        </div>

        {/* ── Nav ── */}
        <header className="relative z-30 mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 px-5 pt-6 sm:px-10 sm:pt-7">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="Huenxt"
              width={224}
              height={86}
              priority
              className="h-14 w-auto rounded-md"
            />
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <button className="flex items-center gap-1.5 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20">
              All pages <ChevronDown className="size-3.5" />
            </button>
            <Link
              href="#features"
              className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:flex sm:px-5 sm:py-3 sm:text-sm"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-black shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.04] sm:px-6 sm:py-3 sm:text-sm"
            >
              Get Huenxt Now
            </Link>
          </div>
        </header>

        {/* ── Hero body ── */}
        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pt-12 sm:px-10 sm:pt-16">
          {/* Massive headline */}
          <h1 className="relative z-0 font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-white">
            <span className="block text-left text-[clamp(3rem,11vw,10rem)]">
              Automate
            </span>
            <span className="block text-right text-[clamp(3rem,11vw,10rem)]">
              The Web
            </span>
          </h1>

          {/* ── Content row: copy • mockup • copy — all in flow, no overlap ── */}
          <div className="mt-10 grid grid-cols-1 items-start gap-12 pb-12 lg:mt-6 lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)_minmax(0,290px)] lg:gap-8">
            {/* Left column copy */}
            <div className="mx-auto max-w-[300px] text-center text-white lg:order-1 lg:mx-0 lg:pt-20 lg:text-left">
              <p className="text-[17px] font-medium leading-[1.6] text-white/90">
                AI-powered workflows to automate any web task, saving you
                time and effort on every page.
              </p>
              <div className="mt-7 flex justify-center -space-x-3 lg:justify-start">
                <span className="flex size-11 items-center justify-center rounded-full border-2 border-white/40 bg-[#3984ff] text-xs font-bold text-white">
                  SC
                </span>
                <span className="flex size-11 items-center justify-center rounded-full border-2 border-white/40 bg-[#ff7442] text-xs font-bold text-white">
                  MW
                </span>
                <span className="flex size-11 items-center justify-center rounded-full border-2 border-white/40 bg-[#0101db] text-xs font-bold text-white">
                  PN
                </span>
              </div>
              <p className="mt-4 text-sm font-bold">Trusted by</p>
              <p className="text-[13px] font-medium text-white/75">
                2,500+ users worldwide
              </p>
            </div>

            {/* Right column copy */}
            <div className="order-2 mx-auto max-w-[300px] text-center text-white lg:order-3 lg:mx-0 lg:justify-self-end lg:pt-40 lg:text-left">
              <p className="text-[17px] font-medium leading-[1.6] text-white/90">
                Discover automations that match the way you work. Get your
                repetitive tasks done fast.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/pricing"
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.04]"
                >
                  <Globe className="size-4" /> Chrome Web Store
                </Link>
                <Link
                  href="#pricing"
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.04]"
                >
                  <Zap className="size-4" /> Get Lifetime Access
                </Link>
              </div>
            </div>

            {/* ── Mockup ── */}
            <div className="relative order-3 mx-auto w-full max-w-[420px] lg:order-2">
              {/* Floating badges — anchored to the mockup edges */}
              <div className="absolute -left-10 top-14 z-30 hidden -rotate-[10deg] items-center justify-center rounded-full bg-[#0101db] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:flex">
                New!
              </div>
              <div className="absolute -left-14 bottom-24 z-30 hidden rotate-[4deg] rounded-t-[28px] rounded-bl-[28px] bg-white px-6 py-3.5 text-sm font-bold text-black shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:block">
                Smart AI Matching
              </div>
              <div className="absolute -right-12 top-1/3 z-30 hidden -rotate-[3deg] rounded-t-[28px] rounded-br-[28px] bg-white px-6 py-3.5 text-sm font-bold text-black shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:block">
                28 Best Matches
              </div>

              {/* Browser frame */}
              <div className="relative rounded-t-[28px] border border-b-0 border-black/10 bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)]">
                {/* Chrome bar */}
                <div className="flex h-11 items-center justify-between rounded-t-[28px] border-b border-gray-100 bg-[#f8f8f8] px-5">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="size-2.5 rounded-full bg-[#febc2e]" />
                    <span className="size-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex h-6 w-36 items-center justify-center rounded-md bg-white text-[10px] font-medium text-[#616161] shadow-sm sm:w-44">
                    <Search className="mr-1.5 size-3" /> Huenxt.ai
                  </div>
                  <div className="w-10" />
                </div>

                {/* Extension UI */}
                <div className="h-[400px] overflow-hidden bg-white p-5 text-black sm:p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-[15px] font-bold">Hello, John Wick</p>
                      <p className="text-xs font-medium text-[#616161]">
                        Good Morning
                      </p>
                    </div>
                    <span className="flex size-9 items-center justify-center rounded-full bg-[#f8f8f8] text-black ring-1 ring-black/5">
                      <Bell className="size-4" />
                    </span>
                  </div>

                  <p className="mb-3 text-sm font-bold">Run a Workflow</p>
                  <div className="mb-5 flex gap-2 overflow-hidden">
                    <span className="whitespace-nowrap rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#616161]">
                      UX Research
                    </span>
                    <span className="whitespace-nowrap rounded-full bg-black px-3.5 py-1.5 text-xs font-semibold text-white">
                      Summarize
                    </span>
                    <span className="whitespace-nowrap rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#616161]">
                      Extract
                    </span>
                  </div>

                  <div className="mb-2 flex items-end justify-between">
                    <p className="text-4xl font-extrabold tracking-tight">28</p>
                    <p className="text-xs font-semibold text-[#616161]">
                      Best Matching · View All
                    </p>
                  </div>

                  <div className="mt-3 space-y-3">
                    <div className="rounded-2xl bg-[#0865ff] p-4 text-white">
                      <p className="text-sm font-bold">Summarize Article</p>
                      <p className="mt-0.5 text-xs font-medium text-white/75">
                        Extract key points from any page
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#ff7442] p-4 text-white">
                      <p className="text-sm font-bold">Table to CSV</p>
                      <p className="mt-0.5 text-xs font-medium text-white/75">
                        Convert web tables to spreadsheets
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ LOGO STRIP ═══════════════════════ */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-7 px-5 py-12 sm:gap-8 sm:px-10 sm:py-14">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-[#616161] sm:text-sm">
            Powering workflows at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 text-lg font-bold tracking-tight text-black/25 sm:gap-x-14 sm:gap-y-6 sm:text-xl">
            <span>Google</span>
            <span>Notion</span>
            <span>Linear</span>
            <span>Figma</span>
            <span>Stripe</span>
            <span>Vercel</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURES ═══════════════════════ */}
      <section id="features" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-10">
          <div className="mx-auto mb-12 max-w-[560px] text-center sm:mb-16">
            <h2 className="text-[2.25rem] font-semibold leading-[1.2] tracking-[-0.03em] sm:text-[2.9rem] lg:text-[3.5rem]">
              Everything you need to automate
            </h2>
            <p className="mt-5 text-base font-medium leading-[1.7] text-[#616161] sm:text-lg">
              A focused toolkit for power users who want AI working for them
              on every page — without giving up privacy or control.
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={
                  feature.large
                    ? "group rounded-[32px] bg-[#0865ff] p-8 text-white sm:p-10 md:col-span-2 lg:col-span-1 lg:row-span-2"
                    : "group rounded-[32px] bg-[#f8f8f8] p-8 transition-colors hover:bg-[#0865ff] hover:text-white sm:p-10"
                }
              >
                <div
                  className={
                    feature.large
                      ? "mb-7 flex size-12 items-center justify-center rounded-2xl bg-white text-[#0865ff] sm:mb-8 sm:size-14"
                      : "mb-7 flex size-12 items-center justify-center rounded-2xl bg-white text-black shadow-sm transition-colors group-hover:text-[#0865ff] sm:mb-8 sm:size-14"
                  }
                >
                  <feature.icon className="size-5 sm:size-6" />
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
                  {feature.title}
                </h3>
                <p
                  className={
                    feature.large
                      ? "mt-3 font-medium leading-[1.7] text-white/80 sm:mt-4"
                      : "mt-3 font-medium leading-[1.7] text-[#616161] group-hover:text-white/80 sm:mt-4"
                  }
                >
                  {feature.description}
                </p>
                {feature.large && (
                  <div className="mt-8 space-y-3 sm:mt-10">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                      <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#0865ff]">
                        <Zap className="size-4" />
                      </span>
                      <div className="h-2.5 flex-1 rounded-full bg-white/25" />
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                      <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#ff7442]">
                        <Layers className="size-4" />
                      </span>
                      <div className="h-2.5 w-2/3 rounded-full bg-white/25" />
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                      <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#0101db]">
                        <Sparkles className="size-4" />
                      </span>
                      <div className="h-2.5 w-1/2 rounded-full bg-white/25" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section id="how-it-works" className="bg-[#f8f8f8] py-20 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-10">
          <div className="mx-auto mb-12 max-w-[560px] text-center sm:mb-16">
            <h2 className="text-[2.25rem] font-semibold leading-[1.2] tracking-[-0.03em] sm:text-[2.9rem] lg:text-[3.5rem]">
              Up and running in minutes
            </h2>
            <p className="mt-5 text-base font-medium leading-[1.7] text-[#616161] sm:text-lg">
              No accounts to manage, no data to migrate. Three steps and
              you&apos;re automating.
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            {steps.map((item) => (
              <div
                key={item.step}
                className="rounded-[32px] bg-white p-8 text-center sm:p-10"
              >
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#0865ff] text-base font-extrabold text-white shadow-[0_8px_20px_rgba(8,101,255,0.35)] sm:size-16 sm:text-lg">
                  {item.step}
                </div>
                <h3 className="mt-7 text-xl font-semibold tracking-[-0.01em] sm:mt-8 sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 font-medium leading-[1.7] text-[#616161] sm:mt-4">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-10">
          <div className="mx-auto mb-12 max-w-[560px] text-center sm:mb-16">
            <h2 className="text-[2.25rem] font-semibold leading-[1.2] tracking-[-0.03em] sm:text-[2.9rem] lg:text-[3.5rem]">
              Loved by power users
            </h2>
            <p className="mt-5 text-base font-medium leading-[1.7] text-[#616161] sm:text-lg">
              Professionals who live in the browser trust Huenxt to handle
              the busywork.
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col justify-between rounded-[24px] bg-[#f8f8f8] p-8 sm:p-10"
              >
                <blockquote className="text-base font-medium leading-[1.7] text-black sm:text-[17px]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4 sm:mt-10">
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.color}`}
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-[15px] font-bold">{t.name}</p>
                    <p className="text-sm font-medium text-[#616161]">
                      {t.role}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section id="pricing" className="bg-[#0865ff] py-20 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-10">
          <div className="mx-auto mb-12 max-w-[620px] text-center text-white sm:mb-16">
            <h2 className="text-[2.25rem] font-semibold leading-[1.2] tracking-[-0.03em] sm:text-[2.9rem] lg:text-[3.5rem]">
              One price. Yours forever.
            </h2>
            <p className="mt-5 text-base font-medium leading-[1.7] text-white/80 sm:text-lg">
              No subscriptions, no seat licenses, no surprises. A single
              payment unlocks everything — permanently.
            </p>
          </div>

          <div className="mx-auto max-w-[460px] rounded-[32px] bg-white p-7 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.3)] sm:p-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0101db] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
              <Sparkles className="size-3.5" /> Lifetime deal
            </span>
            <h3 className="mt-6 text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
              Huenxt Pro
            </h3>
            <p className="mt-2 font-medium text-[#616161]">
              Everything, forever. For individuals and power users.
            </p>

            <div className="mt-8 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-5xl font-extrabold tracking-[-0.03em] sm:text-6xl">
                ₹4,999
              </span>
              <span className="pb-1.5 font-semibold text-[#616161] sm:pb-2">
                one-time
              </span>
            </div>

            <ul className="mt-8 space-y-4 border-t border-black/5 pt-8">
              {[
                "Lifetime access — pay once",
                "All premium features unlocked",
                "Every future update included",
                "2 device activations",
                "Priority email support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3.5 text-[15px] font-medium sm:text-base">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0865ff] text-white">
                    <Check className="size-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/pricing"
              className="mt-10 flex h-14 items-center justify-center gap-2 rounded-full bg-black text-base font-bold text-white transition-transform hover:scale-[1.02]"
            >
              Get Lifetime Access <ArrowRight className="size-4" />
            </Link>
            <p className="mt-4 text-center text-xs font-medium text-[#616161]">
              Secure payment · Instant license delivery · 2 devices
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FAQ ═══════════════════════ */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[820px] px-5 sm:px-10">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-[2.25rem] font-semibold leading-[1.2] tracking-[-0.03em] sm:text-[2.9rem] lg:text-[3.5rem]">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-[24px] bg-[#f8f8f8] px-5 py-5 open:bg-[#0865ff] open:text-white sm:px-8 sm:py-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold sm:text-lg [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-sm transition-transform group-open:rotate-45">
                    <Plus className="size-4" />
                  </span>
                </summary>
                <p className="mt-4 max-w-[95%] text-[15px] font-medium leading-[1.7] text-[#616161] group-open:text-white/85 sm:max-w-[90%] sm:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FINAL CTA ═══════════════════════ */}
      <section className="bg-white px-5 pb-20 sm:px-10 sm:pb-24">
        <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[32px] bg-gradient-to-b from-[#0865ff] to-[#0101db] px-5 py-20 text-center text-white sm:px-10 sm:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </div>
          <div className="relative">
            <h2 className="mx-auto max-w-[800px] text-[2.25rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[3rem] lg:text-[4rem]">
              Stop repeating yourself on the web
            </h2>
            <p className="mx-auto mt-6 max-w-[520px] text-base font-medium leading-[1.7] text-white/80 sm:text-lg">
              Join the professionals who let Huenxt handle the busywork —
              securely, privately, and right inside Chrome.
            </p>
            <Link
              href="/pricing"
              className="mt-10 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-bold text-black shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-transform hover:scale-[1.04] sm:px-10 sm:text-base"
            >
              Get Huenxt for ₹4,999 <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-10 sm:py-16">
          <div className="flex flex-col justify-between gap-10 sm:gap-12 md:flex-row">
            <div className="max-w-[280px]">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Huenxt"
                  width={224}
                  height={86}
                  className="h-14 w-auto rounded-md"
                />
              </Link>
              <p className="mt-5 font-medium leading-[1.7] text-[#616161]">
                Premium AI automation for Chrome. Your keys, your data, your
                workflows — forever.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-14">
              <div className="flex flex-col gap-4">
                <span className="text-sm font-bold uppercase tracking-wide">
                  Product
                </span>
                <Link href="#features" className="font-medium text-[#616161] transition-colors hover:text-black">
                  Features
                </Link>
                <Link href="#pricing" className="font-medium text-[#616161] transition-colors hover:text-black">
                  Pricing
                </Link>
                <Link href="/dashboard" className="font-medium text-[#616161] transition-colors hover:text-black">
                  Dashboard
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-sm font-bold uppercase tracking-wide">
                  Resources
                </span>
                <Link href="#how-it-works" className="font-medium text-[#616161] transition-colors hover:text-black">
                  How it works
                </Link>
                <Link href="/pricing" className="font-medium text-[#616161] transition-colors hover:text-black">
                  Get a license
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-sm font-bold uppercase tracking-wide">
                  Legal
                </span>
                <Link href="#" className="font-medium text-[#616161] transition-colors hover:text-black">
                  Terms of Service
                </Link>
                <Link href="#" className="font-medium text-[#616161] transition-colors hover:text-black">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-8 text-center text-sm font-medium text-[#616161] sm:mt-14 sm:flex-row sm:text-left">
            <p>© {new Date().getFullYear()} Huenxt.ai. All rights reserved.</p>
            <p>Built as a Chrome Extension</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
