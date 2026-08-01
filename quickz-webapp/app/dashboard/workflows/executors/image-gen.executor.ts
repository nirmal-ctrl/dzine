// ─── Image Gen Executor ───────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"

export class ImageGenExecutor implements INodeExecutor {
  readonly nodeType = "image-gen"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const { resolvedParams, nativeFetch, proxyUrl } = ctx

    let model = resolvedParams.model || "gemini-3.1-flash-image"
    if (model === "gemini-3-pro-image") model = "gemini-3-pro-image-preview"

    const numImages = parseInt(resolvedParams.numberOfImages || "1")
    const isImagen4 = model === "imagen-4.0-generate-001"

    const { targetUrl, payload } = this.buildRequest(model, isImagen4, numImages, resolvedParams)

    console.log(`[Image Gen Node] Execution started for node ${node.id}`)

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
          responseJson.error?.message || responseJson.error || "Google Imagen API Error"
        )

      generatedImageUrls = isImagen4
        ? this.parseImagen4Response(responseJson)
        : this.parseGeminiResponse(responseJson)
    } else {
      const text = await res.text()
      if (!res.ok) throw new Error(text || "Google Imagen API Error")

      if (
        text.startsWith("image/") ||
        text.startsWith("data:image/") ||
        text.includes("base64")
      ) {
        let cleanedText = text.trim()
        if (cleanedText.startsWith("image/")) {
          cleanedText = "data:" + cleanedText
        }
        generatedImageUrls = [cleanedText]
      } else {
        throw new Error(
          `Invalid non-JSON response from Imagen API: ${text.slice(0, 100)}`
        )
      }
    }

    if (generatedImageUrls.length === 0) {
      const textParts =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responseJson?.candidates?.[0]?.content?.parts?.filter((p: any) => p.text) || []
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
        "No valid image data found in response. The model may not support image generation or the prompt was blocked."
      )
    }

    return {
      imageUrl: generatedImageUrls[0],
      imageUrls: generatedImageUrls,
      aspectRatio: resolvedParams.aspectRatio || "1:1",
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private buildRequest(
    model: string,
    isImagen4: boolean,
    numImages: number,
    resolvedParams: Record<string, string>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): { targetUrl: string; payload: any } {
    if (isImagen4) {
      return {
        targetUrl: `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${resolvedParams.apiKey || ""}`,
        payload: {
          instances: [{ prompt: resolvedParams.prompt || "" }],
          parameters: {
            sampleCount: numImages,
            aspectRatio:
              resolvedParams.aspectRatio && resolvedParams.aspectRatio !== "auto"
                ? resolvedParams.aspectRatio
                : "1:1",
            personGeneration: resolvedParams.personGeneration || "dont_allow",
          },
        },
      }
    }

    // Gemini model schema
    let combinedPrompt =
      "Generate an image strictly based on these instructions and reference images:\n\n" +
      (resolvedParams.prompt || "")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageParts: any[] = []

    if (resolvedParams.referenceImage) {
      const refStr = resolvedParams.referenceImage
      const regex = /data:(image\/\w+);base64,([A-Za-z0-9+/]+={0,2})/g
      let lastIndex = 0
      let match
      while ((match = regex.exec(refStr)) !== null) {
        const textPart = refStr.slice(lastIndex, match.index).trim()
        if (textPart) {
          combinedPrompt += (combinedPrompt ? "\n" : "") + textPart
        }
        imageParts.push({
          inlineData: {
            mimeType: match[1] || "image/png",
            data: match[2],
          },
        })
        lastIndex = regex.lastIndex
      }
      const remainingText = refStr.slice(lastIndex).trim()
      if (remainingText) {
        combinedPrompt += (combinedPrompt ? "\n" : "") + remainingText
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = [{ text: combinedPrompt }]
    parts.push(...imageParts)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageConfig: Record<string, any> = {}
    if (resolvedParams.aspectRatio && resolvedParams.aspectRatio !== "auto") {
      imageConfig.aspectRatio = resolvedParams.aspectRatio
    }
    if (resolvedParams.imageSize) {
      imageConfig.imageSize = resolvedParams.imageSize
    }

    return {
      targetUrl: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${resolvedParams.apiKey || ""}`,
      payload: {
        contents: [{ role: "user", parts }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          candidateCount: numImages,
          ...(Object.keys(imageConfig).length > 0 ? { imageConfig } : {}),
          ...(resolvedParams.temperature
            ? { temperature: parseFloat(resolvedParams.temperature) }
            : {}),
          ...(resolvedParams.topP
            ? { topP: parseFloat(resolvedParams.topP) }
            : {}),
        },
      },
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseImagen4Response(json: any): string[] {
    if (!json.predictions || json.predictions.length === 0) {
      throw new Error("No images were generated by the model")
    }
    return json.predictions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => {
        if (p.bytesBase64Encoded)
          return `data:${p.mimeType || "image/png"};base64,${p.bytesBase64Encoded}`
        return ""
      })
      .filter(Boolean)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseGeminiResponse(json: any): string[] {
    if (
      !json.candidates?.[0]?.content?.parts ||
      json.candidates[0].content.parts.length === 0
    ) {
      let errReason = "No images were generated by the model"
      if (json.candidates?.[0]?.finishReason) {
        errReason += ` (Finish Reason: ${json.candidates[0].finishReason})`
      }
      if (json.promptFeedback?.blockReason) {
        errReason += ` (Prompt Blocked: ${json.promptFeedback.blockReason})`
      }
      throw new Error(errReason)
    }
    return json.candidates[0].content.parts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((part: any) => part.inlineData && part.inlineData.data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (part: any) =>
          `data:${part.inlineData?.mimeType || "image/png"};base64,${part.inlineData?.data}`
      )
  }
}
