import { Bell, CalendarDays } from "lucide-react";
import { user } from "@/lib/mock-data";

/** Shared workspace header — title/greeting + date pill, notifications, avatar. */
export function DashboardHeader({
  title,
  subtitle,
}: {
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#101c3d]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[13.5px] font-medium text-[#5c6b8a]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-[12.5px] font-medium text-[#3d4c6d] shadow-soft ring-1 ring-[#e9f0fb] md:flex">
          May 20 – May 26
          <CalendarDays className="size-4 text-[#8fa1c7]" />
        </span>
        <button
          className="relative flex size-10 items-center justify-center rounded-full bg-white text-[#5c6b8a] shadow-soft ring-1 ring-[#e9f0fb] transition-all duration-300 hover:-translate-y-0.5 hover:text-[#2b5ce6] hover:shadow-lift"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" strokeWidth={1.9} />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#b6f500] ring-2 ring-white" />
        </button>
        <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2b5ce6] to-[#7fb3ff] text-[13px] font-semibold text-white shadow-soft ring-2 ring-white">
          {user.initials}
        </span>
      </div>
    </div>
  );
}
