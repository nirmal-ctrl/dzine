"use client"

import * as React from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SparklesIcon, ChevronUpIcon, ChevronDownIcon, CheckIcon, CopyIcon } from "lucide-react"

// Recursive JSON Tree Viewer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const JsonViewer = ({ data, level = 0 }: { data: any, level?: number }) => {
  const [isExpanded, setIsExpanded] = React.useState(true)

  if (data === null) return <span className="text-muted-foreground/60 italic font-mono text-[10px]">null</span>
  if (data === undefined) return <span className="text-muted-foreground/60 italic font-mono text-[10px]">undefined</span>
  if (typeof data === "string") {
    const isLong = data.length > 100
    const displayStr = isLong ? data.substring(0, 100) + "..." : data
    return <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] break-all">"{displayStr}"</span>
  }
  if (typeof data === "number") return <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px]">{data}</span>
  if (typeof data === "boolean") return <span className="text-rose-600 dark:text-rose-400 font-mono text-[10px]">{data ? "true" : "false"}</span>

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-foreground font-mono text-[10px]">[]</span>
    return (
      <div className="font-mono text-[10px]">
        <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="text-muted-foreground/50 hover:text-foreground">{isExpanded ? "▼" : "▶"}</span>
          <span>[</span>
          {!isExpanded && <span className="text-muted-foreground/60 italic"> {data.length} items </span>}
          {!isExpanded && <span>]</span>}
        </div>
        {isExpanded && (
          <div className="pl-4 border-l border-border/50 ml-1.5 mt-0.5 space-y-0.5">
            {data.map((item, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className="text-muted-foreground/50 select-none">{i}:</span>
                <JsonViewer data={item} level={level + 1} />
              </div>
            ))}
          </div>
        )}
        {isExpanded && <div className="ml-1">]</div>}
      </div>
    )
  }

  if (typeof data === "object") {
    const keys = Object.keys(data)
    if (keys.length === 0) return <span className="text-foreground font-mono text-[10px]">{"{}"}</span>
    return (
      <div className="font-mono text-[10px]">
        <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="text-muted-foreground/50 hover:text-foreground">{isExpanded ? "▼" : "▶"}</span>
          <span>{"{"}</span>
          {!isExpanded && <span className="text-muted-foreground/60 italic"> {keys.length} keys </span>}
          {!isExpanded && <span>{"}"}</span>}
        </div>
        {isExpanded && (
          <div className="pl-4 border-l border-border/50 ml-1.5 mt-0.5 space-y-0.5">
            {keys.map(k => (
              <div key={k} className="flex items-start gap-1">
                <span className="text-primary/80 select-none">"{k}":</span>
                <JsonViewer data={data[k]} level={level + 1} />
              </div>
            ))}
          </div>
        )}
        {isExpanded && <div className="ml-1">{"}"}</div>}
      </div>
    )
  }

  return <span className="text-foreground font-mono text-[10px]">{String(data)}</span>
}

// Collapsible Thought Component for Modern Aesthetic
export const ThoughtBlock = ({ thought }: { thought: string }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mb-3 w-full border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent rounded-lg shadow-sm overflow-hidden transition-all duration-300"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between p-2.5 text-[10px] font-bold text-primary/80 hover:bg-primary/10 transition-colors">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-3.5 animate-pulse text-primary" />
          <span className="uppercase tracking-widest font-mono">View Thinking Process</span>
        </div>
        {isOpen ? <ChevronUpIcon className="size-3.5" /> : <ChevronDownIcon className="size-3.5" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
        <div className="p-3 pt-1 text-[11px] text-muted-foreground italic whitespace-pre-wrap font-mono leading-relaxed border-t border-primary/10">
          {thought}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
      title="Copy JSON"
    >
      {copied ? <CheckIcon className="size-3 text-emerald-500" /> : <CopyIcon className="size-3" />}
    </button>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DataRenderer = ({ data, setMaximizedImage }: { data: any, setMaximizedImage: any }) => {
  const [view, setView] = React.useState<"rich" | "raw">("rich")

  let hasRichContent = false;
  const textContents: { key: string, text: string }[] = [];

  if (data && typeof data === 'object') {
    Object.entries(data).forEach(([k, v]) => {
      if (typeof v === 'string' && v.length > 20 && !v.startsWith('data:image') && !v.startsWith('http')) {
        hasRichContent = true;
        textContents.push({ key: k, text: v });
      }
    });
    if (data.results && Array.isArray(data.results)) {
      hasRichContent = true;
    }
  }

  // Handle images
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imgUrl = data.imageUrl || data.image || (typeof data === 'object' && Object.values(data).find((v: any) => typeof v === 'string' && (v.startsWith('data:image/') || v.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/i))));

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center gap-1 border-b border-border pb-1">
        {hasRichContent && (
          <button
            onClick={() => setView("rich")}
            className={`text-[10px] px-2 py-1 rounded-t-md font-bold uppercase tracking-wider transition-colors ${view === "rich" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Pretty View
          </button>
        )}
        <button
          onClick={() => setView("raw")}
          className={`text-[10px] px-2 py-1 rounded-t-md font-bold uppercase tracking-wider transition-colors ${view === "raw" || !hasRichContent ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Raw JSON
        </button>
      </div>

      {imgUrl && (
        <div className="border border-border p-2 bg-card rounded-md max-w-[200px] shadow-sm animate-in fade-in zoom-in-95 duration-200 group relative overflow-hidden">
          <img
            src={imgUrl}
            alt="Generated Output"
            className="rounded object-cover w-full h-auto cursor-zoom-in hover:opacity-90 transition-opacity"
            onClick={() => setMaximizedImage(imgUrl)}
            title="Click to maximize & download"
          />
        </div>
      )}

      {view === "rich" && hasRichContent && (
        <div className="bg-card border border-border p-3 rounded-md shadow-sm space-y-3">
          {textContents.map((tc, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{tc.key}</div>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{tc.text}</div>
            </div>
          ))}
          {data.results && Array.isArray(data.results) && (
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.results.map((res: any, idx: number) => (
                <div key={idx} className="p-2 border border-border/50 rounded bg-muted/10">
                  <div className="text-[10px] font-bold text-primary mb-1">Iteration {res.index !== undefined ? res.index + 1 : idx + 1}</div>
                  <DataRenderer data={res.results || res} setMaximizedImage={setMaximizedImage} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(view === "raw" || !hasRichContent) && (
        <div className="bg-muted/30 border border-border p-3 rounded-md overflow-x-auto shadow-sm relative group">
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground mr-1">Payload</span>
            <CopyButton text={JSON.stringify(data, null, 2)} />
          </div>
          <JsonViewer data={data} />
        </div>
      )}
    </div>
  )
}
