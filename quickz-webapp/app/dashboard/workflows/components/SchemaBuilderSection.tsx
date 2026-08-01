"use client"

import * as React from "react"
import type { Node } from "reactflow"
import { BracesIcon, RepeatIcon, Trash2Icon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { NodeData } from "../types/workflow.types"

interface SchemaNode {
  name: string
  type: string
  description: string
  properties?: SchemaNode[]
  items?: SchemaNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseJsonSchemaToNodes(schema: any, name: string = ""): SchemaNode {
  const type = schema?.type || "string"
  const description = schema?.description || ""
  const node: SchemaNode = { name, type, description }

  if (type === "object" && schema.properties) {
    node.properties = Object.entries(schema.properties).map(([propName, propSchema]) =>
      parseJsonSchemaToNodes(propSchema, propName)
    )
  } else if (type === "array" && schema.items) {
    node.items = parseJsonSchemaToNodes(schema.items, "item")
  }

  return node
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeNodesToJsonSchema(node: SchemaNode): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = { type: node.type }
  if (node.description) {
    schema.description = node.description
  }

  if (node.type === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties: Record<string, any> = {}
    if (node.properties) {
      for (const prop of node.properties) {
        if (!prop.name.trim()) continue
        properties[prop.name.trim()] = serializeNodesToJsonSchema(prop)
      }
    }
    schema.properties = properties
  } else if (node.type === "array") {
    if (node.items) {
      schema.items = serializeNodesToJsonSchema(node.items)
    } else {
      schema.items = { type: "string" }
    }
  }

  return schema
}

function parseSchemaFields(schemaStr: string): SchemaNode[] {
  if (!schemaStr || schemaStr === "{}") return []
  try {
    const parsed = JSON.parse(schemaStr)
    if (parsed && typeof parsed === "object") {
      if (parsed.properties) {
        return Object.entries(parsed.properties).map(([name, schema]) =>
          parseJsonSchemaToNodes(schema, name)
        )
      }
    }
  } catch { /* ignore */ }
  return []
}

function serializeSchemaFields(fields: SchemaNode[]): string {
  if (fields.length === 0) return "{}"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: Record<string, any> = {}
  for (const f of fields) {
    if (!f.name.trim()) continue
    properties[f.name.trim()] = serializeNodesToJsonSchema(f)
  }
  return JSON.stringify({ type: "object", properties }, null, 2)
}

/** Recursive visual schema builder component row. */
const SchemaNodeEditor = ({
  node,
  onChange,
  onRemove,
  level = 0
}: {
  node: SchemaNode
  onChange: (updated: SchemaNode) => void
  onRemove: () => void
  level?: number
}) => {
  return (
    <div className="space-y-1.5 p-2.5 border border-border rounded-md bg-muted/10 relative" style={{ marginLeft: `${level > 0 ? 12 : 0}px` }}>
      <div className="flex gap-2 items-center">
        <Input
          value={node.name}
          onChange={(e) => onChange({ ...node, name: e.target.value })}
          className="rounded-none text-xs h-8 font-mono flex-1 bg-background"
          placeholder={level === 0 ? "fieldName" : "childField"}
          disabled={node.name === "item" && level > 0}
        />
        <select
          value={node.type}
          onChange={(e) => {
            const newType = e.target.value
            const updated: SchemaNode = { ...node, type: newType }
            if (newType === "object") {
              updated.properties = updated.properties || []
              delete updated.items
            } else if (newType === "array") {
              updated.items = updated.items || { name: "item", type: "object", description: "Array item", properties: [] }
              delete updated.properties
            } else {
              delete updated.properties
              delete updated.items
            }
            onChange(updated)
          }}
          className="flex h-8 w-[95px] items-center justify-between border border-input bg-background px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-ring text-foreground rounded-none"
        >
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="boolean">boolean</option>
          <option value="object">object</option>
          <option value="array">array</option>
        </select>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="shrink-0 size-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2Icon className="size-3" />
        </Button>
      </div>
      <Input
        value={node.description}
        onChange={(e) => onChange({ ...node, description: e.target.value })}
        className="rounded-none text-[10px] h-8 text-muted-foreground bg-background"
        placeholder="Description (optional)"
      />

      {/* Children for Object type */}
      {node.type === "object" && (
        <div className="mt-2.5 space-y-2 border-l-2 border-primary/20 pl-3">
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1">
            <BracesIcon className="size-2.5" />
            Properties of {node.name || "object"}:
          </div>
          {node.properties?.map((child, cIdx) => (
            <SchemaNodeEditor
              key={cIdx}
              node={child}
              onChange={(updatedChild) => {
                const nextProps = [...(node.properties || [])]
                nextProps[cIdx] = updatedChild
                onChange({ ...node, properties: nextProps })
              }}
              onRemove={() => {
                const nextProps = [...(node.properties || [])]
                nextProps.splice(cIdx, 1)
                onChange({ ...node, properties: nextProps })
              }}
              level={level + 1}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const nextProps = [...(node.properties || []), { name: "", type: "string", description: "" }]
              onChange({ ...node, properties: nextProps })
            }}
            className="w-full text-[10px] h-7 rounded-none border-dashed bg-background/50 hover:bg-background"
          >
            + Add Property to {node.name || "object"}
          </Button>
        </div>
      )}

      {/* Item for Array type */}
      {node.type === "array" && node.items && (
        <div className="mt-2.5 space-y-2 border-l-2 border-indigo-500/20 pl-3">
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1">
            <RepeatIcon className="size-2.5" />
            Array Item Structure:
          </div>
          <SchemaNodeEditor
            node={node.items}
            onChange={(updatedItems) => {
              onChange({ ...node, items: updatedItems })
            }}
            onRemove={() => {
              onChange({ ...node, items: undefined })
            }}
            level={level + 1}
          />
        </div>
      )}
    </div>
  )
}

/** Visual schema builder for expected payload schemas (Trigger and LLM nodes). */
export const SchemaBuilderSection = ({
  selectedNode,
  updateNodeData,
  paramKey = "inputSchema",
  title = "Expected Payload Schema"
}: {
  selectedNode: Node<NodeData>
  updateNodeData: (updatedFields: Partial<NodeData>) => void
  paramKey?: "inputSchema" | "jsonSchema"
  title?: string
}) => {
  const [isRawMode, setIsRawMode] = React.useState(false)
  const [fields, setFields] = React.useState<SchemaNode[]>(() =>
    parseSchemaFields(selectedNode.data.params[paramKey] || "{}")
  )
  const [rawJson, setRawJson] = React.useState(() => selectedNode.data.params[paramKey] || "{}")
  const [schemaError, setSchemaError] = React.useState<string | null>(null)

  const commitFields = (newFields: SchemaNode[]) => {
    setFields(newFields)
    const jsonStr = serializeSchemaFields(newFields)
    setRawJson(jsonStr)
    updateNodeData({ params: { ...selectedNode.data.params, [paramKey]: jsonStr } })
  }

  const handleRawChange = (val: string) => {
    setRawJson(val)
    if (!val.trim()) {
      setSchemaError(null)
      updateNodeData({ params: { ...selectedNode.data.params, [paramKey]: "{}" } })
      setFields([])
      return
    }

    try {
      const parsed = JSON.parse(val)
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Schema must be a valid JSON Object")
      }
      setSchemaError(null)
      updateNodeData({ params: { ...selectedNode.data.params, [paramKey]: JSON.stringify(parsed, null, 2) } })
      setFields(parseSchemaFields(JSON.stringify(parsed)))
    } catch (err: unknown) {
      setSchemaError(err instanceof Error ? err.message : "Malformed JSON")
    }
  }

  const toggleMode = (rawMode: boolean) => {
    if (!rawMode) {
      try {
        const parsed = JSON.parse(rawJson)
        setFields(parseSchemaFields(JSON.stringify(parsed)))
        setSchemaError(null)
      } catch {
        setSchemaError("Cannot switch to visual mode with invalid JSON. Please fix errors first.")
        return
      }
    } else {
      setRawJson(selectedNode.data.params[paramKey] || "{}")
    }
    setIsRawMode(rawMode)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</Label>
        <div className="flex gap-1.5 bg-muted p-0.5 rounded border border-border">
          <button
            type="button"
            onClick={() => toggleMode(false)}
            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide transition-all ${!isRawMode ? "bg-card text-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => toggleMode(true)}
            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide transition-all ${isRawMode ? "bg-card text-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {!isRawMode ? (
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <SchemaNodeEditor
              key={idx}
              node={field}
              onChange={(updatedField) => {
                const next = [...fields]
                next[idx] = updatedField
                commitFields(next)
              }}
              onRemove={() => {
                const next = [...fields]
                next.splice(idx, 1)
                commitFields(next)
              }}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => commitFields([...fields, { name: "", type: "string", description: "" }])}
            className="w-full text-xs h-9 rounded-none border-dashed"
          >
            + Add Schema Field
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            value={rawJson}
            onChange={(e) => handleRawChange(e.target.value)}
            className="rounded-none text-xs min-h-[180px] font-mono resize-none leading-relaxed border-border focus-visible:ring-1"
            placeholder={`{\n  "type": "object",\n  "properties": {\n    "items": {\n      "type": "array",\n      "description": "Complex list of products"\n    }\n  }\n}`}
          />
          {schemaError ? (
            <p className="text-[10px] text-red-500 font-medium font-mono leading-tight p-2 bg-red-500/5 border border-red-500/20">
              ⚠️ {schemaError}
            </p>
          ) : (
            <p className="text-[10px] text-emerald-500 font-semibold font-mono leading-tight p-2 bg-emerald-500/5 border border-emerald-500/20">
              ✓ JSON Schema is valid
            </p>
          )}
          <p className="text-[9px] text-muted-foreground/60 leading-relaxed">
            Specify a full JSON Schema. You can define nested keys, default values, array items, and any complex objects.
          </p>
        </div>
      )}

      {fields.some(f => f.name.trim()) && !isRawMode && (
        <details className="text-[10px] text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground flex items-center gap-1 select-none">
            <BracesIcon className="size-3" />
            Preview JSON Schema
          </summary>
          <pre className="font-mono bg-muted/30 border border-border p-3 rounded-md overflow-x-auto mt-2">
            {selectedNode.data.params[paramKey] || "{}"}
          </pre>
        </details>
      )}
    </div>
  )
}
