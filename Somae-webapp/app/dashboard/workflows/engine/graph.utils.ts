// ─── Graph Utilities ──────────────────────────────────────────────────────────
// Pure functions for graph traversal, sorting, and ID generation.
// Single Responsibility: only graph/topology concerns, no UI or execution logic.

import type { Edge, Node } from "reactflow"
import type { NodeData } from "../types/workflow.types"

/** Walk edges backward to collect all nodes that feed into `nodeId` (BFS). */
export function getUpstreamNodeIds(edges: Edge[], nodeId: string): string[] {
  const upstream = new Set<string>()
  const queue = [nodeId]
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const e of edges) {
      if (e.target === current && !upstream.has(e.source)) {
        upstream.add(e.source)
        queue.push(e.source)
      }
    }
  }
  return Array.from(upstream)
}

/** Walk edges forward to collect all nodes reachable from `nodeId` (BFS). */
export function getDownstreamNodes(
  nodeId: string,
  allNodes: Node<NodeData>[],
  edges: Edge[]
): Node<NodeData>[] {
  const visited = new Set<string>()
  const queue = [nodeId]
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const e of edges) {
      if (e.source === current && !visited.has(e.target)) {
        visited.add(e.target)
        const node = allNodes.find((n) => n.id === e.target)
        if (node) queue.push(node.id)
      }
    }
  }
  return allNodes.filter((n) => visited.has(n.id))
}

/** Kahn's algorithm topological sort. Preserves original order for cycles/orphans. */
export function topologicalSort(
  nodes: Node<NodeData>[],
  edges: Edge[]
): Node<NodeData>[] {
  const adj = new Map<string, string[]>()
  const inDegree = new Map<string, number>()
  const nodeIds = new Set(nodes.map((n) => n.id))

  for (const n of nodes) {
    adj.set(n.id, [])
    inDegree.set(n.id, 0)
  }
  for (const e of edges) {
    if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
      const existing = adj.get(e.source) || []
      existing.push(e.target)
      adj.set(e.source, existing)
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1)
    }
  }
  const queue: string[] = []
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id)
  }
  const sorted: Node<NodeData>[] = []
  while (queue.length > 0) {
    const id = queue.shift()!
    const node = nodes.find((n) => n.id === id)
    if (node) sorted.push(node)
    for (const neighbor of adj.get(id) || []) {
      const newDeg = (inDegree.get(neighbor) || 1) - 1
      inDegree.set(neighbor, newDeg)
      if (newDeg === 0) queue.push(neighbor)
    }
  }
  // Append any unvisited nodes (cycles or orphans) in original order
  for (const n of nodes) {
    if (!sorted.find((s) => s.id === n.id)) sorted.push(n)
  }
  return sorted
}

