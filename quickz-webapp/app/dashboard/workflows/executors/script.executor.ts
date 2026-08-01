// ─── Script Executor ──────────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"
import { getUpstreamNodeIds } from "../engine/graph.utils"

export class ScriptExecutor implements INodeExecutor {
  readonly nodeType = "script"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const { resolvedParams, nodeOutputs, allEdges, loopCtx } = ctx

    if (!resolvedParams.code) {
      return { processed: true }
    }

    // eslint-disable-next-line no-new-func
    const fn = new Function("data", "nodeOutputs", "loopCtx", resolvedParams.code)
    const upstreamData = getUpstreamNodeIds(allEdges, node.id)
      .map((uid) => nodeOutputs[uid])
      .filter(Boolean)
    return fn(upstreamData, nodeOutputs, loopCtx)
  }
}
