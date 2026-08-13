"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Minus,
  SendHorizontal,
  Camera,
  Newspaper,
  Image as ImageIcon,
  CalendarPlus,
  ChartLine,
  Paperclip,
} from "lucide-react";
import { assistantSuggestions, user } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const suggestionIcons: Record<string, React.ReactNode> = {
  instagram: <Camera className="size-3.5 text-[#e1306c]" />,
  blog: <Newspaper className="size-3.5 text-[#7c3aed]" />,
  image: <ImageIcon className="size-3.5 text-[#2b5ce6]" />,
  calendar: <CalendarPlus className="size-3.5 text-[#047857]" />,
  chart: <ChartLine className="size-3.5 text-[#b45309]" />,
};

type Message = { role: "ai" | "user"; text: string };

const cannedReplies = [
  "On it — I'm drafting a few options in your brand voice. I'll have them ready in a moment. ✨",
  "Great idea. Based on your audience's activity, the best time to post this would be Thursday at 10 AM.",
  "I've analyzed your top-performing content and woven those patterns into this suggestion.",
  "Done! I've added that to your content calendar as a draft — feel free to refine it in Content Studio.",
];

export function AssistantPanel({ className }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: `I've analyzed your brand and found new opportunities for growth.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const replyIndex = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setTyping(true);
    const reply = cannedReplies[replyIndex.current % cannedReplies.length];
    replyIndex.current += 1;
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    }, 1400);
  };

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-white shadow-soft ring-1 ring-[#e9f0fb]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#eef4ff] px-5 py-4">
        <span className="relative flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2b5ce6] to-[#4a8dff] text-white shadow-glow">
          <Sparkles className="size-4" />
          <span className="ai-pulse absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#b6f500] ring-2 ring-white" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#101c3d]">Somae AI Assistant</p>
          <p className="text-[11px] font-medium text-[#5c6b8a]">Always-on brand intelligence</p>
        </div>
        <button
          className="flex size-7 items-center justify-center rounded-full text-[#8fa1c7] transition-colors hover:bg-[#f2f6fd] hover:text-[#2b5ce6]"
          aria-label="Collapse assistant"
        >
          <Minus className="size-4" />
        </button>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="pretty-scroll flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <div>
          <p className="text-sm font-semibold text-[#101c3d]">
            Hi {user.name}! <span aria-hidden>👋</span>
          </p>
        </div>
        {messages.map((m, i) =>
          m.role === "ai" ? (
            <div key={i} className="animate-rise-in">
              <p className="text-[13px] leading-relaxed text-[#3d4c6d]">{m.text}</p>
            </div>
          ) : (
            <div key={i} className="animate-rise-in flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-[#2e6bff] px-4 py-2.5 text-[13px] leading-relaxed text-white shadow-soft">
                {m.text}
              </p>
            </div>
          )
        )}

        {typing && (
          <div className="flex items-center gap-1.5 px-1 py-1">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="typing-dot size-1.5 rounded-full bg-[#2e6bff]"
                style={{ animationDelay: `${d * 0.18}s` }}
              />
            ))}
          </div>
        )}

        {/* Suggested actions */}
        <div className="space-y-2 pt-1">
          {assistantSuggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => send(s.label)}
              className="group flex w-full items-center gap-3 rounded-2xl border border-[#e9f0fb] bg-white px-4 py-3 text-left text-[13px] font-medium text-[#3d4c6d] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2e6bff]/25 hover:bg-[#f7faff] hover:shadow-soft"
            >
              <span className="flex size-7 items-center justify-center rounded-xl bg-[#f2f6fd] transition-colors group-hover:bg-white">
                {suggestionIcons[s.icon]}
              </span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input — fixed at bottom */}
      <div className="border-t border-[#eef4ff] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 rounded-full border border-[#e3ebf7] bg-[#f7faff] py-1.5 pl-4 pr-1.5 transition-all duration-300 focus-within:border-[#2e6bff]/40 focus-within:bg-white focus-within:shadow-glow"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Somae anything…"
            className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[#101c3d] outline-none placeholder:text-[#8fa1c7]"
          />
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-[#8fa1c7] transition-colors hover:text-[#2b5ce6]"
            aria-label="Attach"
          >
            <Paperclip className="size-4" />
          </button>
          <button
            type="submit"
            className="flex size-9 items-center justify-center rounded-full bg-[#2e6bff] text-white shadow-soft transition-all duration-300 hover:brightness-110 hover:shadow-glow active:scale-95"
            aria-label="Send"
          >
            <SendHorizontal className="size-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
