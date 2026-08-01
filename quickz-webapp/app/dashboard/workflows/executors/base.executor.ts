// ─── Base Executor ────────────────────────────────────────────────────────────
// Defines the INodeExecutor interface that all node-type executors implement.
// Open/Closed Principle: new node types implement this interface without
// modifying existing executors or the orchestration engine.

import type { Edge, Node } from "reactflow"
import type { NodeData, LoopContext, LogEntry } from "../types/workflow.types"

/** Shared context available to every executor during a workflow run. */
export interface ExecutionContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeOutputs: Record<string, any>
  allNodes: Node<NodeData>[]
  allEdges: Edge[]
  resolvedParams: Record<string, string>
  loopCtx?: LoopContext
  nativeFetch: typeof fetch
  proxyUrl: string
  // UI side-effect callbacks
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
  showToast: (title: string, message: string, type?: "error" | "success" | "info") => void
  // Tracking sets shared across the run
  processedNodeIds: Set<string>
  loopInternalNodeIds: Set<string>
  activeEdgeIds: Set<string>
  // Optional input payloads for triggers or parameterized runs
  customInputs?: Record<string, unknown>
  runInputData?: Record<string, unknown>
}

/**
 * Every node type implements this interface.
 * The orchestrator calls `execute()` and stores the return value as the node's output.
 * Throwing an Error marks the node as failed.
 */
export interface INodeExecutor {
  readonly nodeType: string
  execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown>
}