/** Generate a collision-resistant node/group id. */
export function generateNodeId(prefix: "node" | "group" = "node"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Quick check if any param value contains a {{placeholder}}. */
export function hasPlaceholders(params: Record<string, string>): boolean {
  return Object.values(params).some(
    (v) => typeof v === "string" && /\{\{/.test(v)
  )
}

/** Derive available variable hints for the autocomplete panel. */
export function getAvailableVariables(
  currentNodeId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeOutputs: Record<string, any>,
  allNodes: Node<NodeData>[],
  edges: Edge[],
  loopCtx?: { itemName?: string }
): string[] {
  const vars: string[] = []
  const upstreamIds = getUpstreamNodeIds(edges, currentNodeId)
  for (const uid of upstreamIds) {
    const node = allNodes.find((n) => n.id === uid)
    if (!node) continue
    const output = nodeOutputs[uid]
    vars.push(`{{${uid}}}`)
    if (output && typeof output === "object") {
      for (const key of Object.keys(output as Record<string, unknown>)) {
        vars.push(`{{${uid}.${key}}}`)
      }
    }
  }
  if (loopCtx?.itemName) {
    vars.push(`{{${loopCtx.itemName}}}`, `{{${loopCtx.itemName}.}}`, `{{index}}`)
  } else {
    vars.push(`{{item}}`, `{{item.}}`, `{{index}}`)
  }
  return [...new Set(vars)].sort()
}

/**
 * Helper to extract loop item field hints dynamically from any upstream node's
 * schema based on the loop's arrayPath param.
 */
export function getLoopFields(
  allNodes: Node<NodeData>[],
  allEdges: Edge[]
): { name: string; path: string }[] {
  const loopNode = allNodes.find((n) => n.data.type === "loop")
  if (!loopNode) return []

  const arrayPath = loopNode.data.params.arrayPath || "$.slides"
  const upstreamIds = getUpstreamNodeIds(allEdges, loopNode.id)
  if (upstreamIds.length === 0) return []

  for (const uid of upstreamIds) {
    const upstreamNode = allNodes.find((n) => n.id === uid)
    if (!upstreamNode) continue

    const schemaStr =
      upstreamNode.data.params.jsonSchema || upstreamNode.data.params.inputSchema
    if (!schemaStr || schemaStr === "{}") continue

    try {
      const schema = JSON.parse(schemaStr)
      if (!schema || schema.type !== "object" || !schema.properties) continue

      const pathParts = arrayPath.replace(/^\$\./, "").split(".")
      let currentSchema = schema
      let found = true

      for (const part of pathParts) {
        if (currentSchema?.properties?.[part]) {
          currentSchema = currentSchema.properties[part]
        } else {
          found = false
          break
        }
      }

      if (
        found &&
        currentSchema.type === "array" &&
        currentSchema.items?.type === "object" &&
        currentSchema.items?.properties
      ) {
        return Object.keys(currentSchema.items.properties).map((propName) => ({
          name: propName,
          path: propName,
        }))
      }
    } catch {
      // ignore malformed JSON
    }
  }

  return []
}

/**
 * Statically extract field names from a node's output schema.
 * Used by the autocomplete system and the config panel variable picker.
 */
export function getStaticNodeFields(
  nodeId: string,
  allNodes: Node<NodeData>[]
): { name: string; type: string; description?: string }[] {
  const node = allNodes.find((n) => n.id === nodeId)
  if (!node) return []

  const mappingStr = node.data.params.outputMapping || "[]"
  try {
    const mappedFields = JSON.parse(mappingStr)
    if (Array.isArray(mappedFields) && mappedFields.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mappedFields.map((f: any) => ({ name: f.key, type: "mapped" }))
    }
  } catch { /* ignore */ }

  if (node.data.type === "trigger") {
    let fields: { name: string; type: string; description?: string }[] = []
    try {
      const parsed = JSON.parse(node.data.params.inputSchema || "{}")
      if (parsed?.properties) {
        fields = Object.entries(parsed.properties).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ([name, prop]: [string, any]) => ({
            name,
            type: prop?.type || "any",
            description: prop?.description,
          })
        )
      }
    } catch { /* ignore */ }

    if (
      node.data.params.contentType === "multipart/form-data" ||
      node.data.params.contentType === "image/png"
    ) {
      fields.push({ name: "file", type: "string", description: "Uploaded file base64 data" })
      try {
        if (node.data.params.sampleFiles) {
          const customFiles = JSON.parse(node.data.params.sampleFiles)
          if (Array.isArray(customFiles)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            customFiles.forEach((f: any) => {
              if (f.key) {
                fields.push({
                  name: f.key,
                  type: "string",
                  description: `Uploaded file input: ${f.name || f.key}`,
                })
              }
            })
          }
        }
      } catch { /* ignore */ }
    }

    if (fields.length > 0) return fields
  }

  if (node.data.type === "image-gen")
    return [
      { name: "imageUrl", type: "string" },
      { name: "imageUrls", type: "array" },
      { name: "aspectRatio", type: "string" },
    ]

  if (node.data.type === "http-request")
    return [
      { name: "status", type: "number" },
      { name: "data", type: "object" },
    ]

  if (node.data.type === "llm") {
    if (
      node.data.params.responseFormat === "json_object" &&
      node.data.params.jsonSchema
    ) {
      try {
        const parsed = JSON.parse(node.data.params.jsonSchema)
        if (parsed?.properties) {
          return Object.entries(parsed.properties).map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ([name, prop]: [string, any]) => ({
              name,
              type: prop?.type || "any",
              description: prop?.description,
            })
          )
        }
      } catch { /* ignore */ }
    }
    return [{ name: "text", type: "string" }]
  }

  if (node.data.type === "router")
    return [
      { name: "branch", type: "string" },
      { name: "evaluated", type: "boolean" },
    ]

  if (node.data.type === "classifier")
    return [
      { name: "chosenMatch", type: "string" },
      { name: "value", type: "string" },
    ]

  return []
}
