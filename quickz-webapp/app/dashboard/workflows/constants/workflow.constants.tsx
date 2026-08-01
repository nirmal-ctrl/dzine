// ─── Workflow Constants ───────────────────────────────────────────────────────
// Static data: provider/model lists, node color tokens, and the node palette.
// Kept separate so UI and engine code don't depend on each other.

import React from "react"
import {
  ClockIcon,
  Code2Icon,
  ImageIcon,
  BrainCircuitIcon,
  GlobeIcon,
  ZapIcon,
  SquareArrowOutUpRightIcon,
  RepeatIcon,
  LayersIcon,
  GitBranchIcon,
  GitMergeIcon,
  ToggleLeftIcon,
  FilterIcon,
  Wand2Icon,
} from "lucide-react"
import type { NodeType, AvailableTile } from "../types/workflow.types"

// ─── Provider Model Lists ─────────────────────────────────────────────────────

export const PROVIDER_MODELS: Record<string, { id: string; name: string }[]> = {
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
  ],
}

// ─── Node Color Tokens ────────────────────────────────────────────────────────

export const NODE_COLORS: Record<NodeType, { border: string; bg: string; text: string; iconBg: string; accent: string }> = {
  trigger: { border: "border-border", bg: "bg-card", text: "text-slate-600", iconBg: "bg-slate-700", accent: "bg-slate-100 dark:bg-slate-800/50" },
  delay: { border: "border-border", bg: "bg-card", text: "text-stone-600", iconBg: "bg-stone-700", accent: "bg-stone-100 dark:bg-stone-800/50" },
  script: { border: "border-border", bg: "bg-card", text: "text-red-600", iconBg: "bg-red-700", accent: "bg-red-50 dark:bg-red-950/30" },
  "image-gen": { border: "border-border", bg: "bg-card", text: "text-rose-600", iconBg: "bg-rose-700", accent: "bg-rose-50 dark:bg-rose-950/30" },
  "http-request": { border: "border-border", bg: "bg-card", text: "text-sky-600", iconBg: "bg-sky-700", accent: "bg-sky-50 dark:bg-sky-950/30" },
  output: { border: "border-border", bg: "bg-card", text: "text-emerald-600", iconBg: "bg-emerald-700", accent: "bg-emerald-50 dark:bg-emerald-950/30" },
  loop: { border: "border-border", bg: "bg-card", text: "text-indigo-600", iconBg: "bg-indigo-700", accent: "bg-indigo-50 dark:bg-indigo-950/30" },
  llm: { border: "border-border", bg: "bg-card", text: "text-violet-600", iconBg: "bg-violet-700", accent: "bg-violet-50 dark:bg-violet-950/30" },
  router: { border: "border-border", bg: "bg-card", text: "text-pink-600", iconBg: "bg-pink-700", accent: "bg-pink-50 dark:bg-pink-950/30" },
  merge: { border: "border-border", bg: "bg-card", text: "text-cyan-600", iconBg: "bg-cyan-700", accent: "bg-cyan-50 dark:bg-cyan-950/30" },
  boolean: { border: "border-border", bg: "bg-card", text: "text-fuchsia-600", iconBg: "bg-fuchsia-700", accent: "bg-fuchsia-50 dark:bg-fuchsia-950/30" },
  transform: { border: "border-border", bg: "bg-card", text: "text-lime-600", iconBg: "bg-lime-700", accent: "bg-lime-50 dark:bg-lime-950/30" },
  filter: { border: "border-border", bg: "bg-card", text: "text-orange-600", iconBg: "bg-orange-700", accent: "bg-orange-50 dark:bg-orange-950/30" },
  group: { border: "border-border", bg: "bg-card", text: "text-indigo-600", iconBg: "bg-indigo-700", accent: "bg-indigo-50 dark:bg-indigo-950/30" },
  classifier: { border: "border-border", bg: "bg-card", text: "text-amber-600", iconBg: "bg-amber-700", accent: "bg-amber-50 dark:bg-amber-950/30" },
}

// ─── Available Node Tiles (Palette) ──────────────────────────────────────────

