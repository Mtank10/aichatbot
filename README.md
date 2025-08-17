# 🧠 Local AI Chatbot (Python FastAPI Version)

A ChatGPT-style chatbot that runs completely **locally** using [Ollama](https://ollama.com/) and the `gemma3:1b` model, built with Python FastAPI and Next.js.

---

## ⚙️ Tech Stack

| Layer        | Technology         |
|--------------|--------------------|
| Backend      | Python + FastAPI   |
| Frontend     | Next.js (React) + Tailwind CSS |
| Database     | PostgreSQL + SQLAlchemy ORM |
| LLM          | Ollama (`gemma3:1b`) |
| Styling      | Tailwind CSS       |

---

## 🚀 Features

- ChatGPT-style UI with message streaming
- "New Chat" experience
- Chat history with creation date
- Message streaming token-by-token
- Stop generation button
- Auto-title chat from first user message
- Typing indicator
- Keyboard shortcuts (Enter to send)
- Cloud deployment ready (Railway, Render, Vercel)

---

## 🛠️ Local Development Setup

### ✅ 0. Setup Python Virtual Environment

First, set up the Python virtual environment to avoid system package conflicts:

```bash
# Run the setup script (recommended)
cd backend && ./setup.sh

# OR manually create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### ✅ 1. Install & Run Ollama

> Ollama is required to run the local LLM (`gemma3:1b`).

- Download from: https://ollama.com/download

Then in your terminal:

```bash
# Pull the gemma3:1b model
ollama pull gemma3:1b

# Run the model
ollama run gemma3:1b
```

This will run Ollama on `http://localhost:11434`.

> 💡 Keep this terminal window running during development.

---

### ✅ 2. Setup the Database

We use **PostgreSQL** and SQLAlchemy ORM.

#### Create `.env` in `/backend`

```env
DATABASE_URL=postgresql://username:password@localhost:5432/chatbotdb
OLLAMA_URL=http://localhost:11434
```

#### Install Python dependencies and setup database

```bash
# Install Python dependencies
pip install -r requirements.txt

# Navigate to backend directory
cd backend

# Initialize Alembic (first time only)
alembic init alembic

# Create and run migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

---

### ✅ 3. Start the Backend Server

```bash
cd backend

# Option 1: Use the run script (recommended)
./run.sh

# Option 2: Manual activation and run
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> Runs at: `http://localhost:8000`
> API docs available at: `http://localhost:8000/docs`

---

### ✅ 4. Start the Frontend App

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run Next.js frontend
npm run dev
```

> Runs at: `http://localhost:3000`

---

## 🐳 Docker Development

Run the entire stack with Docker Compose:

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up --build

# Run in background
docker-compose up -d --build
```

This will start:
- PostgreSQL on port 5432
- FastAPI backend on port 8000
- Next.js frontend on port 3000

---

## ☁️ Cloud Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Add environment variables:
   ```
   DATABASE_URL=<your-postgresql-url>
   OLLAMA_URL=<your-ollama-instance-url>
   ```
3. Deploy using the included `railway.json` configuration

### Render Deployment

1. Connect your GitHub repository to Render
2. Use the included `render.yaml` configuration
3. Add PostgreSQL database service
4. Deploy both backend and frontend services

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Use the included `vercel.json` configuration
4. Deploy with automatic builds

---

## 🔁 Quick Start Commands

```bash
# 1. Start Ollama in a terminal
ollama run gemma3:1b

# 2. Setup & start backend (in another terminal)
cd backend
./setup.sh
source venv/bin/activate
alembic upgrade head
./run.sh

# 3. Start frontend in another terminal
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` to start chatting.

---

## 📁 Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database configuration
│   ├── alembic/             # Database migrations
│   └── .env.example         # Environment variables template
├── frontend/
│   ├── app/                 # Next.js app directory
│   ├── package.json         # Frontend dependencies
│   └── .env.example         # Frontend environment variables
├── requirements.txt         # Python dependencies
├── docker-compose.yml       # Docker development setup
├── Dockerfile              # Backend Docker image
├── railway.json            # Railway deployment config
├── render.yaml             # Render deployment config
└── vercel.json             # Vercel deployment config
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/chatbotdb
OLLAMA_URL=http://localhost:11434
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📌 Key Features & Improvements

- **Python FastAPI**: High-performance async API framework
- **SQLAlchemy ORM**: Powerful and flexible database ORM
- **Alembic Migrations**: Database schema version control
- **Type Safety**: Pydantic schemas for request/response validation
- **Auto-generated API Docs**: FastAPI automatically generates OpenAPI docs
- **Cloud Ready**: Multiple deployment configurations included
- **Docker Support**: Full containerization for development and production
- **Streaming Support**: Real-time message streaming with Server-Sent Events
- **Error Handling**: Comprehensive error handling and logging

---

## 🚨 Requirements

- Python 3.11+
- python3-venv (for virtual environments)
- Node.js 18+
- PostgreSQL 12+
- Ollama with `gemma3:1b` model
- 6GB+ RAM for the LLM model

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).