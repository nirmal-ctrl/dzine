const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

// 1x1 transparent png
const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        contents: [{ 
            parts: [
                { text: "A futuristic cybernetic interface with purple lights" },
                { inlineData: { mimeType: "image/png", data: base64Image } }
            ] 
        }],
        generationConfig: {
            responseModalities: ["IMAGE"],
            candidateCount: 1
        }
    })
}).then(res => res.json()).then(data => {
    console.log(JSON.stringify(data, null, 2).slice(0, 1000));
}).catch(console.error);
