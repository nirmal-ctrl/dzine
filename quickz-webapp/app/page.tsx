import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-2xl tracking-tighter">Quickz</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
            Dashboard
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black text-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Automate Your Workflow with Quickz
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  The ultimate Chrome extension for premium AI-driven automation. Bring your own keys, get lifetime access.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-black shadow transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
                  href="/pricing"
                >
                  Get Started
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md border border-gray-700 bg-transparent px-8 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
                  href="#features"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-black">Features</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg bg-white shadow-sm">
                <h3 className="text-xl font-bold text-black">Premium Workflow</h3>
                <p className="text-sm text-gray-600 text-center">
                  Streamlined automation designed for maximum productivity.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg bg-white shadow-sm">
                <h3 className="text-xl font-bold text-black">BYO API Keys</h3>
                <p className="text-sm text-gray-600 text-center">
                  Full control over your LLM providers and costs.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg bg-white shadow-sm">
                <h3 className="text-xl font-bold text-black">Lifetime License</h3>
                <p className="text-sm text-gray-600 text-center">
                  Pay once, use forever. No monthly subscriptions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2026 Quickz.ai. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
