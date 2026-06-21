# 🌌 Aether AI Backend — Enterprise RAG & Agentic Gateway

The production-grade, high-performance backend server powering the Aether AI Assistant ecosystem. Built with a Node.js + TypeScript stack, this gateway handles secure JWT authentication, document parsing and ingestion, and real-time agentic orchestration via LangChain, utilizing Supabase (pgvector) and PostgreSQL.

---

## 🚀 Key Features

*   **🤖 Advanced Agentic Orchestration**: LangChain-powered agent dynamically selects and coordinates tools (Knowledge Base Search, Calculator, Weather API) based on context and system prompts.
*   **📂 Vector Ingestion Pipeline (RAG)**: Form-data PDF parsing and chunk splitting using recursive text splitters, converting text chunks to vector embeddings (`text-embedding-3-small`) stored in a Supabase PGVector database.
*   **📡 Real-Time WebSockets**: Persistent, low-latency duplex streaming channel for token-by-token message streaming, custom event signals, and instant session title updates.
*   **🔒 JWT-secured REST API**: Custom authentication middleware validating user identities for chat history retrieval, session management, and document library operations.
*   **🗄️ Relational Persistence (Prisma)**: Prisma ORM with PostgreSQL backend mapping chat sessions, user profiles, and conversation logs.

---

## 🧱 Architecture Workflow

```mermaid
graph TD
    Client[React Native App] -->|WebSocket Connection / token| WS[WS Gateway]
    Client -->|HTTP REST Requests| REST[Express HTTP Router]
    
    REST -->|Auth Middleware| Controller[Express Controller]
    WS -->|JWT Verification| SocketController[WebSocket Handler]
    
    SocketController -->|Invokes| Agent[LangChain Agent]
    Controller -->|Invokes| Agent
    
    Agent -->|Calls Tools| KBTool[Knowledge Base Tool]
    KBTool -->|Similarity Search| Supabase[Supabase pgvector]
    
    Agent -->|Invokes LLM| OpenAI[OpenAI API / Custom LLM Endpoint]
    
    Agent -->|Saves History| Prisma[Prisma ORM & Postgres]
    SocketController -->|Streams Tokens| Client
```

---

## 🛠️ Tech Stack & Dependencies

*   **Runtime & Framework**: Node.js, Express.js (v5)
*   **Language**: TypeScript (v6)
*   **AI & Search**: LangChain Core/Community/OpenAI, Supabase Client
*   **Database & ORM**: PostgreSQL, Prisma ORM
*   **File Processing**: Multer (Multipart Form Upload), PDF-Parse
*   **Calculations**: Mathjs
*   **Real-time Communication**: WS (WebSockets)

---

## 📁 Directory Structure

```text
src/
├── agent/            # LangChain agent definitions and core orchestration
├── controller/       # Express HTTP controllers & WebSocket connection handlers
├── middleware/       # Custom middleware (JWT auth, error handlers, validations)
├── model/            # Model instantiation (OpenAI chat/embeddings)
├── routes/           # REST API Route declarations
├── services/         # Database persistence services (RAG history persistence)
├── tools/            # Custom agent tools (Weather, Calculator, get_knowledge_base)
└── utils/            # Helper utils (Prisma, Supabase clients, PDF extraction)
```

---

## ⚙️ Configuration & Environment

Create a `.env` file in the root directory and configure the following variables:

```ini
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Connections
DATABASE_URL="postgresql://user:password@localhost:5432/aether_db"
SUPABASE_URL="https://your-supabase-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# OpenAI & LLM Credentials
AI_ENDPOINT="https://api.openai.com/v1"
AI_API_KEY="your-openai-api-key"
AI_MODEL="gpt-4o"
AI_EMBEDDING_MODEL="text-embedding-3-small"

# Security
JWT_SECRET="your-high-entropy-jwt-secret-key"
```

---

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations
Initialize your database schema and tables:
```bash
npx prisma migrate dev
```

### 3. Build & Run Application

#### Development (Hot reloading)
```bash
npm run dev
```

#### Production (Build and Run)
```bash
npm run build
npm start
```

---

## 📡 API & Protocols

### 1. REST Endpoints

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/user/register` | `POST` | Create a new user profile | No |
| `/user/login` | `POST` | Authenticate and get JWT token | No |
| `/rag/upload` | `POST` | Ingest a PDF file into Vector Store | Yes (Bearer Token) |
| `/rag/chats` | `GET` | List all historical chat sessions | Yes (Bearer Token) |
| `/rag/chats/:id` | `GET` | Fetch all messages for a session | Yes (Bearer Token) |
| `/rag/chats/:id` | `DELETE`| Delete chat session and messages | Yes (Bearer Token) |
| `/rag/documents` | `GET` | Retrieve list of active knowledge files | Yes (Bearer Token) |
| `/rag/documents/:filename` | `DELETE`| Remove a document and its vectors | Yes (Bearer Token) |

### 2. WebSocket Stream Protocol

*   **URL**: `ws://<host>:<port>/rag/chat?token=<JWT_TOKEN>`
*   **Communication Structure**:
    *   **Client Message**:
        ```json
        {
          "type": "chat",
          "query": "Tell me about my uploaded resume.",
          "chatId": "optional-uuid-to-continue-session"
        }
        ```
    *   **Server Event Signals**:
        *   `{ "type": "chatId", "chatId": "..." }` — Fired when a new chat session is created.
        *   `{ "type": "content", "content": "..." }` — Streamed incrementally containing the generated token chunk.
        *   `{ "type": "done" }` — Emitted when response generation finishes.
        *   `{ "type": "error", "message": "..." }` — Fired on system errors.
