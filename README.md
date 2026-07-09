# AI-First CRM HCP Module -Log Interaction Screen

An AI-powered Customer Relationship Management (CRM) system for pharmaceutical field representatives, featuring a **Healthcare Professional (HCP) Module** with intelligent interaction logging.

<img src="./CRM%20HCP-Photoroom.png" alt="App Screenshot" width="600" />

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/star.svg" width="28" height="28" align="top" /> Features

### Log Interaction Screen
- **Form Mode**: Structured form with HCP autocomplete, interaction type selection, product tagging, and notes
- **Chat Mode**: Conversational AI interface powered by LangGraph + Groq LLM to log interactions via natural language

### 5 LangGraph AI Tools
1. **Log Interaction**: AI extracts entities (HCP name, products, topics) from natural language and creates structured records
2. **Edit Interaction**: Modify logged interactions using natural language commands
3. **Lookup HCP**: Search the HCP database by name, specialty, hospital, or territory
4. **Analyze Sentiment**: AI-powered sentiment analysis of interaction notes with key point extraction
5. **Suggest Follow-up**: Intelligent follow-up recommendations based on interaction history

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/wrench.svg" width="28" height="28" align="top" /> Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Redux Toolkit + Vite |
| Backend | Python 3.11 + FastAPI |
| AI Agent | LangGraph |
| LLM | Groq API (`llama-3.3-70b-versatile`) — see note below |
| Database | PostgreSQL 15 (via Docker; SQLite fallback supported) |
| Font | Google Inter |

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/folder.svg" width="28" height="28" align="top" /> Project Structure

```
├── backend/
│   ├── agent/
│   │   ├── graph.py          # LangGraph agent definition
│   │   ├── tools.py          # 5 AI tools
│   │   ├── prompts.py        # System & tool prompts
│   │   └── state.py          # Agent state schema
│   ├── routes/
│   │   ├── hcps.py           # HCP REST API
│   │   ├── interactions.py   # Interaction REST API
│   │   └── chat.py           # Chat/AI agent endpoint
│   ├── main.py               # FastAPI application
│   ├── models.py             # SQLAlchemy ORM models
│   ├── schemas.py            # Pydantic schemas
│   ├── crud.py               # CRUD operations
│   ├── database.py           # DB configuration
│   ├── seed_data.py          # Sample data seeder
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LogInteraction/
│   │   │   │   ├── LogInteractionScreen.jsx
│   │   │   │   ├── FormMode.jsx
│   │   │   │   ├── ChatMode.jsx
│   │   │   │   ├── InteractionList.jsx
│   │   │   │   └── EditInteractionModal.jsx
│   │   │   └── common/
│   │   │       ├── Sidebar.jsx
│   │   │       └── Header.jsx
│   │   ├── store/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── interactionSlice.js
│   │   │       ├── chatSlice.js
│   │   │       └── hcpSlice.js
│   │   ├── api/
│   │   │   ├── interactionApi.js
│   │   │   └── chatApi.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/rocket.svg" width="28" height="28" align="top" /> How to Run

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API Key (free at https://console.groq.com)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
# DATABASE_URL is preconfigured for the Dockerized PostgreSQL below

# Start PostgreSQL (from the project root, in another terminal)
#   docker compose up -d

# Seed the database with sample data
python seed_data.py

# Start the backend server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API Docs**: http://localhost:8000/docs

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/key.svg" width="28" height="28" align="top" /> Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |
| `DATABASE_URL` | Database connection URL (default: PostgreSQL — `postgresql://crm_user:crm_password_2024@localhost:5432/crm_hcp`) |
| `LLM_MODEL` | LLM model name (default: `llama-3.3-70b-versatile`) |

> **<img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/triangle-alert.svg" width="20" height="20" align="text-bottom" /> Note on the LLM model:** The assignment specified `gemma2-9b-it`, but Groq
> has since **decommissioned** that model — the API now returns `HTTP 400 "model
> has been decommissioned and is no longer supported"`. This project therefore
> uses **`llama-3.3-70b-versatile`**, which the assignment explicitly permits
> ("You may also consider llama-3.3-70b-versatile for context") and which
> supports the tool-calling the LangGraph agent depends on. To switch models,
> just change `LLM_MODEL` in `.env`.

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/book-open.svg" width="28" height="28" align="top" /> How It Works

### Form Mode
1. Select an HCP from the autocomplete dropdown
2. Fill in interaction details (type, channel, products, notes)
3. Click "Log Interaction" to save

### Chat Mode
1. Type a natural language description of your interaction
2. The LangGraph AI agent processes your message
3. The agent uses appropriate tools (log, edit, lookup, analyze, suggest)
4. Results are displayed in the chat and saved to the database

### Example Chat Commands
- "I just visited Dr. Sarah Mitchell at her clinic. We discussed CardioGuard XR and she was very interested in the Phase III data."
- "Look up oncologists in the database"
- "Analyze the sentiment of interaction #1"
- "Edit interaction #2 — change the follow-up date to next Friday"
- "Suggest follow-up actions for Dr. James Chen"

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/building.svg" width="28" height="28" align="top" /> Architecture

```
React + Redux ──→ FastAPI ──→ LangGraph Agent ──→ Groq LLM
                     │               │
                     └─→ PostgreSQL ←┘
```

## <img src="https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/icons/file-text.svg" width="28" height="28" align="top" /> License

This project was created as part of a technical assessment.
