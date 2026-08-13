import { Plus, Download, Sparkles, Image as ImageIcon } from "lucide-react";
import { DashboardHeader } from "@/components/somae/dashboard-header";
import { aiImages } from "@/lib/mock-data";

export default function AiImagesPage() {
  return (
    <div className="mx-auto max-w-[980px] px-1 pb-10 pt-2">
      <DashboardHeader
        title="AI Images"
        subtitle="On-brand visuals generated in your palette and style."
      />

      {/* Generate bar */}
      <form className="mb-6 flex items-center gap-2 rounded-full border border-[#e3ebf7] bg-white py-2 pl-6 pr-2 shadow-soft transition-all duration-300 focus-within:border-[#2e6bff]/40 focus-within:shadow-glow">
        <Sparkles className="size-4 shrink-0 text-[#2b5ce6]" />
        <input
          placeholder="Describe an image — Somae will match your brand style…"
          className="min-w-0 flex-1 bg-transparent text-[13.5px] font-medium text-[#101c3d] outline-none placeholder:text-[#8fa1c7]"
        />
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-[#2e6bff] px-5 py-2.5 text-[13px] font-semibold text-white shadow-soft transition-all duration-300 hover:brightness-110 hover:shadow-glow active:scale-[0.98]"
        >
          Generate
        </button>
      </form>

      {/* Gallery */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* New image tile */}
        <button className="group flex aspect-square flex-col items-center justify-center rounded-[24px] border border-dashed border-[#c9dbfa] bg-[#fafdff] transition-all duration-300 hover:border-[#2e6bff]/40 hover:bg-[#f2f7ff]">
          <span className="flex size-11 items-center justify-center rounded-full bg-[#eef4ff] text-[#2b5ce6] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2e6bff] group-hover:text-white group-hover:shadow-glow">
            <Plus className="size-5" />
          </span>
          <p className="mt-3 text-[13px] font-semibold text-[#101c3d]">New image</p>
          <p className="mt-0.5 text-[11px] font-medium text-[#8fa1c7]">Brand-consistent by default</p>
        </button>

        {aiImages.map((img) => (
          <div
            key={img.title}
            className="card-interactive group relative aspect-square cursor-pointer overflow-hidden rounded-[24px] shadow-soft ring-1 ring-[#e9f0fb]"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${img.tone}`} />
            <ImageIcon className="absolute inset-0 m-auto size-8 text-white/50" strokeWidth={1.5} />
            {/* hover overlay */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[#101c3d]/60 to-transparent p-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="text-[12px] font-semibold text-white">{img.title}</p>
              <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/35">
                <Download className="size-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
