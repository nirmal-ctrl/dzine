"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";

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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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
          name: session?.user?.name,
          email: session?.user?.email,
        },
        theme: {
          color: "#000000",
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-lg border">
        <h1 className="text-3xl font-bold text-center mb-6">Complete Your Purchase</h1>
        <div className="space-y-4 mb-8">
          <div className="flex justify-between border-b pb-2">
            <span>Product</span>
            <span className="font-semibold">Quickz Pro Lifetime</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>License</span>
            <span className="font-semibold">Lifetime Access (2 Devices)</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-2">
            <span>Total</span>
            <span>₹4,999</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-8 text-center">
          Secure payment processed via Razorpay. Supported: UPI, Cards, Net Banking, Wallets.
        </p>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 bg-black text-white rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
