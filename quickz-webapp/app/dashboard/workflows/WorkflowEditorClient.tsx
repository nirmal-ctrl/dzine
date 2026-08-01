"use client"

import * as React from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  updateEdge,
  Connection,
  Edge,
  MarkerType,
  type Node,
  Handle,
  Position,
  NodeResizer,
} from "reactflow"
import "reactflow/dist/style.css"

import { cn } from "@/lib/utils"
import { useAiSettings } from "@/hooks/use-ai-settings"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import {
  ClockIcon,
  SparklesIcon,
  Code2Icon,
  Trash2Icon,
  PlayCircleIcon,
  SparkleIcon,
  ImageIcon,
  BrainCircuitIcon,
  BracesIcon,
  GlobeIcon,
  ZapIcon,
  Maximize2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  SquareArrowOutUpRightIcon,
  RepeatIcon,
  LayersIcon,
  GitBranchIcon,
  GitMergeIcon,
  ToggleLeftIcon,
  FilterIcon,
  Wand2Icon,
  SearchIcon,
  CopyIcon,
  CheckIcon,
  WorkflowIcon,
  ArrowLeftIcon,
  XIcon,
  AlertCircleIcon,
  CheckCircle2Icon
} from "lucide-react"

// ─── SOLID Module Imports ──────────────────────────────────────────────────────
import type { NodeType, NodeData, LogEntry, AvailableTile } from "./types/workflow.types"
import { PROVIDER_MODELS, NODE_COLORS, AVAILABLE_TILES } from "./constants/workflow.constants"
import { resolveTemplate, resolveRawTemplate, resolveParams, cleanJsonString } from "./engine/template.engine"
import { topologicalSort, getUpstreamNodeIds, getDownstreamNodes, generateNodeId, hasPlaceholders, getAvailableVariables, getLoopFields, getStaticNodeFields } from "./engine/graph.utils"
import { CustomWorkflowNode, GroupWorkflowNode, nodeTypes } from "./components/CustomWorkflowNode"
import { WorkflowNodesContext, DroppableRichInput, DroppableInput, DroppableTextarea } from "./components/DroppableRichInput"
import { JsonViewer, ThoughtBlock, CopyButton, DataRenderer } from "./components/JsonViewer"
import { OutputMappingSection } from "./components/OutputMappingSection"
import { SchemaBuilderSection } from "./components/SchemaBuilderSection"

interface WorkflowEditorClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
}

