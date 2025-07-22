# 🧠 Local AI Chatbot

A ChatGPT-style chatbot that runs completely **locally** using [Ollama](https://ollama.com/) and the `gemma3:1b` model.

---

## ⚙️ Tech Stack Used

| Layer        | Technology         |
|--------------|--------------------|
| Frontend     | Next.js (React) + Tailwind CSS |
| Backend      | Node.js + Express  |
| LLM          | Ollama (`gemma3:1b`) |
| Database     | PostgreSQL + Prisma ORM |
| Styling      | Tailwind CSS       |

---

## 🚀 Features

- ChatGPT-style UI with message streaming
- “New Chat” experience
- Chat history with creation date
- Message streaming token-by-token
- Stop generation button
- Auto-title chat from first user message
- Typing indicator
- Keyboard shortcuts (Enter to send)

---

## 🛠️ Setup Instructions

### ✅ 1. Install & Run Ollama

> Ollama is required to run the local LLM (`gemma3:1b`).

- Download from: https://ollama.com/download

Then in your terminal:

```bash
# Pull the gemma:1b model
ollama pull gemma3:1b

# Run the model
ollama run gemma3:1b
```

This will run Ollama on `http://localhost:11434`.

> 💡 Keep this terminal window running during development.

---

### ✅ 2. Setup the Database

We use **PostgreSQL** and Prisma ORM.

#### Create `.env` in `/backend`

```env
DATABASE_URL=postgresql://username:password@localhost:5432/chatbotdb
```
#### Run database setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run DB migration
npx prisma migrate dev --name init
```

---

### ✅ 3. Start the Backend Server

```bash
cd backend
node server.js
```

> Runs at: `http://localhost:5000`

---

### ✅ 4. Start the Frontend App

```bash
cd frontend

# Install dependencies
npm install

# Run Next.js frontend
npm run dev
```

> Runs at: `http://localhost:3000`

---

## 🔁 Local Run Summary

```bash
# 1. Start Ollama in a terminal
ollama run gemma3:1b

# 2. Setup & start backend
cd backend
npm install
npx prisma migrate dev
node server.js

# 3. Start frontend in another terminal
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` to start chatting.

---

## 📌 Assumptions / Constraints

- Ollama is running locally at `http://localhost:11434`
- `gemma3:1b` model requires ~6GB RAM
- Chat and messages are stored per session in PostgreSQL
- No authentication; single-user mode only
- First message sets the chat title (auto-titling)
- Uses Server-Sent Events (SSE) for streaming tokens
