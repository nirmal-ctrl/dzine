// ─── Delay Executor ───────────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"

export class DelayExecutor implements INodeExecutor {
  readonly nodeType = "delay"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    return { delayed: true, ms: ctx.resolvedParams.ms || "2000" }
  }
}
