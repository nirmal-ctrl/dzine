// ─── Filter Executor ──────────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"
import { resolveTemplate } from "../engine/template.engine"
import { evaluateCondition } from "../engine/condition.evaluator"

/**
 * The filter executor returns a special shape that the orchestrator inspects:
 * if `__blockDownstream` is true, the orchestrator won't activate outgoing edges.
 */
export class FilterExecutor implements INodeExecutor {
  readonly nodeType = "filter"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const { nodeOutputs, allEdges } = ctx
    const conditionTemplate = node.data.params.condition || "true"
    const directParentIds = allEdges
      .filter((e) => e.target === node.id)
      .map((e) => e.source)
    const upstreamVal = directParentIds.length
      ? nodeOutputs[directParentIds[0]]
      : undefined

    const upstreamArray: unknown[] | null = Array.isArray(upstreamVal)
      ? (upstreamVal as unknown[])
      : upstreamVal &&
          typeof upstreamVal === "object" &&
          Array.isArray(
            (upstreamVal as Record<string, unknown>).items
          )
        ? ((upstreamVal as Record<string, unknown>).items as unknown[])
        : null

    if (upstreamArray) {
      const keptItems = upstreamArray.filter(
        (item: unknown, idx: number) => {
          const perItem = resolveTemplate(
            conditionTemplate,
            nodeOutputs,
            { item, index: idx },
            undefined,
            undefined
          )
          return evaluateCondition(perItem)
        }
      )
      return {
        items: keptItems,
        total: upstreamArray.length,
        keptCount: keptItems.length,
      }
    }

    // Single-value filter
    const evaluated = resolveTemplate(
      conditionTemplate,
      nodeOutputs,
      { item: upstreamVal, index: 0 },
      node.id,
      allEdges
    )
    const passed = evaluateCondition(evaluated)

    if (!passed) {
      // Signal to the orchestrator to block downstream propagation
      return {
        passed,
        data: undefined,
        __blockDownstream: true,
      }
    }
    return { passed, data: upstreamVal }
  }
}
