"use client"

import * as React from "react"
import { Handle, Position, NodeResizer, type Node } from "reactflow"
import { RepeatIcon, BracesIcon } from "lucide-react"
import type { NodeData } from "../types/workflow.types"
import { NODE_COLORS } from "../constants/workflow.constants"

// Custom Node component inside React Flow — solid, opaque, strong visual cards
export const CustomWorkflowNode = ({ data }: { data: NodeData }) => {
  const colors = NODE_COLORS[data.type]

  return (
    <div className={`border-2 ${colors.border} ${colors.bg} w-[240px] transition-all relative shadow-md rounded-lg overflow-hidden ${data.status === "running" ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-background animate-pulse" : ""
      } ${data.status === "success" ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background" : ""
      }`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--border)', border: '2px solid var(--background)' }}
      />
      {/* Header bar with solid color accent */}
      <div className={`flex items-center gap-2.5 px-3 py-2.5 ${colors.accent} border-b ${colors.border}`}>
        <div className={`p-1.5 ${colors.iconBg} rounded-md flex items-center justify-center shadow-sm`}>
          {data.icon}
        </div>
        <div className="flex-1 overflow-hidden">
          <h4 className="font-bold text-xs text-foreground tracking-tight truncate leading-tight">{data.label}</h4>
          <span className={`text-[9px] ${colors.text} uppercase font-bold font-mono tracking-wider`}>{data.type}</span>
        </div>
      </div>
      {/* Body — solid background, readable params */}
      <div className="px-3 py-2.5 bg-card text-[10px] text-muted-foreground font-mono space-y-1">
        {data.type === "trigger" && (
          <>
            <p className="truncate"><span className="text-muted-foreground/50">event:</span> {data.params.eventName || ""}</p>
            <p className="truncate"><span className="text-muted-foreground/50">payload:</span> {data.params.contentType || "json"}{data.params.sampleFile ? " + file" : ""}</p>
          </>
        )}
        {data.type === "delay" && (
          <p><span className="text-muted-foreground/50">wait:</span> {data.params.ms || "?"}ms</p>
        )}
        {data.type === "image-gen" && (
          <>
            <p className="truncate"><span className="text-muted-foreground/50">model:</span> {data.params.model}</p>
            <p className="truncate"><span className="text-muted-foreground/50">prompt:</span> {data.params.prompt}</p>
            <p><span className="text-muted-foreground/50">size:</span> {data.params.aspectRatio} · {data.params.numberOfImages || "1"} img</p>
          </>
        )}
        {data.type === "http-request" && (
          <p className="truncate"><span className={`${colors.text} font-bold`}>{data.params.method}</span> {data.params.url}</p>
        )}
        {data.type === "script" && <p><span className="text-muted-foreground/50">js:</span> custom script loaded</p>}
        {data.type === "output" && (
          <>
            <p><span className="text-muted-foreground/50">key:</span> {data.params.outputKey || "result"}</p>
            <p><span className="text-muted-foreground/50">format:</span> {data.params.format || "json"}</p>
          </>
        )}
        {data.type === "loop" && (
          <>
            <p className="truncate"><span className="text-muted-foreground/50">array:</span> {data.params.arrayPath || "$.items"}</p>
            <p><span className="text-muted-foreground/50">item:</span> {data.params.itemName || "item"}</p>
            <p><span className="text-muted-foreground/50">mode:</span> {data.params.mode || "parallel"}</p>
          </>
        )}
        {data.type === "router" && (
          <p className="truncate"><span className="text-muted-foreground/50">if:</span> {data.params.condition}</p>
        )}
        {data.type === "merge" && (
          <p className="truncate"><span className="text-muted-foreground/50">mode:</span> {data.params.strategy}</p>
        )}
        {data.type === "boolean" && (
          <p className="truncate"><span className="text-muted-foreground/50">op:</span> {data.params.operator}</p>
        )}
        {data.type === "transform" && (
          <p className="truncate"><span className="text-muted-foreground/50">map:</span> custom transform</p>
        )}
        {data.type === "filter" && (
          <p className="truncate"><span className="text-muted-foreground/50">keep if:</span> {data.params.condition}</p>
        )}
        {data.type === "classifier" && (
          <>
            <p className="truncate"><span className="text-muted-foreground/50">value:</span> {data.params.valueToMatch || ""}</p>
            <p className="truncate"><span className="text-muted-foreground/50">cases:</span> {data.params.possibilities || ""}</p>
          </>
        )}
        {data.type === "llm" && (
          <>
            <p className="truncate"><span className="text-muted-foreground/50">provider:</span> {data.params.provider || "openai"}</p>
            <p className="truncate"><span className="text-muted-foreground/50">model:</span> {data.params.model || "gpt-4o-mini"}</p>
            {data.params.responseFormat === "json_object" && <p className="truncate"><span className="text-muted-foreground/50">format:</span> JSON</p>}
          </>
        )}
        {data.params.outputMapping && data.params.outputMapping !== "[]" && (
          <p className="truncate text-primary/70 border-t border-border/50 pt-1 mt-1"><BracesIcon className="size-2.5 inline mr-1" />output mapped</p>
        )}
      </div>
      {data.status === "success" && (
        <div className="absolute top-2 right-2 size-2.5 bg-emerald-500 rounded-full shadow-sm border-2 border-card" />
      )}
      {data.status === "running" && (
        <div className="absolute top-2 right-2 size-2.5 bg-amber-500 rounded-full animate-ping shadow-sm border-2 border-card" />
      )}

      {data.type === "router" ? (
        <>
          <Handle
            id="true"
            type="source"
            position={Position.Right}
            style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981', border: '2px solid var(--background)', top: '30%' }}
          />
          <Handle
            id="false"
            type="source"
            position={Position.Right}
            style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444', border: '2px solid var(--background)', top: '70%' }}
          />
        </>
      ) : data.type === "classifier" ? (
        (data.params.possibilities || "billing,support,sales")
          .split(",")
          .map(c => c.trim())
          .filter(Boolean)
          .map((opt, idx, arr) => {
            const count = arr.length;
            const topPct = count > 1 ? 15 + (idx / (count - 1)) * 70 : 50;
            return (
              <React.Fragment key={opt}>
                <Handle
                  id={opt}
                  type="source"
                  position={Position.Right}
                  style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--primary)', border: '2px solid var(--background)', top: `${topPct}%` }}
                />
                <div
                  className="absolute text-[8px] font-bold font-mono text-foreground/70 tracking-tight pointer-events-none select-none"
                  style={{ right: '14px', top: `calc(${topPct}% - 6px)` }}
                >
                  {opt}
                </div>
              </React.Fragment>
            )
          })
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--primary)', border: '2px solid var(--background)' }}
        />
      )}
    </div>
  )
}

// Group Node Component for Visual Encapsulation
export const GroupWorkflowNode = ({ data, selected }: { data: NodeData, selected?: boolean }) => {
  return (
    <>
      <NodeResizer color="#6366f1" isVisible={selected} minWidth={200} minHeight={150} />
      <div className={`w-full h-full border-2 border-dashed border-indigo-500/50 bg-indigo-500/5 rounded-xl relative transition-colors ${data.status === "running" ? "border-amber-500 bg-amber-500/10" : ""}`}>
        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 border border-indigo-500/50 rounded text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 shadow-sm flex items-center gap-1.5">
          <RepeatIcon className="size-3" />
          {data.label}
        </div>
      </div>
    </>
  )
}

export const nodeTypes = {
  custom: CustomWorkflowNode,
  group: GroupWorkflowNode
}
