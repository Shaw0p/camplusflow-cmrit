# 🎓 CampusFlow — AI × WhatsApp × Google Calendar

> **A Student Productivity Platform** that combines Groq AI, WhatsApp reminders, and Google Calendar automation via n8n.

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🤖 **Groq AI** | Generates personalized reminders (Motivational, Strict, Friendly, Funny) using LLaMA3 |
| 📱 **WhatsApp** | Sends AI-crafted reminder messages via WhatsApp Business API |
| 📆 **Google Calendar** | Auto-creates calendar events for every scheduled task |
| ⚡ **n8n Automation** | Connects everything with a visual workflow |
| 💾 **localStorage** | Keeps your last 5 reminders locally |

---

## 📁 Project Structure

```
CampusFlow/
├── src/                    # React frontend (Vite)
│   ├── App.jsx             # Main app component + form logic
│   ├── index.css           # Global styles (dark glassmorphism)
│   ├── main.jsx            # React entry point
│   └── components/
│       ├── States.jsx      # LoadingState + SuccessState
│       └── RecentReminders.jsx  # Recent reminders cards
├── server/                 # Node.js + Express backend
│   ├── server.js           # API server (POST /api/schedule)
│   ├── package.json
│   └── .env                # 🔑 Add your keys here!
├── public/
│   └── favicon.svg
├── .env                    # Frontend env (VITE_API_BASE)
├── vite.config.js          # Vite config with API proxy
└── package.json
```

---

## 🛠️ Setup & Running

### 1. Install & start the frontend

```bash
npm install
npm run dev
# → http://localhost:5173
```

#### Frontend API base (Render vs local)

By default, the frontend uses the deployed backend:

- `https://camplusflow-cmrit-1.onrender.com`

To override (e.g. when running the backend locally), create a local `.env` (not committed) using `.env.example`:

```bash
copy .env.example .env
```

Then set:

```env
VITE_API_BASE=http://localhost:5000
```

### 2. Install & start the backend

```bash
cd server
npm install
npm run dev
# → http://localhost:5000
```

### 3. Configure your `.env` (in `server/`)

```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/campusflow-trigger
PORT=5000
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
```

> **Without `N8N_WEBHOOK_URL`**, the backend runs in **dev mode** — the form still works and saves reminders locally, it just won't trigger the automation.

---

## 🔌 API Endpoints

### `POST /api/schedule`
Schedule a new reminder.

**Request body:**
```json
{
  "name": "Arjun Sharma",
  "task": "Data Structures Assignment",
  "taskType": "Assignment",
  "date": "2026-03-20",
  "time": "14:00",
  "phone": "+91XXXXXXXXXX",
  "style": "Motivational"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scheduled successfully",
  "data": { ... }
}
```

### `GET /api/health`
Health check.
```json
{
  "status": "ok",
  "service": "CampusFlow API",
  "n8nConfigured": true,
  "groqConfigured": true
}
```

---

## 🔧 n8n Workflow Setup

1. **Webhook Node** → `POST /campusflow-trigger`
2. **HTTP Request Node (Groq AI)**
   - URL: `https://api.groq.com/openai/v1/chat/completions`
   - Auth: `Bearer {{ $env.GROQ_API_KEY }}`
   - Model: `llama3-8b-8192`
   - Prompt: `"Generate a {{style}} WhatsApp reminder for {{name}} about their {{taskType}} '{{task}}' on {{date}} at {{time}}. Under 100 words, include an emoji."`
3. **HTTP Request Node (WhatsApp)** → UltraMsg / Twilio / Green API
4. **Google Calendar Node** → Create Event
   - Title: `{{taskType}}: {{task}}`
   - Description: `{{aiMessage}}`
5. **Respond to Webhook** → `{ success: true }`

---

## 🎨 Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS v3 + react-hot-toast
- **Backend:** Node.js 18+ + Express 4 (ESM modules)
- **AI:** Groq API (LLaMA3-8B)
- **Automation:** n8n (self-hosted or cloud)
- **Messaging:** WhatsApp Business API (UltraMsg / Twilio)
- **Calendar:** Google Calendar via n8n node

---

## 📸 UI Preview

| Header & Form | Success State |
|---|---|
| Dark glassmorphism form with gradient header | Green success card with full pipeline visualization |

---

*Built with ❤️ · CampusFlow · AI × WhatsApp × Google Calendar*
