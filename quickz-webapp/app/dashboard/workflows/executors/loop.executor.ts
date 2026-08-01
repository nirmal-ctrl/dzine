// ─── Loop Executor ────────────────────────────────────────────────────────────
// Orchestrates iterating over an array — runs sub-nodes for each item in
// parallel or sequential mode. This is the most complex executor because it
// re-uses other executors recursively for sub-nodes.

import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData, LoopContext } from "../types/workflow.types"
import { getDownstreamNodes, getUpstreamNodeIds, topologicalSort } from "../engine/graph.utils"
import { resolveParams, resolveRawTemplate, resolveTemplate, cleanJsonString } from "../engine/template.engine"
import { applyOutputMapping } from "../engine/output.mapper"
import { evaluateCondition } from "../engine/condition.evaluator"
import { getExecutor } from "./executor.registry"

export class LoopExecutor implements INodeExecutor {
  readonly nodeType = "loop"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const {
      resolvedParams,
      nodeOutputs,
      allNodes,
      allEdges,
      nativeFetch,
      proxyUrl,
      setNodes,
      setLogs,
      showToast,
      processedNodeIds,
      loopInternalNodeIds,
      activeEdgeIds,
    } = ctx

    // ── Resolve the array ─────────────────────────────────────────────
    const directParentIds = allEdges
      .filter((e) => e.target === node.id)
      .map((e) => e.source)
    const upstreamOutput = directParentIds.length > 0
      ? nodeOutputs[directParentIds[0]]
      : (getUpstreamNodeIds(allEdges, node.id).length > 0
          ? nodeOutputs[getUpstreamNodeIds(allEdges, node.id)[0]]
          : null)

    const rawArrayPathVal = resolveRawTemplate(
      node.data.params.arrayPath || "",
      nodeOutputs,
      undefined,
      node.id,
      allEdges
    )

    let arrData: unknown[] | null = this.resolveArray(
      rawArrayPathVal,
      upstreamOutput,
      resolvedParams.arrayPath || "$.slides"
    )

    // Strict validation
    if (!arrData || !Array.isArray(arrData) || arrData.length === 0) {
      const errMsg = `Loop node "${node.data.label}" array path "${node.data.params.arrayPath || "$.slides"}" could not be resolved to a non-empty array from upstream output.`
      showToast(`Loop Execution Error: ${node.data.label}`, errMsg, "error")
      throw new Error(errMsg)
    }

    const itemName = resolvedParams.itemName || "slide"
    const loopMode = resolvedParams.mode || "parallel"
    const loopResults: unknown[] = []

    // Identify downstream loop-body nodes
    const downstreamAll = getDownstreamNodes(node.id, allNodes, allEdges)
    const downstreamNodes = downstreamAll.filter(
      (n) =>
        n.id !== node.id &&
        n.data.type !== "output" &&
        n.data.type !== "merge" &&
        n.type !== "group" &&
        n.data.type !== "group"
    )
    downstreamNodes.forEach((dn) => loopInternalNodeIds.add(dn.id))

    // Visual feedback for group node
    setNodes((prev) =>
      prev.map((n) =>
        n.type === "group"
          ? { ...n, data: { ...n.data, status: "running" as const } }
          : n
      )
    )

