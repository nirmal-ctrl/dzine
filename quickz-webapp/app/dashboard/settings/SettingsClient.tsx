"use client"

import { useAiSettings, AiProvider } from "@/hooks/use-ai-settings"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { BrainCircuitIcon } from "lucide-react"

interface SettingsClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
}

export function SettingsClient({ session }: SettingsClientProps) {
  const { settings, updateSettings, updateModel, isLoaded } = useAiSettings()

  if (!isLoaded) return null

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
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ThemeToggle />
        </header>

        <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Settings</h1>
            <p className="text-muted-foreground mt-2">
              Configure your default AI providers and models for workflow execution.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuitIcon className="size-5 text-primary" />
                Default AI Provider
              </CardTitle>
              <CardDescription>
                Select which AI provider handles your workflows by default.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-sm">
                <Label>Active Provider</Label>
                <Select 
                  value={settings.activeProvider} 
                  onValueChange={(val) => updateSettings({ activeProvider: val as AiProvider })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="claude">Anthropic (Claude)</SelectItem>
                    <SelectItem value="gemini">Google (Gemini)</SelectItem>
                    <SelectItem value="open-source">Open Source (Llama)</SelectItem>
                    <SelectItem value="light-llm">Light LLM (Gemma)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Provider Models</CardTitle>
              <CardDescription>
                Configure the specific model to use for each provider.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {settings.activeProvider === "openai" && (
                <div className="space-y-2 max-w-sm">
                  <Label>OpenAI Model</Label>
                  <Select 
                    value={settings.models.openai} 
                    onValueChange={(val) => updateModel("openai", val as string)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select OpenAI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-5.6-luna">GPT-5.6 Luna</SelectItem>
                      <SelectItem value="gpt-5.4-pro">GPT-5.4 Pro</SelectItem>
                      <SelectItem value="gpt-5">GPT-5</SelectItem>
                      <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
                      <SelectItem value="o4-mini">o4 Mini</SelectItem>
                      <SelectItem value="o3">o3</SelectItem>
                      <SelectItem value="o1">o1</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {settings.activeProvider === "claude" && (
                <div className="space-y-2 max-w-sm">
                  <Label>Anthropic Model</Label>
                  <Select 
                    value={settings.models.claude} 
                    onValueChange={(val) => updateModel("claude", val as string)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Claude model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-sonnet-5">Claude 5 Sonnet</SelectItem>
                      <SelectItem value="claude-fable-5">Claude 5 Fable</SelectItem>
                      <SelectItem value="claude-opus-4-0">Claude 4 Opus</SelectItem>
                      <SelectItem value="claude-sonnet-4-5">Claude 4.5 Sonnet</SelectItem>
                      <SelectItem value="claude-haiku-4-5">Claude 4.5 Haiku</SelectItem>
                      <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {settings.activeProvider === "gemini" && (
                <div className="space-y-2 max-w-sm">
                  <Label>Google Model</Label>
                  <Select 
                    value={settings.models.gemini} 
                    onValueChange={(val) => updateModel("gemini", val as string)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gemini model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-3.5-flash">Gemini 3.5 Flash</SelectItem>
                      <SelectItem value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Preview)</SelectItem>
                      <SelectItem value="gemini-3-pro-preview">Gemini 3.0 Pro (Preview)</SelectItem>
                      <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                      <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                      <SelectItem value="gemini-1.5-pro-latest">Gemini 1.5 Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {settings.activeProvider === "open-source" && (
                <div className="space-y-2 max-w-sm">
                  <Label>Open Source Model (Groq)</Label>
                  <Select 
                    value={settings.models["open-source"]} 
                    onValueChange={(val) => updateModel("open-source", val as string)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Open Source model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meta-llama/llama-4-scout-17b-16e-instruct">Llama 4 Scout (17B)</SelectItem>
                      <SelectItem value="deepseek-r1-distill-llama-70b">DeepSeek R1 (Distill Llama 70B)</SelectItem>
                      <SelectItem value="qwen/qwen3-32b">Qwen 3 (32B)</SelectItem>
                      <SelectItem value="openai/gpt-oss-120b">GPT OSS (120B)</SelectItem>
                      <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 (70B) Versatile</SelectItem>
                      <SelectItem value="llama-3.1-8b-instant">Llama 3.1 (8B) Instant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {settings.activeProvider === "light-llm" && (
                <div className="space-y-2 max-w-sm">
                  <Label>Light LLM (Groq)</Label>
                  <Select 
                    value={settings.models["light-llm"]} 
                    onValueChange={(val) => updateModel("light-llm", val as string)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Light LLM model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemma-3-27b-it">Gemma 3 (27B)</SelectItem>
                      <SelectItem value="gemma-3-12b-it">Gemma 3 (12B)</SelectItem>
                      <SelectItem value="gemma2-9b-it">Gemma 2 (9B)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

            </CardContent>
          </Card>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
