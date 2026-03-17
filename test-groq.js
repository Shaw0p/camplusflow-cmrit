// Test Groq API key directly (read from environment, never commit secrets)
const GROQ_KEY = process.env.GROQ_API_KEY;

if (!GROQ_KEY) {
    console.error("Missing GROQ_API_KEY in environment.");
    console.error("PowerShell:  $env:GROQ_API_KEY = 'your_key_here'");
    console.error("macOS/Linux: export GROQ_API_KEY='your_key_here'");
    process.exit(1);
}

console.log("🧪 Testing Groq API directly...\n");

fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: "Generate a motivational WhatsApp reminder for student Arjun about Data Structures Assignment on March 20 at 2pm. Under 80 words, include emojis." }],
        max_tokens: 200,
    }),
})
    .then(async (res) => {
        const data = await res.json();
        console.log("Status:", res.status);
        if (res.ok) {
            console.log("\n✅ Groq API works! Response:\n");
            console.log(data.choices[0].message.content);
        } else {
            console.log("\n❌ Groq API error:");
            console.log(JSON.stringify(data, null, 2));
        }
    })
    .catch((err) => console.error("❌ Request failed:", err.message));
