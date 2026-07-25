import Link from "next/link";
import {
  ArrowRight,
  Check,
  Globe,
  Infinity as InfinityIcon,
  KeyRound,
  MousePointerClick,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Workflow,
    title: "Visual Workflows",
    description:
      "Compose powerful automations with a drag-and-drop editor. No code required — just describe what you want.",
  },
  {
    icon: KeyRound,
    title: "Bring Your Own Keys",
    description:
      "Use your own OpenAI, Anthropic, or Gemini API keys. Full control over providers, models, and spend.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Blocks",
    description:
      "Summarize, extract, rewrite, generate, and reason over any page content with pre-built AI blocks.",
  },
  {
    icon: Globe,
    title: "Runs in Your Browser",
    description:
      "A native Chrome extension that works where you work. No context switching, no extra tabs, no copy-paste.",
  },
  {
    icon: ShieldCheck,
    title: "Private by Design",
    description:
      "Your data never touches our servers. Requests go straight from your browser to your chosen AI provider.",
  },
  {
    icon: InfinityIcon,
    title: "Lifetime License",
    description:
      "Pay once, use forever. Every future update included. No subscriptions, no recurring fees, ever.",
  },
];

const steps = [
  {
    step: "01",
    title: "Install the extension",
    description:
      "Add Quickz to Chrome in one click and activate your lifetime license.",
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

const pricingFeatures = [
  "Lifetime access — pay once",
  "All premium features unlocked",
  "Every future update included",
  "2 device activations",
  "Priority email support",
];

const stats = [
  { value: "100%", label: "Local & private — keys never leave your browser" },
  { value: "3+", label: "AI providers supported out of the box" },
  { value: "∞", label: "Lifetime updates with a single purchase" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ─────────────────────────── Header ─────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/55">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="relative flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/25 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30">
              <Zap className="size-4" />
            </span>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-lg font-semibold tracking-tight">
              Quickz
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            <Link
              href="#features"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Pricing
            </Link>
          </nav>

          <div className="ml-4 flex items-center gap-1.5 md:ml-6">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex"
              )}
            >
              Sign in
            </Link>
            <Link
              href="/buy"
              className={cn(
                buttonVariants({ size: "sm" }),
                "shadow-md shadow-primary/20 transition-shadow hover:shadow-lg hover:shadow-primary/25"
              )}
            >
              Get Quickz
              <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─────────────────────────── Hero ─────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Layered aurora background */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black_60%,transparent_100%)] opacity-50" />
            <div className="animate-aurora absolute -top-24 left-1/4 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
            <div className="animate-aurora-slow absolute -top-16 right-1/4 h-[380px] w-[480px] translate-x-1/2 rounded-full bg-chart-2/20 blur-3xl" />
            <div className="absolute left-1/2 top-1/3 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6 sm:pt-32 lg:pt-40">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <Badge
                variant="secondary"
                className="mb-7 gap-1.5 border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-primary shadow-sm backdrop-blur"
              >
                <Sparkles className="size-3.5" />
                AI automation, right inside Chrome
              </Badge>

              <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Automate any workflow{" "}
                <span className="relative inline-block bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
                  in your browser
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
                Quickz is a premium Chrome extension that puts AI-driven
                automation one click away. Bring your own API keys, build
                visual workflows, and own it for life.
              </p>

              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
                <Link
                  href="/buy"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                  )}
                >
                  Get lifetime access
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#how-it-works"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 px-8 text-base backdrop-blur"
                  )}
                >
                  See how it works
                </Link>
              </div>

              <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10">
                    <Check className="size-3 text-primary" />
                  </span>
                  One-time payment
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10">
                    <Check className="size-3 text-primary" />
                  </span>
                  Your keys, your data
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10">
                    <Check className="size-3 text-primary" />
                  </span>
                  Free updates forever
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────── Stats strip ─────────────────────── */}
        <section className="border-y border-border/60 bg-muted/40">
          <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-border/60 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 px-6 py-8 text-center"
              >
                <span className="text-3xl font-bold tracking-tight text-primary">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────────────── Features ───────────────────────── */}
        <section id="features" className="scroll-mt-20 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4">
                Features
              </Badge>
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                Everything you need to automate the web
              </h2>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                A focused toolkit designed for power users who want AI working
                for them on every page — without giving up privacy or control.
              </p>
            </div>

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 hover:ring-primary/30"
                >
                  {/* Hover glow accent */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <CardHeader>
                    <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20 transition-all duration-300 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25 group-hover:ring-primary/40">
                      <feature.icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="leading-6">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────────── How it works ─────────────────────── */}
        <section
          id="how-it-works"
          className="scroll-mt-20 border-y border-border/60 bg-muted/40 py-24 sm:py-32"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4">
                How it works
              </Badge>
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                Up and running in minutes
              </h2>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                No accounts to manage, no data to migrate. Three steps and
                you&apos;re automating.
              </p>
            </div>

            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {steps.map((item, i) => (
                <div
                  key={item.step}
                  className="relative flex flex-col items-center text-center md:items-start md:text-left"
                >
                  <div className="flex w-full items-center gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 font-mono text-sm font-semibold text-primary">
                      {item.step}
                    </span>
                    {i < steps.length - 1 && (
                      <div className="hidden h-px flex-1 bg-border md:block" />
                    )}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 max-w-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────── Pricing ────────────────────────── */}
        <section id="pricing" className="scroll-mt-20 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4">
                Pricing
              </Badge>
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                One price. Yours forever.
              </h2>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                No subscriptions, no seat licenses, no surprises. A single
                payment unlocks everything — permanently.
              </p>
            </div>

            <div className="relative mx-auto mt-16 max-w-md">
              {/* Gradient border + glow wrapper */}
              <div
                aria-hidden
                className="absolute -inset-6 rounded-[2rem] bg-primary/20 blur-2xl"
              />
              <div className="relative rounded-[1.35rem] bg-gradient-to-br from-primary via-chart-2 to-primary p-[1.5px] shadow-2xl shadow-primary/20">
                <Card className="relative overflow-hidden rounded-[1.25rem] ring-0">
                  {/* subtle top sheen */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent"
                  />
                  <div className="absolute right-4 top-4 z-10">
                    <Badge className="shadow-md shadow-primary/25">
                      <Sparkles className="size-3" />
                      Lifetime deal
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Quickz Pro</CardTitle>
                    <CardDescription>
                      Everything, forever. For individuals and power users.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6">
                    <div className="flex items-baseline gap-2">
                      <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight">
                        ₹4,999
                      </span>
                      <span className="text-muted-foreground">one-time</span>
                    </div>

                    <Separator />

                    <ul className="flex flex-col gap-3">
                      {pricingFeatures.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-sm"
                        >
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary ring-1 ring-primary/20">
                            <Check className="size-3" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/buy"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "h-12 w-full text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                      )}
                    >
                      Buy Quickz Pro
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                    <p className="text-center text-xs text-muted-foreground">
                      Secure payment · Instant license delivery · 2 devices
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────── Final CTA ───────────────────────── */}
        <section className="relative overflow-hidden border-t border-border/60">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="animate-aurora absolute left-1/3 top-1/2 h-[380px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div className="animate-aurora-slow absolute right-1/4 top-1/3 h-[320px] w-[480px] translate-x-1/2 rounded-full bg-chart-2/15 blur-3xl" />
          </div>
          <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32">
            <div className="mx-auto flex max-w-2xl flex-col items-center">
              <span className="animate-float-soft mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-xl shadow-primary/30 ring-1 ring-primary/30">
                <MousePointerClick className="size-7" />
              </span>
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                Stop repeating yourself on the web
              </h2>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Join the professionals who let Quickz handle the busywork —
                securely, privately, and right inside Chrome.
              </p>
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
                <Link
                  href="/buy"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 px-8 text-base"
                  )}
                >
                  Get Quickz for ₹4,999
                  <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "h-12 px-8 text-base"
                  )}
                >
                  Full pricing details
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─────────────────────────── Footer ─────────────────────────── */}
      <footer className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="size-4" />
              </span>
              <span className="text-lg font-semibold tracking-tight">
                Quickz
              </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Premium AI automation for Chrome. Your keys, your data, your
              workflows — forever.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">Product</span>
              <Link
                href="#features"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">Resources</span>
              <Link
                href="#how-it-works"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                How it works
              </Link>
              <Link
                href="/buy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Get a license
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">Legal</span>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        <Separator />

        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Quickz.ai. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Puzzle className="size-3.5" />
            Built as a Chrome Extension
          </p>
        </div>
      </footer>
    </div>
  );
}
