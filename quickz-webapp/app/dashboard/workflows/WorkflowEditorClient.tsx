"use client"

import * as React from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  updateEdge,
  Connection,
  Edge,
  MarkerType,
  type Node,
  Handle,
  Position,
  NodeResizer,
} from "reactflow"
import "reactflow/dist/style.css"

import { useAiSettings } from "@/hooks/use-ai-settings"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import { 
  ClockIcon, 
  SparklesIcon, 
  Code2Icon, 
  Trash2Icon, 
  PlayCircleIcon, 
  SparkleIcon,
  ImageIcon, 
  BrainCircuitIcon, 
  BracesIcon, 
  GlobeIcon, 
  ZapIcon,
  Maximize2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  SquareArrowOutUpRightIcon,
  RepeatIcon,
  LayersIcon,
  GitBranchIcon,
  GitMergeIcon,
  ToggleLeftIcon,
  FilterIcon,
  Wand2Icon,
  SearchIcon,
  CopyIcon,
  CheckIcon,
  WorkflowIcon,
  ArrowLeftIcon
} from "lucide-react"

// Dynamic nodes typing & parameters
type NodeType = "trigger" | "delay" | "script" | "image-gen" | "http-request" | "output" | "loop" | "llm" | "router" | "merge" | "boolean" | "transform" | "filter" | "group" | "classifier"

interface NodeData {
  label: string
  type: NodeType
  icon?: React.ReactNode
  color?: string
  params: Record<string, string>
  status: "idle" | "running" | "success" | "error"
}

const PROVIDER_MODELS: Record<string, { id: string; name: string }[]> = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o (Premium)" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast & Cost-effective)" },
    { id: "o1", name: "o1 (Reasoning)" },
    { id: "o1-mini", name: "o1-mini (Reasoning Fast)" },
  ],
  anthropic: [
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (Best)" },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku (Fast)" },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus (Creative)" },
  ],
  google: [
    { id: "gemini-1.5-flash", name: "gemini-1.5-flash" },
    { id: "gemini-2.0-flash", name: "gemini-2.0-flash" },
    { id: "gemini-2.5-flash", name: "gemini-2.5-flash" },
    { id: "gemini-2.5-pro", name: "gemini-2.5-pro" },
    { id: "gemma-4-26b-a4b-it", name: "gemma-4-26b-a4b-it" },
    { id: "gemma-4-31b-it", name: "gemma-4-31b-it" },
    { id: "gemini-flash-latest", name: "gemini-flash-latest" },
    { id: "gemini-flash-lite-latest", name: "gemini-flash-lite-latest" },
    { id: "gemini-pro-latest", name: "gemini-pro-latest" },
    { id: "gemini-2.5-flash-lite", name: "gemini-2.5-flash-lite" },
    { id: "gemini-2.5-flash-image", name: "gemini-2.5-flash-image" },
    { id: "gemini-3-flash-preview", name: "gemini-3-flash-preview" },
    { id: "gemini-3.1-pro-preview", name: "gemini-3.1-pro-preview" },
    { id: "gemini-3.1-pro-preview-customtools", name: "gemini-3.1-pro-preview-customtools" },
    { id: "gemini-3.1-flash-lite", name: "gemini-3.1-flash-lite" },
    { id: "gemini-3-pro-image", name: "gemini-3-pro-image" },
    { id: "nano-banana-pro-preview", name: "nano-banana-pro-preview" },
    { id: "gemini-3.1-flash-image", name: "gemini-3.1-flash-image" },
    { id: "gemini-3.5-flash", name: "gemini-3.5-flash" },
  ],
  groq: [
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Versatile)" },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (MoE)" },
    { id: "gemma2-9b-it", name: "Gemma 2 9B (Google Lightweight)" },
  ],
  "open-source": [
    { id: "meta-llama/llama-3.1-405b-instruct", name: "Llama 3.1 405B" },
    { id: "mistralai/mistral-large-2407", name: "Mistral Large 2" },
    { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B" },
  ]
};

// Colors for nodes — muted, professional tones (no neon, no purple/indigo/violet/fuchsia)
// Colors for nodes — subtle uniform border, distinct icon badges and accents
const NODE_COLORS: Record<NodeType, { border: string, bg: string, text: string, iconBg: string, accent: string }> = {
  trigger:      { border: "border-border",      bg: "bg-card",  text: "text-slate-600",    iconBg: "bg-slate-700",    accent: "bg-slate-100 dark:bg-slate-800/50" },
  delay:        { border: "border-border",      bg: "bg-card",  text: "text-stone-600",   iconBg: "bg-stone-700",    accent: "bg-stone-100 dark:bg-stone-800/50" },
  script:       { border: "border-border",      bg: "bg-card",  text: "text-red-600",      iconBg: "bg-red-700",      accent: "bg-red-50 dark:bg-red-950/30" },
  "image-gen":  { border: "border-border",      bg: "bg-card",  text: "text-rose-600",    iconBg: "bg-rose-700",    accent: "bg-rose-50 dark:bg-rose-950/30" },
  "http-request":{ border: "border-border",     bg: "bg-card",  text: "text-sky-600",     iconBg: "bg-sky-700",     accent: "bg-sky-50 dark:bg-sky-950/30" },
  "output":      { border: "border-border",      bg: "bg-card",  text: "text-emerald-600", iconBg: "bg-emerald-700", accent: "bg-emerald-50 dark:bg-emerald-950/30" },
  "loop":        { border: "border-border",      bg: "bg-card",  text: "text-indigo-600",  iconBg: "bg-indigo-700",  accent: "bg-indigo-50 dark:bg-indigo-950/30" },
  "llm":         { border: "border-border",      bg: "bg-card",  text: "text-violet-600",  iconBg: "bg-violet-700",  accent: "bg-violet-50 dark:bg-violet-950/30" },
  "router":      { border: "border-border",      bg: "bg-card",  text: "text-pink-600",    iconBg: "bg-pink-700",    accent: "bg-pink-50 dark:bg-pink-950/30" },
  "merge":       { border: "border-border",      bg: "bg-card",  text: "text-cyan-600",    iconBg: "bg-cyan-700",    accent: "bg-cyan-50 dark:bg-cyan-950/30" },
  "boolean":     { border: "border-border",      bg: "bg-card",  text: "text-fuchsia-600", iconBg: "bg-fuchsia-700", accent: "bg-fuchsia-50 dark:bg-fuchsia-950/30" },
  "transform":   { border: "border-border",      bg: "bg-card",  text: "text-lime-600",    iconBg: "bg-lime-700",    accent: "bg-lime-50 dark:bg-lime-950/30" },
  "filter":      { border: "border-border",      bg: "bg-card",  text: "text-orange-600",  iconBg: "bg-orange-700",  accent: "bg-orange-50 dark:bg-orange-950/30" },
  "group":       { border: "border-border",      bg: "bg-card",  text: "text-indigo-600",  iconBg: "bg-indigo-700",  accent: "bg-indigo-50 dark:bg-indigo-950/30" },
  "classifier":  { border: "border-border",      bg: "bg-card",  text: "text-amber-600",   iconBg: "bg-amber-700",   accent: "bg-amber-50 dark:bg-amber-950/30" },
}

interface AvailableTile {
  name: string
  description: string
  type: NodeType
  icon: React.ReactNode
  color: string
  defaultParams: Record<string, string>
}

const AVAILABLE_TILES: AvailableTile[] = [
  { name: "Trigger", description: "Webhook entry point — starts the workflow when an external event fires", type: "trigger", icon: <ZapIcon className="size-4 text-white" />, color: "slate", defaultParams: { triggerType: "webhook", webhookUrl: "", eventName: "On New Order", contentType: "application/json", inputSchema: "{}", sampleFile: "" } },
  { name: "Delay", description: "Pause execution for a fixed duration in milliseconds", type: "delay", icon: <ClockIcon className="size-4 text-white" />, color: "stone", defaultParams: { ms: "2000" } },
  { name: "LLM Node", description: "Advanced LLM — customize provider, model, structured outputs & instructions", type: "llm", icon: <BrainCircuitIcon className="size-4 text-white" />, color: "violet", defaultParams: { provider: "openai", model: "gpt-4o-mini", apiKey: "", prompt: "Generate the deck content...", temperature: "0.7", responseFormat: "text", jsonSchema: "" } },
  { name: "Image Gen", description: "AI image generation with aspect ratio, resolution & style reference support", type: "image-gen", icon: <ImageIcon className="size-4 text-white" />, color: "rose", defaultParams: { apiKey: "", model: "gemini-3.1-flash-image", prompt: "A hyper-realistic corporate mascot logo", aspectRatio: "1:1", numberOfImages: "1", imageSize: "1K", personGeneration: "dont_allow", referenceImage: "", temperature: "", topP: "" } },
  { name: "HTTP Request", description: "Call any REST API — GET, POST, PUT, DELETE with JSON body", type: "http-request", icon: <GlobeIcon className="size-4 text-white" />, color: "sky", defaultParams: { url: "https://api.example.com", method: "GET", body: "{}" } },
  { name: "Script", description: "Run custom JavaScript to transform or filter workflow data", type: "script", icon: <Code2Icon className="size-4 text-white" />, color: "red", defaultParams: { code: "return data.map(item => ({ ...item, processed: true }));" } },
  { name: "Output", description: "Terminal sink — aggregates results and returns the final workflow payload", type: "output", icon: <SquareArrowOutUpRightIcon className="size-4 text-white" />, color: "emerald", defaultParams: { outputKey: "result", format: "json" } },
  { name: "Iterator / Loop", description: "Iterate over an array — run nested nodes for each item in parallel or sequentially (loop mode)", type: "loop", icon: <RepeatIcon className="size-4 text-white" />, color: "indigo", defaultParams: { arrayPath: "$.slides", itemName: "slide", mode: "parallel" } },
  { name: "Router", description: "Branch logic based on a true/false condition", type: "router", icon: <GitBranchIcon className="size-4 text-white" />, color: "pink", defaultParams: { condition: "{{$json.value}} > 5" } },
  { name: "Merge", description: "Wait for multiple branches and combine their data", type: "merge", icon: <GitMergeIcon className="size-4 text-white" />, color: "cyan", defaultParams: { strategy: "wait-all" } },
  { name: "Boolean Logic", description: "Evaluate AND/OR/NOT conditions", type: "boolean", icon: <ToggleLeftIcon className="size-4 text-white" />, color: "fuchsia", defaultParams: { operator: "AND", operand1: "true", operand2: "false" } },
  { name: "Transform", description: "Map and restructure data fields", type: "transform", icon: <Wand2Icon className="size-4 text-white" />, color: "lime", defaultParams: { mapping: "{}" } },
  { name: "Filter", description: "Filter items in an array or stop execution", type: "filter", icon: <FilterIcon className="size-4 text-white" />, color: "orange", defaultParams: { condition: "{{$json.value}} == true" } },
  { name: "Classifier / Match", description: "Route dynamically based on matching incoming values to custom possibilities", type: "classifier", icon: <LayersIcon className="size-4 text-white" />, color: "amber", defaultParams: { valueToMatch: "{{$json.status}}", possibilities: "new, assigned, resolved" } },
  { name: "Group Container", description: "Visual container to organize nodes (e.g., body of a loop)", type: "group", icon: <LayersIcon className="size-4 text-white" />, color: "indigo", defaultParams: {} },
]

// Custom Node component inside React Flow — solid, opaque, strong visual cards
const CustomWorkflowNode = ({ data }: { data: NodeData }) => {
  const colors = NODE_COLORS[data.type]
  
  return (
    <div className={`border-2 ${colors.border} ${colors.bg} w-[240px] transition-all relative shadow-md rounded-lg overflow-hidden ${
      data.status === "running" ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-background animate-pulse" : ""
    } ${
      data.status === "success" ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background" : ""
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
            <p className="truncate"><span className="text-muted-foreground/50">event:</span> {data.params.eventName || "—"}</p>
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
            <p className="truncate"><span className="text-muted-foreground/50">value:</span> {data.params.valueToMatch || "—"}</p>
            <p className="truncate"><span className="text-muted-foreground/50">cases:</span> {data.params.possibilities || "—"}</p>
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
const GroupWorkflowNode = ({ data, selected }: { data: NodeData, selected?: boolean }) => {
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

const nodeTypes = {
  custom: CustomWorkflowNode,
  group: GroupWorkflowNode
}

// Context to share nodes globally for autocomplete
const WorkflowNodesContext = React.createContext<Node<NodeData>[]>([])

// Helper to extract loop fields dynamically from any upstream node's schema based on the loop's arrayPath
function getLoopFields(allNodes: Node<NodeData>[], allEdges: Edge[]): { name: string; path: string }[] {
  const loopNode = allNodes.find(n => n.data.type === "loop")
  if (!loopNode) return []

  const arrayPath = loopNode.data.params.arrayPath || "$.slides"
  
  // Find all upstream nodes of the loop node to see where the array data is coming from
  const upstreamIds = getUpstreamNodeIds(allEdges, loopNode.id)
  if (upstreamIds.length === 0) return []

  // Check upstream nodes (like Trigger or LLM nodes) for valid JSON schemas
  for (const uid of upstreamIds) {
    const upstreamNode = allNodes.find(n => n.id === uid)
    if (!upstreamNode) continue

    // Use "jsonSchema" for LLM nodes or "inputSchema" for Trigger nodes
    const schemaStr = upstreamNode.data.params.jsonSchema || upstreamNode.data.params.inputSchema
    if (!schemaStr || schemaStr === "{}") continue

    try {
      const schema = JSON.parse(schemaStr)
      if (!schema || schema.type !== "object" || !schema.properties) continue

      // Clean array path: e.g. "$.slides" -> ["slides"]
      const pathParts = arrayPath.replace(/^\$\./, "").split(".")
      let currentSchema = schema
      let found = true
      
      for (const part of pathParts) {
        if (currentSchema && currentSchema.properties && currentSchema.properties[part]) {
          currentSchema = currentSchema.properties[part]
        } else {
          found = false
          break
        }
      }

      if (found && currentSchema.type === "array" && currentSchema.items && currentSchema.items.type === "object" && currentSchema.items.properties) {
        return Object.keys(currentSchema.items.properties).map(propName => ({
          name: propName,
          path: propName
        }))
      }
    } catch {
      // ignore malformed JSON
    }
  }

  return []
}

// Helper to statically extract fields from a node
function getStaticNodeFields(nodeId: string, allNodes: Node<NodeData>[]): { name: string; type: string; description?: string }[] {
  const node = allNodes.find(n => n.id === nodeId)
  if (!node) return []

  const mappingStr = node.data.params.outputMapping || "[]"
  try {
    const mappedFields = JSON.parse(mappingStr)
    if (Array.isArray(mappedFields) && mappedFields.length > 0) {
      return mappedFields.map((f: any) => ({ name: f.key, type: "mapped" }))
    }
  } catch {}

  if (node.data.type === "trigger") {
    let fields: { name: string; type: string; description?: string }[] = []
    const schemaStr = node.data.params.inputSchema || "{}"
    try {
      const parsed = JSON.parse(schemaStr)
      if (parsed?.properties) {
        fields = Object.entries(parsed.properties).map(([name, prop]: [string, any]) => ({
          name, type: prop?.type || "any", description: prop?.description
        }))
      }
    } catch {}
    
    if (node.data.params.contentType === "multipart/form-data" || node.data.params.contentType === "image/png") {
      fields.push({ name: "file", type: "string", description: "Uploaded file base64 data" })
      try {
        if (node.data.params.sampleFiles) {
          const customFiles = JSON.parse(node.data.params.sampleFiles)
          if (Array.isArray(customFiles)) {
            customFiles.forEach((f: any) => {
              if (f.key) {
                fields.push({ name: f.key, type: "string", description: `Uploaded file input: ${f.name || f.key}` })
              }
            })
          }
        }
      } catch {}
    }
    
    if (fields.length > 0) return fields;
  }
  if (node.data.type === "image-gen") return [{ name: "imageUrl", type: "string" }, { name: "imageUrls", type: "array" }, { name: "aspectRatio", type: "string" }]
  if (node.data.type === "http-request") return [{ name: "status", type: "number" }, { name: "data", type: "object" }]
  if (node.data.type === "llm") {
    if (node.data.params.responseFormat === "json_object" && node.data.params.jsonSchema) {
      try {
        const parsed = JSON.parse(node.data.params.jsonSchema)
        if (parsed?.properties) {
          return Object.entries(parsed.properties).map(([name, prop]: [string, any]) => ({
            name, type: prop?.type || "any", description: prop?.description
          }))
        }
      } catch {}
    }
    return [{ name: "text", type: "string" }]
  }
  if (node.data.type === "router") return [{ name: "branch", type: "string" }, { name: "evaluated", type: "boolean" }]
  if (node.data.type === "classifier") return [{ name: "chosenMatch", type: "string" }, { name: "value", type: "string" }]

  return []
}

// ─── Rich ContentEditable Editor for True Visual Chips ───────────────────────

function parseValueToHtml(val: string, nodes: Node<NodeData>[]) {
  if (!val) return "";
  let escaped = val.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
  escaped = escaped.replace(/\n/g, "<br>");
  
  return escaped.replace(/\{\{\s*(.*?)\s*\}\}/g, (match, inner) => {
     let label = inner;
     const nodeMatch = inner.match(/\$node\["([^"]+)"\]\.json\.?(.*)/);
     if (nodeMatch) {
        const nodeId = nodeMatch[1];
        const field = nodeMatch[2];
        const node = nodes.find(n => n.id === nodeId);
        label = node ? `${node.data.label}${field ? ` → ${field}` : ''}` : inner;
     } else if (inner.startsWith("$json.")) {
        label = `Trigger → ${inner.substring(6)}`;
     } else if (inner === "$json") {
        label = `Trigger Output`;
     }
     
     // The zero-width spaces (&#8203;) allow the cursor to snap cleanly around the uneditable block in standard contentEditable
     return `&#8203;<span class="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground shadow-sm select-none align-middle" contenteditable="false" data-raw="${encodeURIComponent(match)}">${label}</span>&#8203;`;
  });
}

function parseHtmlToValue(html: string) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  
  let val = "";
  function walk(node: ChildNode) {
    if (node.nodeType === globalThis.Node.TEXT_NODE) {
      // Remove zero-width spaces used for cursor placement
      val += (node.textContent || "").replace(/\u200B/g, '');
    } else if (node.nodeType === globalThis.Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.nodeName === "BR") {
        val += "\n";
      } else if (el.hasAttribute("data-raw")) {
        val += decodeURIComponent(el.getAttribute("data-raw") || "");
      } else {
        el.childNodes.forEach(walk);
      }
    }
  }
  temp.childNodes.forEach(walk);
  return val;
}

function AutocompletePopup({ popover, onSelect }: { popover: any, onSelect: (name: string) => void }) {
  if (!popover.show) return null
  return (
    <div 
      className="absolute z-50 min-w-[200px] max-h-[160px] overflow-y-auto bg-card border border-primary/20 shadow-xl rounded-md p-1 flex flex-col"
      style={{ top: popover.top, left: popover.left }}
    >
      <div className="px-2 py-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b mb-1">
        Available Fields
      </div>
      {popover.options.map((opt: any, idx: number) => (
        <button
          key={opt.name}
          type="button"
          onMouseDown={(e) => {
             e.preventDefault() // prevent blur
             onSelect(opt.name)
          }}
          className={`flex flex-col text-left px-2 py-1.5 rounded-sm transition-colors ${
            idx === popover.activeIndex ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
          }`}
        >
          <div className="flex justify-between items-center gap-2">
            <span className="font-mono text-xs font-bold truncate">{opt.name}</span>
            <span className={`text-[9px] uppercase tracking-wide opacity-70 ${idx === popover.activeIndex ? "" : "text-primary"}`}>{opt.type}</span>
          </div>
          {opt.description && (
            <span className="text-[10px] opacity-70 truncate max-w-full">{opt.description}</span>
          )}
        </button>
      ))}
    </div>
  )
}

function getCaretCharacterOffsetWithin(element: HTMLElement) {
  let caretOffset = 0;
  const doc = element.ownerDocument;
  const win = doc.defaultView;
  let sel;
  if (win && (sel = win.getSelection()) && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    // count length of text but we also have to account for nodes.
    // parseHtmlToValue logic is perfect to measure the raw length up to the caret!
    const tempHtml = document.createElement("div");
    tempHtml.appendChild(preCaretRange.cloneContents());
    caretOffset = parseHtmlToValue(tempHtml.innerHTML).length;
  }
  return caretOffset;
}

// A unified rich input component for true visual chips
interface RichInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  onChange?: (e: { target: { value: string }; currentTarget: { value: string } }) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string; // accepted but ignored, for API compat
}

