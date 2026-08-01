// ─── Workflow Editor Types ────────────────────────────────────────────────────
// Single source of truth for all shared types across the workflow editor modules.
// Each node type has its own typed params interface (Interface Segregation Principle).

import type { Edge, Node } from "reactflow"

// ─── Core Node Types ──────────────────────────────────────────────────────────

export type NodeType =
  | "trigger"
  | "delay"
  | "script"
  | "image-gen"
  | "http-request"
  | "output"
  | "loop"
  | "llm"
  | "router"
  | "merge"
  | "boolean"
  | "transform"
  | "filter"
  | "group"
  | "classifier"

export interface NodeData {
  label: string
  type: NodeType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: React.ReactNode
  color?: string
  params: Record<string, string>
  status: "idle" | "running" | "success" | "error"
}

// ─── Typed Params per Node Type (ISP) ────────────────────────────────────────

export interface TriggerParams {
  triggerType: string
  webhookUrl: string
  eventName: string
  contentType: string
  inputSchema: string
  sampleFile: string
}

export interface LlmParams {
  provider: string
  model: string
  apiKey: string
  prompt: string
  temperature: string
  responseFormat: string
  jsonSchema: string
}

export interface ImageGenParams {
  apiKey: string
  model: string
  prompt: string
  aspectRatio: string
  numberOfImages: string
  imageSize: string
  personGeneration: string
  referenceImage: string
  temperature: string
  topP: string
}

export interface HttpRequestParams {
  url: string
  method: string
  headers: string
  body: string
}

export interface ScriptParams {
  code: string
}

export interface OutputParams {
  outputKey: string
  format: string
}

export interface LoopParams {
  arrayPath: string
  itemName: string
  mode: "parallel" | "sequential"
}

export interface RouterParams {
  condition: string
}

export interface MergeParams {
  strategy: string
}

export interface BooleanParams {
  operator: string
  operand1: string
  operand2: string
}

export interface TransformParams {
  mapping: string
}

export interface FilterParams {
  condition: string
}

export interface ClassifierParams {
  valueToMatch: string
  possibilities: string
}

// ─── Execution Context ────────────────────────────────────────────────────────

export interface LoopContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  index: number
  itemName?: string
}

export interface ExecutionContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeOutputs: Record<string, any>
  allNodes: Node<NodeData>[]
  allEdges: Edge[]
  resolvedParams: Record<string, string>
  loopCtx?: LoopContext
  nativeFetch: typeof fetch
  proxyUrl: string
  // Callbacks for side effects
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
  showToast: (title: string, message: string, type?: "error" | "success" | "info") => void
  processedNodeIds: Set<string>
  loopInternalNodeIds: Set<string>
  activeEdgeIds: Set<string>
}

// ─── Log Entry ────────────────────────────────────────────────────────────────

export interface LogEntry {
  id?: string
  nodeId?: string
  label?: string
  type?: string
  status?: "running" | "success" | "error"
  message?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export interface Toast {
  id: string
  title: string
  message: string
  type: "error" | "success" | "info"
}

// ─── Workflow Record (DB) ─────────────────────────────────────────────────────

export interface WorkflowRecord {
  id: string
  name: string
  description?: string
  nodes: Node<NodeData>[]
  edges: Edge[]
  createdAt: string
  updatedAt: string
}

// ─── Available Tile ───────────────────────────────────────────────────────────

export interface AvailableTile {
  name: string
  description: string
  type: NodeType
  icon: React.ReactNode
  color: string
  defaultParams: Record<string, string>
}

// ─── Schema Builder Types ─────────────────────────────────────────────────────

export interface SchemaNode {
  name: string
  type: string
  description?: string
  children?: SchemaNode[]
  required?: boolean
  enum?: string[]
}

// ─── Re-export reactflow types needed by consumers ───────────────────────────

export type { Edge, Node } from "reactflow"
