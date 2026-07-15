import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions).catch(() => null);

    // Get parameters from body
    const { prompt, provider, activeNodes = [] } = await req.json();
    const lowerPrompt = (prompt || "").toLowerCase();

    // Determine the responses based on provider and prompt
    let personalityPrefix = "";
    let personalitySuffix = "";
    let providerName = "";

    if (provider === "openai") {
      providerName = "OpenAI GPT-4o";
      personalityPrefix = "As OpenAI GPT-4o, an advanced and authoritative orchestration engine, I have analyzed your requested automation structure. Let's build a highly reliable, industry-standard deployment.\n\n";
      personalitySuffix = "\n\nThis workflow is optimized for execution efficiency. Let me know if you would like me to adjust any parameters!";
    } else if (provider === "claude") {
      providerName = "Anthropic Claude 3.5 Sonnet";
      personalityPrefix = "Hello. It is a pleasure to design this for you. As Claude 3.5 Sonnet, I have analyzed the dependencies and structural requirements of your system to formulate a clean, modular solution.\n\n";
      personalitySuffix = "\n\nI hope this comprehensive structure aligns with your design goals. Let me know if we should refine the scripts or variables.";
    } else if (provider === "gemini") {
      providerName = "Google Gemini 1.5 Pro";
      personalityPrefix = "Hey there! Gemini 1.5 Pro is super thrilled to design this workspace with you! 🚀 Let's craft an incredibly creative and powerful automated workflow! ✨\n\n";
      personalitySuffix = "\n\nWoohoo! Click 'Apply JSON to Canvas' to see it come to life! Let me know if you want to add more cool integrations! 🌟";
    } else if (provider === "open-source") {
      providerName = "Meta Llama 3.1";
      personalityPrefix = "This is Llama 3.1, a robust open-source foundation model. I have structured a highly performant, standard-compliant layout schema suitable for containerized microservices and API gateways.\n\n";
      personalitySuffix = "\n\nThis configuration offers maximum flexibility and zero lock-in.";
    } else {
      providerName = "Banana Nano Flash";
      personalityPrefix = "BEEP BOOP! 🍌 Banana Nano in the house, peeling back complexity at light speed! FAST AND FRUITY! 🐒 Let's get this banana rolling!\n\n";
      personalitySuffix = "\n\nBOOM! Done! ZOOM ZOOM! 🍌🚀 Drop more commands if you've got them!";
    }

    const isWorkflowGen =
      lowerPrompt.includes("build workflow") ||
      lowerPrompt.includes("build image gen sequence") ||
      lowerPrompt.includes("generate workflow");

    let responseBody = "";

    if (isWorkflowGen) {
      const isImage = lowerPrompt.includes("image") || lowerPrompt.includes("draw") || lowerPrompt.includes("picture");
      
      let nodes = [];
      let edges = [];

      if (isImage) {
        nodes = [
          {
            id: "node-1",
            type: "custom",
            position: { x: 100, y: 150 },
            data: {
              label: "Webhook Image Trigger",
              type: "trigger",
              params: {
                webhookUrl: "https://api.quickz.ai/v1/webhook/image-trigger",
                event: "On Image Requested"
              }
            }
          },
          {
            id: "node-2",
            type: "custom",
            position: { x: 420, y: 150 },
            data: {
              label: "Imagen 4.0 Generator",
              type: "image-gen",
              params: {
                prompt: "A beautiful sci-fi city with floating cars and neon purple holograms",
                model: "imagen-4.0",
                aspectRatio: "16:9",
                numberOfImages: "1"
              }
            }
          },
          {
            id: "node-3",
            type: "custom",
            position: { x: 740, y: 150 },
            data: {
              label: "Format Result Script",
              type: "script",
              params: {
                code: "return items.map(img => ({ ...img, status: 'processed', cdnUrl: img.url }));"
              }
            }
          },
          {
            id: "node-4",
            type: "custom",
            position: { x: 1060, y: 150 },
            data: {
              label: "Dispatch Image to Discord",
              type: "http-request",
              params: {
                url: "https://discord.com/api/webhooks/image-channel",
                method: "POST",
                body: "{ \"content\": \"New AI Art processed successfully!\", \"embeds\": [{ \"image\": { \"url\": \"$.nodes.node-3.cdnUrl\" } }] }"
              }
            }
          }
        ];

        edges = [
          { id: "edge-1-2", source: "node-1", target: "node-2" },
          { id: "edge-2-3", source: "node-2", target: "node-3" },
          { id: "edge-3-4", source: "node-3", target: "node-4" }
        ];
      } else {
        nodes = [
          {
            id: "node-1",
            type: "custom",
            position: { x: 100, y: 150 },
            data: {
              label: "SaaS Checkout Webhook",
              type: "trigger",
              params: {
                webhookUrl: "https://api.quickz.ai/v1/checkout",
                event: "customer.subscription.created"
              }
            }
          },
          {
            id: "node-2",
            type: "custom",
            position: { x: 420, y: 150 },
            data: {
              label: "GPT-4o French Summarizer",
              type: "text-gen",
              params: {
                prompt: "Draft a French welcome email summaries for this billing customer.",
                model: "gpt-4o",
                temperature: "0.7"
              }
            }
          },
          {
            id: "node-3",
            type: "custom",
            position: { x: 740, y: 150 },
            data: {
              label: "JSON payload parser",
              type: "json-parse",
              params: {
                expression: "$.customer.email"
              }
            }
          },
          {
            id: "node-4",
            type: "custom",
            position: { x: 1060, y: 150 },
            data: {
              label: "Send Inbound Notification",
              type: "http-request",
              params: {
                url: "https://api.sendgrid.com/v3/mail/send",
                method: "POST",
                body: "{ \"personalizations\": [{ \"to\": [{ \"email\": \"$.nodes.node-3\" }] }], \"subject\": \"Bienvenue!\" }"
              }
            }
          }
        ];

        edges = [
          { id: "edge-1-2", source: "node-1", target: "node-2" },
          { id: "edge-2-3", source: "node-2", target: "node-3" },
          { id: "edge-3-4", source: "node-3", target: "node-4" }
        ];
      }

      const workflowJson = JSON.stringify({ nodes, edges }, null, 2);

      responseBody = `${personalityPrefix}I have successfully created an automated workflow schema matching your specifications!

Here is the structured JSON workflow design:

\`\`\`json
${workflowJson}
\`\`\`

You can apply these nodes and connections directly to your workflow visual workspace by clicking the **"Apply JSON to Canvas"** button below.${personalitySuffix}`;
    } else if (lowerPrompt.includes("add") || lowerPrompt.includes("create") || lowerPrompt.includes("generate") || lowerPrompt.includes("insert")) {
      const type = lowerPrompt.includes("image") ? "image-gen" : lowerPrompt.includes("webhook") || lowerPrompt.includes("trigger") ? "trigger" : "text-gen";
      const label = type === "image-gen" ? "Image Gen (AI)" : type === "trigger" ? "Trigger (Event)" : "Text Gen (AI)";

      responseBody = `${personalityPrefix}I have added a new **${label}** node to the active canvas workspace. It is automatically connected to the end of your workflow and is fully configurable.${personalitySuffix}`;
    } else {
      responseBody = `${personalityPrefix}I am currently running inside a high-performance routed AI session. Here is a quick reference of the triggers you can run on the canvas:
- Type *"build workflow"* to lay out an automated SaaS sequence.
- Type *"build image gen sequence"* to construct a photorealistic creative system.
- Or say *"add an image node"* or *"connect node-1 to node-2"* to directly command me.${personalitySuffix}`;
    }

    // Set up response streaming (using Server-Sent Events / SSE style)
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        // Stream word by word with a slight delay to simulate a real streaming LLM
        const words = responseBody.split(" ");
        let wordBuffer = "";
        
        for (let i = 0; i < words.length; i++) {
          wordBuffer += (i === 0 ? "" : " ") + words[i];
          // Every few words, or at the end, stream a chunk
          if (i % 2 === 0 || i === words.length - 1) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: wordBuffer })}\n\n`));
            await new Promise((resolve) => setTimeout(resolve, 30));
          }
        }
        controller.close();
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
