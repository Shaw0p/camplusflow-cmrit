// Quick test: sends a sample payload to the n8n webhook
const payload = {
    name: "Arjun Sharma",
    task: "Data Structures Assignment",
    taskType: "Assignment",
    date: "2026-03-20",
    time: "14:00",
    phone: "+919631886999",
    style: "Motivational",
};

const WEBHOOK_URL = "https://ash0p.app.n8n.cloud/webhook/campusflow";

console.log("🚀 Sending test payload to n8n webhook...");
console.log("URL:", WEBHOOK_URL);
console.log("Payload:", JSON.stringify(payload, null, 2));

fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
})
    .then(async (res) => {
        const text = await res.text();
        console.log("\n✅ Response Status:", res.status);
        console.log("Response Body:", text);
        if (res.ok) {
            console.log("\n🎉 Webhook received successfully! Check n8n to see data flowing.");
        } else {
            console.log("\n❌ Webhook returned an error. Check n8n is listening (Test URL mode).");
        }
    })
    .catch((err) => {
        console.error("\n❌ Request failed:", err.message);
        console.log("Make sure n8n is in listening mode (click the Webhook node in n8n first).");
    });
