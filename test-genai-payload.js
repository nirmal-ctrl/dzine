const { GoogleGenAI } = require("@google/genai");

// Mock fetch to intercept the payload
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  console.log("URL:", url);
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
      { role: "user", parts: [ { text: "Hello" }, { inlineData: { mimeType: "image/jpeg", data: "base64" } } ] }
    ],
    config: {
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      },
      candidateCount: 1,
      temperature: 1.0,
      topP: 0.95
    }
  });
}
run();
