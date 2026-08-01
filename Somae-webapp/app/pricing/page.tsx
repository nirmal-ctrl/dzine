"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  KeyRound,
  MonitorSmartphone,
  ArrowLeft,
} from "lucide-react";

const pillars = [
  {
    title: "Zero Markup on Tokens",
    description: "Bring your own API keys for OpenAI, Claude, or Gemini with zero server markup.",
    icon: KeyRound,
  },
  {
    title: "Bank-Grade Privacy",
    description: "Your browsing context and workflows run locally; your data never touches our servers.",
    icon: ShieldCheck,
  },
  {
    title: "Multi-Device Freedom",
    description: "2 concurrent device activations included per license, easily managed in your dashboard.",
    icon: MonitorSmartphone,
  },
];

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: () => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      const options = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Huenxt",
        description: "Huenxt Pro Lifetime License",
        order_id: data.id,
        handler: function () {
          router.push("/dashboard?payment=success");
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#0865ff",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen max-h-screen w-screen flex-col justify-between overflow-hidden bg-[#0865ff] font-sans text-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Subtle grid pattern background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]" />
      </div>

      {/* Ambient glowing orbs */}
      <div className="pointer-events-none absolute -left-40 top-0 size-[450px] rounded-full bg-blue-300/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-[450px] rounded-full bg-indigo-900/35 blur-[120px]" />

      {/* ── Header / Nav ── */}
      <header className="relative z-30 mx-auto flex h-16 w-full shrink-0 max-w-[1240px] items-center justify-between px-6 sm:px-10">
        <Link href="/" className="group flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-white text-[#0865ff] shadow-sm">
            <Zap className="size-4 fill-current" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Huenxt
          </span>
        </Link>

        <Link
          href="/dashboard"
          className="rounded-full bg-white px-5 py-2 text-xs font-bold text-[#0865ff] shadow-sm transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Go to Dashboard
        </Link>
      </header>

      {/* ── Main Single-Screen Content ── */}
      <main className="relative z-20 mx-auto flex min-h-0 w-full flex-1 max-w-[1240px] items-center justify-center px-6 sm:px-10">
        <div className="grid w-full grid-cols-1 items-center gap-8 md:grid-cols-12 lg:gap-12">
          {/* Left Column: Value Proposition */}
          <div className="flex flex-col justify-center space-y-5 md:col-span-7">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0101db] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                <Sparkles className="size-3.5" /> No Monthly Subscriptions
              </span>
              
              <h1 className="mt-3.5 text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
                One simple price.<br />Yours forever.
              </h1>
              <p className="mt-3 text-sm font-medium leading-relaxed text-white/85 sm:text-base max-w-[520px]">
                Pay once and unlock the ultimate browser AI workflow engine permanently. No seat fees, no recurring billing, no surprises.
              </p>
            </div>

            {/* Frosted Glass Pillar Boxes */}
            <div className="space-y-3 pt-1">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-sm transition-colors hover:bg-white/15"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#0865ff] shadow-sm">
                    <pillar.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-white">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-medium text-white/80 line-clamp-1 sm:line-clamp-2">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Price Card */}
          <div className="md:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-[440px] rounded-[32px] bg-white p-7 text-black shadow-[0_24px_65px_-10px_rgba(0,0,0,0.45)] border border-white/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0865ff] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                    <Sparkles className="size-3" /> Pro Deal
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wide border border-emerald-100">
                    Save 80% today
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-zinc-900">
                  Huenxt Pro Lifetime
                </h2>
                <p className="mt-1 text-xs font-medium text-zinc-500">
                  Everything you need for infinite browser automations.
                </p>

                <div className="mt-5 flex items-baseline gap-2 pb-5 border-b border-zinc-100">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black">
                    ₹4,999
                  </span>
                  <span className="text-sm font-bold text-zinc-500 uppercase tracking-wide">
                    one-time
                  </span>
                </div>

                {/* Compact Feature List */}
                <ul className="my-5 space-y-3">
                  {[
                    "Lifetime license — pay once, use forever",
                    "All visual AI automation blocks unlocked",
                    "Bring your own OpenAI, Claude & Gemini keys",
                    "2 concurrent device activations included",
                    "All future updates & priority support",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-zinc-700">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0865ff] text-white shadow-xs">
                        <Check className="size-3" />
                      </span>
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className="group relative flex h-13 w-full items-center justify-center gap-2 rounded-full bg-black py-3.5 text-sm sm:text-base font-bold text-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.4)] transition-all duration-200 hover:scale-[1.02] hover:bg-zinc-800 active:scale-[0.98]"
              >
                <span>{loading ? "Opening Razorpay..." : "Get Lifetime Access"}</span>
                {!loading && <ArrowRight className="size-4 text-white transition-transform group-hover:translate-x-1" />}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* ── Minimal Footer ── */}
      <footer className="relative z-20 flex h-10 shrink-0 items-center justify-center gap-6 px-4 text-[11px] font-semibold tracking-wide text-white/75 sm:h-12">
        <span>© 2026 Huenxt</span>
        <span>·</span>
        <span className="flex items-center gap-1 text-emerald-300">
          <ShieldCheck className="size-3.5" /> 256-bit Secure Razorpay Checkout
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">Instant License Delivery</span>
      </footer>
    </div>
  );
}