    // ── Shared iteration runner ───────────────────────────────────────
    const runIteration = async (item: unknown, idx: number) => {
      const loopCtx: LoopContext = { item, index: idx, itemName }
      const localNodeOutputs = { ...nodeOutputs }

      const subSorted = topologicalSort(downstreamNodes, allEdges)
      for (const subNode of subSorted) {
        if (subNode.type === "group") continue
        processedNodeIds.add(subNode.id)

        const subResolved = resolveParams(
          subNode.data.params,
          localNodeOutputs,
          loopCtx,
          subNode.id,
          allEdges
        )

        setNodes((prev) =>
          prev.map((n) =>
            n.id === subNode.id
              ? { ...n, data: { ...n.data, status: "running" as const } }
              : n
          )
        )

        const logId = Math.random().toString(36).substring(7)
        setLogs((prev) => [
          ...prev,
          {
            id: logId,
            nodeId: subNode.id,
            label: `${subNode.data.label} (Iter ${idx + 1})`,
            type: subNode.data.type,
            status: "running" as const,
            message: `[Loop iter ${idx + 1}] Executing...`,
          },
        ])

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const markSubNodeSuccess = (data: any) => {
          setLogs((prev) =>
            prev.map((log) =>
              log.id === logId ? { ...log, status: "success" as const, data } : log
            )
          )
        }

        try {
          // Execute the sub-node using the modular executor registry
          const subExecutor = getExecutor(subNode.data.type || "")
          if (subExecutor && subExecutor.execute) {
            const subCtx: ExecutionContext = {
              ...ctx,
              nodeOutputs: localNodeOutputs,
              resolvedParams: subResolved,
              loopCtx,
            }
            const res = await subExecutor.execute(subNode, subCtx)
            if (res !== undefined) {
              localNodeOutputs[subNode.id] = res
            }
          } else {
            localNodeOutputs[subNode.id] = { processed: true }
          }

          // Apply output mapping for sub-node
          if (
            localNodeOutputs[subNode.id] &&
            subResolved.outputMapping &&
            subResolved.outputMapping !== "[]"
          ) {
            localNodeOutputs[subNode.id] = applyOutputMapping(
              localNodeOutputs[subNode.id],
              subResolved.outputMapping,
              localNodeOutputs,
              loopCtx
            )
          }

          await new Promise((resolve) =>
            setTimeout(resolve, 300 + idx * 150)
          )
          setNodes((prev) =>
            prev.map((n) =>
              n.id === subNode.id
                ? { ...n, data: { ...n.data, status: "success" as const } }
                : n
            )
          )
          markSubNodeSuccess(localNodeOutputs[subNode.id])
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err)
          localNodeOutputs[subNode.id] = { error: errMsg }
          setNodes((prev) =>
            prev.map((n) =>
              n.id === subNode.id
                ? { ...n, data: { ...n.data, status: "error" as const } }
                : n
            )
          )
          setLogs((prev) =>
            prev.map((log) =>
              log.id === logId
                ? {
                    ...log,
                    status: "error" as const,
                    message: `${log.message}\n⚠️ Error: ${errMsg}`,
                    data: {
                      error: errMsg,
                      stack: err instanceof Error ? err.stack : undefined,
                    },
                  }
                : log
            )
          )
          showToast(
            `Loop Node Iteration Error (${subNode.data.label})`,
            `Iteration ${idx + 1} failed: ${errMsg}`,
            "error"
          )
          throw err
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 200))
      loopResults.push({
        index: idx,
        item,
        results: downstreamNodes
          .map((dn) => localNodeOutputs[dn.id])
          .filter(Boolean),
      })
    }

    // ── Execute iterations ────────────────────────────────────────────
    try {
      if (loopMode === "sequential") {
        for (let i = 0; i < arrData.length; i++) {
          await runIteration(arrData[i], i)
        }
      } else {
        await Promise.all(
          arrData.map((item, idx) => runIteration(item, idx))
        )
      }
    } finally {
      setNodes((prev) =>
        prev.map((n) =>
          n.type === "group"
            ? { ...n, data: { ...n.data, status: "idle" as const } }
            : n
        )
      )
    }

    // Activate outgoing edges from internal nodes to external
    downstreamNodes.forEach((dn) => {
      allEdges
        .filter((e) => e.source === dn.id)
        .forEach((e) => activeEdgeIds.add(e.id))
    })

    setLogs((prev) => [
      ...prev,
      {
        message: `[Loop complete] All ${loopResults.length} iterations executed in ${loopMode.toUpperCase()} mode.`,
        data: { iterations: loopResults.length, results: loopResults },
      },
    ])

    return { iterations: loopResults.length, results: loopResults }
  }

  // ── Array Resolution ────────────────────────────────────────────────

  private resolveArray(
    rawArrayPathVal: unknown,
    upstreamOutput: unknown,
    arrayPathParam: string
  ): unknown[] | null {
    if (Array.isArray(rawArrayPathVal)) return rawArrayPathVal

    if (
      typeof rawArrayPathVal === "number" &&
      !isNaN(rawArrayPathVal) &&
      rawArrayPathVal > 0
    ) {
      return Array.from(
        { length: Math.floor(rawArrayPathVal) },
        (_, i) => i + 1
      )
    }

    if (
      typeof rawArrayPathVal === "string" &&
      !isNaN(Number(rawArrayPathVal)) &&
      Number(rawArrayPathVal) > 0 &&
      rawArrayPathVal.trim() !== ""
    ) {
      return Array.from(
        { length: Math.floor(Number(rawArrayPathVal)) },
        (_, i) => i + 1
      )
    }

    // Try upstream output directly
    if (Array.isArray(upstreamOutput)) return upstreamOutput
    if (
      upstreamOutput &&
      typeof upstreamOutput === "object" &&
      Array.isArray((upstreamOutput as Record<string, unknown>).json)
    ) {
      return (upstreamOutput as Record<string, unknown>).json as unknown[]
    }
    if (
      upstreamOutput &&
      typeof upstreamOutput === "object" &&
      Array.isArray((upstreamOutput as Record<string, unknown>).data)
    ) {
      return (upstreamOutput as Record<string, unknown>).data as unknown[]
    }

    // JSONPath extraction
    const arrayPath = arrayPathParam
    if (
      !isNaN(Number(arrayPath)) &&
      Number(arrayPath) > 0 &&
      arrayPath.trim() !== ""
    ) {
      return Array.from(
        { length: Math.floor(Number(arrayPath)) },
        (_, i) => i + 1
      )
    }

    const pathParts = arrayPath
      .replace(/^\$\./, "")
      .split(".")
      .filter(Boolean)
    if (upstreamOutput && typeof upstreamOutput === "object") {
      let current: unknown = upstreamOutput
      if (
        current &&
        typeof current === "object" &&
        (current as Record<string, unknown>).json
      ) {
        current = (current as Record<string, unknown>).json
      }
      for (const part of pathParts) {
        if (current && typeof current === "object") {
          current = (current as Record<string, unknown>)[part]
        } else {
          current = undefined
        }
      }
      if (Array.isArray(current)) return current
      if (
        typeof current === "number" &&
        !isNaN(current) &&
        current > 0
      ) {
        return Array.from(
          { length: Math.floor(current) },
          (_, i) => i + 1
        )
      }
      if (
        typeof current === "string" &&
        !isNaN(Number(current)) &&
        Number(current) > 0
      ) {
        return Array.from(
          { length: Math.floor(Number(current)) },
          (_, i) => i + 1
        )
      }
    }

    return null
  }

  // ── Sub-node execution (duplicated logic that lives inside the loop) ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async executeSubNode(
    subNode: Node<NodeData>,
    subResolved: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    localNodeOutputs: Record<string, any>,
    loopCtx: LoopContext,
    allEdges: import("reactflow").Edge[],
    nativeFetch: typeof fetch,
    proxyUrl: string,
    item: unknown,
    idx: number
  ): Promise<unknown> {
    if (subNode.data.type === "llm") {
      return this.executeLlmSubNode(subResolved, nativeFetch, proxyUrl)
    }

    if (subNode.data.type === "image-gen") {
      return this.executeImageGenSubNode(subResolved, nativeFetch, proxyUrl)
    }

    if (subNode.data.type === "http-request") {
      return this.executeHttpSubNode(subResolved, nativeFetch, proxyUrl)
    }

    if (subNode.data.type === "script") {
      let scriptResult: unknown = { processed: true }
      if (subResolved.code) {
        // eslint-disable-next-line no-new-func
        const fn = new Function(
          "data",
          "nodeOutputs",
          "loopCtx",
          subResolved.code
        )
        const upstreamData = getUpstreamNodeIds(allEdges, subNode.id)
          .map((uid) => localNodeOutputs[uid])
          .filter(Boolean)
        scriptResult = fn(upstreamData, localNodeOutputs, loopCtx)
      }
      return scriptResult
    }

    if (subNode.data.type === "router") {
      const condition = subResolved.condition || "false"
      const result = evaluateCondition(condition)
      return { branch: result ? "true" : "false", evaluated: result }
    }

    if (subNode.data.type === "boolean") {
      const toBool = (v: unknown): boolean => {
        if (typeof v === "boolean") return v
        const s = String(v ?? "").trim().toLowerCase()
        return !(
          s === "" ||
          s === "false" ||
          s === "0" ||
          s === "null" ||
          s === "undefined" ||
          s === "nan"
        )
      }
      const op1 = toBool(subResolved.operand1)
      const op2 = toBool(subResolved.operand2)
      const operator = subResolved.operator || "AND"
      const result =
        operator === "NOT" ? !op1 : operator === "OR" ? op1 || op2 : op1 && op2
      return {
        result,
        operator,
        operand1: op1,
        ...(operator === "NOT" ? {} : { operand2: op2 }),
      }
    }

    if (subNode.data.type === "transform") {
      const mappingStr = subResolved.mapping || "{}"
      let mappingObj: Record<string, string> = {}
      try {
        const parsed = JSON.parse(mappingStr)
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
          mappingObj = parsed
      } catch {
        throw new Error(`Transform mapping is not valid JSON.`)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformed: Record<string, any> = {}
      for (const [key, tpl] of Object.entries(mappingObj)) {
        const resolvedVal = resolveTemplate(
          String(tpl),
          localNodeOutputs,
          loopCtx,
          subNode.id,
          allEdges
        )
        try {
          transformed[key] = JSON.parse(resolvedVal)
        } catch {
          transformed[key] = resolvedVal
        }
      }
      return transformed
    }

    if (subNode.data.type === "filter") {
      const conditionTemplate = subNode.data.params.condition || "true"
      const evaluated = resolveTemplate(
        conditionTemplate,
        localNodeOutputs,
        loopCtx,
        subNode.id,
        allEdges
      )
      const passed = evaluateCondition(evaluated)
      if (!passed) {
        throw new Error(
          `Filter condition "${conditionTemplate}" failed for iteration item ${idx + 1}`
        )
      }
      return { passed, item: passed ? item : null }
    }

    if (subNode.data.type === "output") {
      return { result: `Iteration ${idx + 1} output`, item }
    }

    // Default fallback for unknown sub-node types
    return { result: `Iteration ${idx + 1} output`, item }
  }

  // ── LLM sub-node (shared with main LLM executor) ───────────────────
  private async executeLlmSubNode(
    subResolved: Record<string, string>,
    nativeFetch: typeof fetch,
    proxyUrl: string
  ): Promise<unknown> {
    const provider = subResolved.provider || "openai"
    let model = subResolved.model || "gpt-4o-mini"

    // Fix model for provider
    const isKnown = Object.values(PROVIDER_MODELS)
      .flat()
      .some((m) => m.id === model)
    if (isKnown) {
      const defaults: Record<string, string> = {
        google: "gemini-2.5-flash",
        anthropic: "claude-3-5-sonnet-20241022",
        openai: "gpt-4o-mini",
        groq: "llama-3.3-70b-versatile",
        "open-source": "meta-llama/llama-3.1-405b-instruct",
      }
      const providerModels = PROVIDER_MODELS[provider]
      if (providerModels && !providerModels.some((m) => m.id === model)) {
        model = defaults[provider] || model
      }
    }

    const targetUrl =
      provider === "google"
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${subResolved.apiKey || ""}`
        : provider === "groq"
          ? "https://api.groq.com/openai/v1/chat/completions"
          : provider === "anthropic"
            ? "https://api.anthropic.com/v1/messages"
            : "https://api.openai.com/v1/chat/completions"

    const targetHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (subResolved.apiKey) {
      if (provider === "anthropic") {
        targetHeaders["x-api-key"] = subResolved.apiKey
        targetHeaders["anthropic-version"] = "2023-06-01"
        targetHeaders["anthropic-dangerous-direct-browser-access"] = "true"
      } else if (provider !== "google") {
        targetHeaders["Authorization"] = `Bearer ${subResolved.apiKey}`
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedSchema: any = undefined
    if (
      subResolved.jsonSchema &&
      subResolved.responseFormat === "json_object"
    ) {
      try {
        parsedSchema = JSON.parse(subResolved.jsonSchema)
      } catch {
        /* ignore */
      }
    }

    const payload =
      provider === "google"
        ? {
            contents: [
              { role: "user", parts: [{ text: subResolved.prompt }] },
            ],
            generationConfig: {
              temperature: Number(subResolved.temperature || 0.7),
              responseMimeType:
                subResolved.responseFormat === "json_object"
                  ? "application/json"
                  : undefined,
              ...(parsedSchema ? { responseSchema: parsedSchema } : {}),
            },
          }
        : {
            model,
            messages: [{ role: "user", content: subResolved.prompt }],
            temperature: Number(subResolved.temperature || 0.7),
            ...(provider === "anthropic"
              ? { max_tokens: 4096 }
              : {
                  response_format:
                    subResolved.responseFormat === "json_object"
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

    let content = ""
    if (provider === "anthropic") {
      content = json.content?.[0]?.text || ""
    } else if (provider === "google") {
      content = json.candidates?.[0]?.content?.parts?.[0]?.text || ""
    } else {
      content = json.choices?.[0]?.message?.content || ""
    }
    if (!content) {
      throw new Error(`Empty response from ${provider} model.`)
    }

    return subResolved.responseFormat === "json_object"
      ? JSON.parse(cleanJsonString(content))
      : { text: content }
  }

  // ── Image-gen sub-node ──────────────────────────────────────────────
  private async executeImageGenSubNode(
    subResolved: Record<string, string>,
    nativeFetch: typeof fetch,
    proxyUrl: string
  ): Promise<unknown> {
    let model = subResolved.model || "gemini-3.1-flash-image"
    if (model === "gemini-3-pro-image") model = "gemini-3-pro-image-preview"

    const numImages = parseInt(subResolved.numberOfImages || "1")
    const isImagen4 = model === "imagen-4.0-generate-001"

    let targetUrl: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any

    if (isImagen4) {
      targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${subResolved.apiKey || ""}`
      payload = {
        instances: [{ prompt: subResolved.prompt || "" }],
        parameters: {
          sampleCount: numImages,
          aspectRatio:
            subResolved.aspectRatio && subResolved.aspectRatio !== "auto"
              ? subResolved.aspectRatio
              : "1:1",
          personGeneration: subResolved.personGeneration || "dont_allow",
        },
      }
    } else {
      let combinedPrompt =
        "Generate an image strictly based on these instructions and reference images:\n\n" +
        (subResolved.prompt || "")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imageParts: any[] = []

      if (subResolved.referenceImage) {
        const refStr = subResolved.referenceImage
        const regex = /data:(image\/\w+);base64,([A-Za-z0-9+/]+={0,2})/g
        let lastIndex = 0
        let match
        while ((match = regex.exec(refStr)) !== null) {
          const textPart = refStr.slice(lastIndex, match.index).trim()
          if (textPart) combinedPrompt += "\n" + textPart
          imageParts.push({
            inlineData: {
              mimeType: match[1] || "image/png",
              data: match[2],
            },
          })
          lastIndex = regex.lastIndex
        }
        const rem = refStr.slice(lastIndex).trim()
        if (rem) combinedPrompt += "\n" + rem
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts: any[] = [{ text: combinedPrompt }, ...imageParts]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imageConfig: Record<string, any> = {}
      if (subResolved.aspectRatio && subResolved.aspectRatio !== "auto")
        imageConfig.aspectRatio = subResolved.aspectRatio
      if (subResolved.imageSize) imageConfig.imageSize = subResolved.imageSize

      targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${subResolved.apiKey || ""}`
      payload = {
        contents: [{ role: "user", parts }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          candidateCount: numImages,
          ...(Object.keys(imageConfig).length > 0 ? { imageConfig } : {}),
          ...(subResolved.temperature
            ? { temperature: parseFloat(subResolved.temperature) }
            : {}),
          ...(subResolved.topP
            ? { topP: parseFloat(subResolved.topP) }
            : {}),
        },
      }
    }

    const res = await nativeFetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: targetUrl,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      }),
    })

    const contentType = res.headers.get("content-type") || ""
    let generatedImageUrls: string[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let responseJson: any = null

    if (contentType.includes("application/json")) {
      responseJson = await res.json()
      if (!res.ok)
        throw new Error(
          responseJson.error?.message ||
            responseJson.error ||
            "Google Imagen API Error"
        )

      if (isImagen4) {
        if (!responseJson.predictions || responseJson.predictions.length === 0)
          throw new Error("No images were generated by the model")
        generatedImageUrls = responseJson.predictions
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) =>
            p.bytesBase64Encoded
              ? `data:${p.mimeType || "image/png"};base64,${p.bytesBase64Encoded}`
              : ""
          )
          .filter(Boolean)
      } else {
        if (
          !responseJson.candidates?.[0]?.content?.parts ||
          responseJson.candidates[0].content.parts.length === 0
        ) {
          let errReason = "No images were generated by the model"
          if (responseJson.candidates?.[0]?.finishReason)
            errReason += ` (Finish Reason: ${responseJson.candidates[0].finishReason})`
          if (responseJson.promptFeedback?.blockReason)
            errReason += ` (Prompt Blocked: ${responseJson.promptFeedback.blockReason})`
          throw new Error(errReason)
        }
        generatedImageUrls = responseJson.candidates[0].content.parts
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((p: any) => p.inlineData?.data)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (p: any) =>
              `data:${p.inlineData?.mimeType || "image/png"};base64,${p.inlineData?.data}`
          )
      }
    } else {
      const text = await res.text()
      if (!res.ok) throw new Error(text || "Google Imagen API Error")
      if (
        text.startsWith("image/") ||
        text.startsWith("data:image/") ||
        text.includes("base64")
      ) {
        let ct = text.trim()
        if (ct.startsWith("image/")) ct = "data:" + ct
        generatedImageUrls = [ct]
      } else {
        throw new Error(
          `Invalid non-JSON response from Imagen API: ${text.slice(0, 100)}`
        )
      }
    }

    if (generatedImageUrls.length === 0) {
      const textParts =
        responseJson?.candidates?.[0]?.content?.parts?.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p: any) => p.text
        ) || []
      if (textParts.length > 0) {
        throw new Error(
          `Model returned text instead of images: ${textParts
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((p: any) => p.text)
            .join(" ")
            .slice(0, 200)}`
        )
      }
      throw new Error(
        "No valid image data was returned by the Google Imagen API."
      )
    }

    return {
      imageUrl: generatedImageUrls[0],
      imageUrls: generatedImageUrls,
      aspectRatio: subResolved.aspectRatio || "1:1",
    }
  }

  // ── HTTP sub-node ───────────────────────────────────────────────────
  private async executeHttpSubNode(
    subResolved: Record<string, string>,
    nativeFetch: typeof fetch,
    proxyUrl: string
  ): Promise<unknown> {
    const method = subResolved.method || "GET"
    const url = subResolved.url || "https://api.example.com"
    let body: unknown = {}
    if (subResolved.body && subResolved.body !== "{}") {
      try {
        body = JSON.parse(subResolved.body)
      } catch {
        body = subResolved.body
      }
    }
    let customHeaders: Record<string, string> = {}
    if (subResolved.headers && subResolved.headers !== "{}") {
      try {
        customHeaders = JSON.parse(subResolved.headers)
      } catch {
        /* ignore */
      }
    }
    const res = await nativeFetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        method,
        headers: { "Content-Type": "application/json", ...customHeaders },
        body,
      }),
    })
    const ct = res.headers.get("content-type") || ""
    let data
    if (ct.includes("application/json")) data = await res.json()
    else data = await res.text()
    if (!res.ok)
      throw new Error(typeof data === "string" ? data : JSON.stringify(data))
    return { status: res.status, data }
  }
}

