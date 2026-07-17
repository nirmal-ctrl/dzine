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
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="o3-mini">o3 Mini</SelectItem>
                      <SelectItem value="o1-mini">o1 Mini</SelectItem>
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
                      <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</SelectItem>
                      <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
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
                      <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                      <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                      <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                      <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
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
                      <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 (70B) Versatile</SelectItem>
                      <SelectItem value="llama-3.1-8b-instant">Llama 3.1 (8B) Instant</SelectItem>
                      <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
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
