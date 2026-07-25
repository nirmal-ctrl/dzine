import { GoogleGenAI } from "@google/genai";

const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  console.log("PAYLOAD:", JSON.stringify(JSON.parse(options.body), null, 2));
  return {
    ok: true,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => ({ candidates: [{ content: { parts: [] } }] })
  };
};

const ai = new GoogleGenAI({ apiKey: "fake-key" });

async function run() {
  await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [
      { 
        role: "user", 
        parts: [ 
          { text: "Hello" }, 
          { inlineData: { mimeType: "image/jpeg", data: "base64" } },
          { text: "for logo refer:" },
          { inlineData: { mimeType: "image/jpeg", data: "base64_2" } }
        ] 
      }
    ],
    config: {
      responseModalities: ['IMAGE']
    }
  });
}
run();
