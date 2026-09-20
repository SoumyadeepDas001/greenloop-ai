# 🌿 GreenLoop AI

> An agentic AI platform for sustainable community living — connecting organic waste to composting facilities, diagnosing plant diseases, and coordinating community gardens through multi-agent workflows.

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![IBM](https://img.shields.io/badge/IBM-052FAD?logo=ibm&logoColor=white)](https://ibm.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ What is GreenLoop?

GreenLoop is a mobile-first progressive web app that helps communities divert organic waste from landfills. Users describe or photograph their waste, and a pipeline of specialized AI agents classifies the material, scores nearby facilities using geospatial ranking, drafts a pickup coordination message, and guides the user through the drop-off — all within a few seconds.

Beyond composting, the platform supports plant disease diagnosis, plantation guidance, inorganic waste recycling, a community craft advisor, a peer marketplace, and an AI garden assistant.

---

## 📱 Features

| Flow | Description |
|---|---|
| **Waste → Compost** | Scout classifies waste via text or camera image, Matcher ranks nearby compost facilities by distance, capacity, and material fit, Coordinator drafts a drop-off message |
| **Plant Disease Diagnosis** | Identifies plant diseases from description or image using Gemini Vision + RAG over a local plant knowledge base |
| **Plantation Guide** | Personalized planting calendar and care instructions based on species and region |
| **Inorganic Waste Analyzer** | Classifies recyclables (plastic, metal, glass, e-waste, paper) and finds the nearest recycling facility |
| **Community Garden Coordinator** | Matches garden volunteers to projects and coordinates schedules |
| **Craft Advisor** | Suggests upcycled craft projects from waste materials |
| **Peer Marketplace** | List and discover reusable items within the community |
| **AI Garden Assistant** | Conversational assistant for plant care, local pickups, and garden questions |
| **User Dashboard** | Tracks kg of waste diverted, CO₂ prevented, and loop history |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (PWA)                      │
│  index.html + styles.css                                │
│  js/app.js          ← Router + App shell                │
│  js/ai_flows.js     ← Agentic workflow orchestration    │
│  js/screens/        ← 14 screen components              │
│  js/chat_assistant.js ← AI chat logic                   │
│  js/mock_db.js      ← Local data (plants, facilities)   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP (fetch)
                     ▼
┌─────────────────────────────────────────────────────────┐
│             Python Backend  (server.py)                 │
│  POST /api/scout     ← ScoutAgent + MatcherAgent        │
│  POST /api/inorganic ← ClassifierAgent + FacilityMatcher│
│  POST /api/plant_id  ← RAG Plant ID (rag_plant.py)      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│             Agent Layer  (agents.py)                    │
│  ScoutAgent      ← Text parser + Gemini Vision fallback │
│  MatcherAgent    ← Haversine scoring, capacity ranking  │
│  CoordinatorAgent← Gemini LLM message drafter          │
└─────────────────────────────────────────────────────────┘
```

### Agent Scoring (Matcher)

Each facility is ranked using a weighted composite score:

```
total_score = (distance_score × 0.40)
            + (capacity_score × 0.25)
            + (rating_score  × 0.20)
            + material_fit_bonus (up to +15)
```

Where `distance_score = max(0, 100 − dist_km × 5)` using the Haversine formula.

---

## 🗂️ Project Structure

```
Project Greenloop/
├── index.html              # App shell (single-page)
├── styles.css              # Global CSS design system
├── Procfile                # Deployment entry point
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variable template
│
├── server.py               # HTTP API server (port $PORT, default 8001)
├── agents.py               # Core agent implementations
├── agents_core.py          # AgentTrace + BaseAgent base classes
├── recycling_agent.py      # Inorganic classifier + facility matcher
├── rag_plant.py            # RAG pipeline for plant ID and care
├── plantation_agent.py     # Plantation guidance agent
├── mock_db.py              # Python-side data (recycling facilities, plants)
├── main.py                 # CLI test runner for the agent pipeline
│
├── adk_agents.py           # Same pipeline re-expressed with Google ADK
├── mcp_server.py           # Exposes the pipeline as an MCP tool (FastMCP)
│
└── js/
    ├── app.js              # App router, camera, geolocation, auth
    ├── ai_flows.js         # Frontend flow orchestration (all 9 flows)
    ├── mock_db.js          # Client-side data (compost units, plant KB)
    ├── chat_assistant.js   # Chat message processing
    ├── supabase_client.js  # Supabase auth + persistence
    └── screens/            # 14 screen renderers (scan, match, chat, …)
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- A [Google AI Studio](https://aistudio.google.com/app/apikey) API key
- Any static file server (e.g. Python's built-in `http.server`, VS Code Live Server)

### 1 — Clone & set up the Python environment

```bash
git clone https://github.com/your-username/project-greenloop.git
cd project-greenloop

python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2 — Configure environment variables

```bash
cp .env.example .env
# Edit .env and add your key:
# GEMINI_API_KEY="your_key_here"
```

### 3 — Start the Python backend

```bash
python3 server.py
# → Serving at http://localhost:8001
```

### 4 — Serve the frontend

In a second terminal:

```bash
python3 -m http.server 8000
# → Open http://localhost:8000 in your browser
```

---

## 🌐 Deployment

The app is ready to deploy to any platform that supports Python (Heroku, Render, Railway, Fly.io):

- **`Procfile`** — contains `web: python3 server.py`
- **Port** — reads `$PORT` from environment (`os.environ.get("PORT", 8001)`)
- **CORS** — all API responses include `Access-Control-Allow-Origin: *`
- **Frontend** — can be deployed separately to GitHub Pages, Netlify, or Vercel; update `API_BASE_URL` in `js/ai_flows.js` to point to your deployed backend URL

---

## 🧠 AI & Framework Architecture

### Core Agent Layer (`agents.py`)

The primary, production implementation. Each agent is a Python class with a `.run()` method returning an `AgentTrace`:

- **`ScoutAgent`** — classifies waste type, freshness, and quantity from text or Gemini Vision (image)
- **`MatcherAgent`** — scores facilities using Haversine distance + capacity + rating + material fit bonus
- **`CoordinatorAgent`** — uses Gemini to draft a personalised drop-off message

### Google ADK Re-expression (`adk_agents.py`)

The same three agents re-expressed using the **Google Agent Development Kit** (`@tool`, `Agent`, `Pipeline`). Each agent wraps the existing `agents.py` logic as a `@tool` and delegates sequential hand-offs to the ADK `Pipeline` orchestrator.

### MCP Integration (`mcp_server.py`)

The ADK pipeline is exposed as a single standard tool using **Anthropic's Model Context Protocol** (FastMCP). This allows any MCP-compatible client (Claude Desktop, Cursor, etc.) to invoke the entire compost pipeline via one tool call: `match_compost_waste(description, lat, lon)`.

> **Note:** No live external MCP client is connected in this build. The file demonstrates how the system would be integrated in production.

### RAG Plant Pipeline (`rag_plant.py`)

Retrieves relevant plant care entries from a local knowledge base (`mock_db.py`) using keyword similarity, constructs a grounded context window, and passes it to Gemini with a strict "answer only from context" instruction — preventing hallucination.

---

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key | ✅ Yes |
| `PORT` | Port for the backend server (default: `8001`) | Optional |

---

## 🛡️ Security

- **Rate limiting** — 20 requests per IP per 60-second window
- **Payload size cap** — 6 MB max request, 5 MB max image
- **Prompt injection sanitisation** — strips `ignore previous`, `system prompt`, `<script>`, and `override instructions` from user input
- **CORS** — full CORS headers on every response including preflight `OPTIONS`
- **Secrets** — `GEMINI_API_KEY` loaded from `.env` via `python-dotenv`; `.env` and `.venv/` are gitignored

---

## 🧪 Testing

```bash
# Run the agent pipeline from the CLI
python3 main.py

# Test vision classification and API endpoints
python3 test_vision.py

# Test the Q&A pipeline
python3 test_questions.py
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first. Make sure to run the CLI tests before submitting.

---

## 📄 License

MIT © GreenLoop AI
