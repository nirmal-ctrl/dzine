// ─── Template Engine ──────────────────────────────────────────────────────────
// Resolves n8n-style {{ $json.field }} and {{ $node["id"].json.field }} placeholders
// against the node output registry. Two modes:
//   resolveTemplate  → always returns a string (for prompts, conditions, display)
//   resolveRawTemplate → returns the raw JS value when the entire string is one placeholder
//   resolveParams    → batch-resolve all params of a node

import type { Edge } from "reactflow"
import type { LoopContext } from "../types/workflow.types"
import { getUpstreamNodeIds } from "./graph.utils"

// ─── resolveTemplate ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveTemplate(text: string, registry: Record<string, any>, loopCtx?: LoopContext, currentNodeId?: string, edges?: Edge[]): string {
  if (typeof text !== "string") {
    if (text === null || text === undefined) return ""
    text = String(text)
  }

  return text.replace(/\{\{\s*([\s\S]+?)\s*\}\}/g, (_match: string, rawPath: string): string => {
    const path = rawPath.trim().replace(/\\/g, "")

    // ── $node["id"].json.field ─────────────────────────────────────────
    const nodeMatch = path.match(/^\$node\s*\[\s*["']?([^"'\s]+)["']?\s*\]\s*\.\s*json(?:\s*\.\s*(.+))?$/)
    if (nodeMatch) {
      const nodeId = nodeMatch[1]
      const fieldPath = nodeMatch[2]
      const nodeOutput = registry[nodeId]
      if (!nodeOutput) return `{{ ${path} }}`

      let baseVal: unknown = unwrapJson(nodeOutput)

      if (!fieldPath) {
        return typeof baseVal === "string" ? baseVal : JSON.stringify(baseVal)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let val: any = baseVal
      for (const p of fieldPath.split(".")) {
        if (val == null) return `{{ ${path} }}`
        val = val[p]
      }
      return val == null ? `{{ ${path} }}` : String(val)
    }

    // ── $json / $json.field ────────────────────────────────────────────
    if (path.startsWith("$json")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let baseVal: any = resolveJsonBase(registry, loopCtx, currentNodeId, edges)

      if (path === "$json") {
        return typeof baseVal === "string" ? baseVal : JSON.stringify(baseVal)
      }

      const fieldPath = path.substring(6) // remove "$json."
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let val: any = baseVal
      for (const p of fieldPath.split(".")) {
        if (val == null) return `{{ ${path} }}`
        val = val[p]
      }
      return val == null ? `{{ ${path} }}` : String(val)
    }

    // ── Custom loop item name (e.g. {{slide}} or {{slide.title}}) ──────
    if (loopCtx?.itemName && path === loopCtx.itemName) {
      const val = loopCtx.item
      return typeof val === "string" ? val : JSON.stringify(val)
    }
    if (loopCtx?.itemName && path.startsWith(`${loopCtx.itemName}.`)) {
      const fieldPath = path.substring(loopCtx.itemName.length + 1)
      let val = loopCtx.item
      for (const p of fieldPath.split(".")) {
        if (val == null) return `{{${path}}}`
        val = val[p]
      }
      return val == null ? `{{${path}}}` : String(val)
    }

    // ── {{index}} ──────────────────────────────────────────────────────
    if (loopCtx && path === "index") {
      return String(loopCtx.index)
    }

    // ── Fallback: {{item}} / {{item.field}} for backward compat ───────
    const parts = path.split(".")
    if (parts[0] === "item") {
      if (!loopCtx) return `{{${path}}}`
      let val = loopCtx.item
      if (parts.length === 1) return typeof val === "string" ? val : JSON.stringify(val)
      for (let i = 1; i < parts.length; i++) {
        if (val == null) return `{{${path}}}`
        val = val[parts[i]]
      }
      return val == null ? `{{${path}}}` : String(val)
    }

    return `{{${path}}}`
  })
}

