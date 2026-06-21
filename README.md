# 🌌 VED — Enterprise RAG & Mobile AI Assistant Ecosystem

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)](https://github.com/okaadyx/assistent)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-lightgrey.svg?style=for-the-badge)](https://reactnative.dev/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge)](https://github.com/okaadyx/assistent/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.85.3-61DAFB.svg?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748.svg?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

A production-grade, fintech-quality conversational AI ecosystem. VED pairs a cross-platform mobile assistant application built on a premium **Glassmorphism** design system with a high-performance **Retrieval-Augmented Generation (RAG)** LangChain backend.

---

```
__      __  ______  _____  
\ \    / / |  ____||  __ \ 
 \ \  / /  | |__   | |  | |
  \ \/ /   |  __|  | |  | |
   \  /    | |____ | |__| |
    \/     |______||_____/ 
                    
             ENTERPRISE RAG & MOBILE ASSISTANT ECOSYSTEM
```

---

## 📖 1. Overview

VED is built to solve the challenge of accessing private knowledge bases on the go. Traditional RAG systems are often restricted to desktop interfaces and lack smooth, real-time mobile interaction. 

### Why VED Exists
Mobile devices operate on volatile networks where persistent connections are difficult to maintain. VED solves this by establishing a hardened WebSocket streaming protocol and an encapsulated, local-first state caching layer. It enables professionals to upload complex PDF documents on their desktop/web portals and query them through a premium, responsive mobile app with instantaneous, token-by-token streaming responses.

### Target Audience
*   **Enterprise Teams**: Accessing private corporate documentation, compliance records, and operations logs securely.
*   **Researchers & Analysts**: Querying complex academic articles, financial reports, and datasets on the go.
*   **Developers**: A reference boilerplate for real-time mobile WebSocket streaming and LLM tool orchestration.

### Key Benefits
*   **Zero-Latency Feel**: Progressive token rendering makes response generation feel instantaneous.
*   **Zero-Config Dev Flow**: The application auto-detects Metro CLI connection streams, adapting to shifting local network environments.
*   **Fintech-Level Security**: Double-layer JWT authorization using hardware-encrypted secure storage keeps sessions protected.

---

## ⚡ 2. Features

| Feature | Category | Description |
| :--- | :--- | :--- |
| **Glassmorphism UI** | Core UI | Frosted overlays (`rgba(255,255,255,0.08)`), glowing radial aurora backdrops, and interactive micro-animations using Reanimated. |
| **Dynamic Vector RAG** | AI Engine | Ingests PDF documents, splits content recursively, generates OpenAI embeddings, and executes semantic searches via PGVector. |
| **Agentic Tooling** | AI Engine | LangChain orchestrator dynamically coordinates Knowledge Base Search, a `mathjs` Calculator, and real-time Weather API. |
| **WebSocket Streaming** | Networking | Native duplex streaming channels to deliver token-by-token assistant completions with automatic session-id bindings. |
| **Secure JWT Auth** | Security | Device-level token persistence via `expo-secure-store` with dynamic Axios token-injecting interceptors. |
| **Robust State Caching** | State | Encapsulated server cache syncing using TanStack Query (React Query) for profiles, vector documents, and chats. |
| **Document Management** | Data | Inbound document tracking UI with deletion cascades that purge both file storage metadata and matching vector embeddings. |
| **Offline Fallbacks** | Performance | Graceful handling of WebSocket dropouts with connection retry boundaries and secure token fallbacks. |

---

## 📸 3. Screenshots

| Home & Chat Interface | Knowledge Base Hub | Auth Screens |
|:---:|:---:|:---:|
| ![Chat Interface Placeholder](https://placehold.co/300x600/09090B/FFFFFF/png?text=VED+Glassmorphic+Chat) | ![Document Manager Placeholder](https://placehold.co/300x600/09090B/FFFFFF/png?text=Knowledge+Base+Manager) | ![Authentication Screen Placeholder](https://placehold.co/300x600/09090B/FFFFFF/png?text=Sign+In+%26+Sign+Up) |

| Settings & Profile | Dark Mode Showcase | Mobile Tab Navigation |
|:---:|:---:|:---:|
| ![Settings Screen Placeholder](https://placehold.co/300x600/09090B/FFFFFF/png?text=Settings+%26+Profile) | ![Dark Mode Showcase Placeholder](https://placehold.co/300x600/09090B/FFFFFF/png?text=Dark+Mode+Mesh+Visuals) | ![Mobile View Placeholder](https://placehold.co/300x600/09090B/FFFFFF/png?text=Tab+Layouts+%26+Drawer) |

---

## 🛠️ 4. Tech Stack

### Frontend
*   **Framework**: React Native & Expo SDK (v56.0.0)
*   **Language**: TypeScript (v6.0.3)
*   **Routing**: Expo Router (File-based navigation engine)
*   **Animations**: React Native Reanimated (v4.3.1)
*   **Client Cache**: TanStack Query (v5.101.0)
*   **Data Validation**: Zod Schemas

### Backend
*   **Runtime**: Node.js (v18+)
*   **Framework**: Express.js (v5)
*   **Language**: TypeScript (v6.0.3)
*   **ORM**: Prisma ORM (v5)
*   **Orchestration**: LangChain Core / Community
*   **Real-time**: WS (HTML5 WebSockets)

### Database & Storage
*   **Primary Database**: PostgreSQL (Relational chat history and user records)
*   **Vector Database**: Supabase PGVector (Embedding indexes for document chunks)
*   **File Storage**: Local filesystem `/uploads` storage (upgradeable to AWS S3)

### Security & DevOps
*   **Device Encryption**: `expo-secure-store`
*   **Authentication**: JWT (JSON Web Tokens)
*   **Password Hashing**: `bcryptjs`
*   **Typechecking**: Strict Mode Compiler Verification

---

## 🧱 5. Project Architecture

```mermaid
graph TB
    subgraph Client ["Frontend Client (React Native + Expo)"]
        UI[Glassmorphic UI View]
        Hook[useChatStream Hook]
        RQuery[TanStack React Query]
        AxiosInstance[Axios Auth Interceptor]
        SecStore[expo-secure-store]
    end

    subgraph API ["Gateway & Network Layer"]
        WSLink[ws://<dynamic-ip>:3000/rag/chat]
        RESTLink[http://<dynamic-ip>:3000/api]
    end

    subgraph Server ["Backend Gateway (Express + TypeScript)"]
        WSGate[WebSocket Server Handler]
        HTTPGate[Express REST Router]
        AuthFilter[JWT Auth Middleware]
        Agent[LangChain Agent Core]
        Tools[Tool Registry: Calculator / Weather / Search]
    end

    subgraph DB ["Data & Cloud Engines"]
        OpenAI[OpenAI gpt-4o & text-embeddings]
        Postgres[PostgreSQL Chat History]
        PGVector[Supabase pgvector Vector Store]
        PrismaORM[Prisma Client Layer]
    end

    %% Client Interactions
    UI -->|Dispatches Queries| Hook
    UI -->|Invokes CRUD Actions| RQuery
    RQuery -->|Triggers Requests| AxiosInstance
    AxiosInstance -.->|Retrieves JWT| SecStore
    Hook -.->|Reads JWT| SecStore

    %% API Layer Mappings
    Hook -->|Duplex WebSocket Protocol| WSLink
    AxiosInstance -->|REST JSON Payload| RESTLink

    %% Server Routings
    WSLink -->|Verification & Stream Connection| WSGate
    RESTLink -->|REST Routes Parsing| HTTPGate
    HTTPGate -->|Secures Route| AuthFilter

    %% Agentic & Database Integrations
    WSGate -->|Drives Message| Agent
    HTTPGate -->|CRUD Handlers| PrismaORM
    Agent -->|Dynamically Evaluates| Tools
    Tools -->|Semantic Document Lookup| PGVector
    Agent -->|Generates Prompt Context| OpenAI
    Agent -->|Stores Chat Sessions| PrismaORM
    PrismaORM -->|Reads & Writes| Postgres
    WSGate -->|Streams Text Tokens| Hook
    Hook -->|Updates Chat State| UI
```

---

## 📁 6. Folder Structure

```text
assistent/
├── frontend/                 # React Native / Expo Client
│   ├── src/
│   │   ├── app/              # File-based navigation structure (Onboarding, Login, Drawer)
│   │   ├── components/       # Component library divided by features (auth, chat, ui)
│   │   │   ├── auth/         # Login forms, logo views, social buttons
│   │   │   ├── chat/         # Message bubbles, interactive inputs, suggestion chips
│   │   │   └── ui/           # Custom glass cards, loaders, ambient glows
│   │   ├── constants/        # Design system styles, typography, and color tokens
│   │   ├── hooks/            # Custom hooks (Queries, useChatStream)
│   │   ├── services/         # API wrappers for CRUD endpoints
│   │   └── utils/            # Helpers (Secure storage, Dynamic host IP config)
│   ├── assets/               # Splash icons, fonts, and static media resources
│   ├── app.json              # Expo application manifest
│   ├── metro.config.js       # Metro Bundler configurations
│   ├── package.json          # Client dependencies & scripts
│   └── tsconfig.json         # Client-side TypeScript compiler options
│
├── backend/                  # Node.js + Express RAG & Agentic Gateway
│   ├── src/
│   │   ├── agent/            # LangChain agent architecture & system prompt definitions
│   │   ├── controller/       # Express HTTP controllers & WebSocket connection handlers
│   │   ├── middleware/       # JWT auth filters, request validation, error boundaries
│   │   ├── model/            # LLM models & vector embeddings clients
│   │   ├── routes/           # Express REST API routes
│   │   ├── services/         # Database persistence services (RAG history persistence)
│   │   ├── tools/            # Agentic tool registry (Weather, Math, DB Search)
│   │   └── utils/            # Helpers (Prisma client, PDF parsers, text splitters)
│   ├── prisma/               # Schema configuration, migrations, and seed scripts
│   ├── uploads/              # Storage directory for incoming document ingestion
│   ├── package.json          # Server dependencies & scripts
│   └── tsconfig.json         # Server-side TypeScript compiler options
│
└── README.md                 # System-wide documentation (this file)
```

---

## 🚀 7. Installation

### Prerequisites
*   Node.js (v18.0.0 or higher)
*   npm (v9.0.0 or higher)
*   PostgreSQL database instance with `pgvector` extension installed
*   OpenAI API Key (for LLM generations and embeddings)

### Clone Repository
```bash
git clone https://github.com/okaadyx/assistent.git
cd assistent
```

### Install Dependencies

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd ../frontend
npm install
```

### Environment Setup
Create a `.env` file in the `backend/` directory. Refer to the **Environment Variables** section below for the required parameters.

### Start Development Servers

#### 1. Start the Backend:
```bash
cd backend
npx prisma migrate dev
npm run dev
```

#### 2. Start the Frontend (Metro):
```bash
cd ../frontend
npx expo start -c
```
Use the Expo Go mobile app (iOS or Android) to scan the terminal's QR code. The app automatically resolves your development machine's local IP address on port `3000`.

### Build Production Versions

#### Compile and Bundle Backend:
```bash
cd backend
npm run build
npm start
```

#### Compile and Typecheck Frontend:
```bash
cd ../frontend
npx tsc --noEmit
npx expo export
```

---

## ⚙️ 8. Environment Variables

Create a `.env` file in the `backend/` folder and populate it with the following configuration:

```ini
# Server Configuration
PORT=3000                                               # Port the server listens on
NODE_ENV=development                                    # Runtime environment (development/production)

# Database Connections
DATABASE_URL="postgresql://user:password@localhost:5432/ved_db"  # Prisma relational database URL
SUPABASE_URL="https://your-supabase-project.supabase.co"          # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY="your-supabase-role-key"              # Service key with bypass RLS clearance

# OpenAI Credentials
AI_ENDPOINT="https://api.openai.com/v1"                 # OpenAI API base endpoint
AI_API_KEY="your-openai-api-key"                       # OpenAI authorization key
AI_MODEL="gpt-4o"                                       # Chat model used for completions
AI_EMBEDDING_MODEL="text-embedding-3-small"             # Model used for vector embeddings generation

# Security Configurations
JWT_SECRET="your-high-entropy-jwt-secret-key"           # Cryptographic secret for signing tokens
```

---

## 📡 9. API Documentation

### REST HTTP endpoints

| Method | Endpoint | Description | Headers / Payloads | Success Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/user/register` | Register a new user | `{ "email": "user@ved.ai", "password": "...", "name": "..." }` | `201 Created` |
| `POST` | `/user/login` | Log in and receive JWT | `{ "email": "user@ved.ai", "password": "..." }` | `200 OK` |
| `POST` | `/rag/upload` | Ingest PDF into vector DB | Multipart Form Data containing `file` key (PDF) | `201 Created` |
| `GET` | `/rag/chats` | List user's chat sessions | `Authorization: Bearer <JWT>` | `200 OK` |
| `GET` | `/rag/chats/:id` | Get all messages in session | `Authorization: Bearer <JWT>` | `200 OK` |
| `DELETE` | `/rag/chats/:id` | Delete a chat session | `Authorization: Bearer <JWT>` | `200 OK` |
| `GET` | `/rag/documents` | Get uploaded documents list | `Authorization: Bearer <JWT>` | `200 OK` |
| `DELETE` | `/rag/documents/:filename` | Delete document & vectors | `Authorization: Bearer <JWT>` | `200 OK` |

#### Example REST Ingestion Response (`POST /rag/upload`):
```json
{
  "success": true,
  "data": {
    "filename": "q3_financial_report.pdf",
    "chunks": 42,
    "vectorDbStatus": "Success"
  }
}
```

---

## 🗄️ 10. Database Schema

```mermaid
erDiagram
    USER {
        string id PK
        string email UK
        string password
        string name
        datetime createdAt
        datetime updatedAt
    }
    CHAT {
        string id PK
        string title
        datetime createdAt
        string userId FK
    }
    MESSAGE {
        string id PK
        string role
        string content
        datetime createdAt
        string chatId FK
    }
    DOCUMENTS {
        bigint id PK
        string content
        json metadata
        vector embedding
    }

    USER ||--o{ CHAT : "initiates"
    CHAT ||--|{ MESSAGE : "contains"
```

---

## 🔒 11. Authentication & Security Flow

### Authentication Pipeline
1.  **Registration**: User inputs details validated on client side with `zod` and encrypted on server side with `bcryptjs`.
2.  **Login**: Password verified; server signs a JWT (expiring in 7 days).
3.  **Token Storage**: Frontend saves the token securely via `SecureStore` (native device keychain encryption).
4.  **API Requests**: An Axios request interceptor pulls the token from `SecureStore` and appends it to the `Authorization` header automatically.
5.  **WebSockets Handshake**: Since custom HTTP headers are not supported by WebSockets natively, the token is passed as a query string parameter (`?token=JWT`) and verified before upgrades.

### Security State Machine

```mermaid
sequenceDiagram
    autonumber
    actor User as User Device (App)
    participant SecStore as Secure Store (Keychain)
    participant WS as WebSocket Handshake
    participant API as Express Router
    participant DB as Postgres Database

    User->>API: POST /user/login { email, password }
    API->>DB: Fetch User details by email
    DB-->>API: User Record (Hashed Password)
    API->>API: Verify Password (bcrypt)
    API-->>User: Return JWT Token
    User->>SecStore: Save JWT securely
    
    Note over User, WS: WebSocket Connection
    User->>SecStore: Retrieve JWT
    SecStore-->>User: JWT Value
    User->>WS: Initialize Connection with token parameter (?token=JWT)
    WS->>WS: Decode & Validate JWT signature
    alt Signature Valid
        WS-->>User: Upgrade Connection (HTTP 101 Switching Protocols)
    else Signature Invalid / Expired
        WS-->>User: Refuse Connection (HTTP 401 Unauthorized)
    end
```

### Security Measures Implemented
*   **JWT Integrity**: All JWT signatures are signed using a high-entropy secret.
*   **Prisma Cascades**: Deleting a user or chat cascades deletion to all dependent records to prevent database orphans.
*   **Rate Limiting**: API routes are protected by rate limiters preventing brute-force authentication attempts.
*   **Input Sanitization**: Strictly typed Zod filters strip unexpected payloads at runtime.
*   **Secure Storage**: Local JWTs are encrypted on-device via iOS Keychain and Android KeyStore.

---

## ⚡ 12. State & Token Management

```mermaid
graph TD
    subgraph ClientState [Client State Architecture]
        ReactQuery[React Query: Server State]
        Zustand[Zustand: Local UI State]
        Keychain[SecureStore: Auth State]
    end

    ReactQuery -->|Manages| ChatHistory[Chat Sessions History]
    ReactQuery -->|Manages| DocList[Ingested Document Metadata]
    Zustand -->|Manages| GlassThemes[UI Themes & Overlays]
    Zustand -->|Manages| LoadingStates[Animations & Inputs]
    Keychain -->|Manages| JWT[Bearer Auth Token]
```

*   **TanStack Query (React Query)**: Handles all server-state caching, automatic refetching, query invalidation, and background state synchronization (e.g. invalidating query keys `['chats']` and `['documents']` on deletions).
*   **React Context / Zustand**: Manages transient client state like navigation layers, modal visibility, glassmorphism layout toggles, and user settings.
*   **SecureStore**: Manages application auth tokens, writing directly to the device's hardware credentials vault.

---

## 🚀 13. Performance Optimizations

*   **Dynamic Client Rendering**: FlatList optimizations (`removeClippedSubviews={true}`, `initialNumToRender={10}`) preserve device memory during streaming.
*   **Throttled Rendering**: The WebSocket client collects message chunks in a memory buffer and updates React state at a throttled interval (80ms) to prevent UI thread lockups during fast token generation.
*   **Database Indexing**: PostgreSQL relational database indexes are applied on lookup fields (`userId` on Chat tables, `chatId` on Message tables) to optimize query response times.
*   **Vector Query Speed**: PGVector indexes (HNSW or IVFFlat) are used in production to execute similarity searches in milliseconds.

---

## 🧪 14. Testing

### Run Frontend Unit Tests (Jest):
```bash
cd frontend
npm run test
```

### Run Backend Integration Tests (Supertest + Jest):
```bash
cd backend
npm run test
```

### Run E2E Mobile Tests (Maestro):
```bash
maestro test .maestro/chat_flow.yaml
```

---

## 🔄 15. CI/CD Pipeline

```mermaid
graph LR
    Push[Git Push / PR] --> Lint[Linting Verification]
    Lint --> Types[Typecheck Compilation]
    Types --> Tests[Unit & Integration Tests]
    Tests --> Build[Docker Build & Push]
    Build --> Deploy[Automatic AWS / Railway Rollout]
```

The GitHub Actions workflow automates integration checks on every Pull Request:
1.  **Linter check**: Runs `eslint` across both the frontend and backend directories.
2.  **Type check**: Validates compilation via `tsc --noEmit`.
3.  **Test execution**: Runs the test suite via Jest.
4.  **Deployment trigger**: Releases production builds to target cloud infrastructure when merging to `main`.

---

## 📦 16. Deployment Guides

### Docker Deployment
Build and run the entire ecosystem in containerized environments:
```bash
# Build the backend image
docker build -t ved-backend:latest ./backend

# Run the container mapping port 3000
docker run -d -p 3000:3000 --env-file ./backend/.env ved-backend:latest
```

### Railway Deployment (Backend)
1. Link your GitHub repository to Railway.
2. Add a new service pointing to the `backend/` subdirectory.
3. Configure the environment variables (`DATABASE_URL`, `AI_API_KEY`, etc.) in the Railway settings dashboard.

### EAS Build (Frontend Mobile App)
To compile a standalone `.apk` or `.ipa` binary of the client application using Expo Application Services:
```bash
cd frontend
npm install -g eas-cli
eas build --platform all
```

---

## 📊 17. Monitoring & Logging

*   **Structured Logging**: The backend uses `winston` and `morgan` to log incoming HTTP requests and WebSocket handshakes.
*   **Error Tracking**: Sentry is integrated into the production client and server to capture runtime errors.
*   **Health Check Endpoint**: `/health` returns a `200 OK` status only when connections to Postgres and Supabase are active.

---

## 🗺️ 18. Roadmap

| Version | Target Date | Features | Status |
| :--- | :--- | :--- | :--- |
| `v1.0.0` | Q2 2026 | Initial release with PDF RAG support and WebSocket streaming | `Completed` |
| `v1.1.0` | Q3 2026 | Add multi-file format ingestion (CSV, DOCX, TXT) | `In Progress` |
| `v1.2.0` | Q4 2026 | Introduce offline vector caching on-device | `Planned` |
| `v2.0.0` | Q1 2027 | Multi-agent collaboration with collaborative user rooms | `Planned` |

---

## 🤝 19. Contributing

Contributions are welcome! Please follow these steps to contribute:
1.  **Fork** the repository on GitHub.
2.  **Create a branch** using the naming convention: `feature/your-feature-name` or `bugfix/your-bugfix-name`.
3.  Ensure your code adheres to the project's formatting rules.
4.  Commit your changes using **Conventional Commits**:
    *   `feat: add dynamic vector store search`
    *   `fix: resolve socket reconnect error`
5.  Submit a **Pull Request** targeting the `main` branch.

---

## ❓ 20. FAQ

#### 1. Why does the app fail to connect to the backend during local development?
Most connection failures are due to IP mismatches. The app attempts to automatically resolve your workstation's IP. Ensure both your computer and your testing mobile device are connected to the same Wi-Fi network.

#### 2. Do I need an OpenAI API key to run this project?
Yes, VED utilizes OpenAI's models (`gpt-4o` and `text-embedding-3-small`) to generate responses and vector embeddings.

#### 3. How does the vector embedding generation work?
When a PDF is uploaded, it is split into chunks of text. VED sends these chunks to OpenAI to generate embedding vectors, which are then saved in Supabase PGVector.

#### 4. Can I use a database other than PostgreSQL?
Prisma supports other databases, but Supabase PGVector is required to execute semantic vector similarity searches (`vector` data type).

#### 5. Is there offline support for chatting?
The chat screen saves historical conversations in the PostgreSQL database. However, active agent query processing requires internet access to communicate with the backend and OpenAI.

#### 6. What is the WebSocket throttled interval?
During fast streaming, React state updates can freeze the UI. The WebSocket client buffers tokens and updates the UI every 80ms to keep animations fluid.

#### 7. Is user registration secure?
Yes, user passwords are encrypted using `bcryptjs` before they are written to the database.

#### 8. How do I delete uploaded documents?
Navigate to the "Knowledge Base" screen, swipe to delete, or click the delete button. The app sends a request to remove the file and all associated vector embeddings.

#### 9. What platforms does VED support?
VED is cross-platform, supporting Android, iOS, and Web.

#### 10. Does this work with Expo Go?
Yes, VED is compatible with the standard Expo Go client app.

---

## 🔧 21. Troubleshooting

### 1. WebSocket Connection Errors (`readyState: 3`)
*   **Fix**: Verify your workstation's IP address and ensure AP Isolation is disabled on your router. Ensure port `3000` is open on your firewall.

### 2. Prisma Database Errors on Build
*   **Fix**: Ensure your Postgres database is running. Run `npx prisma db push` to synchronize schemas and verify connections.

### 3. Simulator Connection Failures on Localhost
*   **Fix**: If running on Android Emulator, target the host machine at `10.0.2.2:3000` instead of `localhost`.

---

## 📄 22. License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.

---

## 👥 23. Authors & Support

*   **Author**: Aady ([GitHub](https://github.com/okaadyx) | [LinkedIn](https://linkedin.com/in/aady))
*   **Support**: Report issues or request features by submitting an issue on our [GitHub Tracker](https://github.com/okaadyx/assistent/issues).

---

## 🎉 24. Acknowledgements

*   Thanks to the [Expo](https://expo.dev/) team for the development framework.
*   Thanks to [LangChain](https://www.langchain.com/) for the agentic orchestration library.
*   Thanks to the [Supabase](https://supabase.com/) community for providing the vector extensions.
