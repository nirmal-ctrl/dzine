"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Upload,
  Pencil,
  CircleCheck,
  LoaderCircle,
  CircleDashed,
  Clock,
  Sparkles,
} from "lucide-react";
import { SomaeLogo, AeMark } from "@/components/somae/logo";
import { cn } from "@/lib/utils";

const steps = ["Welcome", "Brand Discovery", "AI Analysis", "Your Brand"];

const analysisItems = [
  { label: "Reading your website", at: 0 },
  { label: "Understanding your audience", at: 1 },
  { label: "Analyzing your content", at: 2 },
  { label: "Identifying opportunities", at: 3 },
  { label: "Building your brand strategy", at: 4 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [url, setUrl] = useState("");
  const [analysisTick, setAnalysisTick] = useState(0);

  // Drive the fake analysis sequence
  useEffect(() => {
    if (step !== 2) return;
    setAnalysisTick(0);
    const timers = analysisItems.map((item, i) =>
      setTimeout(() => setAnalysisTick(i + 1), 1100 * (i + 1))
    );
    const done = setTimeout(() => setStep(3), 1100 * analysisItems.length + 900);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [step]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f5f9ff]">
      {/* soft background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#dce9ff] to-transparent" />
      <AeMark className="ae-watermark-blue pointer-events-none absolute -left-20 bottom-0 text-[420px] leading-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <Link href="/" className="text-[#101c3d]">
          <SomaeLogo className="text-[22px]" />
        </Link>
        <span className="text-[12.5px] font-medium text-[#8fa1c7]">
          Step {step + 1} of {steps.length}
        </span>
      </header>

      {/* Progress */}
      <div className="relative z-10 mx-auto flex w-full max-w-[560px] items-center gap-2 px-6">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                i <= step ? "bg-[#2e6bff]" : "bg-[#dce9ff]"
              )}
            />
            <p
              className={cn(
                "mt-2 text-center text-[10.5px] font-semibold transition-colors duration-300 max-sm:hidden",
                i <= step ? "text-[#2b5ce6]" : "text-[#b3c2dd]"
              )}
            >
              {s}
            </p>
          </div>
        ))}
      </div>

      {/* Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[860px]">
          {/* ── Step 0: Welcome ── */}
          {step === 0 && (
            <div className="animate-rise-in mx-auto max-w-[560px] text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#2b5ce6] to-[#4a8dff] text-white shadow-glow">
                <Sparkles className="size-7" />
              </span>
              <h1 className="mt-8 text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#101c3d]">
                Welcome to Somae
              </h1>
              <p className="mx-auto mt-4 max-w-[440px] text-[15.5px] font-medium leading-relaxed text-[#5c6b8a]">
                In the next minute, Somae will read your brand and build a strategy that usually
                takes weeks. Let's begin.
              </p>
              <button
                onClick={() => setStep(1)}
                className="group mx-auto mt-9 flex items-center gap-2.5 rounded-full bg-[#2e6bff] px-8 py-4 text-[15px] font-semibold text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-glow active:scale-[0.98]"
              >
                Get started
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          )}

          {/* ── Step 1: Brand Discovery ── */}
          {step === 1 && (
            <div className="animate-rise-in mx-auto max-w-[560px]">
              <div className="rounded-[28px] bg-white p-10 shadow-lift ring-1 ring-[#e9f0fb]">
                <h1 className="text-center text-[30px] font-semibold leading-tight tracking-[-0.025em] text-[#101c3d]">
                  Let's understand your brand
                </h1>
                <p className="mx-auto mt-3 max-w-[400px] text-center text-[14px] font-medium leading-relaxed text-[#5c6b8a]">
                  Share your website and Somae AI will analyze your brand automatically.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep(2);
                  }}
                  className="mt-8"
                >
                  <label className="mb-2 block text-[12.5px] font-semibold text-[#3d4c6d]">
                    Enter your website URL
                  </label>
                  <div className="flex items-center gap-2 rounded-full border border-[#e3ebf7] bg-[#f7faff] py-2 pl-6 pr-2 transition-all duration-300 focus-within:border-[#2e6bff]/40 focus-within:bg-white focus-within:shadow-glow">
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://yourbrand.com"
                      className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#101c3d] outline-none placeholder:text-[#8fa1c7]"
                    />
                    <button
                      type="submit"
                      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#2e6bff] text-white shadow-soft transition-all duration-300 hover:brightness-110 hover:shadow-glow active:scale-95"
                      aria-label="Analyze website"
                    >
                      <ArrowRight className="size-5" />
                    </button>
                  </div>
                </form>

                <p className="mt-8 text-center text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8fa1c7]">
                  Or try these options
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="group flex flex-col items-center gap-2.5 rounded-[20px] border border-[#e9f0fb] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2e6bff]/25 hover:shadow-soft"
                  >
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2b5ce6] transition-transform duration-300 group-hover:scale-105">
                      <Upload className="size-5" />
                    </span>
                    <span className="text-[13px] font-semibold text-[#3d4c6d]">Upload Brand Kit</span>
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="group flex flex-col items-center gap-2.5 rounded-[20px] border border-[#e9f0fb] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2e6bff]/25 hover:shadow-soft"
                  >
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2b5ce6] transition-transform duration-300 group-hover:scale-105">
                      <Pencil className="size-5" />
                    </span>
                    <span className="text-[13px] font-semibold text-[#3d4c6d]">Start from Scratch</span>
                  </button>
                </div>

                <p className="mt-7 flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#8fa1c7]">
                  <Clock className="size-3.5" />
                  Takes less than 60 seconds
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: AI Analysis ── */}
          {step === 2 && (
            <div className="animate-rise-in grid items-center gap-6 md:grid-cols-2">
              <div className="rounded-[28px] bg-white p-9 shadow-lift ring-1 ring-[#e9f0fb]">
                <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-[#101c3d]">
                  Analyzing your brand with Somae AI
                </h1>
                <p className="mt-2 text-[13px] font-medium text-[#8fa1c7]">
                  This may take a few moments. Don't worry, we'll notify you when it's ready!
                </p>

                <div className="mt-7 space-y-2.5">
                  {analysisItems.map((item, i) => {
                    const state =
                      analysisTick > i + 1 || analysisTick === analysisItems.length
                        ? analysisTick > i
                          ? "done"
                          : "active"
                        : analysisTick === i
                          ? "active"
                          : analysisTick > i
                            ? "done"
                            : "pending";
                    const done = analysisTick > i;
                    const active = analysisTick === i;
                    return (
                      <div
                        key={item.label}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-500",
                          done
                            ? "border-[#e9f0fb] bg-white"
                            : active
                              ? "border-[#2e6bff]/30 bg-[#f5f9ff] shadow-glow"
                              : "border-[#eef4ff] bg-[#fafdff] opacity-60"
                        )}
                      >
                        {done ? (
                          <CircleCheck className="size-4.5 size-5 text-[#2e6bff]" />
                        ) : active ? (
                          <LoaderCircle className="size-5 animate-spin text-[#2e6bff]" />
                        ) : (
                          <CircleDashed className="size-5 text-[#c9dbfa]" />
                        )}
                        <span className="flex-1 text-[13.5px] font-semibold text-[#101c3d]">
                          {item.label}
                        </span>
                        <span
                          className={cn(
                            "text-[10.5px] font-semibold uppercase tracking-wide",
                            done ? "text-[#0d9d63]" : active ? "text-[#2b5ce6]" : "text-[#b3c2dd]"
                          )}
                        >
                          {done ? "Completed" : active ? "In progress" : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="mt-7 w-full rounded-full border border-[#e3ebf7] py-3 text-[13px] font-semibold text-[#5c6b8a] transition-all duration-300 hover:bg-[#f7faff] hover:text-[#101c3d]"
                >
                  Cancel
                </button>
              </div>

              {/* æ panel */}
              <div className="bg-somae-hero relative hidden min-h-[480px] overflow-hidden rounded-[28px] shadow-lift md:block">
                <div className="bg-blueprint-grid absolute inset-0" />
                <AeMark className="absolute inset-0 m-auto h-fit text-center text-[240px] text-white" />
              </div>
            </div>
          )}

          {/* ── Step 3: Your Brand ── */}
          {step === 3 && (
            <div className="animate-rise-in mx-auto max-w-[560px]">
              <div className="rounded-[28px] bg-white p-10 text-center shadow-lift ring-1 ring-[#e9f0fb]">
                <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#dcf5e9] text-[#047857]">
                  <CircleCheck className="size-8" />
                </span>
                <h1 className="mt-7 text-[30px] font-semibold tracking-[-0.025em] text-[#101c3d]">
                  Your brand is understood
                </h1>
                <p className="mx-auto mt-3 max-w-[420px] text-[14px] font-medium leading-relaxed text-[#5c6b8a]">
                  Somae found your voice, audience and visual style{url ? ` from ${url}` : ""}.
                  Your Brand DNA is ready to guide everything you create.
                </p>

                <div className="mt-7 grid grid-cols-3 gap-3 text-left">
                  {[
                    { k: "Tone", v: "Warm & precise" },
                    { k: "Audience", v: "Founders" },
                    { k: "Pillars", v: "5 identified" },
                  ].map((s) => (
                    <div key={s.k} className="rounded-2xl bg-[#f7faff] p-3.5 ring-1 ring-[#eef4ff]">
                      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#8fa1c7]">
                        {s.k}
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-[#101c3d]">{s.v}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="group mt-8 flex w-full items-center justify-center gap-2.5 rounded-full bg-[#2e6bff] px-8 py-4 text-[15px] font-semibold text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-glow active:scale-[0.98]"
                >
                  Go to your dashboard
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
