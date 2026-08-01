// ─── LLM Executor ─────────────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"
import { PROVIDER_MODELS } from "../constants/workflow.constants"
import { cleanJsonString } from "../engine/template.engine"
import { applyOutputMapping } from "../engine/output.mapper"

export class LlmExecutor implements INodeExecutor {
  readonly nodeType = "llm"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const { resolvedParams, nativeFetch, proxyUrl, nodeOutputs } = ctx
    const provider = resolvedParams.provider || "openai"
    let model = resolvedParams.model || "gpt-4o-mini"

    // Ensure the model belongs to the selected provider
    model = this.fixModelForProvider(provider, model)

    const { targetUrl, targetHeaders, payload } = this.buildRequest(provider, model, resolvedParams)

    const res = await nativeFetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: targetUrl,
        method: "POST",
        headers: targetHeaders,
        body: payload,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      const errDetail =
        typeof json.error === "object" && json.error !== null
          ? json.error.message || JSON.stringify(json.error)
          : json.error || "LLM API Error"
      throw new Error(errDetail)
    }

    const content = this.extractContent(provider, json)
    if (!content) {
      throw new Error(`Empty response from ${provider} model.`)
    }

    let output: unknown
    if (resolvedParams.responseFormat === "json_object") {
      const parsedJson = JSON.parse(cleanJsonString(content))
      output = { json: parsedJson }
    } else {
      output = { text: content }
    }

    // Apply output mapping
    if (resolvedParams.outputMapping && resolvedParams.outputMapping !== "[]") {
      output = applyOutputMapping(output, resolvedParams.outputMapping, nodeOutputs)
    }

    return output
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private fixModelForProvider(provider: string, model: string): string {
    const isKnown = Object.values(PROVIDER_MODELS)
      .flat()
      .some((m) => m.id === model)
    if (!isKnown) return model

    const providerModels = PROVIDER_MODELS[provider]
    if (providerModels && !providerModels.some((m) => m.id === model)) {
      // Model doesn't belong to this provider — use default
      const defaults: Record<string, string> = {
        google: "gemini-2.5-flash",
        anthropic: "claude-3-5-sonnet-20241022",
        openai: "gpt-4o-mini",
        groq: "llama-3.3-70b-versatile",
        "open-source": "meta-llama/llama-3.1-405b-instruct",
      }
      return defaults[provider] || model
    }
    return model
  }

  private buildRequest(
    provider: string,
    model: string,
    resolvedParams: Record<string, string>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): { targetUrl: string; targetHeaders: Record<string, string>; payload: any } {
    const targetUrl =
      provider === "google"
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${resolvedParams.apiKey || ""}`
        : provider === "groq"
          ? "https://api.groq.com/openai/v1/chat/completions"
          : provider === "anthropic"
            ? "https://api.anthropic.com/v1/messages"
            : "https://api.openai.com/v1/chat/completions"

    const targetHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (resolvedParams.apiKey) {
      if (provider === "anthropic") {
        targetHeaders["x-api-key"] = resolvedParams.apiKey
        targetHeaders["anthropic-version"] = "2023-06-01"
        targetHeaders["anthropic-dangerous-direct-browser-access"] = "true"
      } else if (provider !== "google") {
        targetHeaders["Authorization"] = `Bearer ${resolvedParams.apiKey}`
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedSchema: any = undefined
    if (
      resolvedParams.jsonSchema &&
      resolvedParams.responseFormat === "json_object"
    ) {
      try {
        parsedSchema = JSON.parse(resolvedParams.jsonSchema)
      } catch {
        /* ignore bad schema */
      }
    }

    const payload =
      provider === "google"
        ? {
            contents: [
              { role: "user", parts: [{ text: resolvedParams.prompt }] },
            ],
            generationConfig: {
              temperature: Number(resolvedParams.temperature || 0.7),
              responseMimeType:
                resolvedParams.responseFormat === "json_object"
                  ? "application/json"
                  : undefined,
              ...(parsedSchema ? { responseSchema: parsedSchema } : {}),
            },
          }
        : {
            model,
            messages: [{ role: "user", content: resolvedParams.prompt }],
            temperature: Number(resolvedParams.temperature || 0.7),
            ...(provider === "anthropic"
              ? { max_tokens: 4096 }
              : {
                  response_format:
                    resolvedParams.responseFormat === "json_object"
                      ? parsedSchema
                        ? {
                            type: "json_schema",
                            json_schema: {
                              name: "structured_output",
                              schema: parsedSchema,
                            },
                          }
                        : { type: "json_object" }
                      : undefined,
                }),
          }

    return { targetUrl, targetHeaders, payload }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractContent(provider: string, json: any): string {
    if (provider === "anthropic") {
      return json.content?.[0]?.text || ""
    }
    if (provider === "google") {
      return json.candidates?.[0]?.content?.parts?.[0]?.text || ""
    }
    return json.choices?.[0]?.message?.content || ""
  }
}
