// ─── Router Executor ──────────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"
import { evaluateCondition } from "../engine/condition.evaluator"

export class RouterExecutor implements INodeExecutor {
  readonly nodeType = "router"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const condition = ctx.resolvedParams.condition || "false"
    const result = evaluateCondition(condition)

    // Activate outgoing edges matching the chosen handle
    const activeHandle = result ? "true" : "false"
    ctx.allEdges
      .filter((e) => e.source === node.id && e.sourceHandle === activeHandle)
      .forEach((e) => ctx.activeEdgeIds.add(e.id))

    return { branch: result ? "true" : "false", evaluated: result }
  }
}
