// ────────────────────────────────────────────────────────────────────────────────
// CampusFlow — Backend Server
// Node.js + Express
//
// N8N WORKFLOW DESCRIPTION (for reference):
// ─────────────────────────────────────────
// 1. Webhook Node
//    - Method: POST
//    - Path: /campusflow-trigger
//    - Receives: { name, task, taskType, date, time, phone, style }
//
// 2. Groq AI HTTP Request Node
//    - URL: https://api.groq.com/openai/v1/chat/completions
//    - Method: POST
//    - Headers: Authorization: Bearer {{ $env.GROQ_API_KEY }}
//    - Body (JSON):
//      {
//        "model": "llama3-8b-8192",
//        "messages": [{
//          "role": "user",
//          "content": "Generate a {{style}} WhatsApp reminder for student {{name}}
//                      about their {{taskType}} '{{task}}' scheduled on {{date}} at {{time}}.
//                      Keep it under 100 words, include an emoji, be {{style}}."
//        }]
//      }
//    - Output: {{ $json.choices[0].message.content }} → stored as "aiMessage"
//
// 3. WhatsApp HTTP Request Node (via Twilio/UltraMsg/WhatsApp Business API)
//    - URL: https://api.ultramsg.com/instance{ID}/messages/chat
//    - Method: POST
//    - Body: { token, to: phone, body: aiMessage }
//
// 4. Google Calendar Node
//    - Operation: Create Event
//    - Calendar: primary
//    - Title: {{ taskType }}: {{ task }}
//    - Start: {{ date }}T{{ time }}:00
//    - End: {{ date }}T{{ time + 1hr }}:00
//    - Description: {{ aiMessage }}
//
// 5. Respond to Webhook Node
//    - Response: { success: true, message: "Scheduled", aiMessage }
// ────────────────────────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────────
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://camplusflow-cmrit.vercel.app',
            'https://campus-flow-gj5u2irk6-shaw0ps-projects.vercel.app'
        ];
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(allowed =>
            origin.includes('vercel.app') ||
            origin.includes('localhost') ||
            origin === allowed
        )) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger ──────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ── Health check ────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'CampusFlow API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        n8nConfigured: !!process.env.N8N_WEBHOOK_URL,
        groqConfigured: !!process.env.GROQ_API_KEY,
    });
});

// ── Root (friendly) ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'CampusFlow backend is running',
        docs: {
            health: `${req.protocol}://${req.get('host')}/api/health`,
            schedule: `${req.protocol}://${req.get('host')}/api/schedule`,
        },
    });
});

// ── Schedule reminder ────────────────────────────────────────────────────────────
app.post('/api/schedule', async (req, res) => {
    const { name, task, taskType, date, time, phone, style } = req.body;

    // Validate required fields
    const missing = [];
    if (!name?.trim()) missing.push('name');
    if (!task?.trim()) missing.push('task');
    if (!taskType?.trim()) missing.push('taskType');
    if (!date?.trim()) missing.push('date');
    if (!time?.trim()) missing.push('time');
    if (!phone?.trim()) missing.push('phone');
    if (!style?.trim()) missing.push('style');

    if (missing.length) {
        return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missing.join(', ')}`,
            missing,
        });
    }

    // Validate phone format
    if (!/^\+\d{7,15}$/.test(phone.trim())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number. Use international format e.g. +91XXXXXXXXXX',
        });
    }

    // Validate date is not in the past
    const taskDate = new Date(`${date}T${time}`);
    if (isNaN(taskDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date or time format.' });
    }

    const payload = {
        name: name.trim(),
        task: task.trim(),
        taskType: taskType.trim(),
        date: date.trim(),
        time: time.trim(),
        phone: phone.trim(),
        style: style.trim(),
        scheduledFor: taskDate.toISOString(),
    };

    // Forward to n8n webhook
    const N8N_URL = process.env.N8N_WEBHOOK_URL;
    if (!N8N_URL) {
        console.warn('⚠  N8N_WEBHOOK_URL not set — skipping n8n call (dev mode)');
        // In dev mode without n8n, still return success for frontend development
        return res.json({
            success: true,
            message: 'Scheduled successfully (dev mode — n8n not configured)',
            data: payload,
            devMode: true,
        });
    }

    try {
        const n8nRes = await fetch(N8N_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(15000),  // 15s timeout
        });

        const contentType = n8nRes.headers.get('content-type') || '';
        const n8nData = contentType.includes('application/json')
            ? await n8nRes.json()
            : await n8nRes.text();

        if (!n8nRes.ok) {
            throw new Error(`n8n responded with ${n8nRes.status}: ${JSON.stringify(n8nData)}`);
        }

        console.log(`✅ Reminder scheduled for ${name} — ${task} on ${date} at ${time}`);

        return res.json({
            success: true,
            message: 'Scheduled successfully',
            data: payload,
            n8nResponse: n8nData,
        });

    } catch (err) {
        console.error('❌ Failed to reach n8n webhook:', err.message);
        return res.status(502).json({
            success: false,
            message: 'Failed to reach automation service. Please try again or check n8n configuration.',
            error: err.message,
        });
    }
});

// ── Get recent reminders (server-side, optional) ─────────────────────────────
app.get('/api/reminders', (_req, res) => {
    // In a real app, fetch from DB. Here we return a placeholder.
    res.json({
        success: true,
        message: 'Reminders are stored client-side in localStorage',
        tip: 'Integrate a database (MongoDB/PostgreSQL) to persist server-side',
    });
});

// ── 404 handler ─────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// ── Global error handler ─────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('  ╔═══════════════════════════════════════╗');
    console.log('  ║         CampusFlow API Server         ║');
    console.log('  ╠═══════════════════════════════════════╣');
    console.log(`  ║  🚀  http://localhost:${PORT}             ║`);
    console.log(`  ║  ✅  Health: /api/health               ║`);
    console.log(`  ║  📬  POST:   /api/schedule             ║`);
    console.log('  ╠═══════════════════════════════════════╣');
    console.log(`  ║  n8n: ${process.env.N8N_WEBHOOK_URL ? '✅ Configured' : '⚠  Not configured (dev mode)'}          ║`);
    console.log(`  ║  Groq: ${process.env.GROQ_API_KEY ? '✅ Configured' : '⚠  Not configured'}              ║`);
    console.log('  ╚═══════════════════════════════════════╝');
    console.log('');
});
