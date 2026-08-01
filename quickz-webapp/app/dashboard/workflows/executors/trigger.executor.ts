// ─── Trigger Executor ─────────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"

export class TriggerExecutor implements INodeExecutor {
  readonly nodeType = "trigger"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const { resolvedParams } = ctx
    // Access customInputs and runInputData from resolvedParams or ctx
    // The trigger node uses the resolvedParams which already has template resolution applied

    const triggerPayload: Record<string, unknown> = {
      event: resolvedParams.eventName || "On New Order",
      contentType: resolvedParams.contentType || "application/json",
    }

    // Handle file(s) - files are injected via customInputs passed through resolvedParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let loadedFiles: { name: string; content: string }[] = []
    try {
      if (resolvedParams.sampleFiles) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sampleFilesParsed = JSON.parse(resolvedParams.sampleFiles)
        if (Array.isArray(sampleFilesParsed)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sampleFilesParsed.forEach((tf: any) => {
            if (tf.content) {
              triggerPayload[tf.key] = tf.content
              loadedFiles.push({ name: tf.name, content: tf.content })
            }
          })
        }
      }
    } catch { /* ignore */ }

    if (loadedFiles.length === 0) {
      const singleFile = resolvedParams.sampleFile
      if (singleFile) {
        loadedFiles = [{ name: "sample-file", content: singleFile }]
      }
    }

    if (loadedFiles.length > 0) {
      triggerPayload.files = loadedFiles
      triggerPayload.file = loadedFiles[0]?.content || ""
    }

    // Parse inputSchema fields
    if (resolvedParams.inputSchema && resolvedParams.inputSchema !== "{}") {
      try {
        const schema = JSON.parse(resolvedParams.inputSchema)
        if (schema.properties) {
          for (const key of Object.keys(schema.properties)) {
            const inputValue = (ctx.customInputs && ctx.customInputs[key] !== undefined)
              ? ctx.customInputs[key]
              : (ctx.runInputData && ctx.runInputData[key] !== undefined ? ctx.runInputData[key] : undefined);

            if (inputValue !== undefined && inputValue !== "") {
              const type = schema.properties[key].type;
              triggerPayload[key] = type === "number" ? Number(inputValue) : inputValue;
            } else if (triggerPayload[key] === undefined) {
              const prop = schema.properties[key]
              triggerPayload[key] = prop?.default !== undefined ? prop.default : ""
            }
          }
        }
      } catch { /* ignore bad JSON */ }
    }

    return triggerPayload
  }
}
