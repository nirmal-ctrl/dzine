import { Upload, Download, FolderOpen } from "lucide-react";
import { DashboardHeader } from "@/components/somae/dashboard-header";
import { brandAssets } from "@/lib/mock-data";

export default function BrandAssetsPage() {
  return (
    <div className="mx-auto max-w-[980px] px-1 pb-10 pt-2">
      <DashboardHeader
        title="Brand Assets"
        subtitle="Logos, guidelines and kits — always the latest version."
      />

      {/* Upload area */}
      <button className="mb-6 flex w-full flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-[#c9dbfa] bg-[#fafdff] py-10 transition-all duration-300 hover:border-[#2e6bff]/40 hover:bg-[#f2f7ff]">
        <span className="flex size-12 items-center justify-center rounded-full bg-[#eef4ff] text-[#2b5ce6]">
          <Upload className="size-5" />
        </span>
        <div className="text-center">
          <p className="text-[14px] font-semibold text-[#101c3d]">Drop files to upload</p>
          <p className="mt-1 text-[12px] font-medium text-[#8fa1c7]">
            SVG, PNG, PDF or Figma links — Somae keeps everything organized.
          </p>
        </div>
      </button>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brandAssets.map((a) => (
          <article
            key={a.name}
            className="card-interactive group cursor-pointer overflow-hidden rounded-[24px] bg-white shadow-soft ring-1 ring-[#e9f0fb]"
          >
            <div
              className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${a.tone}`}
            >
              <span
                className="font-serif text-[44px] italic leading-none text-white/90"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {a.glyph}
              </span>
              <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/25 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <Download className="size-3.5" />
              </span>
            </div>
            <div className="flex items-center gap-3 p-4">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#f2f6fd] text-[#2b5ce6]">
                <FolderOpen className="size-4" />
              </span>
              <div>
                <p className="text-[13.5px] font-semibold text-[#101c3d]">{a.name}</p>
                <p className="text-[11px] font-medium text-[#8fa1c7]">{a.type}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
