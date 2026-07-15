"use client"

import * as React from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  PlayIcon, 
  MousePointerClickIcon, 
  KeyboardIcon, 
  ClockIcon, 
  SparklesIcon, 
  Code2Icon, 
  ArrowRightIcon,
  HelpCircleIcon,
  ImageIcon, 
  BrainCircuitIcon, 
  BracesIcon, 
  GlobeIcon, 
  ZapIcon
} from "lucide-react"

interface BlocksGuideClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
}

const BLOCKS_GUIDE = [
  {
    name: "Trigger (Event)",
    description: "The starting webhook or trigger event for every automated workflow sequence.",
    icon: <ZapIcon className="size-6 text-emerald-500" />,
    color: "emerald",
    inputs: [
      { name: "Webhook URL", description: "The secure target endpoint listening for event payloads." },
      { name: "Trigger Event", description: "Specific topic to filter (e.g. 'On Order Paid', 'User Registered')." }
    ],
    useCase: "Simulating webhooks, scheduling automated runs, or kicking off sequences instantly when an external system triggers."
  },
  {
    name: "Text Gen (AI)",
    description: "Leverages cutting edge AI models (GPT-4o, Claude 3.5 Sonnet) to reason and generate text.",
    icon: <BrainCircuitIcon className="size-6 text-violet-500" />,
    color: "violet",
    inputs: [
      { name: "Model Choice", description: "Select the LLM model used for the execution." },
      { name: "AI Prompt Instructions", description: "Directives telling the AI exactly how to synthesize or translate the text." },
      { name: "Temperature", description: "Controls randomness / creativity of text output." }
    ],
    useCase: "Translating incoming invoices, writing automated replies, drafting email newsletters, or answering Q&As."
  },
  {
    name: "Image Gen (AI)",
    description: "Utilizes advanced latent diffusion models to generate images dynamically from prompts.",
    icon: <ImageIcon className="size-6 text-pink-500" />,
    color: "pink",
    inputs: [
      { name: "Image Prompt", description: "Description of the visual elements to create." },
      { name: "Aspect Ratio", description: "Target aspect ratio (1:1, 16:9, etc.)." },
      { name: "Visual Style", description: "Apply cinematic, anime, photographic, or minimalist themes." }
    ],
    useCase: "Generating blog banner pictures, producing corporate branding, creating mascot ideas, or prototyping design styles."
  },
  {
    name: "HTTP Request",
    description: "An n8n-style integration node to communicate with external APIs and systems.",
    icon: <GlobeIcon className="size-6 text-blue-500" />,
    color: "blue",
    inputs: [
      { name: "Target URL", description: "API Endpoint URL." },
      { name: "HTTP Method", description: "Standard HTTP request method (GET, POST, PUT, DELETE)." },
      { name: "JSON Request Body", description: "Dynamic JSON payload body to deliver." }
    ],
    useCase: "Sending Slack notices, updating CRM rows, publishing database entries, or querying third-party APIs."
  },
  {
    name: "Custom JS",
    description: "Executes customized JavaScript code to format, process, and transform input nodes.",
    icon: <Code2Icon className="size-6 text-rose-500" />,
    color: "rose",
    inputs: [
      { name: "Custom JavaScript", description: "Sandboxed JavaScript script to map parameters." }
    ],
    useCase: "Merging lists, converting currencies, injecting custom dates, or sanitizing complex structures."
  },
  {
    name: "JSON Parse",
    description: "Parses complex JSON outputs using standardized JSONPath query syntax.",
    icon: <BracesIcon className="size-6 text-amber-500" />,
    color: "amber",
    inputs: [
      { name: "JSONPath Expression", description: "Target selector filter (e.g. $.data.invoice.total)." }
    ],
    useCase: "Extracting specific variables, checking statuses, or filtering out nested list contents."
  }
]

export function BlocksGuideClient({ session }: BlocksGuideClientProps) {
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
                  <BreadcrumbPage>Building Blocks Directory</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 bg-muted/10 flex flex-col gap-6">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Automation Building Blocks</h1>
              <p className="text-sm text-muted-foreground mt-1">Explore all premium modular tiles available in your Quickz automation toolset.</p>
            </div>
            <Link href="/dashboard/workflows">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm gap-2">
                Go to Workflow Editor
                <ArrowRightIcon className="size-4" />
              </Button>
            </Link>
          </div>

          {/* Tiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOCKS_GUIDE.map((block) => (
              <Card key={block.name} className="flex flex-col h-full hover:border-primary/30 transition-all hover:shadow-md group">
                <CardHeader className="flex flex-row items-start gap-4 p-6">
                  <div className={`p-3 rounded-xl bg-muted group-hover:scale-105 transition-transform flex items-center justify-center`}>
                    {block.icon}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-foreground leading-snug">{block.name}</CardTitle>
                    <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-muted text-muted-foreground">
                      {block.color} block
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 px-6 pb-6 pt-0 flex flex-col justify-between gap-4">
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">{block.description}</p>
                    
                    {/* Inputs parameters */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <HelpCircleIcon className="size-3 text-muted-foreground" />
                        Parameters
                      </h4>
                      <div className="grid gap-2 border bg-muted/10 rounded-lg p-3">
                        {block.inputs.map((input) => (
                          <div key={input.name} className="text-xs">
                            <span className="font-bold text-foreground">{input.name}:</span>{" "}
                            <span className="text-muted-foreground text-[11px]">{input.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div className="border-t pt-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Standard Use Case</h5>
                    <p className="text-xs font-semibold text-foreground font-sans leading-normal italic">
                      &ldquo;{block.useCase}&rdquo;
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
