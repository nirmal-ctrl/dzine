require('dotenv').config();
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        instances: [{ prompt: "A futuristic cybernetic interface with purple lights" }],
        parameters: {
            sampleCount: 1,
            styleReferenceImage: { bytesBase64Encoded: base64Image }
        }
    })
}).then(res => res.json()).then(data => {
    console.log(JSON.stringify(data, null, 2).slice(0, 1000));
}).catch(console.error);
