"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  Zap,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Loader2,
} from "lucide-react";

export default function SignInPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSignIn = () => {
    setIsLoggingIn(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen w-full select-none bg-white font-sans text-zinc-900">
      {/* ═══════════════════════ LEFT COLUMN: BRAND BANNER (DESKTOP) ═══════════════════════ */}
      <div className="relative hidden w-6/12 flex-col justify-between overflow-hidden bg-[#0865ff] p-12 text-white lg:flex xl:w-7/12">
        {/* Background decorative geometric grid and glowing orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_30%_50%,black_40%,transparent_100%)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.09)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]" />
        </div>
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-[450px] rounded-full bg-indigo-900/35 blur-[120px]" />
        <div className="pointer-events-none absolute -top-20 right-0 size-[400px] rounded-full bg-blue-400/25 blur-[100px]" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#0865ff] shadow-md">
              <Zap className="size-5 fill-current" />
            </span>
            <span className="text-2xl font-black tracking-tight text-white">
              Quickz
            </span>
          </Link>
        </div>

        {/* Center Headline & Value Prop */}
        <div className="relative z-10 my-auto max-w-[520px] pr-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
            <Sparkles className="size-3.5 text-blue-200" />
            <span className="text-xs font-bold tracking-wide text-white/95 uppercase">
              Browser AI Superpower
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-extrabold leading-[1.15] tracking-[-0.03em] sm:text-4xl xl:text-5xl">
            Automate anything without leaving your tab.
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-white/85 sm:text-lg">
            Connect your own OpenAI, Claude, or Gemini API keys. Experience 100% private, zero-latency workflows inside Chrome.
          </p>

          <div className="mt-10 rounded-2xl border border-white/15 bg-black/15 p-6 backdrop-blur-md">
            <blockquote className="text-sm font-semibold leading-relaxed text-white/90 italic">
              &ldquo;Quickz eliminated hours of tedious copy-pasting for our whole research team. Since API keys stay local in our browser, security compliance took zero time.&rdquo;
            </blockquote>
            <div className="mt-4 flex items-center gap-3 text-xs font-bold text-blue-200">
              <div className="size-2 rounded-full bg-emerald-400" />
              <span>Verified Power User Review · 5.0 ★★★★★</span>
            </div>
          </div>
        </div>

        {/* Footer Trust Indicator */}
        <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-white/75">
          <span>Trusted by modern professionals</span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            <ShieldCheck className="size-4" /> Zero Server Token Routing
          </span>
        </div>
      </div>

      {/* ═══════════════════════ RIGHT COLUMN: AUTH PANEL ═══════════════════════ */}
      <div className="relative flex w-full flex-col justify-between p-6 sm:p-10 lg:w-6/12 xl:w-5/12">
        {/* Mobile / Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 shadow-xs transition-colors hover:border-zinc-300 hover:text-zinc-900"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>

          {/* Shown only on mobile when brand sidebar is hidden */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#0865ff] text-white shadow-xs">
              <Zap className="size-3.5 fill-current" />
            </span>
            <span className="text-lg font-black tracking-tighter text-black">
              Quickz
            </span>
          </Link>
        </div>

        {/* Center Card Container */}
        <div className="mx-auto my-auto w-full max-w-[390px] py-12 sm:py-16">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-3xl bg-blue-50 text-[#0865ff] shadow-[0_8px_20px_-6px_rgba(8,101,255,0.25)] border border-blue-100/80">
              <ShieldCheck className="size-7" />
            </div>

            <h2 className="mt-6 text-2xl font-black tracking-[-0.02em] text-zinc-900 sm:text-3xl">
              Welcome to Quickz
            </h2>
            <p className="mt-2.5 text-sm font-medium text-zinc-500 leading-relaxed">
              Sign in to manage your lifetime license key, view device activations, and explore workflows.
            </p>
          </div>

          <div className="mt-9 space-y-4">
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="group relative flex h-14 w-full items-center justify-center gap-3.5 rounded-full border border-zinc-200/90 bg-white px-6 text-sm font-bold text-zinc-800 shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] active:scale-[0.98] disabled:pointer-events-none disabled:bg-zinc-100 sm:text-base"
            >
              {isLoggingIn ? (
                <Loader2 className="size-5 animate-spin text-[#0865ff]" />
              ) : (
                <img
                  className="size-5 shrink-0 transition-transform group-hover:scale-105"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
              )}
              <span>{isLoggingIn ? "Redirecting to Google..." : "Continue with Google"}</span>
            </button>
          </div>

          {/* Secure divider */}
          <div className="mt-8 flex items-center gap-3 text-zinc-400">
            <div className="h-px flex-1 bg-zinc-200/80" />
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <Lock className="size-3" /> Secure 256-bit OAuth
            </span>
            <div className="h-px flex-1 bg-zinc-200/80" />
          </div>

          <p className="mt-6 text-center text-xs font-medium leading-relaxed text-zinc-500">
            Don&apos;t have a lifetime license yet?{" "}
            <Link href="/pricing" className="font-bold text-[#0865ff] hover:underline">
              View pricing deals
            </Link>
          </p>
        </div>

        {/* Footer legal */}
        <p className="text-center text-[11px] font-medium text-zinc-400 leading-relaxed">
          By authenticating, you agree to Quickz&apos;s{" "}
          <span className="underline cursor-pointer hover:text-zinc-600">Terms of Service</span> and{" "}
          <span className="underline cursor-pointer hover:text-zinc-600">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

