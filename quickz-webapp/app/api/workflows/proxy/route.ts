import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { url, method = "POST", headers = {}, body } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing target URL" }, { status: 400 });
    }

    let targetUrl = url;
    const finalHeaders = { ...headers };

    // Inject server-side keys securely if no key is provided by the client
    if (url.includes("generativelanguage.googleapis.com")) {
      // Google Gemini / Imagen
      const urlObj = new URL(url);
      const hasKey = urlObj.searchParams.has("key");
      const clientKey = urlObj.searchParams.get("key");
      
      if (!hasKey || clientKey === "undefined" || !clientKey) {
        const serverKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
        if (!serverKey) {
          return NextResponse.json({ error: "Google API Key is not configured on the server." }, { status: 400 });
        }
        urlObj.searchParams.set("key", serverKey);
        targetUrl = urlObj.toString();
      }
    } else if (url.includes("api.openai.com")) {
      // OpenAI
      if (!finalHeaders["Authorization"] && !finalHeaders["authorization"]) {
        const serverKey = process.env.OPENAI_API_KEY;
        if (!serverKey) {
          return NextResponse.json({ error: "OpenAI API Key is not configured on the server." }, { status: 400 });
        }
        finalHeaders["Authorization"] = `Bearer ${serverKey}`;
      }
    } else if (url.includes("api.anthropic.com")) {
      // Anthropic
      if (!finalHeaders["x-api-key"]) {
        const serverKey = process.env.ANTHROPIC_API_KEY;
        if (!serverKey) {
          return NextResponse.json({ error: "Anthropic API Key is not configured on the server." }, { status: 400 });
        }
        finalHeaders["x-api-key"] = serverKey;
      }
    } else if (url.includes("api.groq.com")) {
      // Groq
      if (!finalHeaders["Authorization"] && !finalHeaders["authorization"]) {
        const serverKey = process.env.GROQ_API_KEY;
        if (!serverKey) {
          return NextResponse.json({ error: "Groq API Key is not configured on the server." }, { status: 400 });
        }
        finalHeaders["Authorization"] = `Bearer ${serverKey}`;
      }
    }

    const res = await fetch(targetUrl, {
      method,
      headers: finalHeaders,
      body: method !== "GET" && method !== "HEAD" ? JSON.stringify(body) : undefined
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } else {
      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: { "Content-Type": contentType }
      });
    }
  } catch (error: unknown) {
    console.error("Proxy error:", error);
    const errMsg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
