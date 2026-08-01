"use client"

import * as React from "react"
import type { Node } from "reactflow"
import { BracesIcon, Trash2Icon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { NodeData } from "../types/workflow.types"
import { parseOutputMappingFields, serializeOutputMappingFields } from "../engine/output.mapper"
import { DroppableInput } from "./DroppableRichInput"

/** Visual schema builder for configuring node output mapping.
 *  Mounted with key={selectedNode.id} so state resets naturally when switching nodes. */
export const OutputMappingSection = ({
  selectedNode,
  updateNodeData
}: {
  selectedNode: Node<NodeData>
  updateNodeData: (updatedFields: Partial<NodeData>) => void
}) => {
  const [fields, setFields] = React.useState<{ key: string; value: string }[]>(() =>
    parseOutputMappingFields(selectedNode.data.params.outputMapping || "[]")
  )

  const commit = (newFields: { key: string; value: string }[]) => {
    setFields(newFields)
    updateNodeData({ params: { ...selectedNode.data.params, outputMapping: serializeOutputMappingFields(newFields) } })
  }

  return (
    <div className="space-y-3 pt-4 border-t">
      <div className="p-3 border border-primary/20 bg-primary/5 space-y-1 rounded">
        <div className="flex items-center gap-1.5">
          <BracesIcon className="size-3 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Output Mapping (Optional)</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Reshape the output of this node before it flows downstream. Use <code className="text-foreground">{"{{$json.field}}"}</code> to reference the raw output, or drag upstream variables from above.
        </p>
      </div>

      {fields.map((field, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <Input
            value={field.key}
            onChange={(e) => {
              const next = [...fields]
              next[idx] = { ...next[idx], key: e.target.value }
              commit(next)
            }}
            className="rounded-none text-xs h-9 font-mono flex-1"
            placeholder="outputKey"
          />
          <DroppableInput
            value={field.value}
            onChange={(e) => {
              const next = [...fields]
              next[idx] = { ...next[idx], value: e.target.value }
              commit(next)
            }}
            className="rounded-none text-xs h-9 font-mono flex-[2]"
            placeholder="{{$json.field}}"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              const next = [...fields]
              next.splice(idx, 1)
              commit(next)
            }}
            className="shrink-0 size-9 text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => commit([...fields, { key: "", value: "" }])}
        className="w-full text-xs h-9 rounded-none border-dashed"
      >
        + Add Output Field
      </Button>

      {fields.some(f => f.key.trim()) && (
        <details className="text-[10px] text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground flex items-center gap-1">
            <BracesIcon className="size-3" />
            Preview JSON template
          </summary>
          <pre className="font-mono bg-muted/30 border border-border p-3 rounded-md overflow-x-auto mt-2">
            {selectedNode.data.params.outputMapping || "[]"}
          </pre>
        </details>
      )}
    </div>
  )
}
