import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { SomaeLogo } from "./logo";

const navItems = [
  { label: "Product", href: "/#product", chevron: true },
  { label: "Use Cases", href: "/#use-cases", chevron: true },
  { label: "Resources", href: "/#resources", chevron: true },
  { label: "Pricing", href: "/pricing", chevron: false },
];

/** Floating glass navigation for marketing pages. */
export function MarketingNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-6 pt-5">
      <div className="pointer-events-auto mx-auto flex max-w-[1200px] items-center justify-between">
        {/* Logo chip */}
        <Link
          href="/"
          className="glass flex items-center rounded-full px-5 py-2.5 text-white shadow-soft ring-1 ring-white/25 transition-all duration-300 hover:shadow-lift"
        >
          <SomaeLogo className="text-[20px]" />
        </Link>

        {/* Center nav pill */}
        <nav className="glass hidden items-center gap-1 rounded-full p-1.5 shadow-soft ring-1 ring-white/25 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-[13.5px] font-medium text-white/90 transition-all duration-300 hover:bg-white/15 hover:text-white"
            >
              {item.label}
              {item.chevron && <ChevronDown className="size-3.5 opacity-70" />}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/auth/signin"
            className="glass hidden items-center gap-1.5 rounded-full px-5 py-2.5 text-[13.5px] font-medium text-white shadow-soft ring-1 ring-white/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:flex"
          >
            Login
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/onboarding"
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-[#101c3d] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lift active:scale-[0.98]"
          >
            Start Free Trial
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
