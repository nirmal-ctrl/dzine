// ─── Output Executor ──────────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"
import { getUpstreamNodeIds } from "../engine/graph.utils"

export class OutputExecutor implements INodeExecutor {
  readonly nodeType = "output"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const { resolvedParams, nodeOutputs, allEdges } = ctx
    const upstreamIds = getUpstreamNodeIds(allEdges, node.id)
    const aggregated: Record<string, unknown> = {}
    for (const uid of upstreamIds) {
      if (nodeOutputs[uid]) {
        aggregated[uid] = nodeOutputs[uid]
      }
    }
    return { [resolvedParams.outputKey || "result"]: aggregated }
  }
}
