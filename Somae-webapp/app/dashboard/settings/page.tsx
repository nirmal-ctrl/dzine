"use client";

import { useState } from "react";
import { User, Crown, Bell, ShieldCheck, Check } from "lucide-react";
import { DashboardHeader } from "@/components/somae/dashboard-header";
import { user } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function Field({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
}) {
  const [v, setV] = useState(value);
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-[#3d4c6d]">{label}</span>
      <input
        type={type}
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="w-full rounded-2xl border border-[#e3ebf7] bg-[#f7faff] px-4.5 px-4 py-3 text-[13.5px] font-medium text-[#101c3d] outline-none transition-all duration-300 placeholder:text-[#8fa1c7] focus:border-[#2e6bff]/40 focus:bg-white focus:shadow-glow"
      />
    </label>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
        on ? "bg-[#2e6bff]" : "bg-[#e3ebf7]"
      )}
      role="switch"
      aria-checked={on}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all duration-300",
          on ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="mx-auto max-w-[980px] px-1 pb-10 pt-2">
      <DashboardHeader title="Settings" subtitle="Your account, brand and preferences." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Profile */}
        <section className="rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-[#e9f0fb]">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2b5ce6]">
              <User className="size-4" />
            </span>
            <h3 className="text-[15px] font-semibold text-[#101c3d]">Profile</h3>
          </div>
          <div className="mt-5 space-y-4">
            <Field label="Full name" value={user.fullName} />
            <Field label="Email" value={user.email} type="email" />
            <Field label="Brand name" value="Somae Studio" />
            <Field label="Website" value="https://yourbrand.com" />
          </div>
        </section>

        {/* Plan */}
        <section className="flex flex-col rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-[#e9f0fb]">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2b5ce6]">
              <Crown className="size-4" />
            </span>
            <h3 className="text-[15px] font-semibold text-[#101c3d]">Plan</h3>
          </div>
          <div className="mt-5 flex-1 rounded-2xl bg-gradient-to-br from-[#2b5ce6] to-[#4a8dff] p-5 text-white">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold">Pro Plan</p>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10.5px] font-semibold ring-1 ring-white/25">
                Active
              </span>
            </div>
            <p className="mt-1 text-[12px] font-medium text-white/75">Renews in 23 days</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[70%] rounded-full bg-[#b6f500]" />
            </div>
            <p className="mt-2 text-[11.5px] font-medium text-white/85">7 of 10 projects used</p>
          </div>
          <button className="mt-4 rounded-full bg-[#eef4ff] px-5 py-2.5 text-[12.5px] font-semibold text-[#2b5ce6] transition-all duration-300 hover:bg-[#e0ecff]">
            Manage billing
          </button>
        </section>

        {/* Notifications */}
        <section className="rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-[#e9f0fb]">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2b5ce6]">
              <Bell className="size-4" />
            </span>
            <h3 className="text-[15px] font-semibold text-[#101c3d]">Notifications</h3>
          </div>
          <div className="mt-5 space-y-4">
            {[
              { label: "AI suggestions", desc: "New content ideas from Somae", on: true },
              { label: "Weekly summary", desc: "Performance digest every Monday", on: true },
              { label: "Publishing reminders", desc: "Before scheduled posts go live", on: false },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13.5px] font-semibold text-[#101c3d]">{n.label}</p>
                  <p className="text-[11.5px] font-medium text-[#8fa1c7]">{n.desc}</p>
                </div>
                <Toggle defaultOn={n.on} />
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-[#e9f0fb]">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2b5ce6]">
              <ShieldCheck className="size-4" />
            </span>
            <h3 className="text-[15px] font-semibold text-[#101c3d]">Security</h3>
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-[#f7faff] px-4 py-3 ring-1 ring-[#eef4ff]">
              <div>
                <p className="text-[13px] font-semibold text-[#101c3d]">Google account</p>
                <p className="text-[11.5px] font-medium text-[#8fa1c7]">{user.email}</p>
              </div>
              <span className="rounded-full bg-[#dcf5e9] px-3 py-1 text-[10.5px] font-semibold text-[#047857]">
                Connected
              </span>
            </div>
            <button className="w-full rounded-full bg-[#f2f6fd] px-5 py-2.5 text-[12.5px] font-semibold text-[#e5484d] transition-all duration-300 hover:bg-[#fee2e2]">
              Sign out of all devices
            </button>
          </div>
        </section>
      </div>

      {/* Save */}
      <div className="sticky bottom-4 mt-6 flex justify-end">
        <button
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 1800);
          }}
          className={cn(
            "flex items-center gap-2 rounded-full px-7 py-3 text-[13.5px] font-semibold text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]",
            saved ? "bg-[#22c55e]" : "bg-[#2e6bff] hover:brightness-110 hover:shadow-glow"
          )}
        >
          {saved && <Check className="size-4" />}
          {saved ? "Saved" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
