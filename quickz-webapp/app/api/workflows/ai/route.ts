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
| delay | Wait N milliseconds | ms (number) |
| output | Terminal sink — aggregates results and finalizes workflow payload | outputKey, format (json/text/html/buffer) |
| loop | Iterate over an array | arrayPath (JSONPath string, e.g. '$.slides'), itemName (string, e.g. 'slide'), mode (parallel or sequential) |
| router | Conditional logic branch | condition (JS expression string, e.g. '{{$json.value}} > 5') |
| merge | Wait/combine branches | strategy (wait-all / first-wins / append) |
| boolean | Logical operations | operator (AND/OR/NOT), operand1, operand2 (optional) |
| transform | Map and restructure data | mapping (JSON string template) |
| filter | Filter items from an array | condition (JS expression string) |
| classifier | Route dynamically based on matching incoming values to custom possibilities | valueToMatch (string with {{placeholder}}), possibilities (comma separated string, e.g. 'new, assigned, resolved') |
| group | Visual encapsulation container (no logical function) | N/A |

## Output Mapping (optional on every node)

Every node supports an optional \`outputMapping\` param that reshapes the node's raw output into a clean, user-defined JSON object before it flows downstream. This is the recommended way to produce structured, predictable outputs instead of passing raw provider responses.

**Format:** \`outputMapping\` is a JSON array of \`{ "key": string, "value": string }\` rows. Each \`value\` supports the same \`{{placeholder}}\` syntax as other params, where \`{{ $json.field }}\` refers to the node own raw output.

**Example:**
"outputMapping": [
  { "key": "summary", "value": "{{ $json.text }}" },
  { "key": "status", "value": "ok" },
  { "key": "image", "value": "{{ $json.imageUrl }}" }
]

This transforms a raw LLM output like \`{ "text": "Hello world" }\` into \`{ "summary": "Hello world", "status": "ok" }\` before downstream nodes see it.

**When to use it:**
- After an LLM node to expose only the fields downstream nodes need (e.g. map \`{{$json.text}}\` to a semantic key).
- After an HTTP request to flatten a nested API response.
- After an image-gen node to rename \`imageUrl\` to something domain-specific.
- On trigger nodes to normalize incoming webhook payloads.

If \`outputMapping\` is omitted or empty \`[]\`, the node passes its raw output through unchanged.

## Data binding with {{placeholder}} syntax

Nodes can reference output from upstream nodes using \`{{nodeId.field}}\` placeholders. This is how data flows through the workflow DAG.

**Cross-node references (n8n style):**
- Data is passed as an array of objects '[{"json": {...}}]'.
- Use '{{ $json.field }}' to access fields of the current item.
- Use '{{ $node["node-id"].json.field }}' to explicitly access upstream nodes.

**Best practices for placeholders:**
1. Always reference nodes that appear BEFORE the current node in the DAG (upstream).
2. The trigger node typically outputs fields like: event, contentType, and any schema-defined properties.
3. LLM nodes with responseFormat="text" output '{ "text": "..." }', so reference with '{{ $json.text }}'.
4. Image-gen nodes output '{ "imageUrl": "..." }', so reference with '{{ $json.imageUrl }}'.
5. HTTP request nodes output '{ "status": 200, "data": {...} }'.
6. If a node has an outputMapping, downstream nodes see the MAPPED output, not the raw one. Reference the mapped keys with the same placeholder syntax.

**Example workflow with data binding:**
Trigger (node-1) → Router (node-2) → LLM (node-3) → Output (node-4)

- node-2 condition: "{{node-1.isPriority}} === true"
- node-3 prompt: "Process high priority task: {{node-1.task}}"

## Edge rules

- Workflows typically start with a "trigger" node.
- Nodes can have multiple incoming and outgoing edges to form a Directed Acyclic Graph (DAG).
- For parallel tasks, branch out multiple edges from a single source node to multiple target nodes.
- For converging tasks, connect multiple source nodes to a single target node (or use a Merge node).
- sourceHandle is usually "default". For the "router" node type, you must specify the sourceHandle as either "true" or "false" to branch logic based on the condition.
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
        "type": "trigger | llm | image-gen | http-request | script | delay | output | loop | router | merge | boolean | transform | filter | classifier | group",
        "params": { ...relevant config keys for this type... }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-unique_id",
      "source": "nodeId",
      "target": "nodeId",
      "sourceHandle": "true" // Optional, required for 'router' node ("true" or "false") and 'classifier' node (match the possibility string)
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