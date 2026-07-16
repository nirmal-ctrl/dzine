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
  Node,
  Handle,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"

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
  PlayIcon, 
  MousePointerClickIcon, 
  KeyboardIcon, 
  ClockIcon, 
  SparklesIcon, 
  Code2Icon, 
  Trash2Icon, 
  PlayCircleIcon, 
  SaveIcon, 
  SparkleIcon,
  PlusIcon,
  HelpCircleIcon,
  ImageIcon, 
  BrainCircuitIcon, 
  BracesIcon, 
  GlobeIcon, 
  ZapIcon,
  Maximize2Icon,
  MessageSquareIcon
} from "lucide-react"

// Dynamic nodes typing & parameters
type NodeType = "trigger" | "click" | "type" | "delay" | "ai" | "script" | "text-gen" | "image-gen" | "json-parse" | "http-request"

interface NodeData {
  label: string
  type: NodeType
  icon: React.ReactNode
  color: string
  params: Record<string, string>
  status: "idle" | "running" | "success" | "error"
}

// Colors for nodes
const NODE_COLORS: Record<NodeType, { border: string, bg: string, text: string, iconBg: string }> = {
  trigger: { border: "border-emerald-500", bg: "bg-emerald-500/5", text: "text-emerald-500", iconBg: "bg-emerald-500/10" },
  click: { border: "border-blue-500", bg: "bg-blue-500/5", text: "text-blue-500", iconBg: "bg-blue-500/10" },
  type: { border: "border-amber-500", bg: "bg-amber-500/5", text: "text-amber-500", iconBg: "bg-amber-500/10" },
  delay: { border: "border-purple-500", bg: "bg-purple-500/5", text: "text-purple-500", iconBg: "bg-purple-500/10" },
  ai: { border: "border-violet-500", bg: "bg-violet-500/5", text: "text-violet-500", iconBg: "bg-violet-500/10" },
  script: { border: "border-rose-500", bg: "bg-rose-500/5", text: "text-rose-500", iconBg: "bg-rose-500/10" },
  "text-gen": { border: "border-violet-500", bg: "bg-violet-500/5", text: "text-violet-500", iconBg: "bg-violet-500/10" },
  "image-gen": { border: "border-pink-500", bg: "bg-pink-500/5", text: "text-pink-500", iconBg: "bg-pink-500/10" },
  "json-parse": { border: "border-amber-500", bg: "bg-amber-500/5", text: "text-amber-500", iconBg: "bg-amber-500/10" },
  "http-request": { border: "border-blue-500", bg: "bg-blue-500/5", text: "text-blue-500", iconBg: "bg-blue-500/10" }
}

interface AvailableTile {
  name: string
  type: NodeType
  icon: React.ReactNode
  color: string
  defaultParams: Record<string, string>
}

const AVAILABLE_TILES: AvailableTile[] = [
  { name: "Trigger (Event)", type: "trigger", icon: <ZapIcon className="size-4 text-emerald-500" />, color: "emerald", defaultParams: { webhookUrl: "https://api.quickz.ai/v1/webhook", event: "On Order Paid" } },
  { name: "Text Gen (AI)", type: "text-gen", icon: <BrainCircuitIcon className="size-4 text-violet-500" />, color: "violet", defaultParams: { prompt: "Summarize order details to French", model: "gpt-4o", temperature: "0.7" } },
  { name: "Image Gen (AI)", type: "image-gen", icon: <ImageIcon className="size-4 text-pink-500" />, color: "pink", defaultParams: { prompt: "A hyper-realistic corporate mascot logo", aspectRatio: "1:1", style: "Cinematic" } },
  { name: "HTTP Request", type: "http-request", icon: <GlobeIcon className="size-4 text-blue-500" />, color: "blue", defaultParams: { url: "https://api.github.com", method: "GET", body: "{}" } },
  { name: "Custom JS", type: "script", icon: <Code2Icon className="size-4 text-rose-500" />, color: "rose", defaultParams: { code: "return items.map(i => ({ ...i, processed: true }));" } },
  { name: "JSON Parse", type: "json-parse", icon: <BracesIcon className="size-4 text-amber-500" />, color: "amber", defaultParams: { expression: "$.data.invoice.total" } },
]

