// ─── Classifier Executor ──────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"

export class ClassifierExecutor implements INodeExecutor {
  readonly nodeType = "classifier"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const { resolvedParams, allEdges, activeEdgeIds } = ctx
    const valToMatch = resolvedParams.valueToMatch || ""
    const possibilities = (resolvedParams.possibilities || "billing,support,sales")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)

    let chosen = possibilities[0] || "billing"
    const valClean = valToMatch.toLowerCase().trim()
    let foundMatch = false

    // 1. Exact match
    for (const opt of possibilities) {
      if (valClean === opt.toLowerCase().trim()) {
        chosen = opt
        foundMatch = true
        break
      }
    }

    // 2. Substring fallback
    if (!foundMatch) {
      for (const opt of possibilities) {
        const optClean = opt.toLowerCase().trim()
        if (valClean.includes(optClean) || optClean.includes(valClean)) {
          chosen = opt
          foundMatch = true
          break
        }
      }
    }

    // 3. Word-intersection fallback
    if (!foundMatch) {
      const valWords = valClean.split(/[\s\-_]+/).filter((w) => w.length >= 3)
      for (const opt of possibilities) {
        const optWords = opt
          .toLowerCase()
          .trim()
          .split(/[\s\-_]+/)
          .filter((w) => w.length >= 3)
        const hasOverlap = valWords.some((vw) =>
          optWords.some((ow) => vw.startsWith(ow) || ow.startsWith(vw))
        )
        if (hasOverlap) {
          chosen = opt
          break
        }
      }
    }

    // Activate outgoing edges matching the chosen handle
    allEdges
      .filter((e) => e.source === node.id && e.sourceHandle === chosen)
      .forEach((e) => activeEdgeIds.add(e.id))

    return { chosenMatch: chosen, value: valToMatch }
  }
}
