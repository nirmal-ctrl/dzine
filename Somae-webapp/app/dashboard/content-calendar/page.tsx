import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/somae/dashboard-header";
import { calendarWeek, calendarEvents, user } from "@/lib/mock-data";

export default function ContentCalendarPage() {
  return (
    <div className="mx-auto max-w-[980px] px-1 pb-10 pt-2">
      <DashboardHeader
        title="Content Calendar"
        subtitle="Your publishing rhythm across every channel."
      />

      {/* Controls */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="flex size-9 items-center justify-center rounded-full bg-white text-[#5c6b8a] shadow-soft ring-1 ring-[#e9f0fb] transition-all duration-300 hover:text-[#2b5ce6]" aria-label="Previous week">
            <ChevronLeft className="size-4" />
          </button>
          <p className="px-2 text-[15px] font-semibold text-[#101c3d]">{calendarWeek.month}</p>
          <button className="flex size-9 items-center justify-center rounded-full bg-white text-[#5c6b8a] shadow-soft ring-1 ring-[#e9f0fb] transition-all duration-300 hover:text-[#2b5ce6]" aria-label="Next week">
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex rounded-full bg-white p-1 shadow-soft ring-1 ring-[#e9f0fb]">
            {["Week", "Month"].map((v, i) => (
              <button
                key={v}
                className={`rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-all duration-300 ${
                  i === 0 ? "bg-[#eef4ff] text-[#2b5ce6]" : "text-[#5c6b8a] hover:text-[#101c3d]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-full bg-[#2e6bff] px-5 py-2.5 text-[13px] font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-glow active:scale-[0.98]">
            <Plus className="size-4" />
            Create
          </button>
        </div>
      </div>

      {/* Week grid */}
      <section className="overflow-hidden rounded-[24px] bg-white shadow-soft ring-1 ring-[#e9f0fb]">
        {/* Day headers */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-[#eef4ff]">
          <div />
          {calendarWeek.days.map((d) => (
            <div key={d.date} className="border-l border-[#f2f6fd] px-2 py-4 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8fa1c7]">{d.label}</p>
              <p
                className={`mx-auto mt-1.5 flex size-8 items-center justify-center rounded-full text-[14px] font-semibold ${
                  d.date === 22 ? "bg-[#2e6bff] text-white shadow-glow" : "text-[#101c3d]"
                }`}
              >
                {d.date}
              </p>
            </div>
          ))}
        </div>

        {/* Time rows */}
        <div className="relative">
          {calendarWeek.hours.map((h, i) => (
            <div key={h} className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-[#f7faff] last:border-0">
              <div className="py-6 pr-2 text-right text-[10.5px] font-medium text-[#b3c2dd]">
                {h}
              </div>
              {calendarWeek.days.map((d) => (
                <div key={d.date} className="border-l border-[#f7faff]" />
              ))}
              {/* events for this row */}
              {calendarEvents
                .filter((e) => e.row === i + 1)
                .map((e) => (
                  <div
                    key={e.title}
                    className="card-interactive absolute cursor-pointer rounded-xl p-2.5 ring-1 ring-black/5"
                    style={{
                      left: `calc(56px + (100% - 56px) / 7 * ${e.day} + 6px)`,
                      width: `calc((100% - 56px) / 7 - 12px)`,
                      top: `${i * 25}%`,
                      height: "calc(25% - 10px)",
                      marginTop: 5,
                      background: e.bg,
                      color: e.color,
                    }}
                  >
                    <p className="truncate text-[11px] font-semibold">{e.title}</p>
                    <p className="mt-0.5 text-[10px] font-medium opacity-75">{e.start}</p>
                    <span className="absolute bottom-2 left-2.5 flex size-5 items-center justify-center rounded-full bg-white/80 text-[8px] font-bold shadow-sm">
                      {user.initials}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>

      <p className="mt-4 text-center text-[12px] font-medium text-[#8fa1c7]">
        Drag and drop to reschedule — Somae will suggest the best-performing slots.
      </p>
    </div>
  );
}