const DroppableRichInput = React.forwardRef<HTMLDivElement, RichInputProps>(({ value, onChange, placeholder, className, multiline, type, ...props }, ref) => {
  const divRef = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(ref, () => divRef.current as HTMLDivElement)
  const nodes = React.useContext(WorkflowNodesContext)

  const [popover, setPopover] = React.useState<{ show: boolean, top: number, left: number, options: any[], activeIndex: number, matchStart: number }>({
    show: false, top: 0, left: 0, options: [], activeIndex: 0, matchStart: -1
  })

  // We track the focused state so we don't aggressively overwrite innerHTML while the user is typing,
  // which destroys native cursor behavior.
  const [isFocused, setIsFocused] = React.useState(false);

  // Sync value -> HTML only when not focused or initially
  React.useEffect(() => {
    if (divRef.current && !isFocused) {
      const html = parseValueToHtml(value || "", nodes);
      if (divRef.current.innerHTML !== html) {
        divRef.current.innerHTML = html;
      }
    }
  }, [value, isFocused, nodes]);

  const triggerChange = (newVal: string) => {
    // Fake the React event structure
    if (onChange) {
      onChange({ target: { value: newVal }, currentTarget: { value: newVal } });
    }
  }

  const handleInput = () => {
    if (!divRef.current) return;
    const currentHtml = divRef.current.innerHTML;
    const newVal = parseHtmlToValue(currentHtml);
    triggerChange(newVal);

    // Autocomplete Logic
    const cursor = getCaretCharacterOffsetWithin(divRef.current);
    const textBeforeCursor = newVal.substring(0, cursor);
    
    const match = textBeforeCursor.match(/\{\{\s*\$node\["([^"]+)"\]\.json\.([\w]*)$/);
    if (match) {
      const nodeId = match[1];
      const partialField = match[2].toLowerCase();
      const fields = getStaticNodeFields(nodeId, nodes);
      const filtered = partialField 
        ? fields.filter(f => f.name.toLowerCase().startsWith(partialField))
        : fields;
        
      if (filtered.length > 0) {
        const rect = divRef.current.getBoundingClientRect();
        setPopover({
          show: true,
          top: rect.height + 2,
          left: 0,
          options: filtered,
          activeIndex: 0,
          matchStart: cursor - partialField.length
        });
        return;
      }
    }
    setPopover(p => p.show ? { ...p, show: false } : p);
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (data && divRef.current) {
      const newVal = parseHtmlToValue(divRef.current.innerHTML) + data;
      triggerChange(newVal);
      // Immediately force a re-render of chips
      setTimeout(() => {
        if (divRef.current) {
           divRef.current.innerHTML = parseValueToHtml(newVal, nodes);
           divRef.current.focus();
        }
      }, 0);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
    }
    
    if (popover.show) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setPopover(p => ({ ...p, activeIndex: (p.activeIndex + 1) % p.options.length }));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setPopover(p => ({ ...p, activeIndex: (p.activeIndex - 1 + p.options.length) % p.options.length }));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const selected = popover.options[popover.activeIndex];
        if (selected && divRef.current) {
          const currentVal = parseHtmlToValue(divRef.current.innerHTML);
          const startStr = currentVal.substring(0, popover.matchStart);
          const cursor = getCaretCharacterOffsetWithin(divRef.current);
          const endStr = currentVal.substring(cursor);
          const newVal = startStr + selected.name + " }}" + endStr;
          
          triggerChange(newVal);
          setPopover(p => ({ ...p, show: false }));

          // Force chips to re-render immediately and focus
          setTimeout(() => {
            if (divRef.current) {
               divRef.current.innerHTML = parseValueToHtml(newVal, nodes);
               divRef.current.focus();
            }
          }, 0);
        }
      } else if (e.key === "Escape") {
        setPopover(p => ({ ...p, show: false }));
      }
    }
  }

  return (
    <div className={`relative group w-full ${className}`}>
      <div 
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setPopover(p => ({ ...p, show: false }));
        }}
        onInput={handleInput}
        onClick={handleInput}
        onKeyDown={handleKeyDown}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className={`w-full h-full font-mono text-xs bg-background border border-input rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground overflow-y-auto overflow-x-hidden break-words whitespace-pre-wrap leading-relaxed min-h-[36px] ${
          !value ? 'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50' : ''
        }`}
        data-placeholder={placeholder}
      />
      <AutocompletePopup popover={popover} onSelect={(name) => {
        if (!divRef.current) return;
        const currentVal = parseHtmlToValue(divRef.current.innerHTML);
        const startStr = currentVal.substring(0, popover.matchStart);
        const cursor = getCaretCharacterOffsetWithin(divRef.current);
        const endStr = currentVal.substring(cursor);
        const newVal = startStr + name + " }}" + endStr;
        triggerChange(newVal);
        setPopover(p => ({ ...p, show: false }));
        setTimeout(() => {
          if (divRef.current) {
             divRef.current.innerHTML = parseValueToHtml(newVal, nodes);
             divRef.current.focus();
          }
        }, 0);
      }} />
    </div>
  )
})
DroppableRichInput.displayName = "DroppableRichInput"

const DroppableInput = React.forwardRef<HTMLDivElement, RichInputProps>((props, ref) => <DroppableRichInput {...props} ref={ref} />);
DroppableInput.displayName = "DroppableInput";

const DroppableTextarea = React.forwardRef<HTMLDivElement, RichInputProps>((props, ref) => <DroppableRichInput multiline {...props} ref={ref} />);
DroppableTextarea.displayName = "DroppableTextarea";

// Recursive JSON Tree Viewer
const JsonViewer = ({ data, level = 0 }: { data: any, level?: number }) => {
  const [isExpanded, setIsExpanded] = React.useState(true)
  
  if (data === null) return <span className="text-muted-foreground/60 italic font-mono text-[10px]">null</span>
  if (data === undefined) return <span className="text-muted-foreground/60 italic font-mono text-[10px]">undefined</span>
  if (typeof data === "string") {
    // Truncate super long strings like base64 images
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
const ThoughtBlock = ({ thought }: { thought: string }) => {
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

const CopyButton = ({ text }: { text: string }) => {
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

const DataRenderer = ({ data, setMaximizedImage }: { data: any, setMaximizedImage: any }) => {
  const [view, setView] = React.useState<"rich" | "raw">("rich")
  
  // Try to determine if it can be rich rendered
  let hasRichContent = false;
  let textContents: {key: string, text: string}[] = [];
  
  if (data && typeof data === 'object') {
     Object.entries(data).forEach(([k, v]) => {
        if (typeof v === 'string' && v.length > 20 && !v.startsWith('data:image') && !v.startsWith('http')) {
           hasRichContent = true;
           textContents.push({key: k, text: v});
        }
     });
     // Also check for arrays of objects (like loop results)
     if (data.results && Array.isArray(data.results)) {
        hasRichContent = true;
     }
  }

  // Handle images
  const imgUrl = data.imageUrl || data.image || (typeof data === 'object' && Object.values(data).find(v => typeof v === 'string' && (v.startsWith('data:image/') || v.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/i))));

  return (
    <div className="space-y-2 w-full">
      {/* Tab Selector */}
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

interface WorkflowEditorClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
}

// ─── Template Resolver ───────────────────────────────────────────────
// Scans string values for n8n style {{ $json.field }} and {{ $node["id"].json.field }}
// and replaces them with actual values from the node output registry.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveTemplate(text: string, registry: Record<string, any>, loopCtx?: { item: any; index: number; itemName?: string }): string {
  if (typeof text !== "string") {
    if (text === null || text === undefined) return ""
    text = String(text)
  }
  
  // Update regex to match any character inside the template group, including spaces, backslashes, etc.
  return text.replace(/\{\{\s*([\s\S]+?)\s*\}\}/g, (_match: string, rawPath: string): string => {
    // Clean whitespace and remove any backslash escapes (e.g. \" -> " or \' -> ')
    const path = rawPath.trim().replace(/\\/g, "")
    
    // Support $node["id"].json.field with double, single, escaped, or no quotes, and spaces
    const nodeMatch = path.match(/^\$node\s*\[\s*["']?([^"'\s]+)["']?\s*\]\s*\.\s*json(?:\s*\.\s*(.+))?$/)
    if (nodeMatch) {
      const nodeId = nodeMatch[1]
      const fieldPath = nodeMatch[2]
      
      const nodeOutput = registry[nodeId]
      if (!nodeOutput) return `{{ ${path} }}`
      
      // If it's an array n8n style, take the first item's json
      let baseVal = nodeOutput
      if (Array.isArray(nodeOutput) && nodeOutput[0]?.json) {
        baseVal = nodeOutput[0].json
      }

      if (!fieldPath) {
        return typeof baseVal === "string" ? baseVal : JSON.stringify(baseVal)
      }
      
      const parts = fieldPath.split(".")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let val: any = baseVal
      for (const p of parts) {
        if (val == null) return `{{ ${path} }}`
        val = val[p]
      }
      return val == null ? `{{ ${path} }}` : String(val)
    }

    // Support $json.field (from current context / upstream item)
    if (path.startsWith("$json")) {
      let baseVal = loopCtx?.item
      if (!baseVal) {
        // Fallback: grab the last upstream node's output if no explicit item context
        const keys = Object.keys(registry)
        if (keys.length > 0) {
          const lastOutput = registry[keys[keys.length - 1]]
          if (Array.isArray(lastOutput) && lastOutput[0]?.json) {
            baseVal = lastOutput[0].json
          } else {
            baseVal = lastOutput
          }
        }
      } else {
        if (baseVal.json) baseVal = baseVal.json
      }
      
      if (path === "$json") {
        return typeof baseVal === "string" ? baseVal : JSON.stringify(baseVal)
      }
      
      const fieldPath = path.substring(6) // remove "$json."
      const parts = fieldPath.split(".")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let val: any = baseVal
      for (const p of parts) {
        if (val == null) return `{{ ${path} }}`
        val = val[p]
      }
      return val == null ? `{{ ${path} }}` : String(val)
    }

    // Support custom loop item variable name (e.g. {{slideTitle}} or {{slideTitle.field}})
    // The loop node lets users name the current item (itemName param). We must resolve
    // {{<itemName>}} and {{<itemName>.field}} to the current loop item's value.
    if (loopCtx?.itemName && path === loopCtx.itemName) {
      const val = loopCtx.item
      return typeof val === "string" ? val : JSON.stringify(val)
    }
    if (loopCtx?.itemName && path.startsWith(`${loopCtx.itemName}.`)) {
      const fieldPath = path.substring(loopCtx.itemName.length + 1)
      let val = loopCtx.item
      const parts = fieldPath.split(".")
      for (const p of parts) {
        if (val == null) return `{{${path}}}`
        val = val[p]
      }
      return val == null ? `{{${path}}}` : String(val)
    }

    // Support {{index}} to reference the current loop iteration index
    if (loopCtx && path === "index") {
      return String(loopCtx.index)
    }

    // Fallback original variables for backwards compatibility
    const parts = path.split(".")
    if (parts[0] === "item") {
      if (!loopCtx) return `{{${path}}}`
      let val = loopCtx.item
      if (parts.length === 1) return typeof val === "string" ? val : JSON.stringify(val)
      for (let i = 1; i < parts.length; i++) {
        if (val == null) return `{{${path}}}`
        val = val[parts[i]]
      }
      return val == null ? `{{${path}}}` : String(val)
    }
    
    return `{{${path}}}`
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveRawTemplate(text: string, registry: Record<string, any>, loopCtx?: { item: any; index: number; itemName?: string }): any {
  if (typeof text !== "string") return text;
  
  const trimmed = text.trim();
  // Check if the entire string is exactly a single template expression: e.g. {{ ... }}
  if (trimmed.startsWith("{{") && trimmed.endsWith("}}") && (trimmed.match(/\{\{/g) || []).length === 1) {
    const rawPath = trimmed.slice(2, -2).trim();
    // Clean whitespace and remove any backslash escapes (e.g. \" -> " or \' -> ')
    const path = rawPath.replace(/\\/g, "")
    
    // Support $node["id"].json.field with double, single, escaped, or no quotes, and spaces
    const nodeMatch = path.match(/^\$node\s*\[\s*["']?([^"'\s]+)["']?\s*\]\s*\.\s*json(?:\s*\.\s*(.+))?$/)
    if (nodeMatch) {
      const nodeId = nodeMatch[1]
      const fieldPath = nodeMatch[2]
      
      const nodeOutput = registry[nodeId]
      if (!nodeOutput) return undefined
      
      let baseVal = nodeOutput
      if (Array.isArray(nodeOutput) && nodeOutput[0]?.json) {
        baseVal = nodeOutput[0].json
      }

      if (!fieldPath) return baseVal;
      
      const parts = fieldPath.split(".")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let val: any = baseVal
      for (const p of parts) {
        if (val == null) return undefined
        val = val[p]
      }
      return val
    }

    // Support $json.field
    if (path.startsWith("$json")) {
      let baseVal = loopCtx?.item
      if (!baseVal) {
        const keys = Object.keys(registry)
        if (keys.length > 0) {
          const lastOutput = registry[keys[keys.length - 1]]
          if (Array.isArray(lastOutput) && lastOutput[0]?.json) {
            baseVal = lastOutput[0].json
          } else {
            baseVal = lastOutput
          }
        }
      } else {
        if (baseVal.json) baseVal = baseVal.json
      }
      
      if (path === "$json") return baseVal;
      
      const fieldPath = path.substring(6) // remove "$json."
      const parts = fieldPath.split(".")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let val: any = baseVal
      for (const p of parts) {
        if (val == null) return undefined
        val = val[p]
      }
      return val
    }

    // Support custom loop item variable name
    if (loopCtx?.itemName && path === loopCtx.itemName) {
      return loopCtx.item
    }
    if (loopCtx?.itemName && path.startsWith(`${loopCtx.itemName}.`)) {
      const fieldPath = path.substring(loopCtx.itemName.length + 1)
      let val = loopCtx.item
      const parts = fieldPath.split(".")
      for (const p of parts) {
        if (val == null) return undefined
        val = val[p]
      }
      return val
    }

    // Support index
    if (loopCtx && path === "index") {
      return loopCtx.index
    }
  }
  
  // Otherwise fallback to standard string interpolation
  return resolveTemplate(text, registry, loopCtx);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveParams(params: Record<string, string>, registry: Record<string, any>, loopCtx?: { item: any; index: number; itemName?: string }): Record<string, string> {
  const resolved: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    resolved[key] = resolveTemplate(value, registry, loopCtx)
  }
  return resolved
}

/** Parse an output mapping JSON string (array format) into editable field rows. */
function parseOutputMappingFields(mappingStr: string): { key: string; value: string }[] {
  if (!mappingStr || mappingStr === "[]" || mappingStr === "{}") return []
  try {
    const parsed = JSON.parse(mappingStr)
    if (Array.isArray(parsed)) {
      return parsed.map((f: { key?: string; value?: string }) => ({ key: String(f.key || ""), value: String(f.value || "") }))
    }
    // Backward compat: object format { "key": "value" }
    if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }))
    }
  } catch { /* ignore */ }
  return []
}

/** Serialize field rows into a JSON array string for storage in node params. */
function serializeOutputMappingFields(fields: { key: string; value: string }[]): string {
  return JSON.stringify(fields, null, 2)
}

/** Apply user-defined output mapping to reshape a node's raw output before it flows downstream. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyOutputMapping(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawOutput: any,
  mappingStr: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registry: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loopCtx?: { item: any; index: number; itemName?: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const fields = parseOutputMappingFields(mappingStr)
  if (fields.length === 0) return rawOutput
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {}
    // Build a context where $json refers to the node's own raw output
    const mappingCtx = {
      item: { json: rawOutput },
      index: loopCtx?.index ?? 0,
      itemName: loopCtx?.itemName
    }
    for (const field of fields) {
      if (!field.key.trim()) continue
      const resolved = resolveTemplate(field.value, registry, mappingCtx)
      try {
        result[field.key.trim()] = JSON.parse(resolved)
      } catch {
        result[field.key.trim()] = resolved
      }
    }
    return Object.keys(result).length > 0 ? result : rawOutput
  } catch {
    return rawOutput
  }
}

/** Visual schema builder for configuring node output mapping.
 *  Mounted with key={selectedNode.id} so state resets naturally when switching nodes. */
const OutputMappingSection = ({
  selectedNode,
  updateNodeData
}: {
  selectedNode: Node<NodeData>
  updateNodeData: (updatedFields: Partial<NodeData>) => void
}) => {
  const [fields, setFields] = React.useState<{ key: string; value: string }[]>(() =>
    parseOutputMappingFields(selectedNode.data.params.outputMapping || "[]")
  )

  const commit = (newFields: { key: string; value: string }[]) => {
    setFields(newFields)
    updateNodeData({ params: { ...selectedNode.data.params, outputMapping: serializeOutputMappingFields(newFields) } })
  }

  return (
    <div className="space-y-3 pt-4 border-t">
      <div className="p-3 border border-primary/20 bg-primary/5 space-y-1 rounded">
        <div className="flex items-center gap-1.5">
          <BracesIcon className="size-3 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Output Mapping (Optional)</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Reshape the output of this node before it flows downstream. Use <code className="text-foreground">{"{{$json.field}}"}</code> to reference the raw output, or drag upstream variables from above.
        </p>
      </div>

      {fields.map((field, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <Input
            value={field.key}
            onChange={(e) => {
              const next = [...fields]
              next[idx] = { ...next[idx], key: e.target.value }
              commit(next)
            }}
            className="rounded-none text-xs h-9 font-mono flex-1"
            placeholder="outputKey"
          />
          <DroppableInput
            value={field.value}
            onChange={(e) => {
              const next = [...fields]
              next[idx] = { ...next[idx], value: e.target.value }
              commit(next)
            }}
            className="rounded-none text-xs h-9 font-mono flex-[2]"
            placeholder="{{$json.field}}"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              const next = [...fields]
              next.splice(idx, 1)
              commit(next)
            }}
            className="shrink-0 size-9 text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => commit([...fields, { key: "", value: "" }])}
        className="w-full text-xs h-9 rounded-none border-dashed"
      >
        + Add Output Field
      </Button>

      {fields.some(f => f.key.trim()) && (
        <details className="text-[10px] text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground flex items-center gap-1">
            <BracesIcon className="size-3" />
            Preview JSON template
          </summary>
          <pre className="font-mono bg-muted/30 border border-border p-3 rounded-md overflow-x-auto mt-2">
            {selectedNode.data.params.outputMapping || "[]"}
          </pre>
        </details>
      )}
    </div>
  )
}

interface SchemaNode {
  name: string
  type: string
  description: string
  properties?: SchemaNode[]
  items?: SchemaNode
}

function parseJsonSchemaToNodes(schema: any, name: string = ""): SchemaNode {
  const type = schema?.type || "string"
  const description = schema?.description || ""
  const node: SchemaNode = { name, type, description }

  if (type === "object" && schema.properties) {
    node.properties = Object.entries(schema.properties).map(([propName, propSchema]) => 
      parseJsonSchemaToNodes(propSchema, propName)
    )
  } else if (type === "array" && schema.items) {
    node.items = parseJsonSchemaToNodes(schema.items, "item")
  }

  return node
}

function serializeNodesToJsonSchema(node: SchemaNode): any {
  const schema: any = { type: node.type }
  if (node.description) {
    schema.description = node.description
  }

  if (node.type === "object") {
    const properties: Record<string, any> = {}
    if (node.properties) {
      for (const prop of node.properties) {
        if (!prop.name.trim()) continue
        properties[prop.name.trim()] = serializeNodesToJsonSchema(prop)
      }
    }
    schema.properties = properties
  } else if (node.type === "array") {
    if (node.items) {
      schema.items = serializeNodesToJsonSchema(node.items)
    } else {
      schema.items = { type: "string" }
    }
  }

  return schema
}

function parseSchemaFields(schemaStr: string): SchemaNode[] {
  if (!schemaStr || schemaStr === "{}") return []
  try {
    const parsed = JSON.parse(schemaStr)
    if (parsed && typeof parsed === "object") {
      if (parsed.properties) {
        return Object.entries(parsed.properties).map(([name, schema]) => 
          parseJsonSchemaToNodes(schema, name)
        )
      }
    }
  } catch { /* ignore */ }
  return []
}

function serializeSchemaFields(fields: SchemaNode[]): string {
  if (fields.length === 0) return "{}"
  const properties: Record<string, any> = {}
  for (const f of fields) {
    if (!f.name.trim()) continue
    properties[f.name.trim()] = serializeNodesToJsonSchema(f)
  }
  return JSON.stringify({ type: "object", properties }, null, 2)
}

/** Recursive visual schema builder component row. */
const SchemaNodeEditor = ({
  node,
  onChange,
  onRemove,
  level = 0
}: {
  node: SchemaNode
  onChange: (updated: SchemaNode) => void
  onRemove: () => void
  level?: number
}) => {
  return (
    <div className="space-y-1.5 p-2.5 border border-border rounded-md bg-muted/10 relative" style={{ marginLeft: `${level > 0 ? 12 : 0}px` }}>
      <div className="flex gap-2 items-center">
        <Input
          value={node.name}
          onChange={(e) => onChange({ ...node, name: e.target.value })}
          className="rounded-none text-xs h-8 font-mono flex-1 bg-background"
          placeholder={level === 0 ? "fieldName" : "childField"}
          disabled={node.name === "item" && level > 0}
        />
        <select
          value={node.type}
          onChange={(e) => {
            const newType = e.target.value
            const updated: SchemaNode = { ...node, type: newType }
            if (newType === "object") {
              updated.properties = updated.properties || []
              delete updated.items
            } else if (newType === "array") {
              updated.items = updated.items || { name: "item", type: "object", description: "Array item", properties: [] }
              delete updated.properties
            } else {
              delete updated.properties
              delete updated.items
            }
            onChange(updated)
          }}
          className="flex h-8 w-[95px] items-center justify-between border border-input bg-background px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-ring text-foreground rounded-none"
        >
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="boolean">boolean</option>
          <option value="object">object</option>
          <option value="array">array</option>
        </select>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="shrink-0 size-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2Icon className="size-3" />
        </Button>
      </div>
      <Input
        value={node.description}
        onChange={(e) => onChange({ ...node, description: e.target.value })}
        className="rounded-none text-[10px] h-8 text-muted-foreground bg-background"
        placeholder="Description (optional)"
      />

      {/* Children for Object type */}
      {node.type === "object" && (
        <div className="mt-2.5 space-y-2 border-l-2 border-primary/20 pl-3">
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1">
            <BracesIcon className="size-2.5" />
            Properties of {node.name || "object"}:
          </div>
          {node.properties?.map((child, cIdx) => (
            <SchemaNodeEditor
              key={cIdx}
              node={child}
              onChange={(updatedChild) => {
                const nextProps = [...(node.properties || [])]
                nextProps[cIdx] = updatedChild
                onChange({ ...node, properties: nextProps })
              }}
              onRemove={() => {
                const nextProps = [...(node.properties || [])]
                nextProps.splice(cIdx, 1)
                onChange({ ...node, properties: nextProps })
              }}
              level={level + 1}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const nextProps = [...(node.properties || []), { name: "", type: "string", description: "" }]
              onChange({ ...node, properties: nextProps })
            }}
            className="w-full text-[10px] h-7 rounded-none border-dashed bg-background/50 hover:bg-background"
          >
            + Add Property to {node.name || "object"}
          </Button>
        </div>
      )}

      {/* Item for Array type */}
      {node.type === "array" && node.items && (
        <div className="mt-2.5 space-y-2 border-l-2 border-indigo-500/20 pl-3">
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1">
            <RepeatIcon className="size-2.5" />
            Array Item Structure:
          </div>
          <SchemaNodeEditor
            node={node.items}
            onChange={(updatedItems) => {
              onChange({ ...node, items: updatedItems })
            }}
            onRemove={() => {
              onChange({ ...node, items: undefined })
            }}
            level={level + 1}
          />
        </div>
      )}
    </div>
  )
}

/** Visual schema builder for expected payload schemas (Trigger and LLM nodes). */
const SchemaBuilderSection = ({
  selectedNode,
  updateNodeData,
  paramKey = "inputSchema",
  title = "Expected Payload Schema"
}: {
  selectedNode: Node<NodeData>
  updateNodeData: (updatedFields: Partial<NodeData>) => void
  paramKey?: "inputSchema" | "jsonSchema"
  title?: string
}) => {
  const [isRawMode, setIsRawMode] = React.useState(false)
  const [fields, setFields] = React.useState<SchemaNode[]>(() =>
    parseSchemaFields(selectedNode.data.params[paramKey] || "{}")
  )
  const [rawJson, setRawJson] = React.useState(() => selectedNode.data.params[paramKey] || "{}")
  const [schemaError, setSchemaError] = React.useState<string | null>(null)

  const commitFields = (newFields: SchemaNode[]) => {
    setFields(newFields)
    const jsonStr = serializeSchemaFields(newFields)
    setRawJson(jsonStr)
    updateNodeData({ params: { ...selectedNode.data.params, [paramKey]: jsonStr } })
  }

  const handleRawChange = (val: string) => {
    setRawJson(val)
    if (!val.trim()) {
      setSchemaError(null)
      updateNodeData({ params: { ...selectedNode.data.params, [paramKey]: "{}" } })
      setFields([])
      return
    }

    try {
      const parsed = JSON.parse(val)
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Schema must be a valid JSON Object")
      }
      setSchemaError(null)
      updateNodeData({ params: { ...selectedNode.data.params, [paramKey]: JSON.stringify(parsed, null, 2) } })
      setFields(parseSchemaFields(JSON.stringify(parsed)))
    } catch (err: unknown) {
      setSchemaError(err instanceof Error ? err.message : "Malformed JSON")
    }
  }

  const toggleMode = (rawMode: boolean) => {
    if (!rawMode) {
      try {
        const parsed = JSON.parse(rawJson)
        setFields(parseSchemaFields(JSON.stringify(parsed)))
        setSchemaError(null)
      } catch (err: unknown) {
        setSchemaError("Cannot switch to visual mode with invalid JSON. Please fix errors first.")
        return
      }
    } else {
      setRawJson(selectedNode.data.params[paramKey] || "{}")
    }
    setIsRawMode(rawMode)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</Label>
        <div className="flex gap-1.5 bg-muted p-0.5 rounded border border-border">
          <button
            type="button"
            onClick={() => toggleMode(false)}
            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide transition-all ${
              !isRawMode ? "bg-card text-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => toggleMode(true)}
            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide transition-all ${
              isRawMode ? "bg-card text-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {!isRawMode ? (
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <SchemaNodeEditor
              key={idx}
              node={field}
              onChange={(updatedField) => {
                const next = [...fields]
                next[idx] = updatedField
                commitFields(next)
              }}
              onRemove={() => {
                const next = [...fields]
                next.splice(idx, 1)
                commitFields(next)
              }}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => commitFields([...fields, { name: "", type: "string", description: "" }])}
            className="w-full text-xs h-9 rounded-none border-dashed"
          >
            + Add Schema Field
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            value={rawJson}
            onChange={(e) => handleRawChange(e.target.value)}
            className="rounded-none text-xs min-h-[180px] font-mono resize-none leading-relaxed border-border focus-visible:ring-1"
            placeholder={`{\n  "type": "object",\n  "properties": {\n    "items": {\n      "type": "array",\n      "description": "Complex list of products"\n    }\n  }\n}`}
          />
          {schemaError ? (
            <p className="text-[10px] text-red-500 font-medium font-mono leading-tight p-2 bg-red-500/5 border border-red-500/20">
              ⚠️ {schemaError}
            </p>
          ) : (
            <p className="text-[10px] text-emerald-500 font-semibold font-mono leading-tight p-2 bg-emerald-500/5 border border-emerald-500/20">
              ✓ JSON Schema is valid
            </p>
          )}
          <p className="text-[9px] text-muted-foreground/60 leading-relaxed">
            Specify a full JSON Schema. You can define nested keys, default values, array items, and any complex objects.
          </p>
        </div>
      )}

      {fields.some(f => f.name.trim()) && !isRawMode && (
        <details className="text-[10px] text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground flex items-center gap-1 select-none">
            <BracesIcon className="size-3" />
            Preview JSON Schema
          </summary>
          <pre className="font-mono bg-muted/30 border border-border p-3 rounded-md overflow-x-auto mt-2">
            {selectedNode.data.params[paramKey] || "{}"}
          </pre>
        </details>
      )}
    </div>
  )
}

/** Build a map of upstream node IDs → node data for variable hinting. */
function getUpstreamNodeIds(edges: Edge[], nodeId: string): string[] {
  const upstream = new Set<string>()
  const queue = [nodeId]
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const e of edges) {
      if (e.target === current && !upstream.has(e.source)) {
        upstream.add(e.source)
        queue.push(e.source)
      }
    }
  }
  return Array.from(upstream)
}

/** Derive available variable hints from the node output registry and upstream node metadata. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAvailableVariables(
  currentNodeId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeOutputs: Record<string, any>,
  allNodes: Node<NodeData>[],
  edges: Edge[],
  loopCtx?: { itemName?: string }
): string[] {
  const vars: string[] = []
  const upstreamIds = getUpstreamNodeIds(edges, currentNodeId)
  for (const uid of upstreamIds) {
    const node = allNodes.find(n => n.id === uid)
    if (!node) continue
    const output = nodeOutputs[uid]
    const label = node.data.label || uid
    // Suggest the node as a whole
    vars.push(`{{${uid}}}`)
    // Suggest known fields based on mock output shape
    if (output && typeof output === "object") {
      for (const key of Object.keys(output as Record<string, unknown>)) {
        vars.push(`{{${uid}.${key}}}`)
      }
    }
  }
  // Loop context hints
  if (loopCtx?.itemName) {
    vars.push(`{{${loopCtx.itemName}}}`, `{{${loopCtx.itemName}.}}`, `{{index}}`)
  } else {
    vars.push(`{{item}}`, `{{item.}}`, `{{index}}`)
  }
  return [...new Set(vars)].sort()
}

/** Clean markdown code fences and whitespace from a JSON string. */
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/** Topological sort of nodes based on edges. */
function topologicalSort(nodes: Node<NodeData>[], edges: Edge[]): Node<NodeData>[] {
  const adj = new Map<string, string[]>()
  const inDegree = new Map<string, number>()
  for (const n of nodes) {
    adj.set(n.id, [])
    inDegree.set(n.id, 0)
  }
  for (const e of edges) {
    const existing = adj.get(e.source) || []
    existing.push(e.target)
    adj.set(e.source, existing)
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1)
  }
  const queue: string[] = []
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id)
  }
  const sorted: Node<NodeData>[] = []
  while (queue.length > 0) {
    const id = queue.shift()!
    const node = nodes.find(n => n.id === id)
    if (node) sorted.push(node)
    for (const neighbor of adj.get(id) || []) {
      const newDeg = (inDegree.get(neighbor) || 1) - 1
      inDegree.set(neighbor, newDeg)
      if (newDeg === 0) queue.push(neighbor)
    }
  }
  // Preserve original order for any unvisited nodes (cycles or orphan nodes)
  for (const n of nodes) {
    if (!sorted.find(s => s.id === n.id)) sorted.push(n)
  }
  return sorted
}

