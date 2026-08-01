"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  Lock,
  ArrowLeft,
  UserCheck,
} from "lucide-react";

export default function BuyPage() {
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
        name: "Quickz",
        description: "Quickz Pro Lifetime License",
        order_id: data.id,
        handler: function (response: any) {
          // This is the frontend callback, but we rely on webhooks for final verification
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

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Lifetime access — no recurring subscription fees",
    "All premium browser AI automation blocks",
    "Bring your own OpenAI, Anthropic, or Gemini keys",
    "2 device activations included per license",
    "Priority support & instant license key delivery",
  ];

  return (
    <div className="relative min-h-screen bg-[#0865ff] py-12 px-4 sm:px-6 md:py-20 flex items-center justify-center overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Decorative background glow elements */}
      <div className="pointer-events-none absolute -left-40 -top-40 size-[500px] rounded-full bg-blue-400/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 size-[500px] rounded-full bg-indigo-900/30 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-[920px]">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between px-2 text-white">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
          <span className="text-xl font-black tracking-tighter">Quickz</span>
        </div>

        {/* Main Card */}
        <div className="grid overflow-hidden rounded-[36px] bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] md:grid-cols-12 border border-white/20">
          {/* Left / Info Section */}
          <div className="bg-[#f8f8f8] p-8 sm:p-10 md:col-span-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-black/5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0101db] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                <Sparkles className="size-3.5" /> Lifetime Deal
              </span>

              <h1 className="mt-6 text-2xl font-bold tracking-[-0.02em] text-black sm:text-3xl">
                One price. Yours forever.
              </h1>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[#616161] sm:text-base">
                Unlock the ultimate browser AI workflow builder. No seat licenses, no monthly renewals—just pure productivity.
              </p>

              {/* Features breakdown */}
              <ul className="mt-8 space-y-3.5">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm sm:text-[15px] font-medium text-zinc-800">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0865ff] text-white shadow-[0_2px_8px_rgba(8,101,255,0.25)]">
                      <Check className="size-3" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 pt-6 border-t border-black/5">
              <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500">
                <ShieldCheck className="size-5 text-emerald-600 shrink-0" />
                <span>256-bit bank-grade encryption · Instant delivery</span>
              </div>
            </div>
          </div>

          {/* Right / Checkout Action Section */}
          <div className="p-8 sm:p-10 md:col-span-5 flex flex-col justify-between bg-white">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0865ff]">
                  Order Summary
                </span>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-zinc-900">
                  Quickz Pro
                </h3>
                <p className="text-xs font-medium text-zinc-500">
                  2 devices · Lifetime updates
                </p>
              </div>

              <div className="rounded-[24px] bg-[#f8f8f8] p-5 border border-black/5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-[#616161]">Total amount:</span>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold tracking-tight text-black">₹4,999</span>
                    <span className="block text-[11px] font-bold text-emerald-600 uppercase tracking-wide">One-time payment</span>
                  </div>
                </div>
              </div>

              {session?.user && (
                <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-3.5 flex items-center gap-3 text-xs text-blue-950">
                  <UserCheck className="size-4 text-[#0865ff] shrink-0" />
                  <div className="overflow-hidden">
                    <span className="block font-bold text-[#0865ff]">Licensing account:</span>
                    <span className="font-medium truncate block text-zinc-700">{session.user.email}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="group relative flex h-14 w-full items-center justify-center gap-2 rounded-full bg-black text-base font-bold text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] transition-all duration-200 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] disabled:bg-zinc-400 disabled:pointer-events-none"
              >
                <Lock className="size-4 text-zinc-400" />
                <span>{loading ? "Initializing..." : "Proceed to Payment"}</span>
                {!loading && <ArrowRight className="size-4 text-white transition-transform group-hover:translate-x-1" />}
              </button>

              <p className="text-[11px] font-medium text-center text-zinc-500 leading-relaxed">
                By purchasing, you agree to our Terms of Service. Supported: UPI, Cards, Net Banking & Wallets via Razorpay.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

