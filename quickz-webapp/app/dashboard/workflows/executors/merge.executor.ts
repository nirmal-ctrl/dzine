// ─── Merge Executor ───────────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"

export class MergeExecutor implements INodeExecutor {
  readonly nodeType = "merge"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const { resolvedParams, nodeOutputs, allEdges } = ctx
    const directParentIds = allEdges
      .filter((e) => e.target === node.id)
      .map((e) => e.source)
    const available = directParentIds.filter(
      (uid) => nodeOutputs[uid] !== undefined
    )
    const strategy = resolvedParams.strategy || "wait-all"

    if (strategy === "first-wins") {
      const firstId = available[0]
      return firstId ? nodeOutputs[firstId] : { mergedData: {}, strategy }
    }

    if (strategy === "append") {
      return {
        items: available.map((uid) => nodeOutputs[uid]),
        count: available.length,
        strategy,
      }
    }

    // wait-all (default)
    const aggregated: Record<string, unknown> = {}
    for (const uid of available) {
      aggregated[uid] = nodeOutputs[uid]
    }
    return { mergedData: aggregated, strategy }
  }
}