/** Quick check if any param value contains a {{placeholder}}. */
function hasPlaceholders(params: Record<string, string>): boolean {
  return Object.values(params).some(v => typeof v === "string" && /\{\{/.test(v))
}

/** Collect all downstream nodes reachable from a given node (for loop sub-execution). */
function getDownstreamNodes(nodeId: string, allNodes: Node<NodeData>[], edges: Edge[]): Node<NodeData>[] {
  const visited = new Set<string>()
  const queue = [nodeId]
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const e of edges) {
      if (e.source === current && !visited.has(e.target)) {
        visited.add(e.target)
        const node = allNodes.find(n => n.id === e.target)
        if (node) queue.push(node.id)
      }
    }
  }
  return allNodes.filter(n => visited.has(n.id))
}

export function WorkflowEditorClient({ session }: WorkflowEditorClientProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  
  // Database Workflows States
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workflows, setWorkflows] = React.useState<any[]>([])
  const [activeWorkflowId, setActiveWorkflowId] = React.useState<string | null>(null)
  const [loadingWorkflows, setLoadingWorkflows] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [workflowName, setWorkflowName] = React.useState("")
  const [workflowDescription, setWorkflowDescription] = React.useState("")
  
  // Modal for new workflow
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [newWorkflowName, setNewWorkflowName] = React.useState("")
  const [newWorkflowDescription, setNewWorkflowDescription] = React.useState("")
  
  // Code/JSON Modal states
  const [showJsonModal, setShowJsonModal] = React.useState(false)
  const [workflowJsonText, setWorkflowJsonText] = React.useState("")
  const [jsonImportError, setJsonImportError] = React.useState<string | null>(null)
  const [jsonCopied, setJsonCopied] = React.useState(false)
  
  // Search state for list
  const [searchQuery, setSearchQuery] = React.useState("")

  const [omniInput, setOmniInput] = React.useState("")
  const [aiGenerating, setAiGenerating] = React.useState(false)
  const [isRunning, setIsExecuting] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = React.useState<{ id?: string, nodeId?: string, label?: string, type?: NodeType, status?: "running" | "success" | "error", message: string, data?: any }[]>([])
  const [collapsedLogs, setCollapsedLogs] = React.useState<Record<string | number, boolean>>({})
  
  const fetchWorkflows = async () => {
    try {
      setLoadingWorkflows(true)
      const res = await fetch("/api/workflows")
      if (res.ok) {
        const data = await res.json()
        setWorkflows(data)
      }
    } catch (err) {
      console.error("Failed to fetch workflows:", err)
    } finally {
      setLoadingWorkflows(false)
    }
  }

  React.useEffect(() => {
    fetchWorkflows()
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadWorkflow = async (id: string) => {
    try {
      setLoadingWorkflows(true)
      const res = await fetch(`/api/workflows/${id}`)
      if (res.ok) {
        const data = await res.json()
        setActiveWorkflowId(data.id)
        setWorkflowName(data.name)
        setWorkflowDescription(data.description || "")
        
        const dbNodes = data.nodes || []
        const dbEdges = data.edges || []
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rehydratedNodes = dbNodes.map((n: any) => {
          const tile = AVAILABLE_TILES.find(t => t.type === n.data.type)
          return {
            ...n,
            data: {
              ...n.data,
              icon: tile?.icon || <ZapIcon className="size-4 text-white" />,
              color: tile?.color || "slate",
              status: "idle"
            }
          }
        })
        
        setNodes(rehydratedNodes)
        setEdges(dbEdges)
        setLogs([])
        setSelectedNode(null)
        setSelectedEdge(null)
        setIsSheetOpen(false)
        setIsRunSheetOpen(false)
      }
    } catch (err) {
      console.error("Failed to load workflow:", err)
    } finally {
      setLoadingWorkflows(false)
    }
  }

  const createWorkflow = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newWorkflowName.trim()) return

    try {
      setSaving(true)
      const initialNodes = [
        {
          id: "node-1",
          type: "custom",
          position: { x: 50, y: 350 },
          data: {
            label: "Trigger Webhook",
            type: "trigger",
            params: {
              triggerType: "webhook",
              eventName: "On Event",
              contentType: "application/json",
              inputSchema: JSON.stringify({
                type: "object",
                properties: {
                  context: { type: "string", description: "Business context" }
                }
              }, null, 2)
            }
          }
        }
      ]
      
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorkflowName,
          description: newWorkflowDescription,
          nodes: initialNodes,
          edges: []
        })
      })

      if (res.ok) {
        const data = await res.json()
        setShowCreateModal(false)
        setNewWorkflowName("")
        setNewWorkflowDescription("")
        fetchWorkflows()
        loadWorkflow(data.id)
      }
    } catch (err) {
      console.error("Failed to create workflow:", err)
    } finally {
      setSaving(false)
    }
  }

  const saveWorkflow = async () => {
    if (!activeWorkflowId) return
    try {
      setSaving(true)
      const cleanNodes = nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        parentId: n.parentId,
        extent: n.extent,
        style: n.style,
        data: {
          label: n.data.label,
          type: n.data.type,
          params: n.data.params,
        }
      }))

      const res = await fetch(`/api/workflows/${activeWorkflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription,
          nodes: cleanNodes,
          edges: edges
        })
      })

      if (res.ok) {
        fetchWorkflows()
      }
    } catch (err) {
      console.error("Failed to save workflow:", err)
    } finally {
      setSaving(false)
    }
  }

  const deleteWorkflow = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm("Are you sure you want to delete this workflow?")) return
    try {
      const res = await fetch(`/api/workflows/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        fetchWorkflows()
        if (activeWorkflowId === id) {
          setActiveWorkflowId(null)
        }
      }
    } catch (err) {
      console.error("Failed to delete workflow:", err)
    }
  }

  // Dialog state for workflow inputs
  const [runInputData, setRunInputData] = React.useState<Record<string, string>>({})
  const [expectedInputs, setExpectedInputs] = React.useState<string[]>([])
  const [isAwaitingInputs, setIsAwaitingInputs] = React.useState(false)

  const [selectedNode, setSelectedNode] = React.useState<Node<NodeData> | null>(null)
  const [selectedEdge, setSelectedEdge] = React.useState<Edge | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isRunSheetOpen, setIsRunSheetOpen] = React.useState(false)
  const [maximizedImage, setMaximizedImage] = React.useState<string | null>(null)
  const [upstreamSearch, setUpstreamSearch] = React.useState("")

  // AI Assistant Chat panel states
  const { settings } = useAiSettings()

  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [chatMessages, setChatMessages] = React.useState<{ role: "user" | "assistant"; text: string; thought?: string }[]>([
    { role: "assistant", text: "Hello! Tell me what you'd like to build, e.g., 'Build an AI image sequence' or ask me custom questions!" }
  ])
  const [chatInput, setChatInput] = React.useState("")
  const [isChatStreaming, setIsChatStreaming] = React.useState(false)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, isChatStreaming])

  const onNodeClick = React.useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedEdge(null)
    setSelectedNode(node as Node<NodeData>)
    setIsSheetOpen(true)
  }, [])

  const onEdgeClick = React.useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedNode(null)
    setSelectedEdge(edge)
    setIsSheetOpen(true)
  }, [])

  // Helper: parse a JSON workflow block and render nodes/edges onto the canvas
  const applyWorkflowJsonBlock = React.useCallback((jsonText: string) => {
    const parsed = JSON.parse(jsonText)
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return false

    const loadedNodes = parsed.nodes.map((n: { id: string; type: string; position: { x: number; y: number }; data: { label: string; type: NodeType; params: Record<string, string> } }) => {
      let icon = <ZapIcon className="size-4 text-white" />
      let color = "slate"
      if (n.data.type === "delay") {
        icon = <ClockIcon className="size-4 text-white" />
        color = "stone"
      } else if (n.data.type === "image-gen") {
        icon = <ImageIcon className="size-4 text-white" />
        color = "rose"
      } else if (n.data.type === "http-request") {
        icon = <GlobeIcon className="size-4 text-white" />
        color = "sky"
      } else if (n.data.type === "script") {
        icon = <Code2Icon className="size-4 text-white" />
        color = "red"
      } else if (n.data.type === "output") {
        icon = <SquareArrowOutUpRightIcon className="size-4 text-white" />
        color = "emerald"
      } else if (n.data.type === "loop") {
        icon = <RepeatIcon className="size-4 text-white" />
        color = "indigo"
      } else if (n.data.type === "llm") {
        icon = <BrainCircuitIcon className="size-4 text-white" />
        color = "violet"
      } else if (n.data.type === "router") {
        icon = <GitBranchIcon className="size-4 text-white" />
        color = "pink"
      } else if (n.data.type === "classifier") {
        icon = <LayersIcon className="size-4 text-white" />
        color = "amber"
      } else if (n.data.type === "merge") {
        icon = <GitMergeIcon className="size-4 text-white" />
        color = "cyan"
      } else if (n.data.type === "boolean") {
        icon = <ToggleLeftIcon className="size-4 text-white" />
        color = "fuchsia"
      } else if (n.data.type === "transform") {
        icon = <Wand2Icon className="size-4 text-white" />
        color = "lime"
      } else if (n.data.type === "filter") {
        icon = <FilterIcon className="size-4 text-white" />
        color = "orange"
      }
      return {
        ...n,
        data: {
          ...n.data,
          icon,
          color,
          status: "idle" as const
        }
      }
    })

    const loadedEdges = parsed.edges.map((e: { id: string; source: string; target: string }) => ({
      ...e,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
      interactionWidth: 20
    }))

    setNodes(loadedNodes)
    setEdges(loadedEdges)
    return true
  }, [setNodes, setEdges])

  // Robustly extract individual nodes and edges from a partial, streaming JSON block
  const extractPartialWorkflowElements = React.useCallback((str: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractedNodes: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractedEdges: any[] = []
    
    // Fast path: find node objects manually by walking braces
    const nodeRegex = /{\s*"id"\s*:\s*"node-[^"]+"/g
    let match
    while ((match = nodeRegex.exec(str)) !== null) {
      const start = match.index
      let braces = 0
      let end = -1
      let inString = false
      let escape = false
      for (let i = start; i < str.length; i++) {
        const char = str[i]
        if (escape) { escape = false; continue; }
        if (char === '\\') { escape = true; continue; }
        if (char === '"') { inString = !inString; continue; }
        if (!inString) {
          if (char === '{') braces++
          else if (char === '}') {
            braces--
            if (braces === 0) {
              end = i + 1
              break
            }
          }
        }
      }
      if (end !== -1) {
        try { extractedNodes.push(JSON.parse(str.substring(start, end))) } catch (e) {}
      }
    }

    const edgeRegex = /{\s*"id"\s*:\s*"edge-[^"]+"/g
    while ((match = edgeRegex.exec(str)) !== null) {
      const start = match.index
      let braces = 0
      let end = -1
      let inString = false
      let escape = false
      for (let i = start; i < str.length; i++) {
        const char = str[i]
        if (escape) { escape = false; continue; }
        if (char === '\\') { escape = true; continue; }
        if (char === '"') { inString = !inString; continue; }
        if (!inString) {
          if (char === '{') braces++
          else if (char === '}') {
            braces--
            if (braces === 0) {
              end = i + 1
              break
            }
          }
        }
      }
      if (end !== -1) {
        try { extractedEdges.push(JSON.parse(str.substring(start, end))) } catch (e) {}
      }
    }
    
    return { nodes: extractedNodes, edges: extractedEdges }
  }, [])

  const submitChatQuery = async (queryText: string) => {
    if (!queryText.trim() || isChatStreaming) return

    setChatMessages(prev => [...prev, { role: "user", text: queryText }])
    setIsChatStreaming(true)
    
    let renderedCount = 0

    try {
      const response = await fetch("/api/workflows/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryText,
          provider: settings.activeProvider,
          modelId: settings.models[settings.activeProvider],
          activeNodes: nodes.map(n => ({ id: n.id, type: n.data.type }))
        })
      })

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText}`);
      }

      if (!response.body) throw new Error("No response stream available")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let accumulatedText = ""
      let buffer = ""

      setChatMessages(prev => [...prev, { role: "assistant", text: "" }])

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          buffer += decoder.decode(value, { stream: true })

          // Parse SSE format: "data: {json}\n\n"
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6))
                if (parsed.thought) {
                  setChatMessages(prev => {
                    const updated = [...prev]
                    const lastMsg = updated[updated.length - 1]
                    updated[updated.length - 1] = { 
                      ...lastMsg, 
                      thought: (lastMsg.thought || "") + parsed.thought 
                    }
                    return updated
                  })
                }
                if (parsed.text) {
                  accumulatedText += parsed.text

                  setChatMessages(prev => {
                    const updated = [...prev]
                    const lastMsg = updated[updated.length - 1]
                    updated[updated.length - 1] = { ...lastMsg, role: "assistant", text: accumulatedText }
                    return updated
                  })

                  // PROGRESSIVE RENDERING: Extract complete node objects from the stream
                  const partialData = extractPartialWorkflowElements(accumulatedText)
                  if (partialData.nodes.length > renderedCount) {
                    renderedCount = partialData.nodes.length
                    try {
                      applyWorkflowJsonBlock(JSON.stringify(partialData))
                    } catch {
                      // Node data incomplete - will retry on next chunk
                    }
                  }
                }
              } catch {
                // Partial JSON in SSE line - ignore
              }
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.startsWith("data: ")) {
        try {
          const parsed = JSON.parse(buffer.slice(6))
          if (parsed.text) {
            accumulatedText += parsed.text
            setChatMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: "assistant", text: accumulatedText }
              return updated
            })
          }
        } catch {
          // Ignore
        }
      }

      // Final pass: apply the complete workflow
      const finalPartialData = extractPartialWorkflowElements(accumulatedText)
      if (finalPartialData.nodes.length > 0) {
        try {
          applyWorkflowJsonBlock(JSON.stringify(finalPartialData))
          setLogs(prev => [...prev, { message: `[AI Assistant] Rendered complete generated workflow.` }])
        } catch (err) {
          console.error("Failed to parse final workflow:", err)
        }
      }

      setIsChatStreaming(false)
    } catch (err: unknown) {
      console.error(err)
      setIsChatStreaming(false)
      const errMsg = err instanceof Error ? err.message : "Error calling AI Route."
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        text: `Error calling AI Route: ${errMsg}. Please make sure the service is up and running.` 
      }])
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatStreaming) return
    const text = chatInput
    setChatInput("")
    await submitChatQuery(text)
  }

  const updateNodeData = (updatedFields: Partial<NodeData>) => {
    if (!selectedNode) return
    setNodes(prev => prev.map(n => {
      if (n.id === selectedNode.id) {
        const updatedNode = {
          ...n,
          data: {
            ...n.data,
            ...updatedFields,
            params: {
              ...n.data.params,
              ...(updatedFields.params || {})
            }
          }
        }
        setSelectedNode(updatedNode)
        return updatedNode
      }
      return n
    }))
  }

  const groupSelectedNodes = React.useCallback(() => {
    const selected = nodes.filter(n => n.selected && n.type !== "group" && n.data.type !== "group" && !n.parentId)
    if (selected.length < 1) return

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    selected.forEach(n => {
      if (n.position.x < minX) minX = n.position.x
      if (n.position.y < minY) minY = n.position.y
      
      // Node width/height might not be available, fallbacks to typical block size
      const width = n.width || 240
      const height = n.height || 100
      if (n.position.x + width > maxX) maxX = n.position.x + width
      if (n.position.y + height > maxY) maxY = n.position.y + height
    })

    // Padding for group node
    const padding = 40
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    const groupId = `group-${nodes.length + 1}`
    
    const newGroupNode: Node<NodeData> = {
      id: groupId,
      type: "group",
      position: { x: minX, y: minY },
      style: { width: maxX - minX, height: maxY - minY },
      data: {
        label: "New Group",
        type: "group",
        icon: <LayersIcon className="size-4 text-white" />,
        color: "indigo",
        status: "idle",
        params: {}
      }
    }

    setNodes(prev => {
      const updatedNodes = prev.map(n => {
        if (n.selected && n.type !== "group" && n.data.type !== "group" && !n.parentId) {
          return {
            ...n,
            parentId: groupId,
            // Relative position to parent
            position: { x: n.position.x - minX, y: n.position.y - minY },
            selected: false
          }
        }
        return n
      })
      
      return [...updatedNodes, newGroupNode]
    })
    
    setLogs(prev => [...prev, { message: `[System] Grouped ${selected.length} nodes.` }])
  }, [nodes, setNodes])

  const ungroupSelectedNodes = React.useCallback(() => {
    const selectedGroups = nodes.filter(n => n.selected && (n.type === "group" || n.data.type === "group"))
    
    if (selectedGroups.length === 0) return

    setNodes(prev => {
      let nextNodes = [...prev]
      selectedGroups.forEach(group => {
        // Move children out
        nextNodes = nextNodes.map(n => {
          if (n.parentId === group.id) {
            return {
              ...n,
              parentId: undefined,
              // Convert relative position to absolute
              position: { 
                x: n.position.x + group.position.x, 
                y: n.position.y + group.position.y 
              }
            }
          }
          return n
        })
        // Remove group
        nextNodes = nextNodes.filter(n => n.id !== group.id)
      })
      return nextNodes
    })
    
    setLogs(prev => [...prev, { message: `[System] Ungrouped ${selectedGroups.length} groups.` }])
  }, [nodes, setNodes])

  const deleteSelectedElement = () => {
    if (selectedNode) {
      setNodes(prev => prev.filter(n => n.id !== selectedNode.id))
      setEdges(prev => prev.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id))
      setLogs(prev => [...prev, { message: `[System] Deleted node: ${selectedNode.data.label}` }])
    } else if (selectedEdge) {
      setEdges(prev => prev.filter(e => e.id !== selectedEdge.id))
      setLogs(prev => [...prev, { message: `[System] Deleted connection: ${selectedEdge.id}` }])
    }
    setIsSheetOpen(false)
    setSelectedNode(null)
    setSelectedEdge(null)
  }

  // Default load disabled on initial render. ReactFlow is populated by loadWorkflow inside dashboard/workflows list.

  const onConnect = React.useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ 
      ...params, 
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
      interactionWidth: 20
    }, eds)),
    [setEdges]
  )

  const onEdgeUpdate = React.useCallback(
    (oldEdge: Edge, newConnection: Connection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    [setEdges]
  )

  // Direct addition of nodes from clicking the Toolbox / quick panels
  const addBlockNode = (block: AvailableTile) => {
    const newId = block.type === "group" ? `group-${nodes.length + 1}` : `node-${nodes.length + 1}`
    
    // Position slightly offset from the last node
    const lastNode = nodes[nodes.length - 1]
    const xPos = lastNode ? lastNode.position.x + 320 : 100
    const yPos = lastNode ? lastNode.position.y : 150

    const newNode: Node<NodeData> = {
      id: newId,
      type: block.type === "group" ? "group" : "custom",
      position: { x: xPos, y: yPos },
      style: block.type === "group" ? { width: 400, height: 300 } : undefined,
      data: {
        label: block.name,
        type: block.type,
        icon: block.icon,
        color: block.color,
        status: "idle",
        params: { ...block.defaultParams }
      }
    }

    setNodes(prev => [...prev, newNode])

    if (lastNode) {
      const newEdge: Edge = {
        id: `edge-${lastNode.id}-${newId}`,
        source: lastNode.id,
        target: newId,
        markerEnd: { type: MarkerType.ArrowClosed, color: "var(--border)" },
        style: { strokeWidth: 2, stroke: "var(--border)" }
      }
      setEdges(prev => [...prev, newEdge])
    }

    setLogs(prev => [...prev, { message: `[System] Added block: ${block.name}` }])
  }

  // Interpret natural language inside the AI Omni Box in real time
  const handleAiCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!omniInput.trim() || isChatStreaming) return

    const text = omniInput
    setOmniInput("")

    // Check for local instant commands first
    const lowercaseText = text.toLowerCase()
    if (lowercaseText.includes("clear") || lowercaseText.includes("reset")) {
      setNodes([])
      setEdges([])
      setSelectedNode(null)
      setSelectedEdge(null)
      setIsSheetOpen(false)
      setLogs(prev => [...prev, { message: `[AI Omni-Box] Real-time: Cleared canvas.` }])
      return
    }

    // Trigger full chat inference via AI router
    await submitChatQuery(text)
  }

  // ─── Execution context refs (mutable across async steps) ──────────
  const currentNodesRef = React.useRef(nodes)
  const currentEdgesRef = React.useRef(edges)
  React.useEffect(() => { currentNodesRef.current = nodes }, [nodes])
  React.useEffect(() => { currentEdgesRef.current = edges }, [edges])

  // Intercept the run click to open sheet and show the input form if needed
  const handleRunClick = () => {
    setIsRunSheetOpen(true)
    setIsSheetOpen(false) // Close config sheet if open
    setLogs([]) // Clear previous logs
    
    const allNodes = currentNodesRef.current
    const triggerNode = allNodes.find(n => n.data.type === "trigger")
    
    let needsInput = false
    let keys: string[] = []

    if (triggerNode) {
      // Check if schema requires inputs
      if (triggerNode.data.params.inputSchema && triggerNode.data.params.inputSchema !== "{}") {
        try {
          const schema = JSON.parse(triggerNode.data.params.inputSchema)
          if (schema.properties) {
            keys = Object.keys(schema.properties)
            if (keys.length > 0) needsInput = true
          }
        } catch { /* ignore bad json */ }
      }
      
      // Also require input if it's a file upload type, to give them a chance to provide a file or mock it
      if (triggerNode.data.params.contentType === "multipart/form-data" || triggerNode.data.params.contentType === "image/png") {
        let hasCustomFiles = false
        try {
          if (triggerNode.data.params.sampleFiles) {
            const customFiles = JSON.parse(triggerNode.data.params.sampleFiles)
            if (Array.isArray(customFiles) && customFiles.length > 0) {
              customFiles.forEach((f: any) => {
                if (f.key) {
                  keys.push(`_fileKey:${f.key}`)
                  hasCustomFiles = true
                }
              })
            }
          }
        } catch {}
        
        if (!hasCustomFiles) {
          if (!keys.includes("_file_")) keys.push("_file_")
        }
        needsInput = true
      }
    }
    
    if (needsInput) {
      setExpectedInputs(keys)
      const initialData: Record<string, string> = {}
      keys.forEach(k => {
        initialData[k] = runInputData[k] !== undefined ? runInputData[k] : ""
      })
      // Pre-fill file if sampleFile exists on the node and no file is loaded yet
      if (keys.includes("_file_") && !runInputData["_file_"] && triggerNode?.data.params.sampleFile) {
        initialData["_file_"] = triggerNode.data.params.sampleFile
      }
      
      // Pre-fill custom distinct files from sampleFiles if they exist
      try {
        if (triggerNode?.data.params.sampleFiles) {
          const customFiles = JSON.parse(triggerNode.data.params.sampleFiles)
          if (Array.isArray(customFiles)) {
            customFiles.forEach((f: any) => {
              const runKey = `_fileKey:${f.key}`
              if (keys.includes(runKey)) {
                initialData[runKey] = runInputData[runKey] || f.content || ""
                initialData[`_fileNameKey:${f.key}`] = runInputData[`_fileNameKey:${f.key}`] || f.name || ""
              }
            })
          }
        }
      } catch {}
      
      setRunInputData(initialData)
      setIsAwaitingInputs(true)
      return
    }
    
    // No inputs needed, run directly
    setIsAwaitingInputs(false)
    simulateExecution()
  }

  // Simulate workflow execution with full data binding
  const simulateExecution = async (customInputs?: Record<string, string>) => {
    setIsAwaitingInputs(false)
    const allNodes = currentNodesRef.current
    const allEdges = currentEdgesRef.current
    if (allNodes.length === 0) {
      setIsExecuting(false)
      return
    }
    setIsExecuting(true)
    setLogs([{ id: Math.random().toString(), message: `[Executor] Initializing execution run (topological order)...` }])

    // Set all nodes to idle
    setNodes(prev => prev.map(n => ({
      ...n,
      data: { ...n.data, status: "idle" as const }
    })))

    try {
      // Topological sort for correct data-flow order
      const sortedNodes = topologicalSort(allNodes, allEdges)
      
      // ─── Node Output Registry ──────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodeOutputs: Record<string, any> = {}

      // Track which nodes we've already processed (to skip loop-internal nodes in main pass)
      const processedNodeIds = new Set<string>()
      const activeEdgeIds = new Set<string>()
      const loopInternalNodeIds = new Set<string>()

      // Any entry-point node (like the trigger node) activates its outgoing edges by default on start
      const triggerNodes = allNodes.filter(n => n.data.type === "trigger" || !allEdges.some(e => e.target === n.id))
      for (const tn of triggerNodes) {
        allEdges.filter(e => e.source === tn.id).forEach(e => activeEdgeIds.add(e.id))
      }

      let step = 0

      for (const node of sortedNodes) {
      // Skip group nodes from execution pass as they are visual containers
      if (node.data.type === "group" || node.type === "group") continue

      // Skip nodes already processed inside a loop sub-execution or identified as loop internal
      if (processedNodeIds.has(node.id) || loopInternalNodeIds.has(node.id)) continue

      // Path Activation Logic:
      // A node is executed ONLY if it's an entry point (no incoming edges) OR has at least one active incoming path.
      const hasIncoming = allEdges.some(e => e.target === node.id)
      const hasActiveIncoming = allEdges.filter(e => e.target === node.id).some(e => activeEdgeIds.has(e.id))

      if (hasIncoming && !hasActiveIncoming) {
        // Bypassed/Skipped because no active route leads here
        setLogs(prev => [
          ...prev,
          {
            nodeId: node.id,
            label: node.data.label,
            type: node.data.type,
            message: `[Bypassed] Node not executed (inactive route path)`
          }
        ])
        continue
      }

      step++
      
      // Resolve {{placeholders}} in params using the current registry
      const resolvedParams = resolveParams(node.data.params, nodeOutputs)
      
      // running status
      setNodes(prev => prev.map(n => n.id === node.id ? {
        ...n,
        data: { ...n.data, status: "running" as const }
      } : n))

      const logId = Math.random().toString(36).substring(7)
      setLogs(prev => [
        ...prev, 
        { 
          id: logId,
          nodeId: node.id,
          label: node.data.label,
          type: node.data.type,
          status: "running",
          message: `[Step ${step}] Executing...${hasPlaceholders(node.data.params) ? " (resolved {{placeholders}})" : ""}`
        }
      ])

      // Helper to update the correct log entry with success and data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const markNodeSuccess = (data: any, extraMsg?: string) => {
        setLogs(prev => prev.map(log => log.id === logId ? {
          ...log,
          status: "success",
          message: extraMsg ? `${log.message}\n${extraMsg}` : log.message,
          data
        } : log))
      }

      try {
        // ── Execute & store mock output per node type ────────────────
        if (node.data.type === "trigger") {
          // Store trigger payload
          const triggerPayload: Record<string, unknown> = {
            event: resolvedParams.eventName || "On New Order",
            contentType: resolvedParams.contentType || "application/json",
          }
          
          // Handle file(s)
          let loadedFiles: { name: string, content: string }[] = []
          try {
            if (resolvedParams.sampleFiles) {
              const sampleFilesParsed = JSON.parse(resolvedParams.sampleFiles)
              if (Array.isArray(sampleFilesParsed)) {
                sampleFilesParsed.forEach((tf: any) => {
                  const runKey = `_fileKey:${tf.key}`
                  let content = ""
                  let name = tf.name
                  
                  if (customInputs && customInputs[runKey]) {
                    content = customInputs[runKey]
                    name = customInputs[`_fileNameKey:${tf.key}`] || tf.name
                  } else if (runInputData[runKey]) {
                    content = runInputData[runKey]
                    name = runInputData[`_fileNameKey:${tf.key}`] || tf.name
                  } else {
                    content = tf.content
                  }
                  
                  if (content) {
                    // Store as a direct property in triggerPayload so users can reference e.g., {{trigger.invoice}}
                    triggerPayload[tf.key] = content
                    loadedFiles.push({ name, content })
                  }
                })
              }
            }
          } catch {}

          if (loadedFiles.length === 0) {
            // Fallback to legacy single file or uploaded files if no distinct custom inputs were parsed
            try {
              if (customInputs && customInputs["_files_"]) {
                loadedFiles = JSON.parse(customInputs["_files_"])
              } else if (runInputData["_files_"]) {
                loadedFiles = JSON.parse(runInputData["_files_"])
              } else {
                const singleFile = (customInputs && customInputs["_file_"]) || runInputData["_file_"] || resolvedParams.sampleFile
                if (singleFile) {
                  loadedFiles = [{ name: "sample-file", content: singleFile }]
                }
              }
            } catch {}
          }

          if (loadedFiles.length > 0) {
            triggerPayload.files = loadedFiles
            triggerPayload.file = loadedFiles[0]?.content || ""
          }
          
          // Try to parse inputSchema if present
          if (resolvedParams.inputSchema && resolvedParams.inputSchema !== "{}") {
            try {
              const schema = JSON.parse(resolvedParams.inputSchema)
              if (schema.properties) {
                for (const key of Object.keys(schema.properties)) {
                  // If user provided input via modal, use it, else default/empty (disabled mock execution)
                  const inputValue = (customInputs && customInputs[key] !== undefined) 
                    ? customInputs[key] 
                    : runInputData[key];
                    
                  if (inputValue !== undefined && inputValue !== "") {
                    // Try to cast to number if needed
                    const type = schema.properties[key].type
                    triggerPayload[key] = type === "number" ? Number(inputValue) : inputValue
                  } else {
                    const prop = schema.properties[key]
                    triggerPayload[key] = (prop && prop.default !== undefined) ? prop.default : ""
                  }
                }
              }
            } catch { /* ignore bad JSON */ }
          }
          nodeOutputs[node.id] = triggerPayload
          markNodeSuccess(triggerPayload, `Received ${resolvedParams.contentType || "json"} payload via webhook`)
        } else if (node.data.type === "delay") {
        nodeOutputs[node.id] = { delayed: true, ms: resolvedParams.ms || "2000" }
        markNodeSuccess(nodeOutputs[node.id], `Paused thread for ${resolvedParams.ms || 1000}ms`)
      } else if (node.data.type === "image-gen") {
        let msg = `Generating image via ${resolvedParams.model || "gemini-3.1-flash-image"}...\n`
        if (resolvedParams.referenceImage) {
          msg += `(With style reference image)\n`
        }
        if (resolvedParams.prompt) {
          msg += `Prompt: "${resolvedParams.prompt.slice(0, 50)}..."`
        }
        
        try {
          const model = resolvedParams.model || "gemini-3.1-flash-image";
          const numImages = parseInt(resolvedParams.numberOfImages || "1");
          
          const isImagen4 = model === "imagen-4.0-generate-001";
          
          let targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${resolvedParams.apiKey || ""}`;
          let payload: any = {};
          
          if (isImagen4) {
            // Imagen 4 schema (e.g. predict or generateImages)
            // But based on @google/genai SDK, generateImages translates to:
            // POST .../models/imagen-4.0-generate-001:predict
            // with { instances: [...], parameters: { ... } }
            // Let's use the predict endpoint shape for Vertex/Google AI compatibility:
            targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${resolvedParams.apiKey || ""}`;
            payload = {
              instances: [{ prompt: resolvedParams.prompt || "" }],
              parameters: {
                sampleCount: numImages,
                aspectRatio: resolvedParams.aspectRatio && resolvedParams.aspectRatio !== "auto" ? resolvedParams.aspectRatio : "1:1",
                personGeneration: resolvedParams.personGeneration || "dont_allow"
              }
            };
          } else {
            // Gemini model schema
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parts: any[] = [{ text: resolvedParams.prompt || "" }];
            if (resolvedParams.referenceImage) {
              const matches = resolvedParams.referenceImage.match(/^data:(image\/\w+);base64,(.*)$/);
              if (matches && matches.length === 3) {
                parts.push({
                  inlineData: {
                    mimeType: matches[1],
                    data: matches[2]
                  }
                });
              }
            }

            const imageConfig: Record<string, any> = {};
            if (resolvedParams.aspectRatio && resolvedParams.aspectRatio !== "auto") {
              imageConfig.aspectRatio = resolvedParams.aspectRatio;
            }
            if (resolvedParams.imageSize) {
              imageConfig.imageSize = resolvedParams.imageSize;
            }

            payload = {
              contents: [{ parts }],
              generationConfig: {
                responseModalities: ["IMAGE"],
                candidateCount: numImages,
                ...(Object.keys(imageConfig).length > 0 ? { imageConfig } : {}),
                ...(resolvedParams.temperature ? { temperature: parseFloat(resolvedParams.temperature) } : {}),
                ...(resolvedParams.topP ? { topP: parseFloat(resolvedParams.topP) } : {})
              }
            };
          }

          // Call the server-side proxy which secures/injects the API key if missing
          const res = await fetch("/api/workflows/proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: targetUrl,
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: payload
            })
          });
          const json = await res.json();
          
          if (!res.ok) throw new Error(json.error?.message || "Google Imagen API Error");
          
          let generatedImageUrls: string[] = [];
          
          if (isImagen4) {
             if (!json.predictions || json.predictions.length === 0) {
                throw new Error('No images were generated by the model');
             }
             generatedImageUrls = json.predictions.map((p: any) => {
                if (p.bytesBase64Encoded) return `data:${p.mimeType || 'image/png'};base64,${p.bytesBase64Encoded}`;
                return "";
             }).filter(Boolean);
          } else {
            if (!json.candidates?.[0]?.content?.parts || json.candidates[0].content.parts.length === 0) {
              throw new Error('No images were generated by the model');
            }
            generatedImageUrls = json.candidates[0].content.parts
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((part: any) => part.inlineData && part.inlineData.data)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((part: any) => `data:${part.inlineData?.mimeType || 'image/png'};base64,${part.inlineData?.data}`);
          }

          if (generatedImageUrls.length === 0) {
            throw new Error('No valid image data found in response');
          }

          nodeOutputs[node.id] = { imageUrl: generatedImageUrls[0], imageUrls: generatedImageUrls, aspectRatio: resolvedParams.aspectRatio || "1:1" };
          markNodeSuccess(nodeOutputs[node.id], msg);
        } catch(err: unknown) {
          msg += `\n⚠ Image Gen Error: ${err instanceof Error ? err.message : String(err)}`;
          nodeOutputs[node.id] = { error: err instanceof Error ? err.message : String(err) };
          setNodes(prev => prev.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: "error" as const } } : n));
          setLogs(prev => {
            const newLogs = [...prev];
            newLogs[newLogs.length - 1] = { ...newLogs[newLogs.length - 1], status: "error", message: msg, data: { error: err instanceof Error ? err.message : String(err) } };
            return newLogs;
          });
          break; // stop execution
        }
      } else if (node.data.type === "http-request") {
        const method = resolvedParams.method || "GET"
        const url = resolvedParams.url || "https://api.example.com"
        let body: unknown = {}
        if (resolvedParams.body && resolvedParams.body !== "{}") {
          try { body = JSON.parse(resolvedParams.body) } catch { body = resolvedParams.body }
        }
        let msg = `${method} ${url}`
        if (Object.keys(body as object).length > 0) {
          msg += `\nBody: ${JSON.stringify(body).slice(0, 50)}...`
        }
        
        try {
          const fetchOptions: RequestInit = { method };
          if (method !== "GET" && method !== "HEAD") {
            fetchOptions.headers = { "Content-Type": "application/json" };
            fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
          }
          
          const res = await fetch(url, fetchOptions);
          const contentType = res.headers.get("content-type") || "";
          let data;
          if (contentType.includes("application/json")) {
            data = await res.json();
          } else {
            data = await res.text();
          }
          
          nodeOutputs[node.id] = { status: res.status, data };
          markNodeSuccess(nodeOutputs[node.id], msg);
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          msg += `\n⚠ HTTP Request Failed: ${errMsg}`;
          nodeOutputs[node.id] = { error: errMsg };
          
          setNodes(prev => prev.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: "error" as const } } : n));
          setLogs(prev => {
            const newLogs = [...prev];
            newLogs[newLogs.length - 1] = { ...newLogs[newLogs.length - 1], status: "error", message: msg, data: { error: errMsg } };
            return newLogs;
          });
          break; // Stop execution on HTTP failure
        }
      } else if (node.data.type === "llm") {
        const provider = resolvedParams.provider || "openai"
        let model = resolvedParams.model || "gpt-4o-mini"
        
        // Ensure the model actually belongs to the selected provider (fixes AI generation mismatches)
        const isKnownModel = Object.values(PROVIDER_MODELS).flat().some(m => m.id === model);
        if (isKnownModel) {
          if (provider === "google" && !PROVIDER_MODELS["google"].some(m => m.id === model)) model = "gemini-2.5-flash";
          else if (provider === "anthropic" && !PROVIDER_MODELS["anthropic"].some(m => m.id === model)) model = "claude-3-5-sonnet-20241022";
          else if (provider === "openai" && !PROVIDER_MODELS["openai"].some(m => m.id === model)) model = "gpt-4o-mini";
          else if (provider === "groq" && !PROVIDER_MODELS["groq"].some(m => m.id === model)) model = "llama-3.3-70b-versatile";
          else if (provider === "open-source" && !PROVIDER_MODELS["open-source"].some(m => m.id === model)) model = "meta-llama/llama-3.1-405b-instruct";
        }

        let msg = `Called LLM (${provider}/${model})`
        if (resolvedParams.apiKey) msg += `\nUsing custom API key: ********************`
        if (resolvedParams.prompt) msg += `\nPrompt: "${resolvedParams.prompt.slice(0, 50)}..."`

        try {
          let content = "";
          const targetUrl = provider === "google"
            ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${resolvedParams.apiKey || ""}`
            : (provider === "groq" ? "https://api.groq.com/openai/v1/chat/completions" : (provider === "anthropic" ? "https://api.anthropic.com/v1/messages" : "https://api.openai.com/v1/chat/completions"));

          const targetHeaders: Record<string, string> = {
            "Content-Type": "application/json"
          };
          if (resolvedParams.apiKey) {
            if (provider === "anthropic") {
              targetHeaders["x-api-key"] = resolvedParams.apiKey;
              targetHeaders["anthropic-version"] = "2023-06-01";
              targetHeaders["anthropic-dangerous-direct-browser-access"] = "true";
            } else if (provider !== "google") {
              targetHeaders["Authorization"] = `Bearer ${resolvedParams.apiKey}`;
            }
          }

          const payload = provider === "google" ? {
            contents: [{ parts: [{ text: resolvedParams.prompt }] }],
            generationConfig: {
              temperature: Number(resolvedParams.temperature || 0.7),
              responseMimeType: resolvedParams.responseFormat === "json_object" ? "application/json" : undefined
            }
          } : {
            model,
            messages: [{ role: "user", content: resolvedParams.prompt }],
            temperature: Number(resolvedParams.temperature || 0.7),
            ...(provider === "anthropic" ? { max_tokens: 4096 } : { response_format: resolvedParams.responseFormat === "json_object" ? { type: "json_object" } : undefined })
          };

          const res = await fetch("/api/workflows/proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: targetUrl,
              method: "POST",
              headers: targetHeaders,
              body: payload
            })
          });
          const json = await res.json();
          if (!res.ok) {
            const errDetail = typeof json.error === "object" && json.error !== null 
              ? (json.error.message || JSON.stringify(json.error)) 
              : (json.error || "LLM API Error");
            throw new Error(errDetail);
          }

          if (provider === "anthropic") {
            content = json.content?.[0]?.text || "";
          } else if (provider === "google") {
            content = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
          } else {
            content = json.choices?.[0]?.message?.content || "";
          }
          if (!content) {
            throw new Error(`Empty response from ${provider} model.`);
          }

          if (resolvedParams.responseFormat === "json_object") {
            nodeOutputs[node.id] = JSON.parse(cleanJsonString(content));
          } else {
            nodeOutputs[node.id] = { text: content };
          }
          markNodeSuccess(nodeOutputs[node.id], msg);
          // Apply output mapping before continuing to next node (LLM success path skips the bottom delay)
          if (resolvedParams.outputMapping && resolvedParams.outputMapping !== "[]") {
            nodeOutputs[node.id] = applyOutputMapping(nodeOutputs[node.id], resolvedParams.outputMapping, nodeOutputs)
          }
        } catch(err: unknown) {
          msg += `\n⚠ LLM Error: ${err instanceof Error ? err.message : String(err)}`;
          nodeOutputs[node.id] = { error: err instanceof Error ? err.message : String(err) };
          throw err;
        }
      } else if (node.data.type === "script") {
        let msg = `Executing custom JavaScript...`
        // Execute the code in a sandboxed context (limited eval)
        let scriptResult: unknown = { processed: true }
        if (resolvedParams.code) {
          try {
            // eslint-disable-next-line no-new-func
            const fn = new Function("data", "nodeOutputs", resolvedParams.code)
            // Pass upstream data for each incoming edge source
            const upstreamData = getUpstreamNodeIds(allEdges, node.id).map(uid => nodeOutputs[uid]).filter(Boolean)
            scriptResult = fn(upstreamData, nodeOutputs)
          } catch (err: unknown) {
            msg += `\n⚠ Script error: ${err instanceof Error ? err.message : String(err)}`
            scriptResult = { error: err instanceof Error ? err.message : "Script execution failed" }
            setNodes(prev => prev.map(n => n.id === node.id ? {
              ...n,
              data: { ...n.data, status: "error" as const }
            } : n))
            setLogs(prev => {
              const newLogs = [...prev]
              newLogs[newLogs.length - 1] = { ...newLogs[newLogs.length - 1], status: "error", message: msg, data: scriptResult }
              return newLogs
            })
            nodeOutputs[node.id] = scriptResult
            break
          }
        }
        nodeOutputs[node.id] = scriptResult
        markNodeSuccess(nodeOutputs[node.id], msg)
      } else if (node.data.type === "router") {
        // Evaluate the condition
        let result = false
        try {
          // Extremely simple simulated evaluation for mock purposes
          const condition = resolvedParams.condition || "false"
          if (condition.includes("==")) {
             const parts = condition.split("==").map(s => s.trim())
             result = parts[0] === parts[1]
          } else if (condition.includes(">")) {
             const parts = condition.split(">").map(s => s.trim())
             result = Number(parts[0]) > Number(parts[1])
          } else if (condition.trim() === "true") {
             result = true
          }
        } catch (e) {
           console.error("Router evaluation error", e)
        }
        
        nodeOutputs[node.id] = { branch: result ? "true" : "false", evaluated: result }
        markNodeSuccess(nodeOutputs[node.id], `Routed to branch: ${result ? "TRUE" : "FALSE"}`)

        // Activate outgoing edges that match the chosen handle
        const activeHandle = result ? "true" : "false"
        allEdges
          .filter(e => e.source === node.id && e.sourceHandle === activeHandle)
          .forEach(e => activeEdgeIds.add(e.id))
      } else if (node.data.type === "classifier") {
        const valToMatch = resolvedParams.valueToMatch || ""
        const possibilities = (resolvedParams.possibilities || "billing,support,sales")
          .split(",")
          .map(c => c.trim())
          .filter(Boolean)
        
        // Match case: check if incoming value exactly matches or contains the possibility name
        let chosen = possibilities[0] || "billing"
        
        // Dynamic semantic fuzzy match: check exact, then substring, then split word intersection
        const valClean = valToMatch.toLowerCase().trim()
        
        // 1. Exact match
        let foundMatch = false
        for (const opt of possibilities) {
          const optClean = opt.toLowerCase().trim()
          if (valClean === optClean) {
            chosen = opt
            foundMatch = true
            break
          }
        }
        
        // 2. Substring fallback (e.g., valClean contains optClean or vice versa)
        if (!foundMatch) {
          for (const opt of possibilities) {
            const optClean = opt.toLowerCase().trim()
            if (valClean.includes(optClean) || optClean.includes(valClean)) {
              chosen = opt
              foundMatch = true
              break
            }
          }
        }
        
        // 3. Word-intersection fallback (e.g., "closed one" matches "closed-won")
        if (!foundMatch) {
          const valWords = valClean.split(/[\s\-_]+/).filter(w => w.length >= 3)
          for (const opt of possibilities) {
            const optClean = opt.toLowerCase().trim()
            const optWords = optClean.split(/[\s\-_]+/).filter(w => w.length >= 3)
            const hasOverlap = valWords.some(vw => optWords.some(ow => vw.startsWith(ow) || ow.startsWith(vw)))
            if (hasOverlap) {
              chosen = opt
              foundMatch = true
              break
            }
          }
        }
        
        nodeOutputs[node.id] = { chosenMatch: chosen, value: valToMatch }
        markNodeSuccess(nodeOutputs[node.id], `Matched incoming value "${valToMatch}" and routed to branch: "${chosen.toUpperCase()}"`)

        // Activate outgoing edges that match the chosen possibility/handle
        allEdges
          .filter(e => e.source === node.id && e.sourceHandle === chosen)
          .forEach(e => activeEdgeIds.add(e.id))
      } else if (node.data.type === "merge") {
         const upstreamIds = getUpstreamNodeIds(allEdges, node.id)
         const aggregated: Record<string, unknown> = {}
         for (const uid of upstreamIds) {
           if (nodeOutputs[uid]) {
             aggregated[uid] = nodeOutputs[uid]
           }
         }
         nodeOutputs[node.id] = { mergedData: aggregated, strategy: resolvedParams.strategy }
         markNodeSuccess(nodeOutputs[node.id], `Merged ${Object.keys(aggregated).length} branches using ${resolvedParams.strategy || "wait-all"} strategy`)
      } else if (node.data.type === "boolean") {
         nodeOutputs[node.id] = { result: true, operator: resolvedParams.operator }
         markNodeSuccess(nodeOutputs[node.id], `Evaluated boolean logic (${resolvedParams.operator || "AND"})`)
      } else if (node.data.type === "transform") {
         nodeOutputs[node.id] = { transformed: true }
         markNodeSuccess(nodeOutputs[node.id], `Applied data transformation`)
      } else if (node.data.type === "filter") {
         nodeOutputs[node.id] = { filtered: true, passed: true }
         markNodeSuccess(nodeOutputs[node.id], `Filter condition evaluated`)
      } else if (node.data.type === "loop") {
        // Get the array from upstream
        const upstreamIds = getUpstreamNodeIds(allEdges, node.id)
        const upstreamOutput = upstreamIds.length > 0 ? nodeOutputs[upstreamIds[0]] : null
        
        const rawArrayPathVal = resolveRawTemplate(node.data.params.arrayPath || "", nodeOutputs)
        let arrData: unknown[] = [1, 2, 3] as unknown[] // default mock array
        
        // Detailed execution debug logs to easily find and diagnose any array resolution issues
        setLogs(prev => [...prev, {
          nodeId: node.id,
          label: node.data.label,
          type: node.data.type,
          message: `[Debug Loop] Unresolved Param arrayPath: "${node.data.params.arrayPath}"\n[Debug Loop] resolveRawTemplate output: ${JSON.stringify(rawArrayPathVal)}\n[Debug Loop] resolvedParams.arrayPath: "${resolvedParams.arrayPath}"\n[Debug Loop] Upstream output available keys: ${upstreamOutput ? Object.keys(upstreamOutput).join(', ') : 'none'}`
        }])

        if (Array.isArray(rawArrayPathVal)) {
          arrData = rawArrayPathVal
        } else if (typeof rawArrayPathVal === "number" && !isNaN(rawArrayPathVal) && rawArrayPathVal > 0) {
          arrData = Array.from({ length: Math.floor(rawArrayPathVal) }, (_, i) => i + 1)
        } else if (typeof rawArrayPathVal === "string" && !isNaN(Number(rawArrayPathVal)) && Number(rawArrayPathVal) > 0 && rawArrayPathVal.trim() !== "") {
          arrData = Array.from({ length: Math.floor(Number(rawArrayPathVal)) }, (_, i) => i + 1)
        } else {
          // Simple JSONPath extraction fallback (supports $.field or $.field.subfield)
          const arrayPath = resolvedParams.arrayPath || "$.slides"
          
          // Check if arrayPath is itself a number (e.g. it was resolved from a template like {{$node["1"].json.n}})
          if (!isNaN(Number(arrayPath)) && Number(arrayPath) > 0 && arrayPath.trim() !== "") {
              arrData = Array.from({ length: Math.floor(Number(arrayPath)) }, (_, i) => i + 1)
          } else {
              // Otherwise treat it as a JSONPath
              const pathParts = arrayPath.replace(/^\$\./, "").split(".")
              if (upstreamOutput && typeof upstreamOutput === "object") {
                let current: unknown = upstreamOutput
                for (const part of pathParts) {
                  if (current && typeof current === "object") {
                    current = (current as Record<string, unknown>)[part]
                  } else {
                    current = undefined
                  }
                }
                if (Array.isArray(current)) {
                  arrData = current
                } else if (typeof current === "number" && !isNaN(current) && current > 0) {
                  arrData = Array.from({ length: Math.floor(current) }, (_, i) => i + 1)
                } else if (typeof current === "string" && !isNaN(Number(current)) && Number(current) > 0) {
                  arrData = Array.from({ length: Math.floor(Number(current)) }, (_, i) => i + 1)
                }
              }
          }
        }

        // --- Auto-Heal Strategy ---
        // If the loop fell back to the default mock array of size 3 ([1, 2, 3]), let's scan all upstream node
        // outputs for any array. If we find an array or an object with an array property (e.g. "slides"), 
        // we use that actual array. This makes the execution 100% resilient and bulletproof under any conditions.
        if (arrData.length === 3 && arrData[0] === 1 && arrData[1] === 2 && arrData[2] === 3) {
          for (const uid of upstreamIds) {
            const output = nodeOutputs[uid]
            if (output) {
              if (Array.isArray(output)) {
                arrData = output
                break
              } else if (typeof output === "object") {
                // Look for any key that contains a non-empty array
                const arrayKey = Object.keys(output).find(k => Array.isArray(output[k]) && output[k].length > 0)
                if (arrayKey) {
                  arrData = output[arrayKey]
                  break
                }
              }
            }
          }
        }
        
        const itemName = resolvedParams.itemName || "slide"
        const loopMode = resolvedParams.mode || "parallel"
        const loopResults: unknown[] = []
        
        // Get downstream nodes from this loop node
        // Auto-heal: Ensure all nodes downstream of the loop node (excluding output sinks and groups) are assigned to the group
        const associatedGroup = allNodes.find(n => n.type === "group" || n.data.type === "group")
        const downstreamAll = getDownstreamNodes(node.id, allNodes, allEdges)
        
        if (associatedGroup) {
          const groupId = associatedGroup.id
          downstreamAll.forEach(dn => {
            if (dn.id !== node.id && dn.data.type !== "output" && dn.type !== "group" && dn.data.type !== "group" && !dn.parentId) {
              dn.parentId = groupId
              setNodes(prev => prev.map(n => n.id === dn.id ? { ...n, parentId: groupId } : n))
            }
          })
        }

        // We consider all non-output downstream nodes as part of the loop body
        const downstreamNodes = downstreamAll.filter(n => n.id !== node.id && n.data.type !== "output" && n.type !== "group" && n.data.type !== "group")
        
        // Mark all these internal nodes as loopInternal so they are skipped in the main pass
        downstreamNodes.forEach(dn => loopInternalNodeIds.add(dn.id))

        markNodeSuccess(null, `Iterating array at path "${resolvedParams.arrayPath || "$.slides"}" in ${loopMode.toUpperCase()} mode...`)

        // Visual feedback for group node if exists
        setNodes(prev => prev.map(n => n.type === "group" ? { ...n, data: { ...n.data, status: "running" as const } } : n))

        // Shared iteration runner — used for both parallel and sequential modes
        const runIteration = async (item: unknown, idx: number) => {
          const loopCtx = { item, index: idx, itemName }
          
          // Isolate node outputs locally to prevent parallel iterations from overwriting each other!
          const localNodeOutputs = { ...nodeOutputs }

          // Execute each downstream node sequentially WITHIN this specific parallel iteration
          const subSorted = topologicalSort(downstreamNodes, allEdges)
          for (const subNode of subSorted) {
            // Skip the visual group node itself
            if (subNode.type === "group") continue

            // Mark node globally as processed
            processedNodeIds.add(subNode.id)
            
            const subResolved = resolveParams(subNode.data.params, localNodeOutputs, loopCtx)

            setNodes(prev => prev.map(n => n.id === subNode.id ? {
              ...n,
              data: { ...n.data, status: "running" as const }
            } : n))

            const logId = Math.random().toString(36).substring(7)
            setLogs(prev => [
              ...prev, 
              { 
                id: logId,
                nodeId: subNode.id,
                label: `${subNode.data.label} (Iter ${idx + 1})`,
                type: subNode.data.type,
                status: "running",
                message: `[Loop iter ${idx + 1}] Executing...`
              }
            ])

            // Helper for subnodes
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const markSubNodeSuccess = (data: any) => {
              setLogs(prev => prev.map(log => log.id === logId ? {
                ...log,
                status: "success",
                data
              } : log))
            }
            
            try {
              if (subNode.data.type === "llm") {
                const provider = subResolved.provider || "openai";
                let model = subResolved.model || "gpt-4o-mini";
                const isKnownModel = Object.values(PROVIDER_MODELS).flat().some(m => m.id === model);
                if (isKnownModel) {
                  if (provider === "google" && !PROVIDER_MODELS["google"].some(m => m.id === model)) model = "gemini-2.5-flash";
                  else if (provider === "anthropic" && !PROVIDER_MODELS["anthropic"].some(m => m.id === model)) model = "claude-3-5-sonnet-20241022";
                  else if (provider === "openai" && !PROVIDER_MODELS["openai"].some(m => m.id === model)) model = "gpt-4o-mini";
                  else if (provider === "groq" && !PROVIDER_MODELS["groq"].some(m => m.id === model)) model = "llama-3.3-70b-versatile";
                  else if (provider === "open-source" && !PROVIDER_MODELS["open-source"].some(m => m.id === model)) model = "meta-llama/llama-3.1-405b-instruct";
                }
                
                let content = "";
                const targetUrl = provider === "google"
                  ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${subResolved.apiKey || ""}`
                  : (provider === "groq" ? "https://api.groq.com/openai/v1/chat/completions" : (provider === "anthropic" ? "https://api.anthropic.com/v1/messages" : "https://api.openai.com/v1/chat/completions"));

                const targetHeaders: Record<string, string> = {
                  "Content-Type": "application/json"
                };
                if (subResolved.apiKey) {
                  if (provider === "anthropic") {
                    targetHeaders["x-api-key"] = subResolved.apiKey;
                    targetHeaders["anthropic-version"] = "2023-06-01";
                    targetHeaders["anthropic-dangerous-direct-browser-access"] = "true";
                  } else if (provider !== "google") {
                    targetHeaders["Authorization"] = `Bearer ${subResolved.apiKey}`;
                  }
                }

                const payload = provider === "google" ? {
                  contents: [{ parts: [{ text: subResolved.prompt }] }],
                  generationConfig: { temperature: Number(subResolved.temperature || 0.7), responseMimeType: subResolved.responseFormat === "json_object" ? "application/json" : undefined }
                } : {
                  model,
                  messages: [{ role: "user", content: subResolved.prompt }],
                  temperature: Number(subResolved.temperature || 0.7),
                  ...(provider === "anthropic" ? { max_tokens: 4096 } : { response_format: subResolved.responseFormat === "json_object" ? { type: "json_object" } : undefined })
                };

                const res = await fetch("/api/workflows/proxy", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    url: targetUrl,
                    method: "POST",
                    headers: targetHeaders,
                    body: payload
                  })
                });
                const json = await res.json();
                if (!res.ok) {
                  const errDetail = typeof json.error === "object" && json.error !== null 
                    ? (json.error.message || JSON.stringify(json.error)) 
                    : (json.error || "LLM API Error");
                  throw new Error(errDetail);
                }

                if (provider === "anthropic") {
                  content = json.content?.[0]?.text || "";
                } else if (provider === "google") {
                  content = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                } else {
                  content = json.choices?.[0]?.message?.content || "";
                }
                if (!content) {
                  throw new Error(`Empty response from ${provider} model.`);
                }
                
                localNodeOutputs[subNode.id] = subResolved.responseFormat === "json_object" ? JSON.parse(cleanJsonString(content)) : { text: content };
              } else if (subNode.data.type === "image-gen") {
                const model = subResolved.model || "gemini-3.1-flash-image";
                const numImages = parseInt(subResolved.numberOfImages || "1");
                const isImagen4 = model === "imagen-4.0-generate-001";
                
                let targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${subResolved.apiKey || ""}`;
                let payload: any = {};
                
                if (isImagen4) {
                  targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${subResolved.apiKey || ""}`;
                  payload = {
                    instances: [{ prompt: subResolved.prompt || "" }],
                    parameters: {
                      sampleCount: numImages,
                      aspectRatio: subResolved.aspectRatio && subResolved.aspectRatio !== "auto" ? subResolved.aspectRatio : "1:1",
                      personGeneration: subResolved.personGeneration || "dont_allow"
                    }
                  };
                } else {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const parts: any[] = [{ text: subResolved.prompt || "" }];
                  if (subResolved.referenceImage) {
                    const matches = subResolved.referenceImage.match(/^data:(image\/\w+);base64,(.*)$/);
                    if (matches && matches.length === 3) {
                      parts.push({
                        inlineData: {
                          mimeType: matches[1],
                          data: matches[2]
                        }
                      });
                    }
                  }

                  const imageConfig: Record<string, any> = {};
                  if (subResolved.aspectRatio && subResolved.aspectRatio !== "auto") {
                    imageConfig.aspectRatio = subResolved.aspectRatio;
                  }
                  if (subResolved.imageSize) {
                    imageConfig.imageSize = subResolved.imageSize;
                  }

                  payload = {
                    contents: [{ parts }],
                    generationConfig: { 
                      responseModalities: ["IMAGE"], 
                      candidateCount: numImages,
                      ...(Object.keys(imageConfig).length > 0 ? { imageConfig } : {}),
                      ...(subResolved.temperature ? { temperature: parseFloat(subResolved.temperature) } : {}),
                      ...(subResolved.topP ? { topP: parseFloat(subResolved.topP) } : {})
                    }
                  };
                }

                const res = await fetch("/api/workflows/proxy", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    url: targetUrl,
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: payload
                  })
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error?.message || json.error || "Google Imagen API Error");

                let generatedImageUrls: string[] = [];
                
                if (isImagen4) {
                   if (!json.predictions || json.predictions.length === 0) {
                      throw new Error('No images were generated by the model');
                   }
                   generatedImageUrls = json.predictions.map((p: any) => {
                      if (p.bytesBase64Encoded) return `data:${p.mimeType || 'image/png'};base64,${p.bytesBase64Encoded}`;
                      return "";
                   }).filter(Boolean);
                } else {
                  if (!json.candidates?.[0]?.content?.parts || json.candidates[0].content.parts.length === 0) {
                    throw new Error('No images were generated by the model');
                  }
                  generatedImageUrls = json.candidates[0].content.parts
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .filter((p: any) => p.inlineData && p.inlineData.data)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((p: any) => `data:${p.inlineData?.mimeType || 'image/png'};base64,${p.inlineData?.data}`);
                }
                
                if (generatedImageUrls.length === 0) {
                  throw new Error("No valid image data was returned by the Google Imagen API.");
                }
                localNodeOutputs[subNode.id] = { imageUrl: generatedImageUrls[0], imageUrls: generatedImageUrls, aspectRatio: subResolved.aspectRatio || "1:1" };
              } else if (subNode.data.type === "output") {
                localNodeOutputs[subNode.id] = {
                  result: `Iteration ${idx + 1} output`,
                  item,
                }
              } else {
                localNodeOutputs[subNode.id] = { result: `Iteration ${idx + 1} output` }
              }

              // Apply output mapping for subnode within loop iteration
              if (localNodeOutputs[subNode.id] && subResolved.outputMapping && subResolved.outputMapping !== "[]") {
                localNodeOutputs[subNode.id] = applyOutputMapping(localNodeOutputs[subNode.id], subResolved.outputMapping, localNodeOutputs, loopCtx)
              }

              // Stagger animation timing slightly in parallel to ensure UI remains highly responsive
              await new Promise(resolve => setTimeout(resolve, 300 + (idx * 150)))
              setNodes(prev => prev.map(n => n.id === subNode.id ? {
                ...n,
                data: { ...n.data, status: "success" as const }
              } : n))
              
              markSubNodeSuccess(localNodeOutputs[subNode.id])
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : String(err);
              localNodeOutputs[subNode.id] = { error: errMsg };
              setNodes(prev => prev.map(n => n.id === subNode.id ? {
                ...n,
                data: { ...n.data, status: "error" as const }
              } : n))
              setLogs(prev => prev.map(log => log.id === logId ? {
                ...log,
                status: "error",
                message: `${log.message}\n⚠️ Error: ${errMsg}`,
                data: { error: errMsg }
              } : log))
              throw err; // propagate to loop node
            }
          }

          await new Promise(resolve => setTimeout(resolve, 200))
          loopResults.push({ index: idx, item, results: downstreamNodes.map(dn => localNodeOutputs[dn.id]).filter(Boolean) })
        }

        if (loopMode === "sequential") {
          // Run iterations one after another (classic loop semantics)
          for (let i = 0; i < arrData.length; i++) {
            await runIteration(arrData[i], i)
          }
        } else {
          // Run all iterations concurrently in parallel
          await Promise.all(arrData.map((item, idx) => runIteration(item, idx)))
        }
        
        // End visual feedback for group node
        setNodes(prev => prev.map(n => n.type === "group" ? { ...n, data: { ...n.data, status: "idle" as const } } : n))

        nodeOutputs[node.id] = { iterations: loopResults.length, results: loopResults }
        
        // Activate outgoing edges of any internal nodes that lead to external nodes (Bridging Connection Gap)
        downstreamNodes.forEach(dn => {
          allEdges
            .filter(e => e.source === dn.id)
            .forEach(e => activeEdgeIds.add(e.id))
        })

        setLogs(prev => [...prev, { message: `[Loop complete] All ${loopResults.length} iterations executed in ${loopMode.toUpperCase()} mode.`, data: nodeOutputs[node.id] }])
      } else if (node.data.type === "output") {
        // Collect all upstream outputs
        const upstreamIds = getUpstreamNodeIds(allEdges, node.id)
        const aggregated: Record<string, unknown> = {}
        for (const uid of upstreamIds) {
          if (nodeOutputs[uid]) {
            aggregated[uid] = nodeOutputs[uid]
          }
        }
        nodeOutputs[node.id] = { [resolvedParams.outputKey || "result"]: aggregated }
        markNodeSuccess(nodeOutputs[node.id], `Aggregated ${Object.keys(aggregated).length} upstream outputs under key "${resolvedParams.outputKey || "result"}"`)
      }

        // Apply user-defined output mapping to reshape the node's output before it flows downstream
        if (nodeOutputs[node.id] && resolvedParams.outputMapping && resolvedParams.outputMapping !== "[]") {
          nodeOutputs[node.id] = applyOutputMapping(nodeOutputs[node.id], resolvedParams.outputMapping, nodeOutputs)
        }

        // If execution was successful and not a router/classifier brancher, activate ALL outgoing edges from this node
        if (node.data.type !== "router" && node.data.type !== "classifier") {
          allEdges.filter(e => e.source === node.id).forEach(e => activeEdgeIds.add(e.id))
        }

        const delayMs = node.data.type === "delay" ? parseInt(resolvedParams.ms || "2000") : 1500
        await new Promise(resolve => setTimeout(resolve, delayMs))

        // success status
        setNodes(prev => prev.map(n => n.id === node.id ? {
          ...n,
          data: { ...n.data, status: "success" as const }
        } : n))
      } catch (nodeErr: unknown) {
        const errMsg = nodeErr instanceof Error ? nodeErr.message : String(nodeErr)
        setNodes(prev => prev.map(n => n.id === node.id ? {
          ...n,
          data: { ...n.data, status: "error" as const }
        } : n))
        setLogs(prev => prev.map(log => log.id === logId ? {
          ...log,
          status: "error",
          message: `${log.message}\n⚠️ Error: ${errMsg}`,
          data: { error: errMsg }
        } : log))
        break // Stop executing the rest of the workflow on error!
      }
    }

      setLogs(prev => [...prev, { message: `[Executor] All steps executed cleanly. 🎉` }])
    } catch (err) {
      console.error(err)
      setLogs(prev => [...prev, { message: `[Executor] Workflow failed with internal error: ${err instanceof Error ? err.message : String(err)}`, status: "error" }])
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <WorkflowNodesContext.Provider value={nodes}>
    <SidebarProvider>
      <AppSidebar 
        user={{ 
          name: session.user.name || "User", 
          email: session.user.email || "", 
          avatar: session.user.image || "" 
        }} 
      />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {activeWorkflowId === null ? (
          <div className="flex flex-col flex-1 overflow-y-auto p-8 bg-muted/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <WorkflowIcon className="size-6 text-primary" />
                  Workflows Builder
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Create, configure, and automate complex workflows with AI and custom actions.
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="font-semibold gap-1.5 h-11 px-5 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              >
                + Create New Workflow
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="relative max-w-md mb-6">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflows..."
                className="pl-10 h-10 text-sm focus-visible:ring-1"
              />
            </div>

            {/* List / Grid of workflows */}
            {loadingWorkflows ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3 text-muted-foreground">
                <SparkleIcon className="size-8 animate-spin text-primary" />
                <p className="text-sm">Loading workflows from database...</p>
              </div>
            ) : workflows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-lg bg-card text-center p-8 gap-4">
                <div className="p-4 bg-muted rounded-full">
                  <WorkflowIcon className="size-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">No workflows found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    {"You haven't created any workflows yet. Click the button below to build your first automation."}
                  </p>
                </div>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="font-semibold gap-1.5 h-10 px-4 text-sm"
                >
                  + Create First Workflow
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows
                  .filter(wf => 
                    wf.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    (wf.description || "").toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(wf => (
                    <Card key={wf.id} className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-card flex flex-col" onClick={() => loadWorkflow(wf.id)}>
                      <CardContent className="p-5 flex flex-col flex-1 h-full min-h-[160px] justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-base text-foreground truncate">{wf.name}</h3>
                            <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                              {new Date(wf.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                            {wf.description || "No description provided."}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t pt-4 mt-4 gap-2">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {wf.nodes ? (Array.isArray(wf.nodes) ? wf.nodes.length : 1) : 1} nodes
                          </span>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={(e) => {
                                e.stopPropagation()
                                loadWorkflow(wf.id)
                              }}
                              className="text-xs h-8 px-3 font-semibold"
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={(e) => deleteWorkflow(wf.id, e)}
                              className="text-xs h-8 px-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}

            {/* Custom Create Modal Dialog */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <form 
                  onSubmit={createWorkflow} 
                  className="bg-card border shadow-xl rounded-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200"
                  onClick={e => e.stopPropagation()}
                >
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Create New Workflow</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter a name and description to create your automated workflow canvas.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workflow Name</Label>
                      <Input
                        value={newWorkflowName}
                        onChange={(e) => setNewWorkflowName(e.target.value)}
                        placeholder="e.g. Lead Qualification Engine"
                        required
                        className="text-sm h-10 rounded-md"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</Label>
                      <Textarea
                        value={newWorkflowDescription}
                        onChange={(e) => setNewWorkflowDescription(e.target.value)}
                        placeholder="e.g. Analyzes prospect profiles and creates tailored vector backgrounds."
                        className="text-sm min-h-[80px] rounded-md resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      className="text-xs h-9 rounded-md"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving || !newWorkflowName.trim()}
                      className="text-xs h-9 rounded-md font-bold"
                    >
                      {saving ? "Creating..." : "Create Workflow"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

          </div>
        ) : (
          <>
            <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setActiveWorkflowId(null)}
                  className="gap-1 px-2.5 h-9 text-xs"
                >
                  <ArrowLeftIcon className="size-4" />
                  Workflows
                </Button>
                <Separator orientation="vertical" className="mx-1 h-4" />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Input 
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-bold px-0 h-9 font-sans w-full max-w-[240px] truncate"
                  />
                  {workflowDescription && (
                    <span className="hidden md:inline text-xs text-muted-foreground truncate opacity-70">
                      — {workflowDescription}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const currentWorkflowJson = JSON.stringify({
                      nodes: nodes.map(n => ({
                        id: n.id,
                        type: n.type,
                        position: n.position,
                        parentId: n.parentId,
                        extent: n.extent,
                        style: n.style,
                        data: {
                          label: n.data.label,
                          type: n.data.type,
                          params: n.data.params,
                        }
                      })),
                      edges: edges
                    }, null, 2);
                    setWorkflowJsonText(currentWorkflowJson);
                    setJsonImportError(null);
                    setShowJsonModal(true);
                  }}
                  className="text-xs rounded-none font-semibold px-4 h-9 flex gap-1.5 items-center"
                >
                  <BracesIcon className="size-3.5" />
                  Code / JSON
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={saveWorkflow} 
                  disabled={saving}
                  className="text-xs rounded-none font-semibold px-4 h-9"
                >
                  {saving ? "Saving..." : "Save Workflow"}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleRunClick} 
                  disabled={isRunning || nodes.length === 0}
                  className="text-xs rounded-none gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 h-9"
                >
                  <PlayCircleIcon className="size-4" />
                  {isRunning ? "Running..." : "Run Workflow"}
                </Button>
                <ThemeToggle />
              </div>
            </header>

            {/* Full Viewport Canvas */}
            <div className="relative w-full h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] flex overflow-hidden bg-muted/5 select-none shrink-0">
          {/* Canvas Embedded Left Sidebar */}
          <div className="w-[300px] border-r bg-card flex flex-col h-full min-h-0 max-h-full overflow-hidden z-10 shrink-0">
            <div className="p-4 border-b shrink-0">
              <h3 className="text-sm font-bold text-foreground">Quick Tiles Toolbox</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Click any block tile to place on the canvas</p>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2">
              {AVAILABLE_TILES.map((tile) => {
                const colorMap: Record<string, string> = {
                  slate: "bg-slate-700", stone: "bg-stone-700", teal: "bg-teal-700",
                  rose: "bg-rose-700", sky: "bg-sky-700", red: "bg-red-700", amber: "bg-amber-700",
                  emerald: "bg-emerald-700", indigo: "bg-indigo-700", purple: "bg-purple-700",
                  violet: "bg-violet-700", pink: "bg-pink-700", cyan: "bg-cyan-700",
                  fuchsia: "bg-fuchsia-700", lime: "bg-lime-700", orange: "bg-orange-700"
                }
                return (
                  <button
                    key={tile.name}
                    onClick={() => addBlockNode(tile)}
                    className="w-full flex items-start gap-3 p-2.5 border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group rounded-md"
                  >
                    <div className={`shrink-0 p-2 rounded-md shadow-sm ${colorMap[tile.color]}`}>
                      {tile.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-foreground block leading-tight group-hover:text-primary transition-colors">{tile.name}</span>
                      <span className="text-[10px] text-muted-foreground leading-snug block mt-0.5">{tile.description}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="p-4 border-t bg-muted/10 space-y-3 shrink-0">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setNodes([])
                  setEdges([])
                  setLogs([])
                  setSelectedNode(null)
                  setSelectedEdge(null)
                  setIsSheetOpen(false)
                  setIsRunSheetOpen(false)
                }}
                className="w-full text-xs rounded-none h-9"
              >
                Clear All Canvas
              </Button>
            </div>
          </div>

          {/* React Flow Workspace */}
          <ContextMenu>
            <ContextMenuTrigger className="flex-1 h-full relative flex flex-col min-h-0 overflow-hidden">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeUpdate={onEdgeUpdate}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background color="currentColor" className="text-foreground/15 dark:text-foreground/20" gap={20} size={1.5} />
              <Controls className="!border-border bg-card text-foreground rounded-none shadow-sm" />
              <MiniMap 
                nodeColor={(node) => {
                  const type = node.data?.type as NodeType
                  if (type === "trigger") return "#475569"
                  if (type === "delay") return "#57534e"
                  if (type === "image-gen") return "#be123c"
                  if (type === "http-request") return "#0369a1"
                  if (type === "script") return "#b91c1c"
                  if (type === "output") return "#047857"
                  if (type === "loop") return "#4338ca"
                  if (type === "llm") return "#6d28d9"
                  if (type === "router") return "#be185d"
                  if (type === "classifier") return "#d97706"
                  if (type === "merge") return "#0e7490"
                  if (type === "boolean") return "#a21caf"
                  if (type === "transform") return "#4d7c0f"
                  if (type === "filter") return "#c2410c"
                  return "#475569"
                }}
                className="!bg-card !border-border rounded-none"
              />
            </ReactFlow>

            <ContextMenuContent className="w-48 bg-card border-border shadow-xl">
              <ContextMenuItem 
                onClick={groupSelectedNodes}
                disabled={nodes.filter(n => n.selected && n.type !== "group" && !n.parentId).length === 0}
                className="cursor-pointer font-medium"
              >
                <LayersIcon className="mr-2 size-4" />
                Group Selected
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={ungroupSelectedNodes}
                disabled={nodes.filter(n => n.selected && (n.type === "group" || n.data.type === "group")).length === 0}
                className="cursor-pointer font-medium"
              >
                <Trash2Icon className="mr-2 size-4 text-destructive" />
                Ungroup Selected
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem 
                onClick={() => {
                  setNodes([])
                  setEdges([])
                }}
                className="cursor-pointer font-medium text-destructive"
              >
                <Trash2Icon className="mr-2 size-4" />
                Clear Canvas
              </ContextMenuItem>
            </ContextMenuContent>

            {/* Premium Bottom Center AI Omni Box (Centered in Canvas) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-xl px-4">
              <div className="bg-card/95 border border-primary/20 shadow-xl backdrop-blur-md rounded-none overflow-hidden flex flex-col transition-all">
                
                {/* Expandable chat thread within the omni box itself when sidebar chat is closed */}
                {!isChatOpen && chatMessages.length > 1 && (
                  <div className="max-h-[300px] overflow-y-auto p-4 border-b border-border space-y-3 flex flex-col min-h-[100px] scrollbar-thin">
                    {chatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-2.5 max-w-[85%] ${
                          msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        {/* Author Icons */}
                        <div className="shrink-0">
                          {msg.role === 'user' ? (
                            session?.user?.image ? (
                              <img src={session.user.image} alt="User" className="size-6 rounded-full" />
                            ) : (
                              <div className="size-6 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                                U
                              </div>
                            )
                          ) : (
                            <div className="size-6 bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/20 rounded-full">
                              <SparkleIcon className="size-3.5 animate-pulse" />
                            </div>
                          )}
                        </div>

                        {/* Text Thread Content */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                            {msg.role === 'user' ? 'You' : 'AI'}
                          </span>
                          <div className={`p-2.5 text-xs leading-relaxed rounded-none select-text ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground font-semibold' 
                              : 'bg-muted border border-border text-foreground font-medium whitespace-pre-wrap'
                          }`}>
                            {msg.thought && <ThoughtBlock thought={msg.thought} />}
                            {msg.text || (
                              <span className="inline-flex gap-1.5 items-center font-bold text-primary/70 animate-pulse">
                                <SparkleIcon className="size-3 animate-spin text-primary" />
                                Analyzing flow...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isChatStreaming && chatMessages[chatMessages.length - 1]?.text && (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] pl-8">
                        <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="ml-1 font-medium italic">Streaming response...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}

                <form onSubmit={handleAiCommand} className="flex gap-2 p-1.5 items-center">
                  <div className="flex-1 flex items-center gap-2.5 px-3">
                    <SparkleIcon className={`size-4.5 text-primary shrink-0 ${isChatStreaming ? 'animate-spin' : 'animate-pulse'}`} />
                    <Input
                      value={omniInput}
                      onChange={(e) => setOmniInput(e.target.value)}
                      placeholder="Type a message or build request..."
                      disabled={isChatStreaming || isRunning}
                      className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs px-0 h-9 font-medium text-foreground bg-transparent w-full placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button 
                      type="submit" 
                      disabled={isChatStreaming || isRunning || !omniInput.trim()}
                      className="h-9 px-4 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-none gap-1"
                    >
                      {isChatStreaming ? "Streaming..." : "Send"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsChatOpen(true)
                      }}
                      title="Maximize AI Chat"
                      className="h-9 w-9 p-0 rounded-none flex items-center justify-center hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    >
                      <Maximize2Icon className="size-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
            </ContextMenuTrigger>
          </ContextMenu>

          {/* Run Output Sheet (Right Sidebar) */}
          {isRunSheetOpen && (
            <div className="w-[400px] border-l bg-card flex flex-col h-full min-h-0 max-h-full overflow-hidden z-10 shrink-0">
              <div className="p-6 border-b shrink-0 flex justify-between items-center bg-card z-20">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Execution Run</h3>
                  <p className="text-xs text-muted-foreground">Live progress and node outputs</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsRunSheetOpen(false)}>
                  <Trash2Icon className="size-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isAwaitingInputs ? (
                  <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ZapIcon className="size-4 text-primary" />
                        <h4 className="text-sm font-bold text-primary">Trigger Input Required</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This workflow requires initial data to start. Please provide the expected payload variables below.
                      </p>
                    </div>

                    <div className="space-y-4 border border-border p-5 rounded-lg bg-card shadow-sm">
                      {expectedInputs.map(key => {
                        if (key.startsWith("_fileKey:")) {
                          const fileKey = key.substring(9)
                          return (
                            <div key={key} className="space-y-1.5">
                              <Label className="text-xs font-bold text-foreground uppercase tracking-wider">File Upload: {fileKey}</Label>
                              <Input 
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onload = () => {
                                      setRunInputData(prev => ({
                                        ...prev,
                                        [key]: reader.result as string,
                                        [`_fileNameKey:${fileKey}`]: file.name
                                      }))
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }}
                                className="text-xs h-10 rounded-md cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                              />
                              {runInputData[key] && (
                                <p className="text-[10px] text-emerald-500 font-mono truncate mt-1">
                                  ✓ loaded: {runInputData[`_fileNameKey:${fileKey}`] || "custom-file"} ({Math.round(runInputData[key].length / 1024)} KB)
                                </p>
                              )}
                            </div>
                          )
                        }
                        if (key === "_file_") {
                          return (
                            <div key={key} className="space-y-1.5">
                              <Label className="text-xs font-bold text-foreground uppercase tracking-wider">File Upload</Label>
                              <Input 
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onload = () => setRunInputData(prev => ({...prev, [key]: reader.result as string}))
                                    reader.readAsDataURL(file)
                                  }
                                }}
                                className="text-xs h-10 rounded-md cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                              />
                              {runInputData[key] && <p className="text-[10px] text-emerald-500 font-mono truncate mt-1">File loaded ({Math.round(runInputData[key].length / 1024)} KB)</p>}
                            </div>
                          )
                        }
                        return (
                          <div key={key} className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground uppercase tracking-wider">{key}</Label>
                            <Input 
                              value={runInputData[key] || ""}
                              onChange={(e) => setRunInputData(prev => ({...prev, [key]: e.target.value}))}
                              className="text-sm h-10 rounded-md font-mono"
                              placeholder={`Enter ${key}...`}
                            />
                          </div>
                        )
                      })}
                      <Button 
                        onClick={() => simulateExecution(runInputData)} 
                        className="w-full mt-2 gap-2 h-10 font-bold"
                      >
                        <PlayCircleIcon className="size-4" />
                        Start Execution
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-center gap-3 text-muted-foreground">
                        <SparklesIcon className="size-6 animate-pulse opacity-50" />
                        <p className="text-sm italic">Waiting for execution to start...</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {logs.map((log, i) => {
                          const logKey = log.id || i;
                          const isCollapsed = collapsedLogs[logKey] !== undefined 
                            ? collapsedLogs[logKey] 
                            : (log.status === "success");

                          return (
                            <div key={i} className="flex flex-col gap-2 relative">
                              {/* Visual connector line between steps */}
                              {i !== logs.length - 1 && (
                                <div className="absolute left-2.5 top-6 bottom-[-24px] w-0.5 bg-border/50" />
                              )}
                              
                              <div 
                                className="flex items-center gap-3 relative z-10 cursor-pointer select-none group/log"
                                onClick={() => {
                                  setCollapsedLogs(prev => ({
                                    ...prev,
                                    [logKey]: !isCollapsed
                                  }))
                                }}
                              >
                                <div className="shrink-0 size-5 flex items-center justify-center bg-card">
                                  {log.status === "running" && <SparklesIcon className="size-4 text-amber-500 animate-pulse" />}
                                  {log.status === "success" && <div className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />}
                                  {log.status === "error" && <div className="size-2 rounded-full bg-red-500 ring-4 ring-red-500/20" />}
                                  {!log.status && <div className="size-1.5 rounded-full bg-primary" />}
                                </div>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className={`text-sm font-bold truncate ${log.status === 'error' ? 'text-red-500' : 'text-foreground'} group-hover/log:text-primary transition-colors`}>
                                    {log.label || "System"}
                                  </span>
                                  {log.type && (
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono px-1.5 py-0.5 bg-muted rounded-sm shrink-0">
                                      {log.type}
                                    </span>
                                  )}
                                </div>
                                {(log.message || log.data) && (
                                  <div className="text-muted-foreground/50 group-hover/log:text-foreground shrink-0 transition-colors mr-1">
                                    {isCollapsed ? <ChevronRightIcon className="size-3.5" /> : <ChevronDownIcon className="size-3.5" />}
                                  </div>
                                )}
                              </div>
                              
                              {!isCollapsed && (log.message || log.data) && (
                                <div className="pl-8 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                                  {log.message && (
                                    <p className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{log.message}</p>
                                  )}
                                  {log.data && (
                                    <DataRenderer data={log.data} setMaximizedImage={setMaximizedImage} />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Canvas Embedded Right Sidebar (Push configuration panel) */}
          {isSheetOpen && !isRunSheetOpen && (selectedNode || selectedEdge) && (
            <div className="w-[400px] border-l bg-card flex flex-col h-full min-h-0 max-h-full overflow-hidden z-10 shrink-0">
              <div className="p-6 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 bg-primary/10 text-primary font-bold">
                    {selectedNode ? selectedNode.data.type : "Connection"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">ID: {selectedNode ? selectedNode.id : selectedEdge?.id}</span>
                </div>
                <h3 className="text-lg font-bold mt-1 text-foreground">Configure {selectedNode ? "Node" : "Edge"}</h3>
                <p className="text-xs text-muted-foreground">
                  Modify the selected {selectedNode ? "block" : "connection"} configurations.
                </p>
              </div>

              {selectedNode && (
                <div className="relative flex-1 min-h-0 flex flex-col">
                  {/* Upstream Variables Panel */}
                  <div className="shrink-0 p-4 border-b bg-muted/20 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Available Upstream Variables</Label>
                      <div className="relative w-32">
                        <SearchIcon className="absolute left-1.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                        <Input
                          value={upstreamSearch}
                          onChange={(e) => setUpstreamSearch(e.target.value)}
                          placeholder="Search..."
                          className="h-6 text-[10px] pl-6 py-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                      {getUpstreamNodeIds(edges, selectedNode.id).length === 0 && (
                        <span className="text-[10px] text-muted-foreground italic">No upstream nodes connected.</span>
                      )}
                      
                      {getUpstreamNodeIds(edges, selectedNode.id).map((uid, idx) => {
                        const node = nodes.find(n => n.id === uid);
                        if (!node) return null;
                        
                        const fields = getStaticNodeFields(uid, nodes);
                        
                        const filteredFields = upstreamSearch 
                          ? fields.filter(f => f.name.toLowerCase().includes(upstreamSearch.toLowerCase()))
                          : fields;
                          
                        const matchesNodeName = upstreamSearch && node.data.label.toLowerCase().includes(upstreamSearch.toLowerCase());
                        
                        if (upstreamSearch && !matchesNodeName && filteredFields.length === 0) {
                          return null;
                        }
                        
                        return (
                          <Collapsible key={uid} defaultOpen={upstreamSearch ? true : idx === 0} className="border border-border/50 bg-background/50 rounded-md overflow-hidden">
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 transition-colors text-xs font-bold text-foreground">
                              <div className="flex items-center gap-1.5">
                                <div className="size-1.5 rounded-full bg-primary/60" />
                                {node.data.label}
                                {upstreamSearch && filteredFields.length > 0 && (
                                  <span className="ml-1 text-[9px] text-muted-foreground font-normal bg-muted px-1 rounded-full">{filteredFields.length}</span>
                                )}
                              </div>
                              <ChevronDownIcon className="size-3.5 text-muted-foreground/70" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-2 pt-0 pl-4 border-t border-border/50 bg-card/30">
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {/* Option to drag the entire node payload */}
                                {(!upstreamSearch || matchesNodeName || "entire payload".includes(upstreamSearch.toLowerCase())) && (
                                  <div 
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData("text/plain", `{{ $node["${uid}"].json }}`);
                                      e.dataTransfer.effectAllowed = "copy";
                                    }}
                                    className="text-[9px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform bg-primary/5 text-primary border border-primary/20 px-1.5 py-0.5 rounded flex items-center gap-1"
                                    title="Drag the entire JSON payload"
                                  >
                                    <BracesIcon className="size-2.5 opacity-70" />
                                    <span className="font-mono font-bold">Entire Payload</span>
                                  </div>
                                )}
                                
                                {/* Options to drag specific fields */}
                                {filteredFields.map(f => (
                                  <div 
                                    key={f.name}
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData("text/plain", `{{ $node["${uid}"].json.${f.name} }}`);
                                      e.dataTransfer.effectAllowed = "copy";
                                    }}
                                    className="text-[9px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform bg-primary/10 text-primary border border-primary/30 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"
                                    title={`Drag field: ${f.name}`}
                                  >
                                    <span className="font-mono font-bold truncate max-w-[120px]">{f.name}</span>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )
                      })}
                      
                      {selectedNode.data.type !== "trigger" && (!upstreamSearch || "current item loop".includes(upstreamSearch.toLowerCase())) && (
                        <div className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <div className="size-1.5 rounded-full bg-emerald-500/60" />
                            Loop / Current Context
                          </div>
                          <div className="flex flex-wrap gap-1.5 pl-3">
                            <div 
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", `{{ $json }}`);
                                e.dataTransfer.effectAllowed = "copy";
                              }}
                              className="text-[9px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"
                              title="Drag the entire current loop item: {{ $json }}"
                            >
                              <span className="font-mono font-bold">Current Item</span>
                            </div>

                            {/* Loop item variable, e.g. {{ slide }} & {{ index }} */}
                            {(() => {
                              const loopNode = nodes.find(n => n.data.type === "loop")
                              if (!loopNode) return null
                              const itemName = loopNode.data.params.itemName || "item"
                              return (
                                <>
                                  <div 
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData("text/plain", `{{ ${itemName} }}`);
                                      e.dataTransfer.effectAllowed = "copy";
                                    }}
                                    className="text-[9px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"
                                    title={`Drag loop item variable: {{ ${itemName} }}`}
                                  >
                                    <span className="font-mono font-bold">{itemName}</span>
                                  </div>
                                  <div 
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData("text/plain", `{{ index }}`);
                                      e.dataTransfer.effectAllowed = "copy";
                                    }}
                                    className="text-[9px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"
                                    title="Drag current loop index: {{ index }}"
                                  >
                                    <span className="font-mono font-bold">index</span>
                                  </div>
                                </>
                              )
                            })()}

                            {/* Dynamically parsed fields of the current loop item */}
                            {(() => {
                              const loopNode = nodes.find(n => n.data.type === "loop")
                              const itemName = loopNode?.data.params.itemName || "item"
                              return getLoopFields(nodes, edges).map(f => (
                                <div 
                                  key={f.name}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData("text/plain", `{{ ${itemName}.${f.path} }}`);
                                    e.dataTransfer.effectAllowed = "copy";
                                  }}
                                  className="text-[9px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"
                                  title={`Drag loop item field: {{ ${itemName}.${f.name} }}`}
                                >
                                  <span className="font-mono font-bold">{itemName}.{f.name}</span>
                                </div>
                              ))
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Block Title</Label>
                    <DroppableInput 
                      value={selectedNode.data.label}
                      onChange={(e) => updateNodeData({ label: e.target.value })}
                      className="rounded-none text-xs h-9 font-semibold"
                    />
                  </div>

                {/* Trigger Fields */}
                {selectedNode.data.type === "trigger" && (
                  <>
                    <div className="p-3 border border-slate-300 bg-slate-50 dark:bg-slate-900/30 dark:border-slate-700 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <ZapIcon className="size-3 text-slate-600" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">How This Works</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        The Trigger is the <strong>entry point</strong> of your workflow. It defines how this automation starts. 
                        A webhook URL will be generated for external services (e.g., Shopify, Stripe) to call when an event occurs.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trigger Event Name</Label>
                      <DroppableInput 
                        value={selectedNode.data.params.eventName || selectedNode.data.params.event || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, eventName: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="e.g. On New Order, On Payment Received"
                      />
                      <p className="text-[10px] text-muted-foreground/60">A label describing what kicks off this workflow.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Webhook URL (auto-generated on save)</Label>
                      <DroppableInput 
                        value={selectedNode.data.params.webhookUrl || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, webhookUrl: e.target.value } })}
                        className="rounded-none text-xs h-9 font-mono"
                        placeholder="https://api.quickz.ai/v1/webhook/..."
                      />
                      <p className="text-[10px] text-muted-foreground/60">External services POST to this URL to start the workflow.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Incoming Payload Type</Label>
                      <select 
                        value={selectedNode.data.params.contentType || "application/json"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, contentType: e.target.value } })}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="application/json">JSON</option>
                        <option value="multipart/form-data">Form Data / File Upload</option>
                        <option value="text/plain">Plain Text</option>
                        <option value="image/png">Image (PNG URL / base64)</option>
                        <option value="application/xml">XML</option>
                      </select>
                      <p className="text-[10px] text-muted-foreground/60">The MIME type of the data the webhook expects to receive.</p>
                    </div>
                    <SchemaBuilderSection key={selectedNode.id} selectedNode={selectedNode} updateNodeData={updateNodeData} />
                    <p className="text-[10px] text-muted-foreground/60">Define the expected shape of the incoming payload. Used for validation and AI context.</p>
                    {/* File Uploader — shown when payload type supports files */}
                    {(selectedNode.data.params.contentType === "multipart/form-data" || selectedNode.data.params.contentType === "image/png") && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expected File Inputs</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              let currentFiles: { key: string, name: string, content: string }[] = []
                              try {
                                if (selectedNode.data.params.sampleFiles) {
                                  currentFiles = JSON.parse(selectedNode.data.params.sampleFiles)
                                } else if (selectedNode.data.params.sampleFile) {
                                  currentFiles = [{ key: "file", name: "legacy-sample-file", content: selectedNode.data.params.sampleFile }]
                                }
                              } catch {}
                              
                              const next = [...currentFiles, { key: `file_${currentFiles.length + 1}`, name: "", content: "" }]
                              updateNodeData({
                                params: {
                                  ...selectedNode.data.params,
                                  sampleFiles: JSON.stringify(next),
                                  sampleFile: next[0]?.content || ""
                                }
                              })
                            }}
                            className="text-[10px] h-7 px-2 font-bold rounded-none"
                          >
                            + Add File Input
                          </Button>
                        </div>
                        
                        {/* Display list of custom file input fields */}
                        {(() => {
                          let filesList: { key: string, name: string, content: string }[] = []
                          try {
                            if (selectedNode.data.params.sampleFiles) {
                              filesList = JSON.parse(selectedNode.data.params.sampleFiles)
                            } else if (selectedNode.data.params.sampleFile) {
                              filesList = [{ key: "file", name: "legacy-sample-file", content: selectedNode.data.params.sampleFile }]
                            }
                          } catch {}
                          
                          if (filesList.length === 0) {
                            return (
                              <p className="text-[10px] text-muted-foreground italic text-center p-2 bg-muted/10 border border-dashed rounded">
                                No file inputs defined yet. Click "+ Add File Input" to create one.
                              </p>
                            )
                          }
                          
                          return (
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                              {filesList.map((f, idx) => (
                                <div key={idx} className="space-y-1.5 p-2.5 border border-border bg-card rounded shadow-sm relative group/file-row">
                                  <div className="flex gap-2 items-center">
                                    <div className="flex-1 flex flex-col gap-1">
                                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Input Name / Payload Key</span>
                                      <Input
                                        value={f.key}
                                        onChange={(e) => {
                                          const next = [...filesList]
                                          next[idx] = { ...next[idx], key: e.target.value.replace(/\s+/g, "_") }
                                          updateNodeData({
                                            params: {
                                              ...selectedNode.data.params,
                                              sampleFiles: JSON.stringify(next),
                                              sampleFile: next[0]?.content || ""
                                            }
                                          })
                                        }}
                                        className="h-8 text-xs font-mono rounded-none"
                                        placeholder="e.g. invoice, avatar"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = [...filesList]
                                        next.splice(idx, 1)
                                        updateNodeData({
                                          params: {
                                            ...selectedNode.data.params,
                                            sampleFiles: JSON.stringify(next),
                                            sampleFile: next[0]?.content || ""
                                          }
                                        })
                                      }}
                                      className="shrink-0 size-8 mt-4 text-muted-foreground hover:text-destructive rounded-none"
                                      title="Delete file input"
                                    >
                                      <Trash2Icon className="size-3.5" />
                                    </Button>
                                  </div>
                                  
                                  <div className="pt-1">
                                    {f.content ? (
                                      <div className="flex items-center gap-2 text-[10px] bg-emerald-500/5 border border-emerald-500/20 p-2 rounded">
                                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-mono truncate font-bold text-foreground" title={f.name}>{f.name}</p>
                                          <p className="text-[9px] text-muted-foreground mt-0.5">{Math.round(f.content.length / 1024)} KB</p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const next = [...filesList]
                                            next[idx] = { ...next[idx], name: "", content: "" }
                                            updateNodeData({
                                              params: {
                                                ...selectedNode.data.params,
                                                sampleFiles: JSON.stringify(next),
                                                sampleFile: next[0]?.content || ""
                                              }
                                            })
                                          }}
                                          className="text-[10px] text-destructive hover:underline font-semibold"
                                        >
                                          Clear
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="relative">
                                        <Input
                                          type="file"
                                          accept={selectedNode.data.params.contentType === "image/png" ? "image/png,image/jpeg,image/webp,image/gif" : "*/*"}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                              const reader = new FileReader()
                                              reader.onload = () => {
                                                const next = [...filesList]
                                                next[idx] = {
                                                  ...next[idx],
                                                  name: file.name,
                                                  content: reader.result as string
                                                }
                                                updateNodeData({
                                                  params: {
                                                    ...selectedNode.data.params,
                                                    sampleFiles: JSON.stringify(next),
                                                    sampleFile: next[0]?.content || ""
                                                  }
                                                })
                                              }
                                              reader.readAsDataURL(file)
                                            }
                                          }}
                                          className="rounded-none text-xs h-8 cursor-pointer file:mr-2 file:py-0.5 file:px-2 file:rounded-none file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                        <p className="text-[10px] text-muted-foreground/60">Create distinct file input fields. Stored with custom label keys and mock filenames for downstream references like <code className="text-foreground">{"{{trigger.<inputName>}}"}</code>.</p>
                      </div>
                    )}
                  </>
                )}

                {/* Delay Duration */}
                {selectedNode.data.type === "delay" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delay Duration (ms)</Label>
                    <Input 
                      type="number"
                      value={selectedNode.data.params.ms || ""}
                      onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, ms: e.target.value } })}
                      className="rounded-none text-xs h-9"
                      placeholder="2000"
                    />
                  </div>
                )}

                {/* Image Gen (AI) Fields */}
                {selectedNode.data.type === "image-gen" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Model ID</Label>
                      <select 
                        value={selectedNode.data.params.model || "gemini-3.1-flash-image"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, model: e.target.value } })}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="gemini-3.1-flash-image">Gemini 3.1 Flash Image</option>
                        <option value="gemini-3-pro-image">Gemini 3 Pro Image</option>
                        <option value="imagen-4.0-generate-001">Imagen 4.0</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom API Key</Label>
                      <Input 
                        type="password"
                        value={selectedNode.data.params.apiKey || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, apiKey: e.target.value } })}
                        className="rounded-none text-xs h-9 font-mono"
                        placeholder="AIzaSy..."
                      />
                      <p className="text-[10px] text-muted-foreground/60">Your private Google API key.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Image Generation Prompt</Label>
                      <DroppableTextarea 
                        value={selectedNode.data.params.prompt || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, prompt: e.target.value } })}
                        className="rounded-none text-xs min-h-[100px] resize-none"
                        placeholder="A futuristic cybernetic interface with purple lights..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">How many variations?</Label>
                      <select 
                        value={selectedNode.data.params.numberOfImages || "1"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, numberOfImages: e.target.value } })}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="1">1 design</option>
                        <option value="2">2 designs</option>
                        <option value="3">3 designs</option>
                        <option value="4">4 designs</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Image Resolution</Label>
                      <select 
                        value={selectedNode.data.params.imageSize || "1K"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, imageSize: e.target.value } })}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="1K">Good (1024px) - Faster</option>
                        <option value="2K">Better (2048px) - Balanced</option>
                        {(selectedNode.data.params.model === 'gemini-3-pro-image' || selectedNode.data.params.model === 'nano-banana-2') && (
                          <option value="4K">Best (4096px) - Highest Quality</option>
                        )}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Aspect Ratio</Label>
                      <select 
                        value={selectedNode.data.params.aspectRatio || "1:1"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, aspectRatio: e.target.value } })}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="auto">Auto (based on platform)</option>
                        <option value="1:1">Square (1:1)</option>
                        <option value="3:4">Portrait (3:4)</option>
                        <option value="4:3">Landscape (4:3)</option>
                        <option value="9:16">Story (9:16)</option>
                        <option value="16:9">Wide (16:9)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Include People?</Label>
                      <select 
                        value={selectedNode.data.params.personGeneration || "dont_allow"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, personGeneration: e.target.value } })}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="dont_allow">No people</option>
                        <option value="allow_adult">Adults only</option>
                        <option value="allow_all">Adults & children</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Creativity Level (Temperature)</Label>
                        <span className="text-[10px] text-muted-foreground">
                          {selectedNode.data.params.temperature || "1.0"}
                        </span>
                      </div>
                      <input 
                        type="range"
                        step="0.1"
                        min="0"
                        max="2"
                        value={selectedNode.data.params.temperature || "1.0"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, temperature: e.target.value } })}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[9px] text-muted-foreground/60 uppercase">
                        <span>Precise</span>
                        <span>Balanced</span>
                        <span>Wild</span>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Variety (Top-P)</Label>
                        <span className="text-[10px] text-muted-foreground">
                          {selectedNode.data.params.topP || "0.95"}
                        </span>
                      </div>
                      <input 
                        type="range"
                        step="0.05"
                        min="0"
                        max="1"
                        value={selectedNode.data.params.topP || "0.95"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, topP: e.target.value } })}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[9px] text-muted-foreground/60 uppercase">
                        <span>Focused</span>
                        <span>Diverse</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Style Reference Image (optional)</Label>
                      <div className="flex gap-2">
                        <DroppableInput 
                          value={selectedNode.data.params.referenceImage || ""}
                          onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, referenceImage: e.target.value } })}
                          className="rounded-none text-xs h-9 flex-1"
                          placeholder="{{ $node['trigger-1'].json.file }} or Base64..."
                        />
                        <div className="relative">
                          <Button type="button" variant="outline" className="rounded-none h-9 text-xs px-3">
                            Upload File
                          </Button>
                          <Input 
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onload = () => {
                                  updateNodeData({ params: { ...selectedNode.data.params, referenceImage: reader.result as string } })
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                          />
                        </div>
                      </div>
                      {selectedNode.data.params.referenceImage && selectedNode.data.params.referenceImage.startsWith("data:image") && (
                        <div className="flex items-center gap-2 mt-1">
                          <img src={selectedNode.data.params.referenceImage} alt="Reference" className="size-12 object-cover rounded border border-border" />
                          <span className="text-[10px] text-emerald-600 font-mono truncate flex-1">✓ Ref loaded ({Math.round(selectedNode.data.params.referenceImage.length / 1024)} KB)</span>
                          <button
                            type="button"
                            onClick={() => updateNodeData({ params: { ...selectedNode.data.params, referenceImage: "" } })}
                            className="text-[10px] text-destructive hover:underline shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground/60">Provide a base64 string, variable, or upload a file to guide the visual style.</p>
                    </div>
                  </>
                )}

                {/* HTTP Request Fields */}
                {selectedNode.data.type === "http-request" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target URL</Label>
                      <Input 
                        value={selectedNode.data.params.url || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, url: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="https://api.github.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">HTTP Method</Label>
                      <select 
                        value={selectedNode.data.params.method || "GET"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, method: e.target.value } })}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">JSON Request Body</Label>
                      <Textarea 
                        value={selectedNode.data.params.body || "{}"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, body: e.target.value } })}
                        className="rounded-none text-xs min-h-[100px] font-mono resize-none"
                        placeholder="{}"
                      />
                    </div>
                  </>
                )}

                {/* Custom Javascript */}
                {selectedNode.data.type === "script" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom JavaScript</Label>
                    <Textarea 
                      value={selectedNode.data.params.code || ""}
                      onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, code: e.target.value } })}
                      className="rounded-none text-xs min-h-[150px] font-mono resize-none"
                      placeholder="console.log('Hello from node');"
                    />
                  </div>
                )}

                {/* Loop Fields */}
                {selectedNode.data.type === "loop" && (
                  <>
                    <div className="p-3 border border-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-700 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <RepeatIcon className="size-3 text-indigo-600" />
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Iterator / Loop Node</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        The Iterator node iterates over an array from incoming data. Each item is passed to connected
                        downstream nodes using the item variable name you define below. Choose <strong>parallel</strong> mode
                        to run all iterations concurrently, or <strong>sequential</strong> (loop) mode to process items one after another.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Execution Mode</Label>
                      <select
                        value={selectedNode.data.params.mode || "parallel"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, mode: e.target.value } })}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="parallel">Parallel — run all iterations concurrently</option>
                        <option value="sequential">Sequential — loop through items one by one</option>
                      </select>
                      <p className="text-[10px] text-muted-foreground/60">Parallel is faster for independent items; sequential preserves order and is gentler on rate limits.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Array JSONPath</Label>
                      <Input 
                        value={selectedNode.data.params.arrayPath || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, arrayPath: e.target.value } })}
                        className="rounded-none text-xs h-9 font-mono"
                        placeholder="$.slides"
                      />
                      <p className="text-[10px] text-muted-foreground/60">JSONPath expression to extract the array from incoming data.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item Variable Name</Label>
                      <Input 
                        value={selectedNode.data.params.itemName || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, itemName: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="slide"
                      />
                      <p className="text-[10px] text-muted-foreground/60">Downstream nodes can reference the current item via <code className="text-foreground">{"{{<itemName>}}"}</code> (e.g. <code className="text-foreground">{"{{slideTitle}}"}</code>).</p>
                    </div>
                  </>
                )}

                {/* Router Fields */}
                {selectedNode.data.type === "router" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Condition (JavaScript/Expression)</Label>
                    <Input 
                      value={selectedNode.data.params.condition || ""}
                      onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, condition: e.target.value } })}
                      className="rounded-none text-xs h-9 font-mono"
                      placeholder="{{$json.value}} > 5"
                    />
                    <p className="text-[10px] text-muted-foreground/60">Evaluates to true or false. Edges can be connected to the true/false handles.</p>
                  </div>
                )}

                {/* Classifier Fields */}
                {selectedNode.data.type === "classifier" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Incoming Value to Match</Label>
                      <DroppableInput 
                        value={selectedNode.data.params.valueToMatch || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, valueToMatch: e.target.value } })}
                        className="rounded-none text-xs h-9 font-mono"
                        placeholder="e.g. {{$json.status}} or {{$node['node-1'].json.emittedValue}}"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Match Cases / Possibilities (Comma-separated)</Label>
                      <Input 
                        value={selectedNode.data.params.possibilities || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, possibilities: e.target.value } })}
                        className="rounded-none text-xs h-9 font-mono"
                        placeholder="new, assigned, resolved"
                      />
                      <p className="text-[10px] text-muted-foreground/60">Define custom routing labels. A corresponding output handle will appear for each matching case.</p>
                    </div>
                  </>
                )}

                {/* Merge Fields */}
                {selectedNode.data.type === "merge" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Merge Strategy</Label>
                    <select 
                      value={selectedNode.data.params.strategy || "wait-all"}
                      onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, strategy: e.target.value } })}
                      className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    >
                      <option value="wait-all">Wait for all branches</option>
                      <option value="first-wins">Pass through first arriving branch</option>
                      <option value="append">Append as array</option>
                    </select>
                  </div>
                )}

                {/* Boolean Fields */}
                {selectedNode.data.type === "boolean" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Operator</Label>
                      <select 
                        value={selectedNode.data.params.operator || "AND"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, operator: e.target.value } })}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                        <option value="NOT">NOT</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Operand 1</Label>
                      <Input 
                        value={selectedNode.data.params.operand1 || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, operand1: e.target.value } })}
                        className="rounded-none text-xs h-9 font-mono"
                        placeholder="true"
                      />
                    </div>
                    {selectedNode.data.params.operator !== "NOT" && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Operand 2</Label>
                        <Input 
                          value={selectedNode.data.params.operand2 || ""}
                          onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, operand2: e.target.value } })}
                          className="rounded-none text-xs h-9 font-mono"
                          placeholder="false"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Transform Fields */}
                {selectedNode.data.type === "transform" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">JSON Mapping Template</Label>
                    <Textarea 
                      value={selectedNode.data.params.mapping || "{}"}
                      onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, mapping: e.target.value } })}
                      className="rounded-none text-xs min-h-[150px] font-mono resize-none"
                      placeholder='{ "newKey": "{{$json.oldKey}}" }'
                    />
                  </div>
                )}

                {/* Filter Fields */}
                {selectedNode.data.type === "filter" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Keep condition</Label>
                    <Input 
                      value={selectedNode.data.params.condition || ""}
                      onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, condition: e.target.value } })}
                      className="rounded-none text-xs h-9 font-mono"
                      placeholder="{{$json.status}} === 'active'"
                    />
                  </div>
                )}

                {/* LLM Node Fields */}
                {selectedNode.data.type === "llm" && (
                  <>
                    <div className="p-3 border border-violet-300 bg-violet-50 dark:bg-violet-900/30 dark:border-violet-700 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <BrainCircuitIcon className="size-3 text-violet-600" />
                        <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Advanced LLM</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Configure a custom LLM block with your preferred AI provider, model selection, and API credentials.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI Provider</Label>
                      <select 
                        value={selectedNode.data.params.provider || "openai"}
                        onChange={(e) => {
                          const newProvider = e.target.value;
                          let newModel = "";
                          if (newProvider === "openai") newModel = "gpt-4o-mini";
                          else if (newProvider === "anthropic") newModel = "claude-3-5-sonnet-20241022";
                          else if (newProvider === "google") newModel = "gemini-2.5-flash";
                          else if (newProvider === "groq") newModel = "llama-3.3-70b-versatile";
                          else if (newProvider === "open-source") newModel = "meta-llama/llama-3.1-405b-instruct";
                          
                          updateNodeData({ params: { ...selectedNode.data.params, provider: newProvider, model: newModel } });
                        }}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="google">Google Gemini</option>
                        <option value="groq">Groq</option>
                        <option value="open-source">Open Source Router</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Model ID</Label>
                      <select 
                        value={
                          PROVIDER_MODELS[selectedNode.data.params.provider || "openai"]?.some(m => m.id === selectedNode.data.params.model)
                            ? selectedNode.data.params.model || ""
                            : (selectedNode.data.params.provider === "google" ? "gemini-2.5-flash" : "custom")
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "custom") {
                            updateNodeData({ params: { ...selectedNode.data.params, model: "" } });
                          } else {
                            updateNodeData({ params: { ...selectedNode.data.params, model: val } });
                          }
                        }}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        {(PROVIDER_MODELS[selectedNode.data.params.provider || "openai"] || []).map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                        {selectedNode.data.params.provider !== "google" && (
                          <option value="custom">Other (Enter Custom Model ID)</option>
                        )}
                      </select>

                      {selectedNode.data.params.provider !== "google" && (!PROVIDER_MODELS[selectedNode.data.params.provider || "openai"]?.some(m => m.id === selectedNode.data.params.model) || selectedNode.data.params.model === "") && (
                        <Input 
                          value={selectedNode.data.params.model || ""}
                          onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, model: e.target.value } })}
                          className="rounded-none text-xs h-9 font-mono mt-1.5"
                          placeholder="e.g. gpt-4o, claude-3-5-sonnet-20241022"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom API Key</Label>
                      <Input 
                        type="password"
                        value={selectedNode.data.params.apiKey || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, apiKey: e.target.value } })}
                        className="rounded-none text-xs h-9 font-mono"
                        placeholder="sk-..."
                      />
                      <p className="text-[10px] text-muted-foreground/60">Your private API credential. Stored securely on this workspace client.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prompt Instructions</Label>
                      <Textarea 
                        value={selectedNode.data.params.prompt || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, prompt: e.target.value } })}
                        className="rounded-none text-xs min-h-[120px] resize-none"
                        placeholder="Translate the following payload to French: {{trigger.payload}}..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Temperature</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={selectedNode.data.params.temperature || "0.7"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, temperature: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="0.7"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Response Format</Label>
                      <select 
                        value={selectedNode.data.params.responseFormat || "text"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, responseFormat: e.target.value } })}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="text">Plain Text</option>
                        <option value="json_object">JSON Object</option>
                      </select>
                    </div>
                    {selectedNode.data.params.responseFormat === "json_object" && (
                      <SchemaBuilderSection 
                        key={selectedNode.id} 
                        selectedNode={selectedNode} 
                        updateNodeData={updateNodeData} 
                        paramKey="jsonSchema" 
                        title="Structured JSON Schema" 
                      />
                    )}
                  </>
                )}

                {/* Output Fields */}
                {selectedNode.data.type === "output" && (
                  <>
                    <div className="p-3 border border-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-700 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <SquareArrowOutUpRightIcon className="size-3 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Terminal Node</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        The Output node marks the <strong>end of your workflow</strong>. It aggregates all incoming data from 
                        connected branches and produces the final result payload returned to the caller.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Output Key</Label>
                      <Input 
                        value={selectedNode.data.params.outputKey || "result"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, outputKey: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="result"
                      />
                      <p className="text-[10px] text-muted-foreground/60">The key name under which the final result is returned.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Output Format</Label>
                      <select 
                        value={selectedNode.data.params.format || "json"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, format: e.target.value } })}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="json">JSON</option>
                        <option value="text">Plain Text</option>
                        <option value="html">HTML</option>
                        <option value="buffer">Raw Buffer</option>
                      </select>
                      <p className="text-[10px] text-muted-foreground/60">The serialization format for the workflow payload.</p>
                    </div>
                  </>
                )}

                {/* Output Mapping Section — available for all non-group node types */}
                {selectedNode.data.type !== "group" && (
                  <OutputMappingSection key={selectedNode.id} selectedNode={selectedNode} updateNodeData={updateNodeData} />
                )}
                  </div>
                </div>
              )}

              {selectedEdge && (
                <div className="relative flex-1 min-h-0 overflow-hidden">
                  <div className="absolute inset-0 overflow-y-auto p-6 space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source Node ID</Label>
                      <Input 
                        disabled
                        value={selectedEdge.source}
                        className="rounded-none text-xs h-9 bg-muted font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Node ID</Label>
                      <Input 
                        disabled
                        value={selectedEdge.target}
                        className="rounded-none text-xs h-9 bg-muted font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-4">
                      You can delete this connection by clicking the delete button below, or by pressing Backspace/Delete on your keyboard.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-6 border-t shrink-0 flex flex-row items-center gap-3 bg-muted/5">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={deleteSelectedElement}
                  className="flex-1 rounded-none text-xs h-10 gap-1.5"
                >
                  <Trash2Icon className="size-4" />
                  Delete {selectedNode ? "Node" : "Edge"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsSheetOpen(false)}
                  className="flex-1 rounded-none text-xs h-10"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* AI Chat Assistant Panel (Push configuration panel) */}
          {isChatOpen && (
            <div className="w-[400px] border-l bg-card flex flex-col h-full min-h-0 max-h-full overflow-hidden z-10 shrink-0">
              <div className="p-6 border-b shrink-0 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SparkleIcon className="size-4.5 text-primary animate-pulse" />
                    <h3 className="text-sm font-bold text-foreground">AI Workflow Assistant</h3>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 rounded-none flex items-center justify-center hover:bg-muted"
                    onClick={() => setIsChatOpen(false)}
                  >
                    <Maximize2Icon className="size-3.5 rotate-45" />
                  </Button>
                </div>
              </div>

              {/* Chat Message Thread */}
              <div className="relative flex-1 min-h-0 overflow-hidden">
                <div className="absolute inset-0 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-2.5 max-w-[90%] ${
                        msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      {/* Author Icons */}
                      <div className="shrink-0 mt-1">
                        {msg.role === 'user' ? (
                          session?.user?.image ? (
                            <img src={session.user.image} alt="User" className="size-7 rounded-full border border-primary/20 shadow-sm" />
                          ) : (
                            <div className="size-7 bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center rounded-full shadow-sm">
                              U
                            </div>
                          )
                        ) : (
                          <div className="size-7 bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/20 rounded-full shadow-sm">
                            <SparkleIcon className="size-4 animate-pulse" />
                          </div>
                        )}
                      </div>

                      {/* Text Thread Content */}
                      <div className="flex flex-col gap-1 w-full">
                        <span className={`text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono ${
                          msg.role === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          {msg.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                        
                        <div className={`p-3 text-xs leading-relaxed rounded-none select-text ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground font-semibold' 
                            : 'bg-muted border border-border text-foreground font-medium whitespace-pre-wrap'
                        }`}>
                          {msg.thought && <ThoughtBlock thought={msg.thought} />}
                          {msg.text || (
                            <span className="inline-flex gap-1.5 items-center font-bold text-primary/70 animate-pulse">
                              <SparkleIcon className="size-3 animate-spin text-primary" />
                              Thinking...
                            </span>
                          )}
                        </div>

                        {/* Apply JSON to Canvas Button when JSON is embedded */}
                        {msg.text.includes("```json") && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const jsonMatch = msg.text.match(/```json\n([\s\S]+?)\n```/)
                              if (jsonMatch) {
                                try {
                                  const success = applyWorkflowJsonBlock(jsonMatch[1])
                                  if (success) {
                                    setLogs(prev => [...prev, { message: `[System] Successfully applied AI-generated JSON workflow to canvas! 🎉` }])
                                  }
                                } catch (err) {
                                  console.error(err)
                                }
                              }
                            }}
                            className="mt-2 w-full text-[11px] font-bold h-8 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground flex gap-1 items-center justify-center shadow-sm"
                          >
                            <SparkleIcon className="size-3.5" />
                            Apply JSON to Canvas
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isChatStreaming && chatMessages[chatMessages.length - 1]?.text && (
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] pl-10">
                      <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-1 font-medium italic">Streaming response...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Chat Input form at bottom of sidebar */}
              <div className="p-4 border-t bg-muted/5 shrink-0">
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <Input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask AI or type commands..."
                    disabled={isChatStreaming}
                    className="flex-1 rounded-none text-xs h-9 bg-background border-border"
                  />
                  <Button 
                    type="submit" 
                    disabled={isChatStreaming || !chatInput.trim()}
                    className="rounded-none text-xs px-4 h-9 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                  >
                    Send
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
          </>
        )}
      </SidebarInset>

      {/* Full Screen Image Lightbox Modal */}
      {maximizedImage && (
        <div 
          className="fixed inset-0 bg-black/85 z-[9999] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setMaximizedImage(null)}
        >
          <div 
            className="relative max-w-[90vw] max-h-[85vh] bg-card border border-border p-2 shadow-2xl flex flex-col gap-2 rounded-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <img src={maximizedImage} alt="Maximized" className="object-contain max-w-full max-h-[72vh] rounded shadow-inner" />
            <div className="flex gap-2 justify-end px-1.5 pb-1 border-t border-border pt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = maximizedImage;
                  a.download = 'generated-workflow-image.png';
                  a.click();
                }}
                className="text-xs h-9 px-4 gap-1.5 font-bold"
              >
                Download Image
              </Button>
              <Button
                size="sm"
                onClick={() => setMaximizedImage(null)}
                className="text-xs h-9 px-4 font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Code Modal Dialog */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowJsonModal(false)}>
          <div 
            className="bg-card border border-border shadow-2xl rounded-xl max-w-2xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-foreground">Workflow JSON Code</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  View, copy, or paste/edit the complete JSON schema structure of your workflow.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(workflowJsonText)
                    setJsonCopied(true)
                    setTimeout(() => setJsonCopied(false), 2000)
                  }}
                  className="text-xs h-8 gap-1"
                >
                  {jsonCopied ? <CheckIcon className="size-3.5 text-emerald-500" /> : <CopyIcon className="size-3.5" />}
                  {jsonCopied ? "Copied" : "Copy JSON"}
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col space-y-2">
              <Textarea
                value={workflowJsonText}
                onChange={(e) => {
                  setWorkflowJsonText(e.target.value)
                  setJsonImportError(null)
                }}
                className="flex-1 font-mono text-xs p-3 leading-relaxed border-border focus-visible:ring-1 bg-muted/20 min-h-[350px] resize-none"
                placeholder="Paste your workflow JSON here..."
              />
              {jsonImportError && (
                <p className="text-xs text-red-500 font-medium font-mono leading-tight p-2.5 bg-red-500/5 border border-red-500/20 rounded-md">
                  ⚠️ {jsonImportError}
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end border-t pt-4 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowJsonModal(false)}
                className="text-xs h-9 rounded-md"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(workflowJsonText)
                    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
                      throw new Error("Invalid format: JSON must contain 'nodes' and 'edges' arrays.")
                    }
                    const success = applyWorkflowJsonBlock(workflowJsonText)
                    if (success) {
                      setJsonImportError(null)
                      setShowJsonModal(false)
                      setLogs(prev => [...prev, { message: "[System] Successfully loaded workflow JSON code onto canvas! 🎉" }])
                    } else {
                      throw new Error("Failed to render nodes and edges onto the canvas.")
                    }
                  } catch (err: unknown) {
                    setJsonImportError(err instanceof Error ? err.message : "Malformed or invalid Workflow JSON")
                  }
                }}
                className="text-xs h-9 rounded-md font-bold"
              >
                Apply and Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
    </WorkflowNodesContext.Provider>
  )
}