export const AVAILABLE_TILES: AvailableTile[] = [
  {
    name: "Trigger",
    description: "Webhook entry point — starts the workflow when an external event fires",
    type: "trigger",
    icon: React.createElement(ZapIcon, { className: "size-4 text-white" }),
    color: "slate",
    defaultParams: { triggerType: "webhook", webhookUrl: "", eventName: "On New Order", contentType: "application/json", inputSchema: "{}", sampleFile: "" },
  },
  {
    name: "Delay",
    description: "Pause execution for a fixed duration in milliseconds",
    type: "delay",
    icon: React.createElement(ClockIcon, { className: "size-4 text-white" }),
    color: "stone",
    defaultParams: { ms: "2000" },
  },
  {
    name: "LLM Node",
    description: "Advanced LLM — customize provider, model, structured outputs & instructions",
    type: "llm",
    icon: React.createElement(BrainCircuitIcon, { className: "size-4 text-white" }),
    color: "violet",
    defaultParams: { provider: "openai", model: "gpt-4o-mini", apiKey: "", prompt: "Generate the deck content...", temperature: "0.7", responseFormat: "text", jsonSchema: "" },
  },
  {
    name: "Image Gen",
    description: "AI image generation with aspect ratio, resolution & style reference support",
    type: "image-gen",
    icon: React.createElement(ImageIcon, { className: "size-4 text-white" }),
    color: "rose",
    defaultParams: { apiKey: "", model: "gemini-3.1-flash-image", prompt: "A hyper-realistic corporate mascot logo", aspectRatio: "1:1", numberOfImages: "1", imageSize: "1K", personGeneration: "dont_allow", referenceImage: "", temperature: "", topP: "" },
  },
  {
    name: "HTTP Request",
    description: "Call any REST API — GET, POST, PUT, DELETE with JSON body",
    type: "http-request",
    icon: React.createElement(GlobeIcon, { className: "size-4 text-white" }),
    color: "sky",
    defaultParams: { url: "https://api.example.com", method: "GET", headers: "{}", body: "{}" },
  },
  {
    name: "Script",
    description: "Run custom JavaScript to transform or filter workflow data",
    type: "script",
    icon: React.createElement(Code2Icon, { className: "size-4 text-white" }),
    color: "red",
    defaultParams: { code: "return data.map(item => ({ ...item, processed: true }));" },
  },
  {
    name: "Output",
    description: "Terminal sink — aggregates results and returns the final workflow payload",
    type: "output",
    icon: React.createElement(SquareArrowOutUpRightIcon, { className: "size-4 text-white" }),
    color: "emerald",
    defaultParams: { outputKey: "result", format: "json" },
  },
  {
    name: "Iterator / Loop",
    description: "Iterate over an array — run nested nodes for each item in parallel or sequentially",
    type: "loop",
    icon: React.createElement(RepeatIcon, { className: "size-4 text-white" }),
    color: "indigo",
    defaultParams: { arrayPath: "$.slides", itemName: "slide", mode: "parallel" },
  },
  {
    name: "Router",
    description: "Branch logic based on a true/false condition",
    type: "router",
    icon: React.createElement(GitBranchIcon, { className: "size-4 text-white" }),
    color: "pink",
    defaultParams: { condition: "{{$json.value}} > 5" },
  },
  {
    name: "Merge",
    description: "Wait for multiple branches and combine their data",
    type: "merge",
    icon: React.createElement(GitMergeIcon, { className: "size-4 text-white" }),
    color: "cyan",
    defaultParams: { strategy: "wait-all" },
  },
  {
    name: "Boolean Logic",
    description: "Evaluate AND/OR/NOT conditions",
    type: "boolean",
    icon: React.createElement(ToggleLeftIcon, { className: "size-4 text-white" }),
    color: "fuchsia",
    defaultParams: { operator: "AND", operand1: "true", operand2: "false" },
  },
  {
    name: "Transform",
    description: "Map and restructure data fields",
    type: "transform",
    icon: React.createElement(Wand2Icon, { className: "size-4 text-white" }),
    color: "lime",
    defaultParams: { mapping: "{}" },
  },
  {
    name: "Filter",
    description: "Filter items in an array or stop execution",
    type: "filter",
    icon: React.createElement(FilterIcon, { className: "size-4 text-white" }),
    color: "orange",
    defaultParams: { condition: "{{$json.value}} == true" },
  },
  {
    name: "Classifier / Match",
    description: "Route dynamically based on matching incoming values to custom possibilities",
    type: "classifier",
    icon: React.createElement(LayersIcon, { className: "size-4 text-white" }),
    color: "amber",
    defaultParams: { valueToMatch: "{{$json.status}}", possibilities: "new, assigned, resolved" },
  },
  {
    name: "Group Container",
    description: "Visual container to organize nodes (e.g., body of a loop)",
    type: "group",
    icon: React.createElement(LayersIcon, { className: "size-4 text-white" }),
    color: "indigo",
    defaultParams: {},
  },
]
