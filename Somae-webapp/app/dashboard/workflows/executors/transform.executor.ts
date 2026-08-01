// ─── Transform Executor ───────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"
import { resolveTemplate } from "../engine/template.engine"

export class TransformExecutor implements INodeExecutor {
  readonly nodeType = "transform"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const { resolvedParams, nodeOutputs, allEdges } = ctx
    const mappingStr = resolvedParams.mapping || "{}"
    let mappingObj: Record<string, string> = {}
    try {
      const parsed = JSON.parse(mappingStr)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
        mappingObj = parsed
    } catch {
      throw new Error(
        `Transform mapping is not valid JSON. Expected an object like { "newKey": "{{$json.oldKey}}" }`
      )
    }

    const directParentIds = allEdges
      .filter((e) => e.target === node.id)
      .map((e) => e.source)
    const upstreamVal = directParentIds.length
      ? nodeOutputs[directParentIds[0]]
      : undefined
    const transformCtx = { item: upstreamVal, index: 0 }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformed: Record<string, any> = {}
    for (const [key, tpl] of Object.entries(mappingObj)) {
      const resolvedVal = resolveTemplate(
        String(tpl),
        nodeOutputs,
        transformCtx,
        node.id,
        allEdges
      )
      try {
        transformed[key] = JSON.parse(resolvedVal)
      } catch {
        transformed[key] = resolvedVal
      }
    }
    return transformed
  }
}
