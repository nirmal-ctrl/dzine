import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions).catch(() => null);

    // Get parameters from body
    const { prompt, provider, modelId, activeNodes = [] } = await req.json();

    let model;
    
    // Default to Gemini as requested
    switch (provider) {
      case "openai":
        model = openai(modelId || "gpt-5.4-pro");
        break;
      case "claude":
        model = anthropic(modelId || "claude-sonnet-5");
        break;
      case "gemini":
      default:
        model = google(modelId || "gemini-3.5-flash");
        break;
      case "open-source":
        model = groq(modelId || "meta-llama/llama-4-scout-17b-16e-instruct");
        break;
      case "light-llm":
        model = groq(modelId || "gemma-3-12b-it"); // fallback for light-llm
        break;
    }

    // Check if the API key for the selected provider is missing
    const missingKeys = [];
    if (provider === "openai" && !process.env.OPENAI_API_KEY) missingKeys.push("OPENAI_API_KEY");
    if (provider === "claude" && !process.env.ANTHROPIC_API_KEY) missingKeys.push("ANTHROPIC_API_KEY");
    if (provider === "gemini" && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) missingKeys.push("GOOGLE_GENERATIVE_AI_API_KEY");
    if ((provider === "open-source" || provider === "light-llm") && !process.env.GROQ_API_KEY) missingKeys.push("GROQ_API_KEY");

    if (missingKeys.length > 0) {
      return NextResponse.json(
        { error: `Missing required API keys: ${missingKeys.join(", ")}. Please add them to your .env file.` },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an AI workflow assistant. You help users build node-based automated workflows.
The user might ask you to create a workflow, connect nodes, or answer questions.
If you suggest a workflow, output a JSON block wrapped in \`\`\`json containing { "nodes": [], "edges": [] }.
Nodes can be of types: 'trigger', 'text-gen', 'image-gen', 'http-request', 'script', 'json-parse'.
Valid node structure: { "id": "node-X", "type": "custom", "position": { "x": 100, "y": 150 }, "data": { "label": "Label", "type": "node_type", "params": {} } }
Edges connect nodes: { "id": "edge-1-2", "source": "node-1", "target": "node-2" }

Current active nodes on canvas:
${JSON.stringify(activeNodes, null, 2)}
`;

    const result = await streamText({
      model,
      system: systemPrompt,
      prompt: prompt,
    });

    // Custom Server-Sent Events (SSE) adapter to match the frontend expectations
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            // Send only the new delta/chunk instead of the full accumulated text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(customReadable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("AI Workflow Route Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
