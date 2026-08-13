"use client";

import { useState } from "react";
import {
  ArrowRight,
  Camera,
  Newspaper,
  BookOpen,
  Mail,
  AtSign,
  Megaphone,
  Video,
  Image as ImageIcon,
  Sparkles,
  Copy,
  RefreshCw,
  Check,
} from "lucide-react";
import { DashboardHeader } from "@/components/somae/dashboard-header";
import { contentTypes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, React.ReactNode> = {
  instagram: <Camera className="size-5" />,
  linkedin: <Newspaper className="size-5" />,
  blog: <BookOpen className="size-5" />,
  email: <Mail className="size-5" />,
  facebook: <AtSign className="size-5" />,
  ads: <Megaphone className="size-5" />,
  script: <Video className="size-5" />,
  image: <ImageIcon className="size-5" />,
};

const sampleOutput: Record<string, string> = {
  instagram:
    "☕ Behind every smooth morning is a system that just works.\n\nWe spent the weekend in the studio capturing how our team actually plans a launch — sticky notes, strong coffee, and one very patient whiteboard.\n\nThe secret? Fewer tools. Better rituals.\n\n#BehindTheScenes #BrandCraft #StudioLife",
  linkedin:
    "5 ways AI is quietly changing how small brands compete:\n\n1. Brand voice is now a dataset, not a PDF\n2. Content calendars plan themselves\n3. Design systems generate, not just document\n4. Analytics explain what to do next\n5. Consistency became the default\n\nThe advantage isn't the AI — it's the brands that brief it well.",
  blog: "# The Quiet Revolution in Brand Building\n\nFor decades, brand consistency required armies of people and binders of guidelines. Today, a single well-understood brand model can carry your voice across every channel…",
  email:
    "Subject: Your week, beautifully planned ✨\n\nHi {first_name},\n\nMonday mornings feel different when your content is already drafted. Here's what Somae prepared for you this week…",
};

export default function ContentStudioPage() {
  const [selected, setSelected] = useState("instagram");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (generating) return;
    setGenerating(true);
    setOutput(null);
    setTimeout(() => {
      setOutput(sampleOutput[selected] ?? sampleOutput.instagram);
      setGenerating(false);
    }, 1600);
  };

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mx-auto max-w-[980px] px-1 pb-10 pt-2">
      <DashboardHeader title="Content Studio" subtitle="Create on-brand content in seconds." />

      {/* Prompt hero */}
      <section className="rounded-[28px] bg-white p-8 shadow-soft ring-1 ring-[#e9f0fb] md:p-12">
        <h2 className="text-center text-[28px] font-semibold tracking-[-0.02em] text-[#101c3d]">
          What are we creating today?
        </h2>

        <form
          onSubmit={generate}
          className="mx-auto mt-7 flex max-w-[640px] items-center gap-2 rounded-full border border-[#e3ebf7] bg-[#f7faff] py-2 pl-6 pr-2 transition-all duration-300 focus-within:border-[#2e6bff]/40 focus-within:bg-white focus-within:shadow-glow"
        >
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create…"
            className="min-w-0 flex-1 bg-transparent text-[14.5px] font-medium text-[#101c3d] outline-none placeholder:text-[#8fa1c7]"
          />
          <button
            type="submit"
            disabled={generating}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#2e6bff] text-white shadow-soft transition-all duration-300 hover:brightness-110 hover:shadow-glow active:scale-95 disabled:opacity-60"
            aria-label="Generate"
          >
            <ArrowRight className="size-5" />
          </button>
        </form>

        {/* Type selector */}
        <p className="mt-9 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8fa1c7]">
          Popular options
        </p>
        <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {contentTypes.map((t) => (
            <button
              key={t.key}
              onClick={() => setSelected(t.key)}
              className={cn(
                "group flex flex-col items-center gap-2.5 rounded-[20px] border p-4 transition-all duration-300",
                selected === t.key
                  ? "border-[#2e6bff]/35 bg-[#f5f9ff] shadow-glow"
                  : "border-[#e9f0fb] bg-white hover:-translate-y-0.5 hover:border-[#2e6bff]/20 hover:shadow-soft"
              )}
            >
              <span
                className="flex size-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                style={{ background: t.bg, color: t.color }}
              >
                {typeIcons[t.key]}
              </span>
              <span className="text-[12.5px] font-semibold text-[#3d4c6d]">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Output */}
      {(generating || output) && (
        <section className="animate-rise-in mt-6 rounded-[24px] bg-white p-7 shadow-soft ring-1 ring-[#e9f0fb]">
          <div className="flex items-center gap-3">
            <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2b5ce6] to-[#4a8dff] text-white">
              <Sparkles className="size-4" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[#b6f500] ring-2 ring-white" />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-[#101c3d]">
                {generating ? "Crafting in your brand voice…" : "Ready to refine"}
              </p>
              <p className="text-[11.5px] font-medium text-[#8fa1c7]">
                {contentTypes.find((t) => t.key === selected)?.label} · On-brand draft
              </p>
            </div>
            {output && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-3.5 py-2 text-[12px] font-semibold text-[#2b5ce6] transition-all duration-300 hover:bg-[#e0ecff]"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => generate()}
                  className="flex items-center gap-1.5 rounded-full bg-[#f2f6fd] px-3.5 py-2 text-[12px] font-semibold text-[#5c6b8a] transition-all duration-300 hover:bg-[#e9f0fb] hover:text-[#2b5ce6]"
                >
                  <RefreshCw className="size-3.5" />
                  Regenerate
                </button>
              </div>
            )}
          </div>

          {generating ? (
            <div className="mt-5 space-y-3">
              {[92, 100, 78, 96, 60].map((wch, i) => (
                <div
                  key={i}
                  className="h-3.5 animate-pulse rounded-full bg-gradient-to-r from-[#eef4ff] via-[#e0ecff] to-[#eef4ff]"
                  style={{ width: `${wch}%`, animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          ) : (
            <p className="mt-5 whitespace-pre-wrap rounded-2xl bg-[#f7faff] p-5 text-[13.5px] font-medium leading-relaxed text-[#3d4c6d] ring-1 ring-[#eef4ff]">
              {output}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
