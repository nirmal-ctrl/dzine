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
  Node,
  Handle,
  Position,
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
  SquareArrowOutUpRightIcon,
  RepeatIcon,
  LayersIcon,
} from "lucide-react"

// Dynamic nodes typing & parameters
type NodeType = "trigger" | "delay" | "script" | "image-gen" | "json-parse" | "http-request" | "output" | "loop" | "slide-compose" | "llm"

interface NodeData {
  label: string
  type: NodeType
  icon: React.ReactNode
  color: string
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
  "json-parse": { border: "border-border",      bg: "bg-card",  text: "text-amber-600",   iconBg: "bg-amber-700",   accent: "bg-amber-50 dark:bg-amber-950/30" },
  "http-request":{ border: "border-border",     bg: "bg-card",  text: "text-sky-600",     iconBg: "bg-sky-700",     accent: "bg-sky-50 dark:bg-sky-950/30" },
  "output":      { border: "border-border",      bg: "bg-card",  text: "text-emerald-600", iconBg: "bg-emerald-700", accent: "bg-emerald-50 dark:bg-emerald-950/30" },
  "loop":        { border: "border-border",      bg: "bg-card",  text: "text-indigo-600",  iconBg: "bg-indigo-700",  accent: "bg-indigo-50 dark:bg-indigo-950/30" },
  "slide-compose": { border: "border-border",    bg: "bg-card",  text: "text-purple-600", iconBg: "bg-purple-700",  accent: "bg-purple-50 dark:bg-purple-950/30" },
  "llm":         { border: "border-border",      bg: "bg-card",  text: "text-violet-600",  iconBg: "bg-violet-700",  accent: "bg-violet-50 dark:bg-violet-950/30" },
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
  { name: "Image Gen", description: "AI image generation with aspect ratio, resolution & style reference support", type: "image-gen", icon: <ImageIcon className="size-4 text-white" />, color: "rose", defaultParams: { prompt: "A hyper-realistic corporate mascot logo", aspectRatio: "1:1", numberOfImages: "1", imageSize: "1K", personGeneration: "dont_allow", referenceImage: "" } },
  { name: "HTTP Request", description: "Call any REST API — GET, POST, PUT, DELETE with JSON body", type: "http-request", icon: <GlobeIcon className="size-4 text-white" />, color: "sky", defaultParams: { url: "https://api.example.com", method: "GET", body: "{}" } },
  { name: "Script", description: "Run custom JavaScript to transform or filter workflow data", type: "script", icon: <Code2Icon className="size-4 text-white" />, color: "red", defaultParams: { code: "return data.map(item => ({ ...item, processed: true }));" } },
  { name: "JSON Parse", description: "Extract specific values from JSON using JSONPath expressions", type: "json-parse", icon: <BracesIcon className="size-4 text-white" />, color: "orange", defaultParams: { expression: "$.data.invoice.total" } },
  { name: "Output", description: "Terminal sink — aggregates results and returns the final workflow payload", type: "output", icon: <SquareArrowOutUpRightIcon className="size-4 text-white" />, color: "emerald", defaultParams: { outputKey: "result", format: "json" } },
  { name: "Loop", description: "Iterate over an array — runs connected nodes for each item automatically", type: "loop", icon: <RepeatIcon className="size-4 text-white" />, color: "indigo", defaultParams: { arrayPath: "$.slides", itemName: "slide" } },
  { name: "Slide Compose", description: "Overlay title & bullet text onto a generated image to produce a final slide", type: "slide-compose", icon: <LayersIcon className="size-4 text-white" />, color: "purple", defaultParams: { titleField: "title", bulletsField: "bullets", imageField: "imageUrl", layout: "bottom-bar" } },
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
            <p className="truncate"><span className="text-muted-foreground/50">prompt:</span> {data.params.prompt}</p>
            <p><span className="text-muted-foreground/50">size:</span> {data.params.aspectRatio} · {data.params.numberOfImages || "1"} img</p>
          </>
        )}
        {data.type === "http-request" && (
          <p className="truncate"><span className={`${colors.text} font-bold`}>{data.params.method}</span> {data.params.url}</p>
        )}
        {data.type === "script" && <p><span className="text-muted-foreground/50">js:</span> custom script loaded</p>}
        {data.type === "json-parse" && <p className="truncate"><span className="text-muted-foreground/50">path:</span> {data.params.expression}</p>}
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
          </>
        )}
        {data.type === "slide-compose" && (
          <>
            <p className="truncate"><span className="text-muted-foreground/50">title:</span> {data.params.titleField || "title"}</p>
            <p className="truncate"><span className="text-muted-foreground/50">layout:</span> {data.params.layout || "bottom-bar"}</p>
          </>
        )}
        {data.type === "llm" && (
          <>
            <p className="truncate"><span className="text-muted-foreground/50">provider:</span> {data.params.provider || "openai"}</p>
            <p className="truncate"><span className="text-muted-foreground/50">model:</span> {data.params.model || "gpt-4o-mini"}</p>
            {data.params.responseFormat === "json_object" && <p className="truncate"><span className="text-muted-foreground/50">format:</span> JSON</p>}
          </>
        )}
      </div>
      {data.status === "success" && (
        <div className="absolute top-2 right-2 size-2.5 bg-emerald-500 rounded-full shadow-sm border-2 border-card" />
      )}
      {data.status === "running" && (
        <div className="absolute top-2 right-2 size-2.5 bg-amber-500 rounded-full animate-ping shadow-sm border-2 border-card" />
      )}
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--primary)', border: '2px solid var(--background)' }} 
      />
    </div>
  )
}