// Custom Node component inside React Flow
const CustomWorkflowNode = ({ data }: { data: NodeData }) => {
  const colors = NODE_COLORS[data.type]
  
  return (
    <div className={`p-4 border-2 ${colors.border} ${colors.bg} bg-card w-[220px] transition-all relative shadow-sm ${
      data.status === "running" ? "ring-2 ring-amber-500 ring-offset-2 animate-pulse" : ""
    } ${
      data.status === "success" ? "ring-2 ring-emerald-500" : ""
    }`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ width: '8px', height: '8px', borderRadius: '4px', background: '#94a3b8' }} 
      />
      <div className="flex items-center gap-3">
        <div className={`p-2 ${colors.iconBg} flex items-center justify-center`}>
          {data.icon}
        </div>
        <div className="flex-1 overflow-hidden">
          <h4 className="font-bold text-xs text-foreground tracking-tight truncate">{data.label}</h4>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold font-mono">{data.type}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t text-[10px] text-muted-foreground font-mono truncate space-y-1">
        {data.type === "trigger" && (
          <>
            <p className="truncate">Webhook: {data.params.webhookUrl}</p>
            <p>Event: {data.params.event}</p>
          </>
        )}
        {data.type === "text-gen" && (
          <>
            <p className="truncate">Prompt: {data.params.prompt}</p>
            <p>Model: {data.params.model}</p>
          </>
        )}
        {data.type === "image-gen" && (
          <>
            <p className="truncate">Prompt: {data.params.prompt}</p>
            <p>Style: {data.params.style} ({data.params.aspectRatio})</p>
          </>
        )}
        {data.type === "http-request" && (
          <>
            <p className="truncate">{data.params.method}: {data.params.url}</p>
          </>
        )}
        {data.type === "script" && <p>Custom script loaded</p>}
        {data.type === "json-parse" && <p>JSONPath: {data.params.expression}</p>}
      </div>
      {data.status === "success" && (
        <div className="absolute top-2 right-2 size-2 bg-emerald-500 rounded-full" />
      )}
      {data.status === "running" && (
        <div className="absolute top-2 right-2 size-2 bg-amber-500 rounded-full animate-ping" />
      )}
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'var(--primary)' }} 
      />
    </div>
  )
}

const nodeTypes = {
  custom: CustomWorkflowNode
}

interface WorkflowEditorClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
}

