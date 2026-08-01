// ─── Output Mapper ────────────────────────────────────────────────────────────
// Handles user-defined output mappings that reshape a node's raw output
// before it flows downstream. SRP — only mapping logic here.

import type { LoopContext } from "../types/workflow.types"
import { resolveTemplate } from "./template.engine"

/** Parse an output mapping JSON string (array format) into editable field rows. */
export function parseOutputMappingFields(mappingStr: string): { key: string; value: string }[] {
  if (!mappingStr || mappingStr === "[]" || mappingStr === "{}") return []
  try {
    const parsed = JSON.parse(mappingStr)
    if (Array.isArray(parsed)) {
      return parsed.map((f: { key?: string; value?: string }) => ({
        key: String(f.key || ""),
        value: String(f.value || ""),
      }))
    }
    // Backward compat: object format { "key": "value" }
    if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed).map(([key, value]) => ({
        key,
        value: String(value),
      }))
    }
  } catch { /* ignore */ }
  return []
}

/** Serialize field rows into a JSON array string for storage in node params. */
export function serializeOutputMappingFields(
  fields: { key: string; value: string }[]
): string {
  return JSON.stringify(fields, null, 2)
}

/** Apply user-defined output mapping to reshape a node's raw output. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyOutputMapping(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawOutput: any,
  mappingStr: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registry: Record<string, any>,
  loopCtx?: LoopContext
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const fields = parseOutputMappingFields(mappingStr)
  if (fields.length === 0) return rawOutput
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {}
    // Build a context where $json refers to the node's own raw output
    const mappingCtx: LoopContext = {
      item: { json: rawOutput },
      index: loopCtx?.index ?? 0,
      itemName: loopCtx?.itemName,
    }
    for (const field of fields) {
      if (!field.key.trim()) continue
      const resolved = resolveTemplate(field.value, registry, mappingCtx)
      try {
        result[field.key.trim()] = JSON.parse(resolved)
      } catch {
        result[field.key.trim()] = resolved
      }
    }
    return Object.keys(result).length > 0 ? result : rawOutput
  } catch {
    return rawOutput
  }
}
