import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY environment variable." }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const { prompt, activeNodes = [] } = await req.json();

    const systemPrompt = `You are a workflow builder assistant. The user will describe a workflow in natural language and you will return a JSON object representing that workflow.

## Node types available

| type | purpose | config keys |
| :--- | :--- | :--- |
| trigger | Entry point (event or webhook) | webhookUrl, event, contentType (application/json, multipart/form-data, text/plain, image/png, application/xml), inputSchema (JSON Schema, optional) |
| llm | LLM generation block | provider (openai/anthropic/google/groq), model, apiKey, prompt ({{placeholder}} ok), temperature, responseFormat (text/json_object), jsonSchema |
| image-gen | AI image generation | prompt ({{placeholder}} ok), aspectRatio, style, numberOfImages, imageSize, referenceImage (optional base64 style reference) |
| http-request | HTTP request | url, method (GET/POST), body (JSON string w/ {{placeholder}}) |
| script | Execute a JS code block | code (full function body, e.g. 'return items.map(i => i*2);') |
| json-parse | Parse JSON data | expression (e.g. '$.data.invoice.total') |
| delay | Wait N milliseconds | ms (number) |
| output | Terminal sink — aggregates results and finalizes workflow payload | outputKey, format (json/text/html/buffer) |
| loop | Iterate over an array | arrayPath (JSONPath string, e.g. '$.slides'), itemName (string, e.g. 'slide') |
| slide-compose | Compose slide image + text | titleField, bulletsField, imageField, layout (bottom-bar / overlay / split / title-only) |

## Data binding with {{placeholder}} syntax

Nodes can reference output from upstream nodes using \`{{nodeId.field}}\` placeholders. This is how data flows through the workflow DAG.

**Cross-node references:**
- \`{{node-1}}\` — the entire output of node-1 (as JSON string)
- \`{{node-1.event}}\` — the "event" field from node-1's output
- \`{{node-1.slides}}\` — the "slides" array from a text-gen node's output

**Loop context variables (only valid inside a loop's downstream nodes):**
- \`{{item}}\` — the current loop item (stringified if not a string)
- \`{{item.title}}\` — a field on the current loop item
- \`{{index}}\` — the zero-based iteration index (0, 1, 2, ...)

**Best practices for placeholders:**
1. Always reference nodes that appear BEFORE the current node in the DAG (upstream).
2. Use \`{{node-1}}\` as a catch-all when unsure of field names.
3. In loop downstream nodes, use \`{{item.title}}\` where "title" is a field on each array element.
4. The trigger node typically outputs fields like: event, contentType, and any schema-defined properties.
5. LLM nodes with responseFormat="text" output \`{ text: "..." }\`, so reference with \`{{node-N.text}}\`. LLM nodes with responseFormat="json_object" output properties according to their jsonSchema, so you can directly reference \`{{node-N.slides}}\` if "slides" is a property.
6. Image-gen nodes output \`{ imageUrl: "..." }\`, so reference with \`{{node-N.imageUrl}}\`.
7. HTTP request nodes output \`{ status: 200, data: {...} }\`, reference with \`{{node-N.data}}.\`
8. Output nodes aggregate all upstream outputs — they are the terminal sink.

**Example workflow with data binding:**
Trigger (node-1) → LLM (node-2, json_object) → Loop (node-3) → Image Gen (node-4) → Slide Compose (node-5) → Output (node-6)

- node-2 prompt: "Generate a presentation outline from: {{node-1.topic}}", responseFormat: "json_object"
- node-3 arrayPath: "$.slides" (extracts the slides array from node-2's parsed JSON output)
- node-4 prompt: "Create an image for: {{item.title}} (slide #{{index}})"
- node-5 uses {{item.title}}, {{item.bullets}}, and {{node-4.imageUrl}} to compose each slide

## Edge rules

- Workflows typically start with a "trigger" node.
- Nodes can have multiple incoming and outgoing edges to form a Directed Acyclic Graph (DAG).
- For parallel tasks, branch out multiple edges from a single source node to multiple target nodes.
- For converging tasks, connect multiple source nodes to a single target node.
- sourceHandle is "default" for all nodes.
- targetHandle is always "default".

## Response format

Respond ONLY with a raw JSON object: no markdown, no explanation, no code fences.

{
  "nodes": [
    {
      "id": "node-unique_id",
      "type": "custom",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Human readable label",
        "type": "trigger | llm | image-gen | http-request | script | json-parse | delay | output | loop | slide-compose",
        "params": { ...relevant config keys for this type... }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-unique_id",
      "source": "nodeId",
      "target": "nodeId"
    }
  ]
}

## Layout guidance

- The initial node should be at x=100, y=150.
- Space sequential nodes horizontally, incrementing x by ~320 per step.
- For parallel branches (DAG workflows), fan out vertically: keep the same x coordinate but increment y by ~250 for each parallel node.
- For converging nodes, place them at the next x increment and vertically center them relative to their incoming branches.

## Behaviour modes

- **Create**: If no current canvas is provided, build a brand-new workflow from scratch. Every workflow MUST end with an "output" node that defines the final result.
- **Modify**: If a current canvas is provided (see below), you MUST base your response on it. Preserve every node and edge the user did not ask to change. Return the *complete* updated workflow, every node and every edge, not just the delta.

Current active nodes on canvas:
${JSON.stringify(activeNodes, null, 2)}`;

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    const streamResponse = await ai.interactions.create({
      model: "gemini-3.1-pro-preview",
      input: fullPrompt,
      stream: true,
      generation_config: {
        thinking_level: "high",
        thinking_summaries: "auto"
      }
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for await (const event of streamResponse as any) {
            if (event.event_type === "step.delta") {
              if (event.delta?.type === "thought_summary" && event.delta?.content?.text) {
                // Stream the model's native thoughts as a separate property
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ thought: event.delta.content.text })}\n\n`)
                );
              } else if (event.delta?.type === "text" && event.delta?.text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                );
              }
            }
          }
          controller.close();
        } catch (e) {
          console.error("Stream error:", e);
          const errMsg = e instanceof Error ? e.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    console.error("AI Workflow Route Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}