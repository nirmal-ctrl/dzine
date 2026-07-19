const API_KEY = process.env.GEMINI_API_KEY;

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        contents: [{ parts: [{ text: "A futuristic cybernetic interface with purple lights" }] }],
        generationConfig: {
            responseModalities: ["IMAGE"],
            candidateCount: 1
        }
    })
}).then(res => res.json()).then(data => {
    console.log(JSON.stringify(data).slice(0, 500));
}).catch(console.error);