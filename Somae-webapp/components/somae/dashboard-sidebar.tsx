"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Brain,
  SquarePen,
  Megaphone,
  CalendarDays,
  Image as ImageIcon,
  FolderOpen,
  ChartColumn,
  Globe,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { SomaeLogo } from "./logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/brand-intelligence", label: "Brand Intelligence", icon: Brain },
  { href: "/dashboard/content-studio", label: "Content Studio", icon: SquarePen },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/content-calendar", label: "Content Calendar", icon: CalendarDays },
  { href: "/dashboard/ai-images", label: "AI Images", icon: ImageIcon },
  { href: "/dashboard/brand-assets", label: "Brand Assets", icon: FolderOpen },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartColumn },
  { href: "/dashboard/website", label: "Website", icon: Globe },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col rounded-[24px] bg-white p-4 shadow-soft ring-1 ring-[#e9f0fb]">
      {/* Logo */}
      <Link href="/" className="px-3 pb-5 pt-2 text-[#101c3d]">
        <SomaeLogo className="text-[22px]" />
      </Link>

      {/* Nav */}
      <nav className="pretty-scroll flex-1 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-300",
                active
                  ? "bg-[#eef4ff] text-[#2b5ce6] shadow-[inset_0_0_0_1px_rgb(46_107_255/8%)]"
                  : "text-[#5c6b8a] hover:bg-[#f7faff] hover:text-[#101c3d]"
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-xl transition-all duration-300",
                  active
                    ? "bg-[#2e6bff] text-white shadow-glow"
                    : "bg-[#f2f6fd] text-[#8fa1c7] group-hover:bg-white group-hover:text-[#2b5ce6]"
                )}
              >
                <item.icon className="size-4" strokeWidth={1.9} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Plan card */}
      <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#f2f7ff] to-[#e6efff] p-4 ring-1 ring-[#e3ebf7]">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#101c3d]">Pro Plan</p>
          <Link
            href="/pricing"
            className="flex size-6 items-center justify-center rounded-full bg-white text-[#2b5ce6] shadow-soft transition-transform duration-300 hover:scale-110"
            aria-label="Upgrade plan"
          >
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
        <p className="mt-0.5 text-[11px] font-medium text-[#5c6b8a]">Resets in 23 days</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
          <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-[#2b5ce6] to-[#7fb3ff]" />
        </div>
        <p className="mt-2 text-[11px] font-medium text-[#5c6b8a]">7 / 10 Projects</p>
      </div>
    </div>
  );
}