// ─── resolveRawTemplate ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveRawTemplate(text: string, registry: Record<string, any>, loopCtx?: LoopContext, currentNodeId?: string, edges?: Edge[]): any {
  if (typeof text !== "string") return text

  const trimmed = text.trim()
  // Only apply raw resolution when the entire string is exactly one {{ }} expression
  if (trimmed.startsWith("{{") && trimmed.endsWith("}}") && (trimmed.match(/\{\{/g) || []).length === 1) {
    const rawPath = trimmed.slice(2, -2).trim()
    const path = rawPath.replace(/\\/g, "")

    // ── $node["id"].json.field ─────────────────────────────────────────
    const nodeMatch = path.match(/^\$node\s*\[\s*["']?([^"'\s]+)["']?\s*\]\s*\.\s*json(?:\s*\.\s*(.+))?$/)
    if (nodeMatch) {
      const nodeId = nodeMatch[1]
      const fieldPath = nodeMatch[2]
      const nodeOutput = registry[nodeId]
      if (!nodeOutput) return undefined

      let baseVal: unknown = unwrapJson(nodeOutput)

      if (!fieldPath) return baseVal
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let val: any = baseVal
      for (const p of fieldPath.split(".")) {
        if (val == null) return undefined
        val = val[p]
      }
      return val
    }

    // ── $json / $json.field ────────────────────────────────────────────
    if (path.startsWith("$json")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const baseVal: any = resolveJsonBase(registry, loopCtx, currentNodeId, edges)

      if (path === "$json") return baseVal

      const fieldPath = path.substring(6)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let val: any = baseVal
      for (const p of fieldPath.split(".")) {
        if (val == null) return undefined
        val = val[p]
      }
      return val
    }

    // ── Custom loop item name ──────────────────────────────────────────
    if (loopCtx?.itemName && path === loopCtx.itemName) {
      return loopCtx.item
    }
    if (loopCtx?.itemName && path.startsWith(`${loopCtx.itemName}.`)) {
      const fieldPath = path.substring(loopCtx.itemName.length + 1)
      let val = loopCtx.item
      for (const p of fieldPath.split(".")) {
        if (val == null) return undefined
        val = val[p]
      }
      return val
    }

    // ── {{index}} ──────────────────────────────────────────────────────
    if (loopCtx && path === "index") {
      return loopCtx.index
    }
  }

  // Otherwise fall back to string interpolation
  return resolveTemplate(text, registry, loopCtx, currentNodeId, edges)
}

// ─── resolveParams (batch) ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveParams(params: Record<string, string>, registry: Record<string, any>, loopCtx?: LoopContext, currentNodeId?: string, edges?: Edge[]): Record<string, string> {
  const resolved: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    resolved[key] = resolveTemplate(value, registry, loopCtx, currentNodeId, edges)
  }
  return resolved
}

// ─── cleanJsonString ──────────────────────────────────────────────────────────

/** Strip markdown code fences and whitespace from an LLM JSON response. */
export function cleanJsonString(str: string): string {
  let cleaned = str.trim()
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7)
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3)
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3)
  }
  return cleaned.trim()
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Unwrap the `json` envelope from a node output.
 * Priority: [{ json: {...} }, ...] → { json: {...} } → raw object.
 */
function unwrapJson(nodeOutput: unknown): unknown {
  if (Array.isArray(nodeOutput) && (nodeOutput as Array<{ json?: unknown }>)[0]?.json) {
    return (nodeOutput as Array<{ json: unknown }>)[0].json
  }
  if (nodeOutput && typeof nodeOutput === "object" && "json" in (nodeOutput as Record<string, unknown>)) {
    return (nodeOutput as Record<string, unknown>).json
  }
  return nodeOutput
}

/**
 * Resolve the $json base value by looking at upstream nodes, loop context, or
 * the last entry in the registry as a final fallback.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveJsonBase(registry: Record<string, any>, loopCtx?: LoopContext, currentNodeId?: string, edges?: Edge[]): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let baseVal: any = undefined

  if (currentNodeId && edges) {
    const upstreamIds = getUpstreamNodeIds(edges, currentNodeId)
    if (upstreamIds.length > 0) {
      baseVal = registry[upstreamIds[0]]
    }
  }

  if (!baseVal) {
    if (loopCtx?.item !== undefined) {
      baseVal = loopCtx.item
    } else {
      const keys = Object.keys(registry)
      if (keys.length > 0) {
        const lastOutput = registry[keys[keys.length - 1]]
        if (Array.isArray(lastOutput) && lastOutput[0]?.json) {
          baseVal = lastOutput[0].json
        } else {
          baseVal = lastOutput
        }
      }
    }
  }

  // Unwrap json envelope
  if (Array.isArray(baseVal) && baseVal[0]?.json) {
    baseVal = baseVal[0].json
  } else if (baseVal && typeof baseVal === "object" && baseVal.json) {
    baseVal = baseVal.json
  }

  return baseVal
}