export function WorkflowEditorClient({ session }: WorkflowEditorClientProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Database Workflows States
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workflows, setWorkflows] = React.useState<any[]>([])
  const [activeWorkflowId, setActiveWorkflowId] = React.useState<string | null>(null)
  const [loadingWorkflows, setLoadingWorkflows] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [saveState, setSaveState] = React.useState<"idle" | "saved" | "error">("idle")
  const [isDirty, setIsDirty] = React.useState(false)
  const [workflowName, setWorkflowName] = React.useState("")
  const [workflowDescription, setWorkflowDescription] = React.useState("")

  // Modal for new workflow
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [newWorkflowName, setNewWorkflowName] = React.useState("")
  const [newWorkflowDescription, setNewWorkflowDescription] = React.useState("")

  // Code/JSON Modal states
  const [showJsonModal, setShowJsonModal] = React.useState(false)
  const [workflowJsonText, setWorkflowJsonText] = React.useState("")
  const [jsonImportError, setJsonImportError] = React.useState<string | null>(null)
  const [jsonCopied, setJsonCopied] = React.useState(false)

  // Search state for list
  const [searchQuery, setSearchQuery] = React.useState("")

  const [omniInput, setOmniInput] = React.useState("")
  const [aiGenerating, setAiGenerating] = React.useState(false)
  const [isRunning, setIsExecuting] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = React.useState<{ id?: string, nodeId?: string, label?: string, type?: NodeType, status?: "running" | "success" | "error", message: string, data?: any }[]>([])
  const [collapsedLogs, setCollapsedLogs] = React.useState<Record<string | number, boolean>>({})

  // Interactive Error Toasts State
  const [toasts, setToasts] = React.useState<{ id: string; title: string; message: string; type: "error" | "success" | "warning" | "info" }[]>([])

  const showToast = React.useCallback((title: string, message: string, type: "error" | "success" | "warning" | "info" = "error") => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, title, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 7000)
  }, [])

  const fetchWorkflows = async () => {
    try {
      setLoadingWorkflows(true)
      const res = await fetch("/api/workflows")
      if (res.ok) {
        const data = await res.json()
        setWorkflows(data)
      }
    } catch (err) {
      console.error("Failed to fetch workflows:", err)
    } finally {
      setLoadingWorkflows(false)
    }
  }

  React.useEffect(() => {
    fetchWorkflows()
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadWorkflow = async (id: string) => {
    try {
      setLoadingWorkflows(true)
      const res = await fetch(`/api/workflows/${id}`)
      if (res.ok) {
        const data = await res.json()
        setActiveWorkflowId(data.id)
        setWorkflowName(data.name)
        setWorkflowDescription(data.description || "")

        const dbNodes = data.nodes || []
        const dbEdges = data.edges || []

        // Deduplicate loaded nodes and edges by id
        const uniqueNodesMap = new Map<string, any>()
        dbNodes.forEach((n: any) => {
          if (n && n.id) {
            uniqueNodesMap.set(n.id, n)
          }
        })
        const uniqueDbNodes = Array.from(uniqueNodesMap.values())

        const uniqueEdgesMap = new Map<string, any>()
        dbEdges.forEach((e: any) => {
          if (e && e.id) {
            uniqueEdgesMap.set(e.id, e)
          }
        })
        const uniqueDbEdges = Array.from(uniqueEdgesMap.values())

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rehydratedNodes = uniqueDbNodes.map((n: any) => {
          const tile = AVAILABLE_TILES.find(t => t.type === n.data.type)
          return {
            ...n,
            data: {
              ...n.data,
              icon: tile?.icon || <ZapIcon className="size-4 text-white" />,
              color: tile?.color || "slate",
              status: "idle"
            }
          }
        })

        setNodes(rehydratedNodes)
        setEdges(uniqueDbEdges)
        setLogs([])
        setSelectedNode(null)
        setSelectedEdge(null)
        setIsSheetOpen(false)
        setIsRunSheetOpen(false)
        setRunInputData({})
        setExpectedInputs([])
        setIsAwaitingInputs(false)
        setCollapsedLogs({})
        setIsDirty(false)
        setSaveState("idle")
      }
    } catch (err) {
      console.error("Failed to load workflow:", err)
    } finally {
      setLoadingWorkflows(false)
    }
  }

  const createWorkflow = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newWorkflowName.trim()) return

    try {
      setSaving(true)
      const initialNodes = [
        {
          id: "node-1",
          type: "custom",
          position: { x: 50, y: 350 },
          data: {
            label: "Trigger Webhook",
            type: "trigger",
            params: {
              triggerType: "webhook",
              eventName: "On Event",
              contentType: "application/json",
              inputSchema: JSON.stringify({
                type: "object",
                properties: {
                  context: { type: "string", description: "Business context" }
                }
              }, null, 2)
            }
          }
        }
      ]

      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorkflowName,
          description: newWorkflowDescription,
          nodes: initialNodes,
          edges: []
        })
      })

      if (res.ok) {
        const data = await res.json()
        setShowCreateModal(false)
        setNewWorkflowName("")
        setNewWorkflowDescription("")
        fetchWorkflows()
        loadWorkflow(data.id)
      }
    } catch (err) {
      console.error("Failed to create workflow:", err)
    } finally {
      setSaving(false)
    }
  }

  const saveWorkflow = async () => {
    if (!activeWorkflowId) return
    try {
      setSaving(true)
      const cleanNodes = nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        parentId: n.parentId,
        extent: n.extent,
        style: n.style,
        data: {
          label: n.data.label,
          type: n.data.type,
          params: n.data.params,
        }
      }))

      const res = await fetch(`/api/workflows/${activeWorkflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription,
          nodes: cleanNodes,
          edges: edges
        })
      })

      if (res.ok) {
        fetchWorkflows()
        setIsDirty(false)
        setSaveState("saved")
        setTimeout(() => setSaveState("idle"), 2000)
      } else {
        setSaveState("error")
      }
    } catch (err) {
      console.error("Failed to save workflow:", err)
      setSaveState("error")
    } finally {
      setSaving(false)
    }
  }

  const deleteWorkflow = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm("Are you sure you want to delete this workflow?")) return
    try {
      const res = await fetch(`/api/workflows/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        fetchWorkflows()
        if (activeWorkflowId === id) {
          setActiveWorkflowId(null)
        }
      }
    } catch (err) {
      console.error("Failed to delete workflow:", err)
    }
  }

  // Dialog state for workflow inputs
  const [runInputData, setRunInputData] = React.useState<Record<string, string>>({})
  const [expectedInputs, setExpectedInputs] = React.useState<string[]>([])
  const [isAwaitingInputs, setIsAwaitingInputs] = React.useState(false)

  const [selectedNode, setSelectedNode] = React.useState<Node<NodeData> | null>(null)
  const [selectedEdge, setSelectedEdge] = React.useState<Edge | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isRunSheetOpen, setIsRunSheetOpen] = React.useState(false)
  const [maximizedImage, setMaximizedImage] = React.useState<string | null>(null)
  const [upstreamSearch, setUpstreamSearch] = React.useState("")

  // AI Assistant Chat panel states
  const { settings } = useAiSettings()

  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [chatMessages, setChatMessages] = React.useState<{ role: "user" | "assistant"; text: string; thought?: string }[]>([
    { role: "assistant", text: "Hello! Tell me what you'd like to build, e.g., 'Build an AI image sequence' or ask me custom questions!" }
  ])
  const [chatInput, setChatInput] = React.useState("")
  const [isChatStreaming, setIsChatStreaming] = React.useState(false)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, isChatStreaming])

  // Warn before leaving the page with unsaved changes
  React.useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  const onNodeClick = React.useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedEdge(null)
    setSelectedNode(node as Node<NodeData>)
    setIsSheetOpen(true)
  }, [])

  const onEdgeClick = React.useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedNode(null)
    setSelectedEdge(edge)
    setIsSheetOpen(true)
  }, [])

  // Helper: parse a JSON workflow block and render nodes/edges onto the canvas
  const applyWorkflowJsonBlock = React.useCallback((jsonText: string) => {
    const parsed = JSON.parse(jsonText)
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return false

    // Deduplicate nodes and edges by id
    const uniqueNodesMap = new Map<string, any>()
    parsed.nodes.forEach((n: any) => {
      if (n && n.id) {
        uniqueNodesMap.set(n.id, n)
      }
    })
    const uniqueIncomingNodes = Array.from(uniqueNodesMap.values())

    const uniqueEdgesMap = new Map<string, any>()
    parsed.edges.forEach((e: any) => {
      if (e && e.id) {
        uniqueEdgesMap.set(e.id, e)
      }
    })
    const uniqueIncomingEdges = Array.from(uniqueEdgesMap.values())

    const loadedNodes = uniqueIncomingNodes.map((n: { id: string; type: string; position: { x: number; y: number }; data: { label: string; type: NodeType; params: Record<string, string> } }) => {
      let icon = <ZapIcon className="size-4 text-white" />
      let color = "slate"
      if (n.data.type === "delay") {
        icon = <ClockIcon className="size-4 text-white" />
        color = "stone"
      } else if (n.data.type === "image-gen") {
        icon = <ImageIcon className="size-4 text-white" />
        color = "rose"
      } else if (n.data.type === "http-request") {
        icon = <GlobeIcon className="size-4 text-white" />
        color = "sky"
      } else if (n.data.type === "script") {
        icon = <Code2Icon className="size-4 text-white" />
        color = "red"
      } else if (n.data.type === "output") {
        icon = <SquareArrowOutUpRightIcon className="size-4 text-white" />
        color = "emerald"
      } else if (n.data.type === "loop") {
        icon = <RepeatIcon className="size-4 text-white" />
        color = "indigo"
      } else if (n.data.type === "llm") {
        icon = <BrainCircuitIcon className="size-4 text-white" />
        color = "violet"
      } else if (n.data.type === "router") {
        icon = <GitBranchIcon className="size-4 text-white" />
        color = "pink"
      } else if (n.data.type === "classifier") {
        icon = <LayersIcon className="size-4 text-white" />
        color = "amber"
      } else if (n.data.type === "merge") {
        icon = <GitMergeIcon className="size-4 text-white" />
        color = "cyan"
      } else if (n.data.type === "boolean") {
        icon = <ToggleLeftIcon className="size-4 text-white" />
        color = "fuchsia"
      } else if (n.data.type === "transform") {
        icon = <Wand2Icon className="size-4 text-white" />
        color = "lime"
      } else if (n.data.type === "filter") {
        icon = <FilterIcon className="size-4 text-white" />
        color = "orange"
      }
      return {
        ...n,
        data: {
          ...n.data,
          icon,
          color,
          status: "idle" as const
        }
      }
    })

    const loadedEdges = uniqueIncomingEdges.map((e: { id: string; source: string; target: string }) => ({
      ...e,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
      interactionWidth: 20
    }))

    setNodes(loadedNodes)
    setEdges(loadedEdges)
    setIsDirty(true)
    return true
  }, [setNodes, setEdges])

  // Robustly extract individual nodes and edges from a partial, streaming JSON block
  const extractPartialWorkflowElements = React.useCallback((str: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractedNodes: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractedEdges: any[] = []

    // Generic pass: find every balanced JSON object containing an "id" field, then
    // classify it as an edge (has source+target) or a node. This is resilient to any
    // id format the model emits (node-1, trigger-a, generated uuids, ...).
    const idRegex = /{\s*"id"\s*:\s*"[^"]+"/g
    let match
    while ((match = idRegex.exec(str)) !== null) {
      const start = match.index
      let braces = 0
      let end = -1
      let inString = false
      let escape = false
      for (let i = start; i < str.length; i++) {
        const char = str[i]
        if (escape) { escape = false; continue; }
        if (char === '\\') { escape = true; continue; }
        if (char === '"') { inString = !inString; continue; }
        if (!inString) {
          if (char === '{') braces++
          else if (char === '}') {
            braces--
            if (braces === 0) {
              end = i + 1
              break
            }
          }
        }
      }
      if (end !== -1) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const parsed: any = JSON.parse(str.substring(start, end))
          if (parsed && typeof parsed.id === "string") {
            if (parsed.source && parsed.target) {
              extractedEdges.push(parsed)
            } else if (parsed.data || parsed.position || parsed.type) {
              extractedNodes.push(parsed)
            }
          }
        } catch (e) { }
      }
    }

    // Deduplicate extracted nodes and edges by id
    const uniqueNodes: any[] = []
    const seenNodeIds = new Set<string>()
    for (const node of extractedNodes) {
      if (node && node.id && !seenNodeIds.has(node.id)) {
        seenNodeIds.add(node.id)
        uniqueNodes.push(node)
      }
    }

    const uniqueEdges: any[] = []
    const seenEdgeIds = new Set<string>()
    for (const edge of extractedEdges) {
      if (edge && edge.id && !seenEdgeIds.has(edge.id)) {
        seenEdgeIds.add(edge.id)
        uniqueEdges.push(edge)
      }
    }

    return { nodes: uniqueNodes, edges: uniqueEdges }
  }, [])

  const submitChatQuery = async (queryText: string) => {
    if (!queryText.trim() || isChatStreaming) return

    setChatMessages(prev => [...prev, { role: "user", text: queryText }])
    setIsChatStreaming(true)

    let renderedCount = 0

    try {
      const response = await fetch("/api/workflows/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryText,
          provider: settings.activeProvider,
          modelId: settings.models[settings.activeProvider],
          // Send the FULL canvas context (params + edges) so Modify mode can actually
          // preserve everything the user didn't ask to change
          activeNodes: nodes.map(n => ({
            id: n.id,
            type: n.data.type,
            label: n.data.label,
            position: n.position,
            params: n.data.params,
          })),
          activeEdges: edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle ?? undefined,
          }))
        })
      })

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText}`);
      }

      if (!response.body) throw new Error("No response stream available")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let accumulatedText = ""
      let buffer = ""

      setChatMessages(prev => [...prev, { role: "assistant", text: "" }])

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          buffer += decoder.decode(value, { stream: true })

          // Parse SSE format: "data: {json}\n\n"
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6))
                if (parsed.thought) {
                  setChatMessages(prev => {
                    const updated = [...prev]
                    const lastMsg = updated[updated.length - 1]
                    updated[updated.length - 1] = {
                      ...lastMsg,
                      thought: (lastMsg.thought || "") + parsed.thought
                    }
                    return updated
                  })
                }
                if (parsed.text) {
                  accumulatedText += parsed.text

                  setChatMessages(prev => {
                    const updated = [...prev]
                    const lastMsg = updated[updated.length - 1]
                    updated[updated.length - 1] = { ...lastMsg, role: "assistant", text: accumulatedText }
                    return updated
                  })

                  // PROGRESSIVE RENDERING: Extract complete node objects from the stream
                  const partialData = extractPartialWorkflowElements(accumulatedText)
                  if (partialData.nodes.length > renderedCount) {
                    renderedCount = partialData.nodes.length
                    try {
                      applyWorkflowJsonBlock(JSON.stringify(partialData))
                    } catch {
                      // Node data incomplete - will retry on next chunk
                    }
                  }
                }
              } catch {
                // Partial JSON in SSE line - ignore
              }
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.startsWith("data: ")) {
        try {
          const parsed = JSON.parse(buffer.slice(6))
          if (parsed.text) {
            accumulatedText += parsed.text
            setChatMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: "assistant", text: accumulatedText }
              return updated
            })
          }
        } catch {
          // Ignore
        }
      }

      // Final pass: apply the complete workflow
      const finalPartialData = extractPartialWorkflowElements(accumulatedText)
      if (finalPartialData.nodes.length > 0) {
        try {
          applyWorkflowJsonBlock(JSON.stringify(finalPartialData))
          setLogs(prev => [...prev, { message: `[AI Assistant] Rendered complete generated workflow.` }])
        } catch (err) {
          console.error("Failed to parse final workflow:", err)
        }
      }

      setIsChatStreaming(false)
    } catch (err: unknown) {
      console.error(err)
      setIsChatStreaming(false)
      const errMsg = err instanceof Error ? err.message : "Error calling AI Route."
      setChatMessages(prev => [...prev, {
        role: "assistant",
        text: `Error calling AI Route: ${errMsg}. Please make sure the service is up and running.`
      }])
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatStreaming) return
    const text = chatInput
    setChatInput("")
    await submitChatQuery(text)
  }

  const updateNodeData = (updatedFields: Partial<NodeData>) => {
    if (!selectedNode) return
    setIsDirty(true)
    setNodes(prev => prev.map(n => {
      if (n.id === selectedNode.id) {
        const updatedNode = {
          ...n,
          data: {
            ...n.data,
            ...updatedFields,
            params: {
              ...n.data.params,
              ...(updatedFields.params || {})
            }
          }
        }
        setSelectedNode(updatedNode)
        return updatedNode
      }
      return n
    }))
  }

  const groupSelectedNodes = React.useCallback(() => {
    const selected = nodes.filter(n => n.selected && n.type !== "group" && n.data.type !== "group" && !n.parentId)
    if (selected.length < 1) return
    setIsDirty(true)

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    selected.forEach(n => {
      if (n.position.x < minX) minX = n.position.x
      if (n.position.y < minY) minY = n.position.y

      // Node width/height might not be available, fallbacks to typical block size
      const width = n.width || 240
      const height = n.height || 100
      if (n.position.x + width > maxX) maxX = n.position.x + width
      if (n.position.y + height > maxY) maxY = n.position.y + height
    })

    // Padding for group node
    const padding = 40
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    const groupId = generateNodeId("group")

    const newGroupNode: Node<NodeData> = {
      id: groupId,
      type: "group",
      position: { x: minX, y: minY },
      style: { width: maxX - minX, height: maxY - minY },
      data: {
        label: "New Group",
        type: "group",
        icon: <LayersIcon className="size-4 text-white" />,
        color: "indigo",
        status: "idle",
        params: {}
      }
    }

    setNodes(prev => {
      const updatedNodes = prev.map(n => {
        if (n.selected && n.type !== "group" && n.data.type !== "group" && !n.parentId) {
          return {
            ...n,
            parentId: groupId,
            // Relative position to parent
            position: { x: n.position.x - minX, y: n.position.y - minY },
            selected: false
          }
        }
        return n
      })

      return [...updatedNodes, newGroupNode]
    })

    setLogs(prev => [...prev, { message: `[System] Grouped ${selected.length} nodes.` }])
  }, [nodes, setNodes])

  const ungroupSelectedNodes = React.useCallback(() => {
    const selectedGroups = nodes.filter(n => n.selected && (n.type === "group" || n.data.type === "group"))

    if (selectedGroups.length === 0) return
    setIsDirty(true)

    setNodes(prev => {
      let nextNodes = [...prev]
      selectedGroups.forEach(group => {
        // Move children out
        nextNodes = nextNodes.map(n => {
          if (n.parentId === group.id) {
            return {
              ...n,
              parentId: undefined,
              // Convert relative position to absolute
              position: {
                x: n.position.x + group.position.x,
                y: n.position.y + group.position.y
              }
            }
          }
          return n
        })
        // Remove group
        nextNodes = nextNodes.filter(n => n.id !== group.id)
      })
      return nextNodes
    })

    setLogs(prev => [...prev, { message: `[System] Ungrouped ${selectedGroups.length} groups.` }])
  }, [nodes, setNodes])

  const deleteSelectedElement = () => {
    setIsDirty(true)
    if (selectedNode) {
      setNodes(prev => prev.filter(n => n.id !== selectedNode.id))
      setEdges(prev => prev.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id))
      setLogs(prev => [...prev, { message: `[System] Deleted node: ${selectedNode.data.label}` }])
    } else if (selectedEdge) {
      setEdges(prev => prev.filter(e => e.id !== selectedEdge.id))
      setLogs(prev => [...prev, { message: `[System] Deleted connection: ${selectedEdge.id}` }])
    }
    setIsSheetOpen(false)
    setSelectedNode(null)
    setSelectedEdge(null)
  }

  // Default load disabled on initial render. ReactFlow is populated by loadWorkflow inside dashboard/workflows list.

  const onConnect = React.useCallback(
    (params: Connection | Edge) => {
      setIsDirty(true)
      setEdges((eds) => addEdge({
        ...params,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2 },
        interactionWidth: 20
      }, eds))
    },
    [setEdges]
  )

  const onEdgeUpdate = React.useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setIsDirty(true)
      setEdges((els) => updateEdge(oldEdge, newConnection, els))
    },
    [setEdges]
  )

  // Wrap React Flow change handlers to track unsaved changes (ignoring pure selection/highlight changes)
  const handleNodesChange = React.useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      if (changes.some(c => c.type !== "select" && c.type !== "dimensions")) setIsDirty(true)
      onNodesChange(changes)
    },
    [onNodesChange]
  )

  const handleEdgesChange = React.useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      if (changes.some(c => c.type !== "select")) setIsDirty(true)
      onEdgesChange(changes)
    },
    [onEdgesChange]
  )

  // Direct addition of nodes from clicking the Toolbox / quick panels
  const addBlockNode = (block: AvailableTile) => {
    const newId = generateNodeId(block.type === "group" ? "group" : "node")
    setIsDirty(true)

    // Position slightly offset from the last node
    const lastNode = nodes[nodes.length - 1]
    const xPos = lastNode ? lastNode.position.x + 320 : 100
    const yPos = lastNode ? lastNode.position.y : 150

    const newNode: Node<NodeData> = {
      id: newId,
      type: block.type === "group" ? "group" : "custom",
      position: { x: xPos, y: yPos },
      style: block.type === "group" ? { width: 400, height: 300 } : undefined,
      data: {
        label: block.name,
        type: block.type,
        icon: block.icon,
        color: block.color,
        status: "idle",
        params: { ...block.defaultParams }
      }
    }

    setNodes(prev => [...prev, newNode])

    if (lastNode && lastNode.data.type !== "output" && lastNode.type !== "group" && lastNode.data.type !== "group") {
      const newEdge: Edge = {
        id: `edge-${lastNode.id}-${newId}`,
        source: lastNode.id,
        target: newId,
        markerEnd: { type: MarkerType.ArrowClosed, color: "var(--border)" },
        style: { strokeWidth: 2, stroke: "var(--border)" }
      }
      setEdges(prev => [...prev, newEdge])
    }

    setLogs(prev => [...prev, { message: `[System] Added block: ${block.name}` }])
  }

  // Interpret natural language inside the AI Omni Box in real time
  const handleAiCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!omniInput.trim() || isChatStreaming) return

    const text = omniInput
    setOmniInput("")

    // Check for local instant commands first
    const lowercaseText = text.toLowerCase()
    if (lowercaseText.includes("clear") || lowercaseText.includes("reset")) {
      setNodes([])
      setEdges([])
      setSelectedNode(null)
      setSelectedEdge(null)
      setIsSheetOpen(false)
      setLogs(prev => [...prev, { message: `[AI Omni-Box] Real-time: Cleared canvas.` }])
      return
    }

    // Trigger full chat inference via AI router
    await submitChatQuery(text)
  }

  // ─── Execution context refs (mutable across async steps) ──────────
  const currentNodesRef = React.useRef(nodes)
  const currentEdgesRef = React.useRef(edges)
  const isExecutingRef = React.useRef(false)
  React.useEffect(() => { currentNodesRef.current = nodes }, [nodes])
  React.useEffect(() => { currentEdgesRef.current = edges }, [edges])

  // Intercept the run click to open sheet and show the input form if needed
  const handleRunClick = () => {
    setIsRunSheetOpen(true)
    setIsSheetOpen(false) // Close config sheet if open
    setLogs([]) // Clear previous logs

    const allNodes = currentNodesRef.current
    const triggerNode = allNodes.find(n => n.data.type === "trigger")

    let needsInput = false
    let keys: string[] = []

    if (triggerNode) {
      // Check if schema requires inputs
      if (triggerNode.data.params.inputSchema && triggerNode.data.params.inputSchema !== "{}") {
        try {
          const schema = JSON.parse(triggerNode.data.params.inputSchema)
          if (schema.properties) {
            keys = Object.keys(schema.properties)
            if (keys.length > 0) needsInput = true
          }
        } catch { /* ignore bad json */ }
      }

      // Also require input if it's a file upload type, to give them a chance to provide a file or mock it
      if (triggerNode.data.params.contentType === "multipart/form-data" || triggerNode.data.params.contentType === "image/png") {
        let hasCustomFiles = false
        try {
          if (triggerNode.data.params.sampleFiles) {
            const customFiles = JSON.parse(triggerNode.data.params.sampleFiles)
            if (Array.isArray(customFiles) && customFiles.length > 0) {
              customFiles.forEach((f: any) => {
                if (f.key) {
                  keys.push(`_fileKey:${f.key}`)
                  hasCustomFiles = true
                }
              })
            }
          }
        } catch { }

        if (!hasCustomFiles) {
          if (!keys.includes("_file_")) keys.push("_file_")
        }
        needsInput = true
      }
    }

    if (needsInput) {
      setExpectedInputs(keys)
      const initialData: Record<string, string> = {}
      keys.forEach(k => {
        initialData[k] = runInputData[k] !== undefined ? runInputData[k] : ""
      })
      // Pre-fill file if sampleFile exists on the node and no file is loaded yet
      if (keys.includes("_file_") && !runInputData["_file_"] && triggerNode?.data.params.sampleFile) {
        initialData["_file_"] = triggerNode.data.params.sampleFile
      }

      // Pre-fill custom distinct files from sampleFiles if they exist
      try {
        if (triggerNode?.data.params.sampleFiles) {
          const customFiles = JSON.parse(triggerNode.data.params.sampleFiles)
          if (Array.isArray(customFiles)) {
            customFiles.forEach((f: any) => {
              const runKey = `_fileKey:${f.key}`
              if (keys.includes(runKey)) {
                initialData[runKey] = runInputData[runKey] || f.content || ""
                initialData[`_fileNameKey:${f.key}`] = runInputData[`_fileNameKey:${f.key}`] || f.name || ""
              }
            })
          }
        }
      } catch { }

      setRunInputData(initialData)
      setIsAwaitingInputs(true)
      return
    }

    // No inputs needed, run directly
    setIsAwaitingInputs(false)
    simulateExecution()
  }

  // Simulate workflow execution with full data binding
  const simulateExecution = async (customInputs?: Record<string, string>) => {
    // Guard against double execution (e.g. rapid double-click on Run button)
    if (isExecutingRef.current) return
    isExecutingRef.current = true

    // Capture the native fetch BEFORE any Chrome extension can override window.fetch.
    // This prevents "Failed to fetch" errors caused by the Quickz extension patching
    // window.fetch — relative URLs like "/api/workflows/proxy" fail in the extension context.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nativeFetch: typeof fetch = ((globalThis as any).__nativeFetch ?? fetch).bind(globalThis)
    const proxyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/workflows/proxy`

    setIsAwaitingInputs(false)
    const allNodes = currentNodesRef.current
    const allEdges = currentEdgesRef.current
    if (allNodes.length === 0) {
      setIsExecuting(false)
      isExecutingRef.current = false
      return
    }
    setIsExecuting(true)
    setLogs([{ id: Math.random().toString(), message: `[Executor] Initializing execution run (topological order)...` }])

    // Set all nodes to idle
    setNodes(prev => prev.map(n => ({
      ...n,
      data: { ...n.data, status: "idle" as const }
    })))

    try {
      // Topological sort for correct data-flow order
      const sortedNodes = topologicalSort(allNodes, allEdges)

      // ─── Node Output Registry ──────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodeOutputs: Record<string, any> = {}

      // Track which nodes we've already processed (to skip loop-internal nodes in main pass)
      const processedNodeIds = new Set<string>()
      const activeEdgeIds = new Set<string>()
      const loopInternalNodeIds = new Set<string>()

      let step = 0
      let runFailed = false

      for (const node of sortedNodes) {
        // Skip group nodes from execution pass as they are visual containers
        if (node.data.type === "group" || node.type === "group") continue

        // Skip nodes already processed inside a loop sub-execution or identified as loop internal
        if (processedNodeIds.has(node.id) || loopInternalNodeIds.has(node.id)) continue

        // Path Activation Logic:
        // A node is executed ONLY if it's an entry point (no incoming edges) OR has at least one active incoming path.
        const hasIncoming = allEdges.some(e => e.target === node.id)
        const hasActiveIncoming = allEdges.filter(e => e.target === node.id).some(e => activeEdgeIds.has(e.id))

        if (hasIncoming && !hasActiveIncoming) {
          // Bypassed/Skipped because no active route leads here
          setLogs(prev => [
            ...prev,
            {
              nodeId: node.id,
              label: node.data.label,
              type: node.data.type,
              message: `[Bypassed] Node not executed (inactive route path)`
            }
          ])
          continue
        }

        step++

        // Resolve {{placeholders}} in params using the current registry
        const resolvedParams = resolveParams(node.data.params, nodeOutputs, undefined, node.id, allEdges)

        // Surface unresolved placeholders  skip params that are resolved via resolveRawTemplate separately
        // (e.g. loop arrayPath is always resolved via resolveRawTemplate, not resolveParams)
        const rawOnlyParams = node.data.type === "loop" ? new Set(["arrayPath"]) : new Set<string>()
        const unresolvedKeys = Object.entries(resolvedParams)
          .filter(([k, v]) => !rawOnlyParams.has(k) && typeof v === "string" && /\{\{[^{}]*\}\}/.test(v))
          .map(([k]) => k)
        if (unresolvedKeys.length > 0) {
          // Emit as a system-level warning (no nodeId/label/type) so it doesn't create a duplicate node row
          setLogs(prev => [...prev, {
            message: `⚠️ [${node.data.label}] Unresolved placeholder(s) in: ${unresolvedKeys.join(", ")}  check upstream connections & variable names.`,
            status: "error" as const
          }])
        }

        // running status
        setNodes(prev => prev.map(n => n.id === node.id ? {
          ...n,
          data: { ...n.data, status: "running" as const }
        } : n))

        const logId = Math.random().toString(36).substring(7)
        setLogs(prev => [
          ...prev,
          {
            id: logId,
            nodeId: node.id,
            label: node.data.label,
            type: node.data.type,
            status: "running",
            message: `[Step ${step}] Executing...${hasPlaceholders(node.data.params) ? " (resolved {{placeholders}})" : ""}`
          }
        ])

        // When a filter node's condition fails, it blocks downstream propagation
        let blockDownstream = false

        // Helper to update the correct log entry with success and data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const markNodeSuccess = (data: any, extraMsg?: string) => {
          setLogs(prev => prev.map(log => log.id === logId ? {
            ...log,
            status: "success",
            message: extraMsg ? `${log.message}\n${extraMsg}` : log.message,
            data
          } : log))
        }

        try {
          // ── Execute & store mock output per node type ────────────────
          if (node.data.type === "trigger" || node.data.type) {
            // ── Execute using SOLID Modular Executor Registry ────────────────
            const executor = getExecutor(node.data.type || "");
            if (executor && executor.execute) {
              const ctx: ExecutionContext = {
                nodeOutputs,
                allNodes,
                allEdges,
                resolvedParams,
                nativeFetch,
                proxyUrl,
                setNodes,
                setLogs,
                showToast,
                processedNodeIds,
                loopInternalNodeIds,
                activeEdgeIds,
                customInputs,
                runInputData,
              };
              const result = await executor.execute(node, ctx);
              if (result !== undefined) {
                nodeOutputs[node.id] = result;
                if (result && typeof result === "object") {
                  if ((result as Record<string, unknown>).__blockDownstream) {
                    blockDownstream = true;
                  }
                  if ((result as Record<string, unknown>).error) {
                    runFailed = true;
                    break;
                  }
                }
                markNodeSuccess(result);
              }
            } else {
              // Default fallback for unrecognized node types
              nodeOutputs[node.id] = { processed: true };
              markNodeSuccess(nodeOutputs[node.id]);
            }
          }

          // Apply user-defined output mapping to reshape the node's output before it flows downstream
          if (nodeOutputs[node.id] && resolvedParams.outputMapping && resolvedParams.outputMapping !== "[]") {
            nodeOutputs[node.id] = applyOutputMapping(nodeOutputs[node.id], resolvedParams.outputMapping, nodeOutputs)
          }

          // If execution was successful and not a router/classifier brancher (and a filter didn't
          // block propagation), activate ALL outgoing edges from this node
          if (node.data.type !== "router" && node.data.type !== "classifier" && !blockDownstream) {
            allEdges.filter(e => e.source === node.id).forEach(e => activeEdgeIds.add(e.id))
          }

          const parsedDelay = parseInt(resolvedParams.ms || "2000")
          const delayMs = node.data.type === "delay" ? (isNaN(parsedDelay) ? 2000 : parsedDelay) : 1500
          await new Promise(resolve => setTimeout(resolve, delayMs))

          // success status
          processedNodeIds.add(node.id)
          setNodes(prev => prev.map(n => n.id === node.id ? {
            ...n,
            data: { ...n.data, status: "success" as const }
          } : n))
        } catch (nodeErr: unknown) {
          const errMsg = nodeErr instanceof Error ? nodeErr.message : String(nodeErr)
          showToast(`Node Error (${node.data.label})`, errMsg, "error")
          setNodes(prev => prev.map(n => n.id === node.id ? {
            ...n,
            data: { ...n.data, status: "error" as const }
          } : n))
          setLogs(prev => prev.map(log => log.id === logId ? {
            ...log,
            status: "error",
            message: `${log.message}\n⚠️ Error: ${errMsg}`,
            data: { error: errMsg }
          } : log))
          runFailed = true
          break // Stop executing the rest of the workflow on error!
        }
      }

      if (runFailed) {
        setLogs(prev => [...prev, { message: `[Executor] Execution stopped due to a node failure. See the error step above.`, status: "error" }])
      } else {
        setLogs(prev => [...prev, { message: `[Executor] All steps executed cleanly. 🎉` }])
      }
    } catch (err) {
      console.error(err)
      setLogs(prev => [...prev, { message: `[Executor] Workflow failed with internal error: ${err instanceof Error ? err.message : String(err)}`, status: "error" }])
    } finally {
      isExecutingRef.current = false
      setIsExecuting(false)
    }
  }

  return (
    <WorkflowNodesContext.Provider value={nodes}>
      <SidebarProvider>
        <AppSidebar
          user={{
            name: session.user.name || "User",
            email: session.user.email || "",
            avatar: session.user.image || ""
          }}
        />
        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          {activeWorkflowId === null ? (
            <div className="flex flex-col flex-1 overflow-y-auto p-8 bg-muted/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 mb-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <WorkflowIcon className="size-6 text-primary" />
                    Workflows Builder
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create, configure, and automate complex workflows with AI and custom actions.
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="font-semibold gap-1.5 h-11 px-5 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  + Create New Workflow
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="relative max-w-md mb-6">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workflows..."
                  className="pl-10 h-10 text-sm focus-visible:ring-1"
                />
              </div>

              {/* List / Grid of workflows */}
              {loadingWorkflows ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3 text-muted-foreground">
                  <SparkleIcon className="size-8 animate-spin text-primary" />
                  <p className="text-sm">Loading workflows from database...</p>
                </div>
              ) : workflows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-lg bg-card text-center p-8 gap-4">
                  <div className="p-4 bg-muted rounded-full">
                    <WorkflowIcon className="size-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">No workflows found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      {"You haven't created any workflows yet. Click the button below to build your first automation."}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="font-semibold gap-1.5 h-10 px-4 text-sm"
                  >
                    + Create First Workflow
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workflows
                    .filter(wf =>
                      wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (wf.description || "").toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(wf => (
                      <Card key={wf.id} className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-card flex flex-col" onClick={() => loadWorkflow(wf.id)}>
                        <CardContent className="p-5 flex flex-col flex-1 h-full min-h-[160px] justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-base text-foreground truncate">{wf.name}</h3>
                              <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                                {new Date(wf.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                              {wf.description || "No description provided."}
                            </p>
                          </div>
                          <div className="flex items-center justify-between border-t pt-4 mt-4 gap-2">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {wf.nodes ? (Array.isArray(wf.nodes) ? wf.nodes.length : 1) : 1} nodes
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  loadWorkflow(wf.id)
                                }}
                                className="text-xs h-8 px-3 font-semibold"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => deleteWorkflow(wf.id, e)}
                                className="text-xs h-8 px-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2Icon className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}

              {/* Custom Create Modal Dialog */}
              {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                  <form
                    onSubmit={createWorkflow}
                    className="bg-card border shadow-xl rounded-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200"
                    onClick={e => e.stopPropagation()}
                  >
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Create New Workflow</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter a name and description to create your automated workflow canvas.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workflow Name</Label>
                        <Input
                          value={newWorkflowName}
                          onChange={(e) => setNewWorkflowName(e.target.value)}
                          placeholder="e.g. Lead Qualification Engine"
                          required
                          className="text-sm h-10 rounded-md"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</Label>
                        <Textarea
                          value={newWorkflowDescription}
                          onChange={(e) => setNewWorkflowDescription(e.target.value)}
                          placeholder="e.g. Analyzes prospect profiles and creates tailored vector backgrounds."
                          className="text-sm min-h-[80px] rounded-md resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end border-t pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateModal(false)}
                        className="text-xs h-9 rounded-md"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving || !newWorkflowName.trim()}
                        className="text-xs h-9 rounded-md font-bold"
                      >
                        {saving ? "Creating..." : "Create Workflow"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          ) : (
            <>
              <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (isDirty && !window.confirm("You have unsaved changes. Leave without saving?")) return
                      setActiveWorkflowId(null)
                    }}
                    className="gap-1 px-2.5 h-9 text-xs"
                  >
                    <ArrowLeftIcon className="size-4" />
                    Workflows
                  </Button>
                  <Separator orientation="vertical" className="mx-1 h-4" />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Input
                      value={workflowName}
                      onChange={(e) => { setWorkflowName(e.target.value); setIsDirty(true) }}
                      className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-bold px-0 h-9 font-sans w-full max-w-[240px] truncate"
                    />
                    {workflowDescription && (
                      <span className="hidden md:inline text-xs text-muted-foreground truncate opacity-70">
                        {workflowDescription}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentWorkflowJson = JSON.stringify({
                        nodes: nodes.map(n => ({
                          id: n.id,
                          type: n.type,
                          position: n.position,
                          parentId: n.parentId,
                          extent: n.extent,
                          style: n.style,
                          data: {
                            label: n.data.label,
                            type: n.data.type,
                            params: n.data.params,
                          }
                        })),
                        edges: edges
                      }, null, 2);
                      setWorkflowJsonText(currentWorkflowJson);
                      setJsonImportError(null);
                      setShowJsonModal(true);
                    }}
                    className="text-xs rounded-none font-semibold px-4 h-9 flex gap-1.5 items-center"
                  >
                    <BracesIcon className="size-3.5" />
                    Code / JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={saveWorkflow}
                    disabled={saving}
                    className="text-xs rounded-none font-semibold px-4 h-9"
                  >
                    {saving ? "Saving..." : saveState === "saved" ? "Saved ✓" : saveState === "error" ? "Save failed  retry" : isDirty ? "Save Workflow •" : "Save Workflow"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleRunClick}
                    disabled={isRunning || nodes.length === 0}
                    className="text-xs rounded-none gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 h-9"
                  >
                    <PlayCircleIcon className="size-4" />
                    {isRunning ? "Running..." : "Run Workflow"}
                  </Button>
                  <ThemeToggle />
                </div>
              </header>

              {/* Full Viewport Canvas */}
              <div className="relative w-full h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] flex overflow-hidden bg-muted/5 select-none shrink-0">
                {/* Canvas Embedded Left Sidebar */}
                <div className="w-[300px] border-r bg-card flex flex-col h-full min-h-0 max-h-full overflow-hidden z-10 shrink-0">
                  <div className="p-4 border-b shrink-0">
                    <h3 className="text-sm font-bold text-foreground">Quick Tiles Toolbox</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Click any block tile to place on the canvas</p>
                  </div>

                  <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2">
                    {AVAILABLE_TILES.map((tile) => {
                      const colorMap: Record<string, string> = {
                        slate: "bg-slate-700", stone: "bg-stone-700", teal: "bg-teal-700",
                        rose: "bg-rose-700", sky: "bg-sky-700", red: "bg-red-700", amber: "bg-amber-700",
                        emerald: "bg-emerald-700", indigo: "bg-indigo-700", purple: "bg-purple-700",
                        violet: "bg-violet-700", pink: "bg-pink-700", cyan: "bg-cyan-700",
                        fuchsia: "bg-fuchsia-700", lime: "bg-lime-700", orange: "bg-orange-700"
                      }
                      return (
                        <button
                          key={tile.name}
                          onClick={() => addBlockNode(tile)}
                          className="w-full flex items-start gap-3 p-2.5 border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group rounded-md"
                        >
                          <div className={`shrink-0 p-2 rounded-md shadow-sm ${colorMap[tile.color]}`}>
                            {tile.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-xs text-foreground block leading-tight group-hover:text-primary transition-colors">{tile.name}</span>
                            <span className="text-[10px] text-muted-foreground leading-snug block mt-0.5">{tile.description}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="p-4 border-t bg-muted/10 space-y-3 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNodes([])
                        setEdges([])
                        setLogs([])
                        setSelectedNode(null)
                        setSelectedEdge(null)
                        setIsSheetOpen(false)
                        setIsRunSheetOpen(false)
                      }}
                      className="w-full text-xs rounded-none h-9"
                    >
                      Clear All Canvas
                    </Button>
                  </div>
                </div>

                {/* React Flow Workspace */}
                <ContextMenu>
                  <ContextMenuTrigger className="flex-1 h-full relative flex flex-col min-h-0 overflow-hidden">
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={handleNodesChange}
                      onEdgesChange={handleEdgesChange}
                      onConnect={onConnect}
                      onEdgeUpdate={onEdgeUpdate}
                      onNodeClick={onNodeClick}
                      onEdgeClick={onEdgeClick}
                      nodeTypes={nodeTypes}
                      fitView
                    >
                      <Background color="currentColor" className="text-foreground/15 dark:text-foreground/20" gap={20} size={1.5} />
                      <Controls className="!border-border bg-card text-foreground rounded-none shadow-sm" />
                      <MiniMap
                        nodeColor={(node) => {
                          const type = node.data?.type as NodeType
                          if (type === "trigger") return "#475569"
                          if (type === "delay") return "#57534e"
                          if (type === "image-gen") return "#be123c"
                          if (type === "http-request") return "#0369a1"
                          if (type === "script") return "#b91c1c"
                          if (type === "output") return "#047857"
                          if (type === "loop") return "#4338ca"
                          if (type === "llm") return "#6d28d9"
                          if (type === "router") return "#be185d"
                          if (type === "classifier") return "#d97706"
                          if (type === "merge") return "#0e7490"
                          if (type === "boolean") return "#a21caf"
                          if (type === "transform") return "#4d7c0f"
                          if (type === "filter") return "#c2410c"
                          return "#475569"
                        }}
                        className="!bg-card !border-border rounded-none"
                      />
                    </ReactFlow>

                    <ContextMenuContent className="w-48 bg-card border-border shadow-xl">
                      <ContextMenuItem
                        onClick={groupSelectedNodes}
                        disabled={nodes.filter(n => n.selected && n.type !== "group" && !n.parentId).length === 0}
                        className="cursor-pointer font-medium"
                      >
                        <LayersIcon className="mr-2 size-4" />
                        Group Selected
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={ungroupSelectedNodes}
                        disabled={nodes.filter(n => n.selected && (n.type === "group" || n.data.type === "group")).length === 0}
                        className="cursor-pointer font-medium"
                      >
                        <Trash2Icon className="mr-2 size-4 text-destructive" />
                        Ungroup Selected
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => {
                          setNodes([])
                          setEdges([])
                        }}
                        className="cursor-pointer font-medium text-destructive"
                      >
                        <Trash2Icon className="mr-2 size-4" />
                        Clear Canvas
                      </ContextMenuItem>
                    </ContextMenuContent>

                    {/* Premium Bottom Center AI Omni Box (Centered in Canvas) */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-xl px-4">
                      <div className="bg-card/95 border border-primary/20 shadow-xl backdrop-blur-md rounded-none overflow-hidden flex flex-col transition-all">

                        {/* Expandable chat thread within the omni box itself when sidebar chat is closed */}
                        {!isChatOpen && chatMessages.length > 1 && (
                          <div className="max-h-[300px] overflow-y-auto p-4 border-b border-border space-y-3 flex flex-col min-h-[100px] scrollbar-thin">
                            {chatMessages.map((msg, idx) => (
                              <div
                                key={idx}
                                className={`flex items-start gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                  }`}
                              >
                                {/* Author Icons */}
                                <div className="shrink-0">
                                  {msg.role === 'user' ? (
                                    session?.user?.image ? (
                                      <img src={session.user.image} alt="User" className="size-6 rounded-full" />
                                    ) : (
                                      <div className="size-6 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                                        U
                                      </div>
                                    )
                                  ) : (
                                    <div className="size-6 bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/20 rounded-full">
                                      <SparkleIcon className="size-3.5 animate-pulse" />
                                    </div>
                                  )}
                                </div>

                                {/* Text Thread Content */}
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                                    {msg.role === 'user' ? 'You' : 'AI'}
                                  </span>
                                  <div className={`p-2.5 text-xs leading-relaxed rounded-none select-text ${msg.role === 'user'
                                      ? 'bg-primary text-primary-foreground font-semibold'
                                      : 'bg-muted border border-border text-foreground font-medium whitespace-pre-wrap'
                                    }`}>
                                    {msg.thought && <ThoughtBlock thought={msg.thought} />}
                                    {msg.text || (
                                      <span className="inline-flex gap-1.5 items-center font-bold text-primary/70 animate-pulse">
                                        <SparkleIcon className="size-3 animate-spin text-primary" />
                                        Analyzing flow...
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {isChatStreaming && chatMessages[chatMessages.length - 1]?.text && (
                              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] pl-8">
                                <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                <span className="ml-1 font-medium italic">Streaming response...</span>
                              </div>
                            )}
                            <div ref={chatEndRef} />
                          </div>
                        )}

                        <form onSubmit={handleAiCommand} className="flex gap-2 p-1.5 items-center">
                          <div className="flex-1 flex items-center gap-2.5 px-3">
                            <SparkleIcon className={`size-4.5 text-primary shrink-0 ${isChatStreaming ? 'animate-spin' : 'animate-pulse'}`} />
                            <Input
                              value={omniInput}
                              onChange={(e) => setOmniInput(e.target.value)}
                              placeholder="Type a message or build request..."
                              disabled={isChatStreaming || isRunning}
                              className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs px-0 h-9 font-medium text-foreground bg-transparent w-full placeholder:text-muted-foreground/60"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              type="submit"
                              disabled={isChatStreaming || isRunning || !omniInput.trim()}
                              className="h-9 px-4 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-none gap-1"
                            >
                              {isChatStreaming ? "Streaming..." : "Send"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsChatOpen(true)
                              }}
                              title="Maximize AI Chat"
                              className="h-9 w-9 p-0 rounded-none flex items-center justify-center hover:border-primary/50 text-muted-foreground hover:text-foreground"
                            >
                              <Maximize2Icon className="size-4" />
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                </ContextMenu>

                {/* Run Output Sheet (Right Sidebar) */}
                {isRunSheetOpen && (
                  <div className="w-[400px] border-l bg-card flex flex-col h-full min-h-0 max-h-full overflow-hidden z-10 shrink-0">
                    <div className="p-6 border-b shrink-0 flex justify-between items-center bg-card z-20">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Execution Run</h3>
                        <p className="text-xs text-muted-foreground">Live progress and node outputs</p>
                      </div>
                      <Button variant="ghost" size="icon" title="Close panel" onClick={() => setIsRunSheetOpen(false)}>
                        <XIcon className="size-4 text-muted-foreground" />
                      </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {isAwaitingInputs ? (
                        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <ZapIcon className="size-4 text-primary" />
                              <h4 className="text-sm font-bold text-primary">Trigger Input Required</h4>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              This workflow requires initial data to start. Please provide the expected payload variables below.
                            </p>
                          </div>

                          <div className="space-y-4 border border-border p-5 rounded-lg bg-card shadow-sm">
                            {expectedInputs.map(key => {
                              if (key.startsWith("_fileKey:")) {
                                const fileKey = key.substring(9)
                                return (
                                  <div key={key} className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground uppercase tracking-wider">File Upload: {fileKey}</Label>
                                    <Input
                                      type="file"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                          const reader = new FileReader()
                                          reader.onload = () => {
                                            setRunInputData(prev => ({
                                              ...prev,
                                              [key]: reader.result as string,
                                              [`_fileNameKey:${fileKey}`]: file.name
                                            }))
                                          }
                                          reader.readAsDataURL(file)
                                        }
                                      }}
                                      className="text-xs h-10 rounded-md cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                    />
                                    {runInputData[key] && (
                                      <p className="text-[10px] text-emerald-500 font-mono truncate mt-1">
                                        ✓ loaded: {runInputData[`_fileNameKey:${fileKey}`] || "custom-file"} ({Math.round(runInputData[key].length / 1024)} KB)
                                      </p>
                                    )}
                                  </div>
                                )
                              }
                              if (key === "_file_") {
                                return (
                                  <div key={key} className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground uppercase tracking-wider">File Upload</Label>
                                    <Input
                                      type="file"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                          const reader = new FileReader()
                                          reader.onload = () => setRunInputData(prev => ({ ...prev, [key]: reader.result as string }))
                                          reader.readAsDataURL(file)
                                        }
                                      }}
                                      className="text-xs h-10 rounded-md cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                    />
                                    {runInputData[key] && <p className="text-[10px] text-emerald-500 font-mono truncate mt-1">File loaded ({Math.round(runInputData[key].length / 1024)} KB)</p>}
                                  </div>
                                )
                              }
                              return (
                                <div key={key} className="space-y-1.5">
                                  <Label className="text-xs font-bold text-foreground uppercase tracking-wider">{key}</Label>
                                  <Input
                                    value={runInputData[key] || ""}
                                    onChange={(e) => setRunInputData(prev => ({ ...prev, [key]: e.target.value }))}
                                    className="text-sm h-10 rounded-md font-mono"
                                    placeholder={`Enter ${key}...`}
                                  />
                                </div>
                              )
                            })}
                            <Button
                              onClick={() => simulateExecution(runInputData)}
                              className="w-full mt-2 gap-2 h-10 font-bold"
                            >
                              <PlayCircleIcon className="size-4" />
                              Start Execution
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center gap-3 text-muted-foreground">
                              <SparklesIcon className="size-6 animate-pulse opacity-50" />
                              <p className="text-sm italic">Waiting for execution to start...</p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {logs.map((log, i) => {
                                const logKey = log.id || i;
                                const isCollapsed = collapsedLogs[logKey] !== undefined
                                  ? collapsedLogs[logKey]
                                  : (log.status === "success");

                                return (
                                  <div key={i} className="flex flex-col gap-2 relative">
                                    {/* Visual connector line between steps */}
                                    {i !== logs.length - 1 && (
                                      <div className="absolute left-2.5 top-6 bottom-[-24px] w-0.5 bg-border/50" />
                                    )}

                                    <div
                                      className="flex items-center gap-3 relative z-10 cursor-pointer select-none group/log"
                                      onClick={() => {
                                        setCollapsedLogs(prev => ({
                                          ...prev,
                                          [logKey]: !isCollapsed
                                        }))
                                      }}
                                    >
                                      <div className="shrink-0 size-5 flex items-center justify-center bg-card">
                                        {log.status === "running" && <SparklesIcon className="size-4 text-amber-500 animate-pulse" />}
                                        {log.status === "success" && <div className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />}
                                        {log.status === "error" && <div className="size-2 rounded-full bg-red-500 ring-4 ring-red-500/20" />}
                                        {!log.status && <div className="size-1.5 rounded-full bg-primary" />}
                                      </div>
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className={`text-sm font-bold truncate ${log.status === 'error' ? 'text-red-500' : 'text-foreground'} group-hover/log:text-primary transition-colors`}>
                                          {log.label || "System"}
                                        </span>
                                        {log.type && (
                                          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono px-1.5 py-0.5 bg-muted rounded-sm shrink-0">
                                            {log.type}
                                          </span>
                                        )}
                                      </div>
                                      {(log.message || log.data) && (
                                        <div className="text-muted-foreground/50 group-hover/log:text-foreground shrink-0 transition-colors mr-1">
                                          {isCollapsed ? <ChevronRightIcon className="size-3.5" /> : <ChevronDownIcon className="size-3.5" />}
                                        </div>
                                      )}
                                    </div>

                                    {!isCollapsed && (log.message || log.data) && (
                                      <div className="pl-8 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                                        {log.message && (
                                          <p className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{log.message}</p>
                                        )}
                                        {log.data && (
                                          <DataRenderer data={log.data} setMaximizedImage={setMaximizedImage} />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Canvas Embedded Right Sidebar (Push configuration panel) */}
                {isSheetOpen && !isRunSheetOpen && (selectedNode || selectedEdge) && (
                  <div className="w-[400px] border-l bg-card flex flex-col h-full min-h-0 max-h-full overflow-hidden z-10 shrink-0">
                    <div className="p-6 border-b shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 bg-primary/10 text-primary font-bold">
                          {selectedNode ? selectedNode.data.type : "Connection"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {selectedNode ? selectedNode.id : selectedEdge?.id}</span>
                      </div>
                      <h3 className="text-lg font-bold mt-1 text-foreground">Configure {selectedNode ? "Node" : "Edge"}</h3>
                      <p className="text-xs text-muted-foreground">
                        Modify the selected {selectedNode ? "block" : "connection"} configurations.
                      </p>
                    </div>

                    {selectedNode && (
                      <div className="relative flex-1 min-h-0 flex flex-col">
                        {/* Upstream Variables Panel */}
                        <div className="shrink-0 p-4 border-b bg-muted/20 flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Available Upstream Variables</Label>
                            <div className="relative w-32">
                              <SearchIcon className="absolute left-1.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                              <Input
                                value={upstreamSearch}
                                onChange={(e) => setUpstreamSearch(e.target.value)}
                                placeholder="Search..."
                                className="h-6 text-[10px] pl-6 py-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                            {getUpstreamNodeIds(edges, selectedNode.id).length === 0 && (
                              <span className="text-[10px] text-muted-foreground italic">No upstream nodes connected.</span>
                            )}

                            {getUpstreamNodeIds(edges, selectedNode.id).map((uid, idx) => {
                              const node = nodes.find(n => n.id === uid);
                              if (!node) return null;

                              const fields = getStaticNodeFields(uid, nodes);

                              const filteredFields = upstreamSearch
                                ? fields.filter(f => f.name.toLowerCase().includes(upstreamSearch.toLowerCase()))
                                : fields;

                              const matchesNodeName = upstreamSearch && node.data.label.toLowerCase().includes(upstreamSearch.toLowerCase());

                              if (upstreamSearch && !matchesNodeName && filteredFields.length === 0) {
                                return null;
                              }

                              return (
                                <Collapsible key={uid} defaultOpen={upstreamSearch ? true : idx === 0} className="border border-border/50 bg-background/50 rounded-md overflow-hidden">
                                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 transition-colors text-xs font-bold text-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <div className="size-1.5 rounded-full bg-primary/60" />
                                      {node.data.label}
                                      {upstreamSearch && filteredFields.length > 0 && (
                                        <span className="ml-1 text-[9px] text-muted-foreground font-normal bg-muted px-1 rounded-full">{filteredFields.length}</span>
                                      )}
                                    </div>
                                    <ChevronDownIcon className="size-3.5 text-muted-foreground/70" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="p-2 pt-0 pl-4 border-t border-border/50 bg-card/30">
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {/* Option to drag the entire node payload */}
                                      {(!upstreamSearch || matchesNodeName || "entire payload".includes(upstreamSearch.toLowerCase())) && (
                                        <div
                                          draggable
                                          onDragStart={(e) => {
                                            e.dataTransfer.setData("text/plain", `{{ $node["${uid}"].json }}`);
                                            e.dataTransfer.effectAllowed = "copy";
                                          }}
                                          className="text-[9px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform bg-primary/5 text-primary border border-primary/20 px-1.5 py-0.5 rounded flex items-center gap-1"
                                          title="Drag the entire JSON payload"
                                        >
                                          <BracesIcon className="size-2.5 opacity-70" />
                                          <span className="font-mono font-bold">Entire Payload</span>
                                        </div>
                                      )}

                                      {/* Options to drag specific fields */}
                                      {filteredFields.map(f => (
                                        <div
                                          key={f.name}
                                          draggable
                                          onDragStart={(e) => {
                                            e.dataTransfer.setData("text/plain", `{{ $node["${uid}"].json.${f.name} }}`);
                                            e.dataTransfer.effectAllowed = "copy";
                                          }}
                                          className="text-[9px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform bg-primary/10 text-primary border border-primary/30 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"
                                          title={`Drag field: ${f.name}`}
                                        >
                                          <span className="font-mono font-bold truncate max-w-[120px]">{f.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              )
                            })}

                            {selectedNode.data.type !== "trigger" && (() => {
                              // Only offer loop-item variables when this node is actually downstream of a loop
                              const loopNodeForCtx = nodes.find(n => n.data.type === "loop")
                              if (!loopNodeForCtx) return false
                              return getDownstreamNodes(loopNodeForCtx.id, nodes, edges).some(n => n.id === selectedNode.id)
                            })() && (!upstreamSearch || "current item loop".includes(upstreamSearch.toLowerCase())) && (
                                <div className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-border/50">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                    <div className="size-1.5 rounded-full bg-emerald-500/60" />
                                    Loop / Current Context
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 pl-3">
                                    <div
                                      draggable
                                      onDragStart={(e) => {
                                        e.dataTransfer.setData("text/plain", `{{ $json }}`);
                                        e.dataTransfer.effectAllowed = "copy";
                                      }}
                                      className="text-[9px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"
                                      title="Drag the entire current loop item: {{ $json }}"
                                    >
                                      <span className="font-mono font-bold">Current Item</span>
                                    </div>

                                    {/* Loop item variable, e.g. {{ slide }} & {{ index }} */}
                                    {(() => {
                                      const loopNode = nodes.find(n => n.data.type === "loop")
                                      if (!loopNode) return null
                                      const itemName = loopNode.data.params.itemName || "item"
                                      return (
                                        <>
                                          <div
                                            draggable
                                            onDragStart={(e) => {
                                              e.dataTransfer.setData("text/plain", `{{ ${itemName} }}`);
                                              e.dataTransfer.effectAllowed = "copy";
                                            }}
                                            className="text-[9px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"
                                            title={`Drag loop item variable: {{ ${itemName} }}`}
                                          >
                                            <span className="font-mono font-bold">{itemName}</span>
                                          </div>
                                          <div
                                            draggable
                                            onDragStart={(e) => {
                                              e.dataTransfer.setData("text/plain", `{{ index }}`);
                                              e.dataTransfer.effectAllowed = "copy";
                                            }}
                                            className="text-[9px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"
                                            title="Drag current loop index: {{ index }}"
                                          >
                                            <span className="font-mono font-bold">index</span>
                                          </div>
                                        </>
                                      )
                                    })()}

                                    {/* Dynamically parsed fields of the current loop item */}
                                    {(() => {
                                      const loopNode = nodes.find(n => n.data.type === "loop")
                                      const itemName = loopNode?.data.params.itemName || "item"
                                      return getLoopFields(nodes, edges).map(f => (
                                        <div
                                          key={f.name}
                                          draggable
                                          onDragStart={(e) => {
                                            e.dataTransfer.setData("text/plain", `{{ ${itemName}.${f.path} }}`);
                                            e.dataTransfer.effectAllowed = "copy";
                                          }}
                                          className="text-[9px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"
                                          title={`Drag loop item field: {{ ${itemName}.${f.name} }}`}
                                        >
                                          <span className="font-mono font-bold">{itemName}.{f.name}</span>
                                        </div>
                                      ))
                                    })()}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Block Title</Label>
                            <DroppableInput
                              value={selectedNode.data.label}
                              onChange={(e) => updateNodeData({ label: e.target.value })}
                              className="rounded-none text-xs h-9 font-semibold"
                            />
                          </div>

                          {/* Trigger Fields */}
                          {selectedNode.data.type === "trigger" && (
                            <>
                              <div className="p-3 border border-slate-300 bg-slate-50 dark:bg-slate-900/30 dark:border-slate-700 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <ZapIcon className="size-3 text-slate-600" />
                                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">How This Works</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                  The Trigger is the <strong>entry point</strong> of your workflow. It defines how this automation starts.
                                  A webhook URL will be generated for external services (e.g., Shopify, Stripe) to call when an event occurs.
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trigger Event Name</Label>
                                <DroppableInput
                                  value={selectedNode.data.params.eventName || selectedNode.data.params.event || ""}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, eventName: e.target.value } })}
                                  className="rounded-none text-xs h-9"
                                  placeholder="e.g. On New Order, On Payment Received"
                                />
                                <p className="text-[10px] text-muted-foreground/60">A label describing what kicks off this workflow.</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Webhook URL (auto-generated on save)</Label>
                                <DroppableInput
                                  value={selectedNode.data.params.webhookUrl || ""}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, webhookUrl: e.target.value } })}
                                  className="rounded-none text-xs h-9 font-mono"
                                  placeholder="https://api.quickz.ai/v1/webhook/..."
                                />
                                <p className="text-[10px] text-muted-foreground/60">External services POST to this URL to start the workflow.</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Incoming Payload Type</Label>
                                <select
                                  value={selectedNode.data.params.contentType || "application/json"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, contentType: e.target.value } })}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  <option value="application/json">JSON</option>
                                  <option value="multipart/form-data">Form Data / File Upload</option>
                                  <option value="text/plain">Plain Text</option>
                                  <option value="image/png">Image (PNG URL / base64)</option>
                                  <option value="application/xml">XML</option>
                                </select>
                                <p className="text-[10px] text-muted-foreground/60">The MIME type of the data the webhook expects to receive.</p>
                              </div>
                              <SchemaBuilderSection key={selectedNode.id} selectedNode={selectedNode} updateNodeData={updateNodeData} />
                              <p className="text-[10px] text-muted-foreground/60">Define the expected shape of the incoming payload. Used for validation and AI context.</p>
                              {/* File Uploader  shown when payload type supports files */}
                              {(selectedNode.data.params.contentType === "multipart/form-data" || selectedNode.data.params.contentType === "image/png") && (
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center border-b pb-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expected File Inputs</Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        let currentFiles: { key: string, name: string, content: string }[] = []
                                        try {
                                          if (selectedNode.data.params.sampleFiles) {
                                            currentFiles = JSON.parse(selectedNode.data.params.sampleFiles)
                                          } else if (selectedNode.data.params.sampleFile) {
                                            currentFiles = [{ key: "file", name: "legacy-sample-file", content: selectedNode.data.params.sampleFile }]
                                          }
                                        } catch { }

                                        const next = [...currentFiles, { key: `file_${currentFiles.length + 1}`, name: "", content: "" }]
                                        updateNodeData({
                                          params: {
                                            ...selectedNode.data.params,
                                            sampleFiles: JSON.stringify(next),
                                            sampleFile: next[0]?.content || ""
                                          }
                                        })
                                      }}
                                      className="text-[10px] h-7 px-2 font-bold rounded-none"
                                    >
                                      + Add File Input
                                    </Button>
                                  </div>

                                  {/* Display list of custom file input fields */}
                                  {(() => {
                                    let filesList: { key: string, name: string, content: string }[] = []
                                    try {
                                      if (selectedNode.data.params.sampleFiles) {
                                        filesList = JSON.parse(selectedNode.data.params.sampleFiles)
                                      } else if (selectedNode.data.params.sampleFile) {
                                        filesList = [{ key: "file", name: "legacy-sample-file", content: selectedNode.data.params.sampleFile }]
                                      }
                                    } catch { }

                                    if (filesList.length === 0) {
                                      return (
                                        <p className="text-[10px] text-muted-foreground italic text-center p-2 bg-muted/10 border border-dashed rounded">
                                          No file inputs defined yet. Click "+ Add File Input" to create one.
                                        </p>
                                      )
                                    }

                                    return (
                                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                        {filesList.map((f, idx) => (
                                          <div key={idx} className="space-y-1.5 p-2.5 border border-border bg-card rounded shadow-sm relative group/file-row">
                                            <div className="flex gap-2 items-center">
                                              <div className="flex-1 flex flex-col gap-1">
                                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Input Name / Payload Key</span>
                                                <Input
                                                  value={f.key}
                                                  onChange={(e) => {
                                                    const next = [...filesList]
                                                    next[idx] = { ...next[idx], key: e.target.value.replace(/\s+/g, "_") }
                                                    updateNodeData({
                                                      params: {
                                                        ...selectedNode.data.params,
                                                        sampleFiles: JSON.stringify(next),
                                                        sampleFile: next[0]?.content || ""
                                                      }
                                                    })
                                                  }}
                                                  className="h-8 text-xs font-mono rounded-none"
                                                  placeholder="e.g. invoice, avatar"
                                                />
                                              </div>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                  const next = [...filesList]
                                                  next.splice(idx, 1)
                                                  updateNodeData({
                                                    params: {
                                                      ...selectedNode.data.params,
                                                      sampleFiles: JSON.stringify(next),
                                                      sampleFile: next[0]?.content || ""
                                                    }
                                                  })
                                                }}
                                                className="shrink-0 size-8 mt-4 text-muted-foreground hover:text-destructive rounded-none"
                                                title="Delete file input"
                                              >
                                                <Trash2Icon className="size-3.5" />
                                              </Button>
                                            </div>

                                            <div className="pt-1">
                                              {f.content ? (
                                                <div className="flex items-center gap-2 text-[10px] bg-emerald-500/5 border border-emerald-500/20 p-2 rounded">
                                                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                                  <div className="flex-1 min-w-0">
                                                    <p className="font-mono truncate font-bold text-foreground" title={f.name}>{f.name}</p>
                                                    <p className="text-[9px] text-muted-foreground mt-0.5">{Math.round(f.content.length / 1024)} KB</p>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const next = [...filesList]
                                                      next[idx] = { ...next[idx], name: "", content: "" }
                                                      updateNodeData({
                                                        params: {
                                                          ...selectedNode.data.params,
                                                          sampleFiles: JSON.stringify(next),
                                                          sampleFile: next[0]?.content || ""
                                                        }
                                                      })
                                                    }}
                                                    className="text-[10px] text-destructive hover:underline font-semibold"
                                                  >
                                                    Clear
                                                  </button>
                                                </div>
                                              ) : (
                                                <div className="relative">
                                                  <Input
                                                    type="file"
                                                    accept={selectedNode.data.params.contentType === "image/png" ? "image/png,image/jpeg,image/webp,image/gif" : "*/*"}
                                                    onChange={(e) => {
                                                      const file = e.target.files?.[0]
                                                      if (file) {
                                                        const reader = new FileReader()
                                                        reader.onload = () => {
                                                          const next = [...filesList]
                                                          next[idx] = {
                                                            ...next[idx],
                                                            name: file.name,
                                                            content: reader.result as string
                                                          }
                                                          updateNodeData({
                                                            params: {
                                                              ...selectedNode.data.params,
                                                              sampleFiles: JSON.stringify(next),
                                                              sampleFile: next[0]?.content || ""
                                                            }
                                                          })
                                                        }
                                                        reader.readAsDataURL(file)
                                                      }
                                                    }}
                                                    className="rounded-none text-xs h-8 cursor-pointer file:mr-2 file:py-0.5 file:px-2 file:rounded-none file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                  <p className="text-[10px] text-muted-foreground/60">Create distinct file input fields. Stored with custom label keys and mock filenames for downstream references like <code className="text-foreground">{"{{trigger.<inputName>}}"}</code>.</p>
                                </div>
                              )}
                            </>
                          )}

                          {/* Delay Duration */}
                          {selectedNode.data.type === "delay" && (
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delay Duration (ms)</Label>
                              <Input
                                type="number"
                                value={selectedNode.data.params.ms || ""}
                                onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, ms: e.target.value } })}
                                className="rounded-none text-xs h-9"
                                placeholder="2000"
                              />
                            </div>
                          )}

                          {/* Image Gen (AI) Fields */}
                          {selectedNode.data.type === "image-gen" && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Model ID</Label>
                                <select
                                  value={selectedNode.data.params.model || "gemini-3.1-flash-image"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, model: e.target.value } })}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  <option value="gemini-3.1-flash-image">Gemini 3.1 Flash Image</option>
                                  <option value="gemini-3-pro-image">Gemini 3 Pro Image</option>
                                  <option value="imagen-4.0-generate-001">Imagen 4.0</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom API Key</Label>
                                <Input
                                  type="password"
                                  value={selectedNode.data.params.apiKey || ""}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, apiKey: e.target.value } })}
                                  className="rounded-none text-xs h-9 font-mono"
                                  placeholder="AIzaSy..."
                                />
                                <p className="text-[10px] text-muted-foreground/60">Your private Google API key.</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Image Generation Prompt</Label>
                                <DroppableTextarea
                                  value={selectedNode.data.params.prompt || ""}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, prompt: e.target.value } })}
                                  className="rounded-none text-xs min-h-[100px] resize-none"
                                  placeholder="A futuristic cybernetic interface with purple lights..."
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">How many variations?</Label>
                                <select
                                  value={selectedNode.data.params.numberOfImages || "1"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, numberOfImages: e.target.value } })}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  <option value="1">1 design</option>
                                  <option value="2">2 designs</option>
                                  <option value="3">3 designs</option>
                                  <option value="4">4 designs</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Image Resolution</Label>
                                <select
                                  value={selectedNode.data.params.imageSize || "1K"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, imageSize: e.target.value } })}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  <option value="1K">Good (1024px) - Faster</option>
                                  <option value="2K">Better (2048px) - Balanced</option>
                                  {(selectedNode.data.params.model === 'gemini-3-pro-image' || selectedNode.data.params.model === 'nano-banana-2') && (
                                    <option value="4K">Best (4096px) - Highest Quality</option>
                                  )}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Aspect Ratio</Label>
                                <select
                                  value={selectedNode.data.params.aspectRatio || "1:1"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, aspectRatio: e.target.value } })}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  <option value="auto">Auto (based on platform)</option>
                                  <option value="1:1">Square (1:1)</option>
                                  <option value="3:4">Portrait (3:4)</option>
                                  <option value="4:3">Landscape (4:3)</option>
                                  <option value="9:16">Story (9:16)</option>
                                  <option value="16:9">Wide (16:9)</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Include People?</Label>
                                <select
                                  value={selectedNode.data.params.personGeneration || "dont_allow"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, personGeneration: e.target.value } })}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  <option value="dont_allow">No people</option>
                                  <option value="allow_adult">Adults only</option>
                                  <option value="allow_all">Adults & children</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Creativity Level (Temperature)</Label>
                                  <span className="text-[10px] text-muted-foreground">
                                    {selectedNode.data.params.temperature || "1.0"}
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  step="0.1"
                                  min="0"
                                  max="2"
                                  value={selectedNode.data.params.temperature || "1.0"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, temperature: e.target.value } })}
                                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[9px] text-muted-foreground/60 uppercase">
                                  <span>Precise</span>
                                  <span>Balanced</span>
                                  <span>Wild</span>
                                </div>
                              </div>
                              <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-center">
                                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Variety (Top-P)</Label>
                                  <span className="text-[10px] text-muted-foreground">
                                    {selectedNode.data.params.topP || "0.95"}
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  step="0.05"
                                  min="0"
                                  max="1"
                                  value={selectedNode.data.params.topP || "0.95"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, topP: e.target.value } })}
                                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[9px] text-muted-foreground/60 uppercase">
                                  <span>Focused</span>
                                  <span>Diverse</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Style Reference Image (optional)</Label>
                                <div className="flex gap-2">
                                  <DroppableInput
                                    value={selectedNode.data.params.referenceImage || ""}
                                    onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, referenceImage: e.target.value } })}
                                    className="rounded-none text-xs h-9 flex-1"
                                    placeholder="{{ $node['trigger-1'].json.file }} or Base64..."
                                  />
                                  <div className="relative">
                                    <Button type="button" variant="outline" className="rounded-none h-9 text-xs px-3">
                                      Upload File
                                    </Button>
                                    <Input
                                      type="file"
                                      accept="image/png,image/jpeg,image/webp,image/gif"
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                          const reader = new FileReader()
                                          reader.onload = () => {
                                            updateNodeData({ params: { ...selectedNode.data.params, referenceImage: reader.result as string } })
                                          }
                                          reader.readAsDataURL(file)
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                                {selectedNode.data.params.referenceImage && selectedNode.data.params.referenceImage.startsWith("data:image") && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <img src={selectedNode.data.params.referenceImage} alt="Reference" className="size-12 object-cover rounded border border-border" />
                                    <span className="text-[10px] text-emerald-600 font-mono truncate flex-1">✓ Ref loaded ({Math.round(selectedNode.data.params.referenceImage.length / 1024)} KB)</span>
                                    <button
                                      type="button"
                                      onClick={() => updateNodeData({ params: { ...selectedNode.data.params, referenceImage: "" } })}
                                      className="text-[10px] text-destructive hover:underline shrink-0"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}
                                <p className="text-[10px] text-muted-foreground/60">Provide a base64 string, variable, or upload a file to guide the visual style.</p>
                              </div>
                            </>
                          )}

                          {/* HTTP Request Fields */}
                          {selectedNode.data.type === "http-request" && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target URL</Label>
                                <Input
                                  value={selectedNode.data.params.url || ""}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, url: e.target.value } })}
                                  className="rounded-none text-xs h-9"
                                  placeholder="https://api.github.com"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">HTTP Method</Label>
                                <select
                                  value={selectedNode.data.params.method || "GET"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, method: e.target.value } })}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  <option value="GET">GET</option>
                                  <option value="POST">POST</option>
                                  <option value="PUT">PUT</option>
                                  <option value="DELETE">DELETE</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom Headers (JSON)</Label>
                                <Textarea
                                  value={selectedNode.data.params.headers || "{}"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, headers: e.target.value } })}
                                  className="rounded-none text-xs min-h-[60px] font-mono resize-none"
                                  placeholder='{ "Authorization": "Bearer ..." }'
                                />
                                <p className="text-[10px] text-muted-foreground/60">Requests are routed through the server proxy (avoids browser CORS issues).</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">JSON Request Body</Label>
                                <Textarea
                                  value={selectedNode.data.params.body || "{}"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, body: e.target.value } })}
                                  className="rounded-none text-xs min-h-[100px] font-mono resize-none"
                                  placeholder="{}"
                                />
                              </div>
                            </>
                          )}

                          {/* Custom Javascript */}
                          {selectedNode.data.type === "script" && (
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom JavaScript</Label>
                              <Textarea
                                value={selectedNode.data.params.code || ""}
                                onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, code: e.target.value } })}
                                className="rounded-none text-xs min-h-[150px] font-mono resize-none"
                                placeholder="console.log('Hello from node');"
                              />
                            </div>
                          )}

                          {/* Loop Fields */}
                          {selectedNode.data.type === "loop" && (
                            <>
                              <div className="p-3 border border-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-700 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <RepeatIcon className="size-3 text-indigo-600" />
                                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Iterator / Loop Node</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                  The Iterator node iterates over an array from incoming data. Each item is passed to connected
                                  downstream nodes using the item variable name you define below. Choose <strong>parallel</strong> mode
                                  to run all iterations concurrently, or <strong>sequential</strong> (loop) mode to process items one after another.
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Execution Mode</Label>
                                <select
                                  value={selectedNode.data.params.mode || "parallel"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, mode: e.target.value } })}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  <option value="parallel">Parallel  run all iterations concurrently</option>
                                  <option value="sequential">Sequential  loop through items one by one</option>
                                </select>
                                <p className="text-[10px] text-muted-foreground/60">Parallel is faster for independent items; sequential preserves order and is gentler on rate limits.</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Array JSONPath</Label>
                                <Input
                                  value={selectedNode.data.params.arrayPath || ""}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, arrayPath: e.target.value } })}
                                  className="rounded-none text-xs h-9 font-mono"
                                  placeholder="$.slides"
                                />
                                <p className="text-[10px] text-muted-foreground/60">JSONPath expression to extract the array from incoming data.</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item Variable Name</Label>
                                <Input
                                  value={selectedNode.data.params.itemName || ""}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, itemName: e.target.value } })}
                                  className="rounded-none text-xs h-9"
                                  placeholder="slide"
                                />
                                <p className="text-[10px] text-muted-foreground/60">Downstream nodes can reference the current item via <code className="text-foreground">{"{{<itemName>}}"}</code> (e.g. <code className="text-foreground">{"{{slideTitle}}"}</code>).</p>
                              </div>
                            </>
                          )}

                          {/* Router Fields */}
                          {selectedNode.data.type === "router" && (
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Condition (JavaScript/Expression)</Label>
                              <Input
                                value={selectedNode.data.params.condition || ""}
                                onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, condition: e.target.value } })}
                                className="rounded-none text-xs h-9 font-mono"
                                placeholder="{{$json.value}} > 5"
                              />
                              <p className="text-[10px] text-muted-foreground/60">Evaluates to true or false. Edges can be connected to the true/false handles.</p>
                            </div>
                          )}

                          {/* Classifier Fields */}
                          {selectedNode.data.type === "classifier" && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Incoming Value to Match</Label>
                                <DroppableInput
                                  value={selectedNode.data.params.valueToMatch || ""}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, valueToMatch: e.target.value } })}
                                  className="rounded-none text-xs h-9 font-mono"
                                  placeholder="e.g. {{$json.status}} or {{$node['node-1'].json.emittedValue}}"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Match Cases / Possibilities (Comma-separated)</Label>
                                <Input
                                  value={selectedNode.data.params.possibilities || ""}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, possibilities: e.target.value } })}
                                  className="rounded-none text-xs h-9 font-mono"
                                  placeholder="new, assigned, resolved"
                                />
                                <p className="text-[10px] text-muted-foreground/60">Define custom routing labels. A corresponding output handle will appear for each matching case.</p>
                              </div>
                            </>
                          )}

                          {/* Merge Fields */}
                          {selectedNode.data.type === "merge" && (
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Merge Strategy</Label>
                              <select
                                value={selectedNode.data.params.strategy || "wait-all"}
                                onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, strategy: e.target.value } })}
                                className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                              >
                                <option value="wait-all">Wait for all branches</option>
                                <option value="first-wins">Pass through first arriving branch</option>
                                <option value="append">Append as array</option>
                              </select>
                            </div>
                          )}

                          {/* Boolean Fields */}
                          {selectedNode.data.type === "boolean" && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Operator</Label>
                                <select
                                  value={selectedNode.data.params.operator || "AND"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, operator: e.target.value } })}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  <option value="AND">AND</option>
                                  <option value="OR">OR</option>
                                  <option value="NOT">NOT</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Operand 1</Label>
                                <Input
                                  value={selectedNode.data.params.operand1 || ""}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, operand1: e.target.value } })}
                                  className="rounded-none text-xs h-9 font-mono"
                                  placeholder="true"
                                />
                              </div>
                              {selectedNode.data.params.operator !== "NOT" && (
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Operand 2</Label>
                                  <Input
                                    value={selectedNode.data.params.operand2 || ""}
                                    onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, operand2: e.target.value } })}
                                    className="rounded-none text-xs h-9 font-mono"
                                    placeholder="false"
                                  />
                                </div>
                              )}
                            </>
                          )}

                          {/* Transform Fields */}
                          {selectedNode.data.type === "transform" && (
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">JSON Mapping Template</Label>
                              <Textarea
                                value={selectedNode.data.params.mapping || "{}"}
                                onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, mapping: e.target.value } })}
                                className="rounded-none text-xs min-h-[150px] font-mono resize-none"
                                placeholder='{ "newKey": "{{$json.oldKey}}" }'
                              />
                            </div>
                          )}

                          {/* Filter Fields */}
                          {selectedNode.data.type === "filter" && (
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Keep condition</Label>
                              <Input
                                value={selectedNode.data.params.condition || ""}
                                onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, condition: e.target.value } })}
                                className="rounded-none text-xs h-9 font-mono"
                                placeholder="{{$json.status}} === 'active'"
                              />
                            </div>
                          )}

                          {/* LLM Node Fields */}
                          {selectedNode.data.type === "llm" && (
                            <>
                              <div className="p-3 border border-violet-300 bg-violet-50 dark:bg-violet-900/30 dark:border-violet-700 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <BrainCircuitIcon className="size-3 text-violet-600" />
                                  <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Advanced LLM</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                  Configure a custom LLM block with your preferred AI provider, model selection, and API credentials.
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI Provider</Label>
                                <select
                                  value={selectedNode.data.params.provider || "openai"}
                                  onChange={(e) => {
                                    const newProvider = e.target.value;
                                    let newModel = "";
                                    if (newProvider === "openai") newModel = "gpt-4o-mini";
                                    else if (newProvider === "anthropic") newModel = "claude-3-5-sonnet-20241022";
                                    else if (newProvider === "google") newModel = "gemini-2.5-flash";
                                    else if (newProvider === "groq") newModel = "llama-3.3-70b-versatile";
                                    else if (newProvider === "open-source") newModel = "meta-llama/llama-3.1-405b-instruct";

                                    updateNodeData({ params: { ...selectedNode.data.params, provider: newProvider, model: newModel } });
                                  }}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  <option value="openai">OpenAI</option>
                                  <option value="anthropic">Anthropic (Claude)</option>
                                  <option value="google">Google Gemini</option>
                                  <option value="groq">Groq</option>
                                  <option value="open-source">Open Source Router</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Model ID</Label>
                                <select
                                  value={
                                    PROVIDER_MODELS[selectedNode.data.params.provider || "openai"]?.some(m => m.id === selectedNode.data.params.model)
                                      ? selectedNode.data.params.model || ""
                                      : (selectedNode.data.params.provider === "google" ? "gemini-2.5-flash" : "custom")
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "custom") {
                                      updateNodeData({ params: { ...selectedNode.data.params, model: "" } });
                                    } else {
                                      updateNodeData({ params: { ...selectedNode.data.params, model: val } });
                                    }
                                  }}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  {(PROVIDER_MODELS[selectedNode.data.params.provider || "openai"] || []).map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                  ))}
                                  {selectedNode.data.params.provider !== "google" && (
                                    <option value="custom">Other (Enter Custom Model ID)</option>
                                  )}
                                </select>

                                {selectedNode.data.params.provider !== "google" && (!PROVIDER_MODELS[selectedNode.data.params.provider || "openai"]?.some(m => m.id === selectedNode.data.params.model) || selectedNode.data.params.model === "") && (
                                  <Input
                                    value={selectedNode.data.params.model || ""}
                                    onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, model: e.target.value } })}
                                    className="rounded-none text-xs h-9 font-mono mt-1.5"
                                    placeholder="e.g. gpt-4o, claude-3-5-sonnet-20241022"
                                  />
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom API Key</Label>
                                <Input
                                  type="password"
                                  value={selectedNode.data.params.apiKey || ""}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, apiKey: e.target.value } })}
                                  className="rounded-none text-xs h-9 font-mono"
                                  placeholder="sk-..."
                                />
                                <p className="text-[10px] text-muted-foreground/60">Your private API credential. Stored securely on this workspace client.</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prompt Instructions</Label>
                                <Textarea
                                  value={selectedNode.data.params.prompt || ""}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, prompt: e.target.value } })}
                                  className="rounded-none text-xs min-h-[120px] resize-none"
                                  placeholder="Translate the following payload to French: {{trigger.payload}}..."
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Temperature</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="2"
                                  value={selectedNode.data.params.temperature || "0.7"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, temperature: e.target.value } })}
                                  className="rounded-none text-xs h-9"
                                  placeholder="0.7"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Response Format</Label>
                                <select
                                  value={selectedNode.data.params.responseFormat || "text"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, responseFormat: e.target.value } })}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  <option value="text">Plain Text</option>
                                  <option value="json_object">JSON Object</option>
                                </select>
                              </div>
                              {selectedNode.data.params.responseFormat === "json_object" && (
                                <SchemaBuilderSection
                                  key={selectedNode.id}
                                  selectedNode={selectedNode}
                                  updateNodeData={updateNodeData}
                                  paramKey="jsonSchema"
                                  title="Structured JSON Schema"
                                />
                              )}
                            </>
                          )}

                          {/* Output Fields */}
                          {selectedNode.data.type === "output" && (
                            <>
                              <div className="p-3 border border-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-700 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <SquareArrowOutUpRightIcon className="size-3 text-emerald-600" />
                                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Terminal Node</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                  The Output node marks the <strong>end of your workflow</strong>. It aggregates all incoming data from
                                  connected branches and produces the final result payload returned to the caller.
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Output Key</Label>
                                <Input
                                  value={selectedNode.data.params.outputKey || "result"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, outputKey: e.target.value } })}
                                  className="rounded-none text-xs h-9"
                                  placeholder="result"
                                />
                                <p className="text-[10px] text-muted-foreground/60">The key name under which the final result is returned.</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Output Format</Label>
                                <select
                                  value={selectedNode.data.params.format || "json"}
                                  onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, format: e.target.value } })}
                                  className="flex h-9 w-full items-center justify-between border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                >
                                  <option value="json">JSON</option>
                                  <option value="text">Plain Text</option>
                                  <option value="html">HTML</option>
                                  <option value="buffer">Raw Buffer</option>
                                </select>
                                <p className="text-[10px] text-muted-foreground/60">The serialization format for the workflow payload.</p>
                              </div>
                            </>
                          )}

                          {/* Output Mapping Section  available for all non-group node types */}
                          {selectedNode.data.type !== "group" && (
                            <OutputMappingSection key={selectedNode.id} selectedNode={selectedNode} updateNodeData={updateNodeData} />
                          )}
                        </div>
                      </div>
                    )}

                    {selectedEdge && (
                      <div className="relative flex-1 min-h-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-y-auto p-6 space-y-5">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source Node ID</Label>
                            <Input
                              disabled
                              value={selectedEdge.source}
                              className="rounded-none text-xs h-9 bg-muted font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Node ID</Label>
                            <Input
                              disabled
                              value={selectedEdge.target}
                              className="rounded-none text-xs h-9 bg-muted font-mono"
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-4">
                            You can delete this connection by clicking the delete button below, or by pressing Backspace/Delete on your keyboard.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="p-6 border-t shrink-0 flex flex-row items-center gap-3 bg-muted/5">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={deleteSelectedElement}
                        className="flex-1 rounded-none text-xs h-10 gap-1.5"
                      >
                        <Trash2Icon className="size-4" />
                        Delete {selectedNode ? "Node" : "Edge"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSheetOpen(false)}
                        className="flex-1 rounded-none text-xs h-10"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}

                {/* AI Chat Assistant Panel (Push configuration panel) */}
                {isChatOpen && (
                  <div className="w-[400px] border-l bg-card flex flex-col h-full min-h-0 max-h-full overflow-hidden z-10 shrink-0">
                    <div className="p-6 border-b shrink-0 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SparkleIcon className="size-4.5 text-primary animate-pulse" />
                          <h3 className="text-sm font-bold text-foreground">AI Workflow Assistant</h3>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-none flex items-center justify-center hover:bg-muted"
                          onClick={() => setIsChatOpen(false)}
                        >
                          <Maximize2Icon className="size-3.5 rotate-45" />
                        </Button>
                      </div>
                    </div>

                    {/* Chat Message Thread */}
                    <div className="relative flex-1 min-h-0 overflow-hidden">
                      <div className="absolute inset-0 overflow-y-auto p-6 space-y-4">
                        {chatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2.5 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                              }`}
                          >
                            {/* Author Icons */}
                            <div className="shrink-0 mt-1">
                              {msg.role === 'user' ? (
                                session?.user?.image ? (
                                  <img src={session.user.image} alt="User" className="size-7 rounded-full border border-primary/20 shadow-sm" />
                                ) : (
                                  <div className="size-7 bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center rounded-full shadow-sm">
                                    U
                                  </div>
                                )
                              ) : (
                                <div className="size-7 bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/20 rounded-full shadow-sm">
                                  <SparkleIcon className="size-4 animate-pulse" />
                                </div>
                              )}
                            </div>

                            {/* Text Thread Content */}
                            <div className="flex flex-col gap-1 w-full">
                              <span className={`text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono ${msg.role === 'user' ? 'text-right' : 'text-left'
                                }`}>
                                {msg.role === 'user' ? 'You' : 'AI Assistant'}
                              </span>

                              <div className={`p-3 text-xs leading-relaxed rounded-none select-text ${msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground font-semibold'
                                  : 'bg-muted border border-border text-foreground font-medium whitespace-pre-wrap'
                                }`}>
                                {msg.thought && <ThoughtBlock thought={msg.thought} />}
                                {msg.text || (
                                  <span className="inline-flex gap-1.5 items-center font-bold text-primary/70 animate-pulse">
                                    <SparkleIcon className="size-3 animate-spin text-primary" />
                                    Thinking...
                                  </span>
                                )}
                              </div>

                              {/* Apply JSON to Canvas Button when JSON is embedded */}
                              {msg.text.includes("```json") && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    const jsonMatch = msg.text.match(/```json\n([\s\S]+?)\n```/)
                                    if (jsonMatch) {
                                      try {
                                        const success = applyWorkflowJsonBlock(jsonMatch[1])
                                        if (success) {
                                          setLogs(prev => [...prev, { message: `[System] Successfully applied AI-generated JSON workflow to canvas! 🎉` }])
                                        }
                                      } catch (err) {
                                        console.error(err)
                                      }
                                    }
                                  }}
                                  className="mt-2 w-full text-[11px] font-bold h-8 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground flex gap-1 items-center justify-center shadow-sm"
                                >
                                  <SparkleIcon className="size-3.5" />
                                  Apply JSON to Canvas
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}

                        {isChatStreaming && chatMessages[chatMessages.length - 1]?.text && (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] pl-10">
                            <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="ml-1 font-medium italic">Streaming response...</span>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                    </div>

                    {/* Chat Input form at bottom of sidebar */}
                    <div className="p-4 border-t bg-muted/5 shrink-0">
                      <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask AI or type commands..."
                          disabled={isChatStreaming}
                          className="flex-1 rounded-none text-xs h-9 bg-background border-border"
                        />
                        <Button
                          type="submit"
                          disabled={isChatStreaming || !chatInput.trim()}
                          className="rounded-none text-xs px-4 h-9 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                        >
                          Send
                        </Button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SidebarInset>

        {/* Full Screen Image Lightbox Modal */}
        {maximizedImage && (
          <div
            className="fixed inset-0 bg-black/85 z-[9999] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setMaximizedImage(null)}
          >
            <div
              className="relative max-w-[90vw] max-h-[85vh] bg-card border border-border p-2 shadow-2xl flex flex-col gap-2 rounded-lg overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <img src={maximizedImage} alt="Maximized" className="object-contain max-w-full max-h-[72vh] rounded shadow-inner" />
              <div className="flex gap-2 justify-end px-1.5 pb-1 border-t border-border pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = maximizedImage;
                    a.download = 'generated-workflow-image.png';
                    a.click();
                  }}
                  className="text-xs h-9 px-4 gap-1.5 font-bold"
                >
                  Download Image
                </Button>
                <Button
                  size="sm"
                  onClick={() => setMaximizedImage(null)}
                  className="text-xs h-9 px-4 font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* JSON Code Modal Dialog */}
        {showJsonModal && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowJsonModal(false)}>
            <div
              className="bg-card border border-border shadow-2xl rounded-xl max-w-2xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Workflow JSON Code</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    View, copy, or paste/edit the complete JSON schema structure of your workflow.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(workflowJsonText)
                      setJsonCopied(true)
                      setTimeout(() => setJsonCopied(false), 2000)
                    }}
                    className="text-xs h-8 gap-1"
                  >
                    {jsonCopied ? <CheckIcon className="size-3.5 text-emerald-500" /> : <CopyIcon className="size-3.5" />}
                    {jsonCopied ? "Copied" : "Copy JSON"}
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col space-y-2">
                <Textarea
                  value={workflowJsonText}
                  onChange={(e) => {
                    setWorkflowJsonText(e.target.value)
                    setJsonImportError(null)
                  }}
                  className="flex-1 font-mono text-xs p-3 leading-relaxed border-border focus-visible:ring-1 bg-muted/20 min-h-[350px] resize-none"
                  placeholder="Paste your workflow JSON here..."
                />
                {jsonImportError && (
                  <p className="text-xs text-red-500 font-medium font-mono leading-tight p-2.5 bg-red-500/5 border border-red-500/20 rounded-md">
                    ⚠️ {jsonImportError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end border-t pt-4 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowJsonModal(false)}
                  className="text-xs h-9 rounded-md"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(workflowJsonText)
                      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
                        throw new Error("Invalid format: JSON must contain 'nodes' and 'edges' arrays.")
                      }
                      const success = applyWorkflowJsonBlock(workflowJsonText)
                      if (success) {
                        setJsonImportError(null)
                        setShowJsonModal(false)
                        setLogs(prev => [...prev, { message: "[System] Successfully loaded workflow JSON code onto canvas! 🎉" }])
                      } else {
                        throw new Error("Failed to render nodes and edges onto the canvas.")
                      }
                    } catch (err: unknown) {
                      setJsonImportError(err instanceof Error ? err.message : "Malformed or invalid Workflow JSON")
                    }
                  }}
                  className="text-xs h-9 rounded-md font-bold"
                >
                  Apply and Close
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Real-Time Interactive Toast Notifications */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2",
                toast.type === "error" && "bg-destructive text-destructive-foreground border-destructive/50",
                toast.type === "success" && "bg-emerald-600 text-white border-emerald-500/50",
                toast.type === "warning" && "bg-amber-600 text-white border-amber-500/50",
                toast.type === "info" && "bg-indigo-600 text-white border-indigo-500/50"
              )}
            >
              {toast.type === "error" ? (
                <AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2Icon className="size-5 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm leading-tight">{toast.title}</h4>
                <p className="text-xs mt-1 leading-relaxed opacity-90 break-words whitespace-pre-wrap">{toast.message}</p>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="opacity-70 hover:opacity-100 p-0.5 transition-opacity"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </SidebarProvider>
    </WorkflowNodesContext.Provider>
  )
}