const nodeTypes = {
  custom: CustomWorkflowNode
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

interface WorkflowEditorClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
}

// ─── Template Resolver ───────────────────────────────────────────────
// Scans string values for {{nodeId.field}}, {{index}}, and {{item.field}} patterns
// and replaces them with actual values from the node output registry.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveTemplate(text: string, registry: Record<string, any>, loopCtx?: { item: any; index: number; itemName?: string }): string {
  return text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_match, path: string) => {
    const parts = path.split(".")
    // ── Loop context tokens ──
    if (parts[0] === "item") {
      if (!loopCtx) return `{{${path}}}`
      const item = loopCtx.item
      if (parts.length === 1) {
        // {{item}} — stringify the whole item
        return typeof item === "string" ? item : JSON.stringify(item)
      }
      // {{item.field}} — drill into item object
      let val = item
      for (let i = 1; i < parts.length; i++) {
        if (val == null) return `{{${path}}}`
        val = val[parts[i]]
      }
      return val == null ? `{{${path}}}` : String(val)
    }
    if (parts[0] === "index") {
      if (!loopCtx) return `{{${path}}}`
      return String(loopCtx.index)
    }
    // ── Node output lookup: {{nodeId.field}} ──
    const nodeId = parts[0]
    const nodeOutput = registry[nodeId]
    if (!nodeOutput) return `{{${path}}}`
    // {{nodeId}} (no field) — stringify entire output
    if (parts.length === 1) return typeof nodeOutput === "string" ? nodeOutput : JSON.stringify(nodeOutput)
    // {{nodeId.field.subfield...}} — drill down
    let val: unknown = nodeOutput
    for (let i = 1; i < parts.length; i++) {
      if (val == null || typeof val !== "object") return `{{${path}}}`
      val = (val as Record<string, unknown>)[parts[i]]
    }
    return val == null ? `{{${path}}}` : String(val)
  })
}

