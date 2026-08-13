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
  Bell,
  Camera,
  Newspaper,
  Mail,
  Plus,
  Sparkles,
  SendHorizontal,
  TrendingUp,
  Minus,
} from "lucide-react";
import { SomaeLogo } from "./logo";
import { Sparkline } from "./sparkline";
import { kpis, upcomingContent, user } from "@/lib/mock-data";

const sideIcons = [LayoutGrid, Brain, SquarePen, Megaphone, CalendarDays, ImageIcon, FolderOpen, ChartColumn, Globe, Settings];

const platformTile: Record<string, { bg: string; icon: React.ReactNode }> = {
  instagram: { bg: "bg-[#ffe4ef] text-[#e1306c]", icon: <Camera className="size-3.5" /> },
  linkedin: { bg: "bg-[#e0ecff] text-[#0a66c2]", icon: <Newspaper className="size-3.5" /> },
  email: { bg: "bg-[#dcf5e9] text-[#047857]", icon: <Mail className="size-3.5" /> },
};

/**
 * Static product mock used on the landing hero —
 * a miniature of the real dashboard, scaled down.
 */
export function DashboardPreview() {
  return (
    <div className="relative">
      {/* Frame */}
      <div className="shadow-hero relative overflow-hidden rounded-[28px] bg-[#f5f9ff] p-2.5 ring-1 ring-white/60">
        <div className="flex overflow-hidden rounded-[20px] bg-[#f7faff]">
          {/* Mini sidebar */}
          <div className="hidden w-[168px] shrink-0 flex-col bg-white p-3 sm:flex">
            <SomaeLogo className="px-1 pb-3 pt-1 text-[15px] text-[#101c3d]" />
            <div className="space-y-1">
              {sideIcons.map((Icon, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 rounded-xl px-2.5 py-2 ${
                    i === 0 ? "bg-[#eef4ff]" : ""
                  }`}
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-lg ${
                      i === 0 ? "bg-[#2e6bff] text-white" : "bg-[#f2f6fd] text-[#8fa1c7]"
                    }`}
                  >
                    <Icon className="size-3" />
                  </span>
                  <span
                    className={`h-1.5 rounded-full ${i === 0 ? "bg-[#2b5ce6]/30" : "bg-[#e3ebf7]"}`}
                    style={{ width: 44 + ((i * 13) % 26) }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-auto rounded-xl bg-gradient-to-br from-[#f2f7ff] to-[#e6efff] p-2.5 ring-1 ring-[#e3ebf7]">
              <div className="h-1.5 w-10 rounded-full bg-[#c9dbfa]" />
              <div className="mt-2 h-1 w-full rounded-full bg-white">
                <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-[#2b5ce6] to-[#7fb3ff]" />
              </div>
            </div>
          </div>

          {/* Mini main */}
          <div className="min-w-0 flex-1 p-4">
            {/* header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#101c3d]">
                  Good morning, {user.name} 👋
                </p>
                <p className="text-[10.5px] font-medium text-[#8fa1c7]">
                  Here's what's happening with your brand today.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-medium text-[#5c6b8a] shadow-soft ring-1 ring-[#e9f0fb] md:flex">
                  May 20 – May 26 <CalendarDays className="size-3 text-[#8fa1c7]" />
                </span>
                <span className="flex size-7 items-center justify-center rounded-full bg-white text-[#8fa1c7] shadow-soft ring-1 ring-[#e9f0fb]">
                  <Bell className="size-3.5" />
                </span>
                <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[#2b5ce6] to-[#7fb3ff] text-[9px] font-semibold text-white">
                  {user.initials}
                </span>
              </div>
            </div>

            {/* KPI row */}
            <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-2xl bg-white p-3 shadow-soft ring-1 ring-[#eef4ff]">
                  <p className="text-[9.5px] font-medium text-[#8fa1c7]">{k.label}</p>
                  <div className="mt-1 flex items-end justify-between gap-1">
                    <div>
                      <p className="text-[17px] font-semibold leading-none text-[#101c3d]">{k.value}</p>
                      <p className="mt-1 text-[8.5px] font-semibold text-[#0d9d63]">{k.delta}</p>
                    </div>
                    <Sparkline data={k.series} tone={k.tone} className="h-6 w-12" height={24} />
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming content */}
            <div className="mt-3 rounded-2xl bg-white p-3.5 shadow-soft ring-1 ring-[#eef4ff]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-[#101c3d]">Upcoming Content</p>
                  <p className="text-[9.5px] font-medium text-[#8fa1c7]">Your content calendar for the next 7 days.</p>
                </div>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[9px] font-semibold text-[#2b5ce6]">
                  View Calendar
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
                {upcomingContent.map((c) => (
                  <div key={c.title} className="rounded-xl ring-1 ring-[#eef4ff]">
                    <div className="p-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`flex size-5 items-center justify-center rounded-md ${platformTile[c.platform]?.bg}`}>
                          {platformTile[c.platform]?.icon}
                        </span>
                        <div>
                          <p className="text-[8.5px] font-semibold text-[#101c3d]">{c.platformLabel}</p>
                          <p className="text-[7.5px] font-medium text-[#8fa1c7]">{c.date}</p>
                        </div>
                        <span
                          className={`ml-auto rounded-full px-1.5 py-0.5 text-[7px] font-semibold ${
                            c.status === "Scheduled"
                              ? "bg-[#ffedd5] text-[#b45309]"
                              : "bg-[#f2f6fd] text-[#5c6b8a]"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="mt-1.5 truncate text-[9px] font-medium text-[#3d4c6d]">{c.title}</p>
                    </div>
                    <div className={`h-12 rounded-b-xl bg-gradient-to-br ${c.art}`} />
                  </div>
                ))}
                {/* Add new */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#c9dbfa] p-2 text-center">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#eef4ff] text-[#2b5ce6]">
                    <Plus className="size-3.5" />
                  </span>
                  <p className="mt-1.5 text-[8.5px] font-semibold text-[#101c3d]">Add new content</p>
                  <p className="text-[7.5px] font-medium text-[#8fa1c7]">Create something amazing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mini assistant */}
          <div className="hidden w-[190px] shrink-0 flex-col bg-white p-3 lg:flex">
            <div className="flex items-center gap-2 border-b border-[#eef4ff] pb-2.5">
              <span className="relative flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#2b5ce6] to-[#4a8dff] text-white">
                <Sparkles className="size-3" />
                <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-[#b6f500] ring-1 ring-white" />
              </span>
              <p className="flex-1 text-[10px] font-semibold text-[#101c3d]">Somae AI Assistant</p>
              <Minus className="size-3 text-[#8fa1c7]" />
            </div>
            <p className="pt-2.5 text-[10px] font-semibold text-[#101c3d]">Hi {user.name}! 👋</p>
            <p className="pt-1 text-[9px] leading-relaxed text-[#5c6b8a]">
              I've analyzed your brand and found new opportunities for growth.
            </p>
            <div className="mt-2 space-y-1.5">
              {["Create Instagram post ideas", "Write a blog on AI trends", "Plan next week's content"].map((s) => (
                <div key={s} className="flex items-center gap-1.5 rounded-lg border border-[#e9f0fb] px-2 py-1.5 text-[8.5px] font-medium text-[#3d4c6d]">
                  <Sparkles className="size-2.5 text-[#2b5ce6]" />
                  {s}
                </div>
              ))}
            </div>
            <div className="mt-auto flex items-center gap-1.5 rounded-full border border-[#e3ebf7] bg-[#f7faff] py-1 pl-2.5 pr-1">
              <span className="flex-1 text-[8.5px] font-medium text-[#8fa1c7]">Ask Somae anything…</span>
              <span className="flex size-5 items-center justify-center rounded-full bg-[#2e6bff] text-white">
                <SendHorizontal className="size-2.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating: AI suggestion */}
      <div className="animate-float-soft absolute -right-4 top-16 hidden w-[190px] rounded-2xl bg-white p-3.5 shadow-lift ring-1 ring-[#e9f0fb] md:block">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-[#eef4ff] text-[#2b5ce6]">
            <Sparkles className="size-3" />
          </span>
          <p className="text-[10px] font-semibold text-[#101c3d]">AI Suggestion</p>
        </div>
        <p className="mt-1.5 text-[9px] font-medium leading-relaxed text-[#5c6b8a]">Product launch campaign</p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-[#f2f6fd]">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#2b5ce6] to-[#7fb3ff]" />
        </div>
        <p className="mt-1.5 text-right text-[9px] font-semibold text-[#2b5ce6]">4.2K</p>
      </div>

      {/* Floating: top post */}
      <div className="animate-float-soft absolute -bottom-6 right-24 hidden w-[170px] rounded-2xl bg-white p-3 shadow-lift ring-1 ring-[#e9f0fb] md:block" style={{ animationDelay: "1.4s" }}>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-[#dcf5e9] text-[#047857]">
            <TrendingUp className="size-3" />
          </span>
          <p className="text-[10px] font-semibold text-[#101c3d]">Top Performing Post</p>
        </div>
        <p className="mt-1.5 text-[9px] font-medium text-[#5c6b8a]">Summer sale is live!</p>
        <div className="mt-2 h-8 rounded-lg bg-gradient-to-br from-[#ffd9c0] via-[#ffb4a2] to-[#e5989b]" />
        <p className="mt-1.5 text-right text-[9px] font-semibold text-[#047857]">4.2K ♥</p>
      </div>
    </div>
  );
}