export function WorkflowEditorClient({ session }: WorkflowEditorClientProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  
  const [omniInput, setOmniInput] = React.useState("")
  const [aiGenerating, setAiGenerating] = React.useState(false)
  const [isRunning, setIsExecuting] = React.useState(false)
  const [logs, setLogs] = React.useState<string[]>([])
  const [showLogs, setShowLogs] = React.useState(false)

  const [selectedNode, setSelectedNode] = React.useState<Node<NodeData> | null>(null)
  const [selectedEdge, setSelectedEdge] = React.useState<Edge | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  // AI Assistant Chat panel states
  const { settings } = useAiSettings()

  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [chatMessages, setChatMessages] = React.useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Hello! Tell me what you'd like to build, e.g., 'Build an AI image sequence' or ask me custom questions!" }
  ])
  const [chatInput, setChatInput] = React.useState("")
  const [isChatStreaming, setIsChatStreaming] = React.useState(false)

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

  const submitChatQuery = async (queryText: string) => {
    if (!queryText.trim() || isChatStreaming) return

    setChatMessages(prev => [...prev, { role: "user", text: queryText }])
    setIsChatStreaming(true)

    try {
      const response = await fetch("/api/workflows/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryText,
          provider: settings.activeProvider,
          modelId: settings.models[settings.activeProvider],
          activeNodes: nodes.map(n => ({ id: n.id, type: n.data.type }))
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

      setChatMessages(prev => [...prev, { role: "assistant", text: "" }])

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6))
                if (parsed.text) {
                  accumulatedText += parsed.text
                  
                  setChatMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = { role: "assistant", text: accumulatedText }
                    return updated
                  })

                  // Progressive Node & Connection Parsing
                  const jsonMatch = accumulatedText.match(/```json\n([\s\S]+?)$/)
                  if (jsonMatch) {
                    const jsonText = jsonMatch[1].trim()
                    
                    // Progressive Regex extraction of individual nodes in real-time
                    const nodeMatches = jsonText.match(/\{\s*"id":\s*"node-\d+"[\s\S]+?\}/g)
                    if (nodeMatches) {
                      const parsedNodes = nodeMatches.map(nm => {
                        try {
                          const parsedNode = JSON.parse(nm.trim())
                          
                          let icon = <BrainCircuitIcon className="size-4 text-violet-500" />
                          let color = "violet"
                          if (parsedNode.data?.type === "trigger") {
                            icon = <ZapIcon className="size-4 text-emerald-500" />
                            color = "emerald"
                          } else if (parsedNode.data?.type === "image-gen") {
                            icon = <ImageIcon className="size-4 text-pink-500" />
                            color = "pink"
                          } else if (parsedNode.data?.type === "http-request") {
                            icon = <GlobeIcon className="size-4 text-blue-500" />
                            color = "blue"
                          } else if (parsedNode.data?.type === "script") {
                            icon = <Code2Icon className="size-4 text-rose-500" />
                            color = "rose"
                          } else if (parsedNode.data?.type === "json-parse") {
                            icon = <BracesIcon className="size-4 text-amber-500" />
                            color = "amber"
                          }

                          return {
                            id: parsedNode.id,
                            type: "custom",
                            position: parsedNode.position || { x: 100, y: 150 },
                            data: {
                              label: parsedNode.data?.label || "Node",
                              type: parsedNode.data?.type || "text-gen",
                              params: parsedNode.data?.params || {},
                              icon,
                              color,
                              status: "idle" as const
                            }
                          }
                        } catch {
                          return null
                        }
                      }).filter(Boolean)

                      if (parsedNodes.length > 0) {
                        setNodes(parsedNodes as Node<NodeData>[])
                      }
                    }

                    // Progressive Regex extraction of individual edges in real-time
                    const edgeMatches = jsonText.match(/\{\s*"id":\s*"edge-\d+-\d+"[\s\S]+?\}/g)
                    if (edgeMatches) {
                      const parsedEdges = edgeMatches.map(em => {
                        try {
                          const parsedEdge = JSON.parse(em.trim())
                          return {
                            id: parsedEdge.id,
                            source: parsedEdge.source,
                            target: parsedEdge.target,
                            markerEnd: { type: MarkerType.ArrowClosed },
                            style: { strokeWidth: 2 },
                            interactionWidth: 20
                          }
                        } catch {
                          return null
                        }
                      }).filter(Boolean)

                      if (parsedEdges.length > 0) {
                        setEdges(parsedEdges as Edge[])
                      }
                    }
                  }
                }
              } catch (e) {
                // Ignore parsing errors for partial stream chunks
              }
            }
          }
        }
      }

      setIsChatStreaming(false)
      setLogs(prev => [...prev, `[AI Assistant] Streaming response complete and rendered on canvas.`])
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

  const deleteSelectedElement = () => {
    if (selectedNode) {
      setNodes(prev => prev.filter(n => n.id !== selectedNode.id))
      setEdges(prev => prev.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id))
      setLogs(prev => [...prev, `[System] Deleted node: ${selectedNode.data.label}`])
    } else if (selectedEdge) {
      setEdges(prev => prev.filter(e => e.id !== selectedEdge.id))
      setLogs(prev => [...prev, `[System] Deleted connection: ${selectedEdge.id}`])
    }
    setIsSheetOpen(false)
    setSelectedNode(null)
    setSelectedEdge(null)
  }

  // Load default nodes on mount
  React.useEffect(() => {
    const defaultNodes: Node<NodeData>[] = [
      {
        id: "node-1",
        type: "custom",
        position: { x: 100, y: 150 },
        data: {
          label: "Trigger (Event/Schedule)",
          type: "trigger",
          icon: <PlayIcon className="size-4 text-emerald-500" />,
          color: "emerald",
          status: "idle",
          params: { url: "https://example.com", mode: "Page Load" }
        }
      },
      {
        id: "node-2",
        type: "custom",
        position: { x: 420, y: 150 },
        data: {
          label: "AI / LLM Action",
          type: "ai",
          icon: <SparklesIcon className="size-4 text-violet-500" />,
          color: "violet",
          status: "idle",
          params: { prompt: "Summarize the text of this page" }
        }
      }
    ]

    const defaultEdges: Edge[] = [
      {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2 },
        interactionWidth: 20
      }
    ]

    setNodes(defaultNodes)
    setEdges(defaultEdges)
  }, [setNodes, setEdges])

  const onConnect = React.useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ 
      ...params, 
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
      interactionWidth: 20
    }, eds)),
    [setEdges]
  )

  const onEdgeUpdate = React.useCallback(
    (oldEdge: Edge, newConnection: Connection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    [setEdges]
  )

  // Direct addition of nodes from clicking the Toolbox / quick panels
  const addBlockNode = (block: AvailableTile) => {
    const newId = `node-${nodes.length + 1}`
    
    // Position slightly offset from the last node
    const lastNode = nodes[nodes.length - 1]
    const xPos = lastNode ? lastNode.position.x + 320 : 100
    const yPos = lastNode ? lastNode.position.y : 150

    const newNode: Node<NodeData> = {
      id: newId,
      type: "custom",
      position: { x: xPos, y: yPos },
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

    if (lastNode) {
      const newEdge: Edge = {
        id: `edge-${lastNode.id}-${newId}`,
        source: lastNode.id,
        target: newId,
        markerEnd: { type: MarkerType.ArrowClosed, color: "var(--border)" },
        style: { strokeWidth: 2, stroke: "var(--border)" }
      }
      setEdges(prev => [...prev, newEdge])
    }

    setLogs(prev => [...prev, `[System] Added block: ${block.name}`])
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
      setLogs(prev => [...prev, `[AI Omni-Box] Real-time: Cleared canvas.`])
      return
    }

    // Trigger full chat inference via AI router
    await submitChatQuery(text)
  }

  // Simulate workflow execution step-by-step
  const simulateExecution = async () => {
    if (nodes.length === 0) return
    setIsExecuting(true)
    setShowLogs(true)
    setLogs([`[Executor] Initializing execution run...`])

    // Set all nodes to idle
    setNodes(prev => prev.map(n => ({
      ...n,
      data: { ...n.data, status: "idle" }
    })))

    // Execute in sequential coordinate order (left to right)
    const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x)

    for (let i = 0; i < sortedNodes.length; i++) {
      const node = sortedNodes[i]
      
      // running status
      setNodes(prev => prev.map(n => n.id === node.id ? {
        ...n,
        data: { ...n.data, status: "running" }
      } : n))

      setLogs(prev => [
        ...prev, 
        `[Step ${i + 1}] Executing: "${node.data.label}" (${node.data.type})...`
      ])

      if (node.data.type === "trigger") {
        setLogs(prev => [...prev, ` -> Opening page: ${node.data.params.url}`])
      } else if (node.data.type === "delay") {
        setLogs(prev => [...prev, ` -> Pausing thread for ${node.data.params.ms || 1000}ms`])
      }

      await new Promise(resolve => setTimeout(resolve, node.data.type === "delay" ? parseInt(node.data.params.ms || "2000") : 1500))

      // success status
      setNodes(prev => prev.map(n => n.id === node.id ? {
        ...n,
        data: { ...n.data, status: "success" }
      } : n))
      
      setLogs(prev => [...prev, `[Success] Step ${i + 1} finalized.`])
    }

    setIsExecuting(false)
    setLogs(prev => [...prev, `[Executor] All steps executed cleanly. 🎉`])
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        user={{ 
          name: session.user.name || "User", 
          email: session.user.email || "", 
          avatar: session.user.image || "" 
        }} 
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Workflow Canvas</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              size="sm" 
              onClick={simulateExecution} 
              disabled={isRunning}
              className="text-xs rounded-none gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 h-9"
            >
              <PlayCircleIcon className="size-4" />
              Run Workflow
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
            
            <div className="flex-1 overflow-y-auto min-h-0 p-4">
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_TILES.map((tile) => (
                  <Button
                    key={tile.name}
                    variant="outline"
                    size="sm"
                    onClick={() => addBlockNode(tile)}
                    className="gap-2 justify-start h-9 hover:border-primary/50 text-xs px-3 rounded-none w-full"
                  >
                    {tile.icon}
                    <span className="font-semibold truncate">{tile.name}</span>
                  </Button>
                ))}
              </div>
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
                }}
                className="w-full text-xs rounded-none h-9"
              >
                Clear All Canvas
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground font-medium">Console Log Output</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowLogs(!showLogs)}
                  className="h-7 text-[10px] rounded-none px-2.5 font-bold"
                >
                  {showLogs ? "Hide Console" : "Show Console"}
                </Button>
              </div>

              {/* Embedded Logger Console inside sidebar */}
              {showLogs && (
                <div className="shadow-md bg-black border border-neutral-800 text-green-400 font-mono text-[10px] w-full h-[150px] overflow-hidden flex flex-col rounded-none">
                  <div className="flex justify-between items-center px-3 py-1.5 border-b border-neutral-900 bg-neutral-950 shrink-0">
                    <span className="text-neutral-300 font-sans font-bold">Execution Logs</span>
                    <div className="flex size-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="p-3 overflow-y-auto flex-1 space-y-1 select-text scrollbar-thin">
                    {logs.length === 0 ? (
                      <span className="text-neutral-600 font-sans">Ready. Logs will render here...</span>
                    ) : (
                      logs.map((log, i) => (
                        <div key={i} className="leading-relaxed whitespace-pre-wrap break-all">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* React Flow Workspace */}
          <div className="flex-1 h-full relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
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
                  if (type === "trigger") return "#10b981"
                  if (type === "delay") return "#a855f7"
                  if (type === "ai") return "#7c3aed"
                  return "#3b82f6"
                }}
                className="!bg-card !border-border rounded-none"
              />
            </ReactFlow>

            {/* Premium Bottom Center AI Omni Box (Centered in Canvas) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-xl px-4">
              <div className="bg-card/95 border border-primary/20 shadow-xl backdrop-blur-md rounded-none overflow-hidden flex flex-col transition-all">
                
                {/* Expandable chat thread within the omni box itself when sidebar chat is closed */}
                {!isChatOpen && chatMessages.length > 1 && (
                  <div className="max-h-[300px] overflow-y-auto p-4 border-b border-border space-y-3 flex flex-col min-h-[100px] scrollbar-thin">
                    {chatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-2.5 max-w-[85%] ${
                          msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
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
                          <div className={`p-2.5 text-xs leading-relaxed rounded-none select-text ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground font-semibold' 
                              : 'bg-muted border border-border text-foreground font-medium whitespace-pre-wrap'
                          }`}>
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
                    {isChatStreaming && (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] pl-8">
                        <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="ml-1 font-medium italic">Streaming response...</span>
                      </div>
                    )}
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
          </div>

          {/* Canvas Embedded Right Sidebar (Push configuration panel) */}
          {isSheetOpen && (selectedNode || selectedEdge) && (
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
                <div className="relative flex-1 min-h-0 overflow-hidden">
                  <div className="absolute inset-0 overflow-y-auto p-6 space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Block Title</Label>
                    <Input 
                      value={selectedNode.data.label}
                      onChange={(e) => updateNodeData({ label: e.target.value })}
                      className="rounded-none text-xs h-9 font-semibold"
                    />
                  </div>

                {/* Trigger Fields */}
                {selectedNode.data.type === "trigger" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Webhook URL</Label>
                      <Input 
                        value={selectedNode.data.params.webhookUrl || selectedNode.data.params.url || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, webhookUrl: e.target.value, url: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trigger Event</Label>
                      <Input 
                        value={selectedNode.data.params.event || selectedNode.data.params.mode || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, event: e.target.value, mode: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="On Event Triggered"
                      />
                    </div>
                  </>
                )}

                {/* Click Selector Fields */}
                {selectedNode.data.type === "click" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Element Selector</Label>
                    <Input 
                      value={selectedNode.data.params.selector || ""}
                      onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, selector: e.target.value } })}
                      className="rounded-none text-xs h-9"
                      placeholder="button#submit"
                    />
                  </div>
                )}

                {/* Type Selector Fields */}
                {selectedNode.data.type === "type" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Element Selector</Label>
                      <Input 
                        value={selectedNode.data.params.selector || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, selector: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="input#q"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Text to Type</Label>
                      <Input 
                        value={selectedNode.data.params.text || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, text: e.target.value } })}
                        className="rounded-none text-xs h-9"
                        placeholder="Value to input..."
                      />
                    </div>
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

                {/* AI prompts */}
                {selectedNode.data.type === "ai" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI Instruction Prompt</Label>
                    <Textarea 
                      value={selectedNode.data.params.prompt || ""}
                      onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, prompt: e.target.value } })}
                      className="rounded-none text-xs min-h-[120px] resize-none"
                      placeholder="What should the AI do?"
                    />
                  </div>
                )}

                {/* Text Gen (AI) Fields */}
                {selectedNode.data.type === "text-gen" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI Prompt Instructions</Label>
                      <Textarea 
                        value={selectedNode.data.params.prompt || ""}
                        onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, prompt: e.target.value } })}
                        className="rounded-none text-xs min-h-[120px] resize-none"
                        placeholder="e.g. Translate the invoice body to Spanish..."
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
                  </>
                )}

                {/* Image Gen (AI) Fields */}
                {selectedNode.data.type === "image-gen" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Image Generation Prompt</Label>
                      <Textarea 
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

                {/* JSON Parse Fields */}
                {selectedNode.data.type === "json-parse" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">JSONPath Expression</Label>
                    <Input 
                      value={selectedNode.data.params.expression || ""}
                      onChange={(e) => updateNodeData({ params: { ...selectedNode.data.params, expression: e.target.value } })}
                      className="rounded-none text-xs h-9"
                      placeholder="$.data.invoice.total"
                    />
                  </div>
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
                      className={`flex flex-col space-y-1 max-w-[85%] ${
                      msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <div className={`p-3 text-xs leading-relaxed rounded-none select-text ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground font-semibold' 
                        : 'bg-muted border border-border text-foreground font-medium whitespace-pre-wrap'
                    }`}>
                      {msg.text || (
                        <span className="inline-flex gap-1 items-center font-bold text-primary/70 animate-pulse">
                          Streaming...
                        </span>
                      )}
                    </div>

                    {/* Apply JSON to Canvas Button when JSON is embedded */}
                    {msg.text.includes("```json") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          try {
                            const jsonMatch = msg.text.match(/```json\n([\s\S]+?)\n```/)
                            if (jsonMatch) {
                              const parsed = JSON.parse(jsonMatch[1])
                              if (parsed.nodes && parsed.edges) {
                                const loadedNodes = parsed.nodes.map((n: { id: string; type: string; position: { x: number; y: number }; data: { label: string; type: NodeType; params: Record<string, string> } }) => {
                                  let icon = <BrainCircuitIcon className="size-4 text-violet-500" />
                                  let color = "violet"
                                  if (n.data.type === "trigger") {
                                    icon = <ZapIcon className="size-4 text-emerald-500" />
                                    color = "emerald"
                                  } else if (n.data.type === "image-gen") {
                                    icon = <ImageIcon className="size-4 text-pink-500" />
                                    color = "pink"
                                  } else if (n.data.type === "http-request") {
                                    icon = <GlobeIcon className="size-4 text-blue-500" />
                                    color = "blue"
                                  } else if (n.data.type === "script") {
                                    icon = <Code2Icon className="size-4 text-rose-500" />
                                    color = "rose"
                                  } else if (n.data.type === "json-parse") {
                                    icon = <BracesIcon className="size-4 text-amber-500" />
                                    color = "amber"
                                  }
                                  return {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      icon,
                                      color,
                                      status: "idle"
                                    }
                                  }
                                })

                                const loadedEdges = parsed.edges.map((e: { id: string; source: string; target: string }) => ({
                                  ...e,
                                  markerEnd: { type: MarkerType.ArrowClosed },
                                  style: { strokeWidth: 2 },
                                  interactionWidth: 20
                                }))

                                setNodes(loadedNodes)
                                setEdges(loadedEdges)
                                setLogs(prev => [...prev, `[System] Successfully applied AI-generated JSON workflow to canvas! 🎉`])
                              }
                            }
                          } catch (err) {
                            console.error(err)
                          }
                        }}
                        className="mt-2 w-full text-[11px] font-bold h-8 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground flex gap-1 items-center justify-center"
                      >
                        <SparkleIcon className="size-3.5" />
                        Apply JSON to Canvas
                      </Button>
                    )}
                    </div>
                  ))}
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
      </SidebarInset>
    </SidebarProvider>
  )
}