/** Deep-resolve all string values (including nested objects/arrays) in a node's params. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveParams(params: Record<string, string>, registry: Record<string, any>, loopCtx?: { item: any; index: number; itemName?: string }): Record<string, string> {
  const resolved: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    resolved[key] = resolveTemplate(value, registry, loopCtx)
  }
  return resolved
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
  return Object.values(params).some(v => /\{\{/.test(v))
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
  
  const [omniInput, setOmniInput] = React.useState("")
  const [aiGenerating, setAiGenerating] = React.useState(false)
  const [isRunning, setIsExecuting] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = React.useState<{ nodeId?: string, label?: string, type?: NodeType, status?: "running" | "success" | "error", message: string, data?: any }[]>([])
  
  // Dialog state for workflow inputs
  const [runInputData, setRunInputData] = React.useState<Record<string, string>>({})
  const [expectedInputs, setExpectedInputs] = React.useState<string[]>([])
  const [isAwaitingInputs, setIsAwaitingInputs] = React.useState(false)

  const [selectedNode, setSelectedNode] = React.useState<Node<NodeData> | null>(null)
  const [selectedEdge, setSelectedEdge] = React.useState<Edge | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isRunSheetOpen, setIsRunSheetOpen] = React.useState(false)

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
      } else if (n.data.type === "json-parse") {
        icon = <BracesIcon className="size-4 text-white" />
        color = "amber"
      } else if (n.data.type === "output") {
        icon = <SquareArrowOutUpRightIcon className="size-4 text-white" />
        color = "emerald"
      } else if (n.data.type === "loop") {
        icon = <RepeatIcon className="size-4 text-white" />
        color = "indigo"
      } else if (n.data.type === "slide-compose") {
        icon = <LayersIcon className="size-4 text-white" />
        color = "purple"
      } else if (n.data.type === "llm") {
        icon = <BrainCircuitIcon className="size-4 text-white" />
        color = "violet"
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

  // Load default nodes on mount — slide‑deck generator pipeline (full data‑binding demo)
  React.useEffect(() => {
    const defaultNodes: Node<NodeData>[] = [
      // ── Step 1: Trigger ──────────────────────────────────────────
      {
        id: "node-1",
        type: "custom",
        position: { x: 100, y: 300 },
        data: {
          label: "Trigger (Build Deck)",
          type: "trigger",
          icon: <ZapIcon className="size-4 text-white" />,
          color: "slate",
          status: "idle",
          params: { triggerType: "webhook", webhookUrl: "https://api.quickz.ai/v1/workflow-webhook", eventName: "Build Slide Deck", contentType: "application/json", inputSchema: "{\"properties\":{\"topic\":{\"type\":\"string\"},\"slideCount\":{\"type\":\"number\"}}}", sampleFile: "" }
        }
      },
      // ── Step 2: LLM Node — generates slide outlines ─────────────
      {
        id: "node-2",
        type: "custom",
        position: { x: 420, y: 300 },
        data: {
          label: "LLM (Slide Outlines)",
          type: "llm",
          icon: <BrainCircuitIcon className="size-4 text-white" />,
          color: "violet",
          status: "idle",
          params: { 
            provider: "openai",
            model: "gpt-4o",
            prompt: "You are a presentation designer. The topic is \"{{node-1.topic}}\". Generate {{node-1.slideCount}} slides.", 
            temperature: "0.7",
            responseFormat: "json_object",
            jsonSchema: "{\"type\":\"object\",\"properties\":{\"slides\":{\"type\":\"array\",\"items\":{\"type\":\"object\",\"properties\":{\"title\":{\"type\":\"string\"},\"bullets\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}}}}}}"
          }
        }
      },
      // ── Step 3: Loop — iterate over each slide ──────────────────
      {
        id: "node-3",
        type: "custom",
        position: { x: 740, y: 300 },
        data: {
          label: "Loop (For Each Slide)",
          type: "loop",
          icon: <RepeatIcon className="size-4 text-white" />,
          color: "indigo",
          status: "idle",
          params: { arrayPath: "$.slides", itemName: "slide" }
        }
      },
      // ── Step 4: Image Gen — create image for the slide ──────────
      {
        id: "node-4",
        type: "custom",
        position: { x: 1060, y: 150 },
        data: {
          label: "Image Gen (Slide Visual)",
          type: "image-gen",
          icon: <ImageIcon className="size-4 text-white" />,
          color: "rose",
          status: "idle",
          params: { prompt: "A professional presentation visual for: \"{{item.title}}\" — clean, corporate style, no text overlay", aspectRatio: "16:9", numberOfImages: "1", imageSize: "2K", personGeneration: "dont_allow", referenceImage: "" }
        }
      },
      // ── Step 5: Slide Compose — overlay text on image ───────────
      {
        id: "node-5",
        type: "custom",
        position: { x: 1060, y: 450 },
        data: {
          label: "Slide Compose",
          type: "slide-compose",
          icon: <LayersIcon className="size-4 text-white" />,
          color: "purple",
          status: "idle",
          params: { titleField: "title", bulletsField: "bullets", imageField: "imageUrl", layout: "bottom-bar" }
        }
      },
      // ── Step 6: Output — aggregate final deck ───────────────────
      {
        id: "node-6",
        type: "custom",
        position: { x: 1380, y: 300 },
        data: {
          label: "Output (Final Deck)",
          type: "output",
          icon: <SquareArrowOutUpRightIcon className="size-4 text-white" />,
          color: "emerald",
          status: "idle",
          params: { outputKey: "deck", format: "json" }
        }
      },
    ]

    const defaultEdges: Edge[] = [
      // trigger → llm
      { id: "edge-1-2", source: "node-1", target: "node-2", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: 2 }, interactionWidth: 20 },
      // llm → loop
      { id: "edge-2-3", source: "node-2", target: "node-3", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: 2 }, interactionWidth: 20 },
      // loop → image-gen (loop-downstream, {{item.title}} bound)
      { id: "edge-3-4", source: "node-3", target: "node-4", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: 2, stroke: "#4338ca" }, interactionWidth: 20 },
      // loop → slide-compose (loop-downstream, {{item.bullets}} + {{node-4.imageUrl}} bound)
      { id: "edge-3-5", source: "node-3", target: "node-5", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: 2, stroke: "#4338ca" }, interactionWidth: 20 },
      // image-gen → slide-compose (data flow: imageUrl)
      { id: "edge-4-5", source: "node-4", target: "node-5", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: 2, stroke: "#be123c" }, interactionWidth: 20 },
      // slide-compose → output
      { id: "edge-5-6", source: "node-5", target: "node-6", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: 2 }, interactionWidth: 20 },
    ]

    setNodes(defaultNodes)
    setEdges(defaultEdges)
  }, [setNodes, setEdges])

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
    const newId = `node-${nodes.length + 1}`
    
    // Position slightly offset from the last node
    const lastNode = nodes[nodes.length - 1]
    const xPos = lastNode ? lastNode.position.x + 320 : 100
    const yPos = lastNode ? lastNode.position.y : 150

    const newNode: Node<NodeData> = {
      id: newId,
      type: "custom",
      position: { x: xPos, y: yPos },
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
    
    if (triggerNode && triggerNode.data.params.inputSchema && triggerNode.data.params.inputSchema !== "{}") {
      try {
        const schema = JSON.parse(triggerNode.data.params.inputSchema)
        if (schema.properties) {
          const keys = Object.keys(schema.properties)
          if (keys.length > 0) {
            setExpectedInputs(keys)
            const initialData: Record<string, string> = {}
            keys.forEach(k => initialData[k] = "")
            setRunInputData(initialData)
            setIsAwaitingInputs(true)
            return
          }
        }
      } catch { /* ignore bad json */ }
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
    if (allNodes.length === 0) return
    setIsExecuting(true)
    setLogs([{ message: `[Executor] Initializing execution run (topological order)...` }])

    // Set all nodes to idle
    setNodes(prev => prev.map(n => ({
      ...n,
      data: { ...n.data, status: "idle" as const }
    })))

    // Topological sort for correct data-flow order
    const sortedNodes = topologicalSort(allNodes, allEdges)
    
    // ─── Node Output Registry ──────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeOutputs: Record<string, any> = {}

    // Track which nodes we've already processed (to skip loop-internal nodes in main pass)
    const processedNodeIds = new Set<string>()

    let step = 0

    for (const node of sortedNodes) {
      // Skip nodes already processed inside a loop sub-execution
      if (processedNodeIds.has(node.id)) continue

      step++
      
      // Resolve {{placeholders}} in params using the current registry
      const resolvedParams = resolveParams(node.data.params, nodeOutputs)
      
      // running status
      setNodes(prev => prev.map(n => n.id === node.id ? {
        ...n,
        data: { ...n.data, params: resolvedParams, status: "running" as const }
      } : n))

      setLogs(prev => [
        ...prev, 
        { 
          nodeId: node.id,
          label: node.data.label,
          type: node.data.type,
          status: "running",
          message: `[Step ${step}] Executing...${hasPlaceholders(node.data.params) ? " (resolved {{placeholders}})" : ""}`
        }
      ])

      // Helper to update the last log entry with success and data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const markNodeSuccess = (data: any, extraMsg?: string) => {
        setLogs(prev => {
          const newLogs = [...prev]
          const lastIdx = newLogs.length - 1
          if (lastIdx >= 0) {
            newLogs[lastIdx] = {
              ...newLogs[lastIdx],
              status: "success",
              message: extraMsg ? `${newLogs[lastIdx].message}\n${extraMsg}` : newLogs[lastIdx].message,
              data
            }
          }
          return newLogs
        })
      }

      // ── Execute & store mock output per node type ────────────────
      if (node.data.type === "trigger") {
        // Store mock trigger payload
        const triggerPayload: Record<string, unknown> = {
          event: resolvedParams.eventName || "On New Order",
          contentType: resolvedParams.contentType || "application/json",
        }
        if (resolvedParams.sampleFile) {
          triggerPayload.file = "(base64 uploaded file)"
        }
        
        // Try to parse inputSchema if present
        if (resolvedParams.inputSchema && resolvedParams.inputSchema !== "{}") {
          try {
            const schema = JSON.parse(resolvedParams.inputSchema)
            if (schema.properties) {
              for (const key of Object.keys(schema.properties)) {
                // If user provided input via modal, use it, else mock it
                if (customInputs && customInputs[key]) {
                  // Try to cast to number if needed
                  const type = schema.properties[key].type
                  triggerPayload[key] = type === "number" ? Number(customInputs[key]) : customInputs[key]
                } else {
                  triggerPayload[key] = `(mock ${key})`
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
      } else if (node.data.type === "llm") {
        const provider = resolvedParams.provider || "openai"
        const model = resolvedParams.model || "gpt-4o-mini"
        let msg = `Called LLM (${provider}/${model})`
        if (resolvedParams.apiKey) msg += `\nUsing custom API key: ********************`
        if (resolvedParams.prompt) msg += `\nPrompt: "${resolvedParams.prompt.slice(0, 50)}..."`

        if (resolvedParams.responseFormat === "json_object") {
          msg += `\nFormatting: JSON Object requested`
          let mockJson = { generated: `content from ${model}` }
          if (resolvedParams.jsonSchema) {
            try {
              const schema = JSON.parse(resolvedParams.jsonSchema)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              mockJson = Object.keys(schema.properties || {}).reduce((acc, key) => ({...acc, [key]: `(mock ${key})`}), {}) as any
            } catch { /* ignore */ }
          }
          nodeOutputs[node.id] = mockJson
        } else {
          nodeOutputs[node.id] = { text: `Generated content from ${model} using ${provider}...` }
        }
        markNodeSuccess(nodeOutputs[node.id], msg)
      } else if (node.data.type === "image-gen") {
        let msg = ""
        if (resolvedParams.referenceImage) {
          msg += `Generating image with style reference transfer (image loaded)...\n`
        } else {
          msg += `Generating standard image from text prompt...\n`
        }
        if (resolvedParams.prompt) {
          msg += `Prompt: "${resolvedParams.prompt.slice(0, 50)}..."`
        }
        nodeOutputs[node.id] = { imageUrl: "https://placehold.co/1024x1024/png?text=Generated+Image", aspectRatio: resolvedParams.aspectRatio || "1:1" }
        markNodeSuccess(nodeOutputs[node.id], msg)
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
        nodeOutputs[node.id] = { status: 200, data: { id: "mock-123", message: "Request succeeded (simulated)" } }
        markNodeSuccess(nodeOutputs[node.id], msg)
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
            continue
          }
        }
        nodeOutputs[node.id] = scriptResult
        markNodeSuccess(nodeOutputs[node.id], msg)
      } else if (node.data.type === "json-parse") {
        // Get first upstream node's output
        const upstreamIds = getUpstreamNodeIds(allEdges, node.id)
        const upstreamOutput = upstreamIds.length > 0 ? nodeOutputs[upstreamIds[0]] : null
        nodeOutputs[node.id] = { value: upstreamOutput ? JSON.stringify(upstreamOutput).slice(0, 100) : "(no upstream data)", expression: resolvedParams.expression }
        markNodeSuccess(nodeOutputs[node.id], `Extracted "${resolvedParams.expression || "$.data.invoice.total"}" from upstream data`)
      } else if (node.data.type === "loop") {
        // Get the array from upstream
        const upstreamIds = getUpstreamNodeIds(allEdges, node.id)
        const upstreamOutput = upstreamIds.length > 0 ? nodeOutputs[upstreamIds[0]] : null
        
        // Simple JSONPath extraction (supports $.field or $.field.subfield)
        const arrayPath = resolvedParams.arrayPath || "$.slides"
        const pathParts = arrayPath.replace(/^\$\./, "").split(".")
        let arrData: unknown[] = [1, 2, 3] as unknown[] // default mock array
        if (upstreamOutput && typeof upstreamOutput === "object") {
          let current: unknown = upstreamOutput
          for (const part of pathParts) {
            if (current && typeof current === "object") {
              current = (current as Record<string, unknown>)[part]
            }
          }
          if (Array.isArray(current)) arrData = current
        }
        
        const itemName = resolvedParams.itemName || "slide"
        const loopResults: unknown[] = []
        
        // Get downstream nodes from this loop node
        const downstreamNodes = getDownstreamNodes(node.id, allNodes, allEdges)
        
        markNodeSuccess(null, `Iterating array at path "${resolvedParams.arrayPath || "$.slides"}"...`)

        for (let idx = 0; idx < arrData.length; idx++) {
          const item = arrData[idx]
          
          // Build loop context
          const loopCtx = { item, index: idx, itemName }
          
          // Execute each downstream node for this iteration (topological order within downstream)
          const subSorted = topologicalSort(downstreamNodes, allEdges)
          for (const subNode of subSorted) {
            if (processedNodeIds.has(subNode.id)) continue
            processedNodeIds.add(subNode.id)
            
            const subResolved = resolveParams(subNode.data.params, nodeOutputs, loopCtx)

            setNodes(prev => prev.map(n => n.id === subNode.id ? {
              ...n,
              data: { ...n.data, params: subResolved, status: "running" as const }
            } : n))

            setLogs(prev => [
              ...prev, 
              { 
                nodeId: subNode.id,
                label: subNode.data.label,
                type: subNode.data.type,
                status: "running",
                message: `[Loop iter ${idx}] Executing...`
              }
            ])

            // Helper for subnodes
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const markSubNodeSuccess = (data: any) => {
              setLogs(prev => {
                const newLogs = [...prev]
                const lastIdx = newLogs.length - 1
                if (lastIdx >= 0) {
                  newLogs[lastIdx] = {
                    ...newLogs[lastIdx],
                    status: "success",
                    data
                  }
                }
                return newLogs
              })
            }
            
            // Quick mock output for sub-node
            if (subNode.data.type === "llm") {
              nodeOutputs[subNode.id] = { text: `Generated for ${itemName} #${idx + 1}` }
            } else if (subNode.data.type === "image-gen") {
              nodeOutputs[subNode.id] = { imageUrl: `https://placehold.co/1024x1024/png?text=${itemName}+${idx + 1}` }
            } else if (subNode.data.type === "slide-compose") {
              nodeOutputs[subNode.id] = { 
                slide: true, 
                index: idx,
                title: (item as Record<string, unknown>)?.[subResolved.titleField || "title"] || `Slide ${idx + 1}`,
                imageUrl: "https://placehold.co/1024x768/png?text=Composed+Slide"
              }
            } else {
              nodeOutputs[subNode.id] = { result: `Iteration ${idx + 1} output` }
            }

            await new Promise(resolve => setTimeout(resolve, 600))
            setNodes(prev => prev.map(n => n.id === subNode.id ? {
              ...n,
              data: { ...n.data, status: "success" as const }
            } : n))
            
            markSubNodeSuccess(nodeOutputs[subNode.id])
          }
          
          await new Promise(resolve => setTimeout(resolve, 400))
          loopResults.push({ index: idx, item, results: downstreamNodes.map(dn => nodeOutputs[dn.id]).filter(Boolean) })
        }
        
        nodeOutputs[node.id] = { iterations: loopResults.length, results: loopResults }
        setLogs(prev => [...prev, { message: `[Loop complete] ${loopResults.length} iterations processed.`, data: nodeOutputs[node.id] }])
      } else if (node.data.type === "slide-compose") {
        nodeOutputs[node.id] = { 
          slide: true, 
          title: `(mock title from ${resolvedParams.titleField || "title"})`,
          bullets: ["Mock bullet 1", "Mock bullet 2"],
          imageUrl: "https://placehold.co/1024x768/png?text=Composed+Slide",
          layout: resolvedParams.layout || "bottom-bar"
        }
        markNodeSuccess(nodeOutputs[node.id], `Compositing slide title "${resolvedParams.titleField || "title"}" and bullets...`)
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

      const delayMs = node.data.type === "delay" ? parseInt(resolvedParams.ms || "2000") : 1500
      await new Promise(resolve => setTimeout(resolve, delayMs))

      // success status
      setNodes(prev => prev.map(n => n.id === node.id ? {
        ...n,
        data: { ...n.data, status: "success" as const }
      } : n))
    }

    setIsExecuting(false)
    setLogs(prev => [...prev, { message: `[Executor] All steps executed cleanly. 🎉` }])
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        user={{ 
          name: session.user.name || "User", 
          email: session.user.email || "", 
          avatar: session.user.image || "" 
        }} 
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Workflow Canvas</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              size="sm" 
              onClick={handleRunClick} 
              disabled={isRunning}
              className="text-xs rounded-none gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 h-9"
            >
              <PlayCircleIcon className="size-4" />
              Run Workflow
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
                  emerald: "bg-emerald-700",
                  indigo: "bg-indigo-700", purple: "bg-purple-700"
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
          <div className="flex-1 h-full relative">
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
                  if (type === "json-parse") return "#b45309"
                  if (type === "output") return "#047857"
                  if (type === "loop") return "#4338ca"
                  if (type === "slide-compose") return "#7e22ce"
                  if (type === "llm") return "#6d28d9"
                  return "#475569"
                }}
                className="!bg-card !border-border rounded-none"
              />
            </ReactFlow>

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
          </div>

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
                      {expectedInputs.map(key => (
                        <div key={key} className="space-y-1.5">
                          <Label className="text-xs font-bold text-foreground uppercase tracking-wider">{key}</Label>
                          <Input 
                            value={runInputData[key] || ""}
                            onChange={(e) => setRunInputData(prev => ({...prev, [key]: e.target.value}))}
                            className="text-sm h-10 rounded-md font-mono"
                            placeholder={`Enter ${key}...`}
                          />
                        </div>
                      ))}
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
                        {logs.map((log, i) => (
                          <div key={i} className="flex flex-col gap-2 relative">
                            {/* Visual connector line between steps */}
                            {i !== logs.length - 1 && (
                              <div className="absolute left-2.5 top-6 bottom-[-24px] w-0.5 bg-border/50" />
                            )}
                            
                            <div className="flex items-center gap-3 relative z-10">
                              <div className="shrink-0 size-5 flex items-center justify-center bg-card">
                                {log.status === "running" && <SparklesIcon className="size-4 text-amber-500 animate-pulse" />}
                                {log.status === "success" && <div className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />}
                                {log.status === "error" && <div className="size-2 rounded-full bg-red-500 ring-4 ring-red-500/20" />}
                                {!log.status && <div className="size-1.5 rounded-full bg-primary" />}
                              </div>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className={`text-sm font-bold truncate ${log.status === 'error' ? 'text-red-500' : 'text-foreground'}`}>
                                  {log.label || "System"}
                                </span>
                                {log.type && (
                                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono px-1.5 py-0.5 bg-muted rounded-sm shrink-0">
                                    {log.type}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="pl-8 space-y-2">
                              <p className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{log.message}</p>
                              {log.data && (
                                <div className="bg-muted/30 border border-border p-3 rounded-md overflow-x-auto text-[10px] font-mono text-foreground mt-1 shadow-sm relative group">
                                  <div className="absolute top-2 right-2 text-[9px] uppercase tracking-wider text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">Payload</div>
                                  <pre>{JSON.stringify(log.data, null, 2)}</pre>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
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
                <div className="relative flex-1 min-h-0 overflow-hidden">
                  <div className="absolute inset-0 overflow-y-auto p-6 space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Block Title</Label>
                    <Input 
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
                      <Input 
                        value={selectedNode.data.params.eventName || selectedNode.data.params.event || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, eventName: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="e.g. On New Order, On Payment Received"
                      />
                      <p className="text-[10px] text-muted-foreground/60">A label describing what kicks off this workflow.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Webhook URL (auto-generated on save)</Label>
                      <Input 
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
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expected Payload Schema (JSON Schema, optional)</Label>
                      <Textarea 
                        value={selectedNode.data.params.inputSchema || "{}"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, inputSchema: e.target.value } })}
                        className="rounded-none text-xs min-h-[120px] font-mono resize-none"
                        placeholder='{"type":"object","properties":{"orderId":{"type":"string"},"total":{"type":"number"}}}'
                      />
                      <p className="text-[10px] text-muted-foreground/60">Define the expected shape of the incoming payload. Used for validation and AI context.</p>
                    </div>
                    {/* File Uploader — shown when payload type supports files */}
                    {(selectedNode.data.params.contentType === "multipart/form-data" || selectedNode.data.params.contentType === "image/png") && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sample / Expected File</Label>
                        <Input 
                          type="file"
                          accept={selectedNode.data.params.contentType === "image/png" ? "image/png,image/jpeg,image/webp,image/gif" : "*/*"}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = () => {
                                updateNodeData({ params: { ...selectedNode.data.params, sampleFile: reader.result as string } })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                          className="rounded-none text-xs h-9 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-none file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        {selectedNode.data.params.sampleFile && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-emerald-600 font-mono truncate flex-1">✓ File loaded ({Math.round(selectedNode.data.params.sampleFile.length / 1024)} KB)</span>
                            <button
                              type="button"
                              onClick={() => updateNodeData({ params: { ...selectedNode.data.params, sampleFile: "" } })}
                              className="text-[10px] text-destructive hover:underline shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground/60">Upload a representative sample file. Stored as a base64 data URI for testing and preview.</p>
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
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Image Generation Prompt</Label>
                      <Textarea 
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
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Style Reference Image (optional)</Label>
                      <Input 
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
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
                        className="rounded-none text-xs h-9 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-none file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {selectedNode.data.params.referenceImage && (
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
                      <p className="text-[10px] text-muted-foreground/60">Upload a reference image to guide the visual style of generated images.</p>
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

                {/* JSON Parse Fields */}
                {selectedNode.data.type === "json-parse" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">JSONPath Expression</Label>
                    <Input 
                      value={selectedNode.data.params.expression || ""}
                      onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, expression: e.target.value } })}
                      className="rounded-none text-xs h-9"
                      placeholder="$.data.invoice.total"
                    />
                  </div>
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
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Iterator Node</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        The Loop node iterates over an array from incoming data. Each item is passed to connected
                        downstream nodes as <code className="text-foreground">{"{{item}}"}</code>. The loop runs until all items are processed.
                      </p>
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
                      <p className="text-[10px] text-muted-foreground/60">The variable name used in downstream <code className="text-foreground">{"{{item}}"}</code> placeholders.</p>
                    </div>
                  </>
                )}

                {/* Slide Compose Fields */}
                {selectedNode.data.type === "slide-compose" && (
                  <>
                    <div className="p-3 border border-purple-300 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-700 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <LayersIcon className="size-3 text-purple-600" />
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Slide Composer</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        The Slide Compose node overlays text content onto a generated image to produce a final composed slide.
                        It takes a title, bullet points, and a background image, then renders them together.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Title Field</Label>
                      <Input 
                        value={selectedNode.data.params.titleField || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, titleField: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="title"
                      />
                      <p className="text-[10px] text-muted-foreground/60">The field name containing the slide title text.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bullets Field</Label>
                      <Input 
                        value={selectedNode.data.params.bulletsField || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, bulletsField: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="bullets"
                      />
                      <p className="text-[10px] text-muted-foreground/60">The field name containing the array of bullet points.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Image Field</Label>
                      <Input 
                        value={selectedNode.data.params.imageField || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, imageField: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="imageUrl"
                      />
                      <p className="text-[10px] text-muted-foreground/60">The field name containing the background image URL.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Text Layout</Label>
                      <select 
                        value={selectedNode.data.params.layout || "bottom-bar"}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, layout: e.target.value } })}
                        className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      >
                        <option value="bottom-bar">Bottom Bar (title + bullets at bottom)</option>
                        <option value="overlay">Overlay (text centered on image)</option>
                        <option value="split">Split (text left, image right)</option>
                        <option value="title-only">Title Only (large title, no bullets)</option>
                      </select>
                      <p className="text-[10px] text-muted-foreground/60">How text is positioned over the background image.</p>
                    </div>
                  </>
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
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, provider: e.target.value } })}
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
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">JSON Schema (Optional)</Label>
                        <Textarea 
                          value={selectedNode.data.params.jsonSchema || ""}
                          onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, jsonSchema: e.target.value } })}
                          className="rounded-none text-xs min-h-[120px] font-mono resize-none"
                          placeholder='{"type":"object","properties":{}}'
                        />
                      </div>
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
      </SidebarInset>
    </SidebarProvider>
  )
}