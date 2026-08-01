// ─── HTTP Request Executor ────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"

export class HttpRequestExecutor implements INodeExecutor {
  readonly nodeType = "http-request"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const { resolvedParams, nativeFetch, proxyUrl } = ctx
    const method = resolvedParams.method || "GET"
    const url = resolvedParams.url || "https://api.example.com"
    let body: unknown = {}
    if (resolvedParams.body && resolvedParams.body !== "{}") {
      try {
        body = JSON.parse(resolvedParams.body)
      } catch {
        body = resolvedParams.body
      }
    }

    let customHeaders: Record<string, string> = {}
    if (resolvedParams.headers && resolvedParams.headers !== "{}") {
      try {
        customHeaders = JSON.parse(resolvedParams.headers)
      } catch {
        /* ignore bad json */
      }
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)
    let res: Response
    try {
      res = await nativeFetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          method,
          headers: { "Content-Type": "application/json", ...customHeaders },
          body,
        }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    const contentType = res.headers.get("content-type") || ""
    let data
    if (contentType.includes("application/json")) {
      data = await res.json()
    } else {
      data = await res.text()
    }

    if (!res.ok) {
      throw new Error(typeof data === "string" ? data : JSON.stringify(data))
    }

    return { status: res.status, data }
  }
}
