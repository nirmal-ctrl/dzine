"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Sparkles, ArrowLeft, ShieldCheck, Lock, LoaderCircle } from "lucide-react";
import { SomaeLogo, AeMark } from "@/components/somae/logo";

export default function SignInPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSignIn = () => {
    setIsLoggingIn(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen w-full select-none bg-white font-sans text-[#101c3d]">
      {/* ── Left: brand panel ── */}
      <div className="bg-somae-hero relative hidden w-6/12 flex-col justify-between overflow-hidden p-12 text-white lg:flex xl:w-7/12">
        <div className="bg-blueprint-grid pointer-events-none absolute inset-0" />
        <div className="animate-aurora pointer-events-none absolute -bottom-32 -left-32 size-[450px] rounded-full bg-white/10 blur-[120px]" />
        <div className="animate-aurora-slow pointer-events-none absolute -top-20 right-0 size-[400px] rounded-full bg-[#7fb3ff]/30 blur-[100px]" />
        <AeMark className="ae-watermark pointer-events-none absolute -right-16 bottom-6 text-[380px] leading-none" />

        <div className="relative z-10">
          <Link href="/">
            <SomaeLogo className="text-[26px]" />
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-[520px] pr-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
            <Sparkles className="size-3.5 text-white" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/95">
              AI-Powered Brand OS
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.12] tracking-[-0.03em] xl:text-[44px]">
            Your Brand.
            <br />
            Understood by AI.
          </h1>
          <p className="mt-4 max-w-[440px] text-[15.5px] font-medium leading-relaxed text-white/85">
            Sign in to your creative workspace — content, calendar, analytics and brand
            intelligence in one calm place.
          </p>

          <div className="mt-10 rounded-[24px] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
            <blockquote className="text-[14px] font-medium leading-relaxed text-white/90">
              &ldquo;Somae is the first tool that actually sounds like us. Our content finally
              feels handcrafted — at ten times the speed.&rdquo;
            </blockquote>
            <div className="mt-4 flex items-center gap-2.5 text-[12px] font-semibold text-white/80">
              <span className="size-2 rounded-full bg-[#b6f500]" />
              Loved by 2,500+ brands worldwide
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[12px] font-medium text-white/75">
          <span>Crafted with care · Somae</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4" /> Secure by design
          </span>
        </div>
      </div>

      {/* ── Right: auth panel ── */}
      <div className="relative flex w-full flex-col justify-between bg-[#f7faff] p-6 sm:p-10 lg:w-6/12 xl:w-5/12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-[#e3ebf7] bg-white px-4 py-2 text-[12px] font-semibold text-[#5c6b8a] shadow-soft transition-all duration-300 hover:border-[#2e6bff]/30 hover:text-[#2b5ce6]"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Home
          </Link>
          <Link href="/" className="lg:hidden">
            <SomaeLogo className="text-[18px] text-[#101c3d]" />
          </Link>
        </div>

        <div className="mx-auto my-auto w-full max-w-[390px] py-12">
          <div className="flex flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#2b5ce6] to-[#4a8dff] text-white shadow-glow">
              <Sparkles className="size-6" />
            </span>
            <h2 className="mt-6 text-[26px] font-semibold tracking-[-0.02em] text-[#101c3d]">
              Welcome to Somae
            </h2>
            <p className="mt-2.5 text-[13.5px] font-medium leading-relaxed text-[#5c6b8a]">
              Sign in to open your brand workspace and pick up right where you left off.
            </p>
          </div>

          <div className="mt-9">
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="group flex h-14 w-full items-center justify-center gap-3.5 rounded-full border border-[#e3ebf7] bg-white px-6 text-[14.5px] font-semibold text-[#101c3d] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2e6bff]/30 hover:shadow-lift active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
            >
              {isLoggingIn ? (
                <LoaderCircle className="size-5 animate-spin text-[#2e6bff]" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-105"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
              )}
              <span>{isLoggingIn ? "Redirecting to Google…" : "Continue with Google"}</span>
            </button>
          </div>

          <div className="mt-8 flex items-center gap-3 text-[#b3c2dd]">
            <div className="h-px flex-1 bg-[#e3ebf7]" />
            <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em]">
              <Lock className="size-3" /> Secure OAuth
            </span>
            <div className="h-px flex-1 bg-[#e3ebf7]" />
          </div>

          <p className="mt-6 text-center text-[12.5px] font-medium text-[#5c6b8a]">
            New to Somae?{" "}
            <Link href="/onboarding" className="font-semibold text-[#2b5ce6] hover:underline">
              Start your free trial
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] font-medium leading-relaxed text-[#8fa1c7]">
          By continuing, you agree to Somae's{" "}
          <span className="cursor-pointer underline hover:text-[#5c6b8a]">Terms of Service</span>{" "}
          and{" "}
          <span className="cursor-pointer underline hover:text-[#5c6b8a]">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
