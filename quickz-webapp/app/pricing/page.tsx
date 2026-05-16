import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-2xl tracking-tighter">Quickz</span>
        </Link>
      </header>
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h1>
            <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl">
              One-time payment for lifetime access. No subscriptions.
            </p>
          </div>
          <div className="mt-12 flex justify-center">
            <div className="flex flex-col p-8 bg-white border rounded-2xl shadow-xl w-full max-w-sm">
              <h3 className="text-2xl font-bold text-center">Quickz Pro Lifetime</h3>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-5xl font-extrabold tracking-tight">₹4,999</span>
                <span className="ml-1 text-xl font-semibold text-gray-500">one-time</span>
              </div>
              <ul className="mt-8 space-y-4 text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✔</span> Lifetime access
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✔</span> All premium features
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✔</span> Future updates
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✔</span> 2 device activations
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✔</span> Email support
                </li>
              </ul>
              <Link
                href="/buy"
                className="mt-8 block w-full py-3 px-6 text-center text-white bg-black rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
