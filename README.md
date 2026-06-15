# 🌌 Aether Assistant

A premium, fintech-quality React Native Android assistant application featuring a modern **Glassmorphism** design system, secure token authentication, and real-time **RAG (Retrieval-Augmented Generation)** streaming capabilities.

---

## ✨ Features

- **💎 Material You Glassmorphism UI**: Stunning dark-mode-first aesthetic with frosted glass surfaces (`rgba(255,255,255,0.08)`), dynamic background aurora glows, soft gradients, and modern micro-animations.
- **⚡ TanStack Query Integration**: Encapsulated queries and mutations for user auth, profile requests, chat logs retrieval, session deletions, and vector document uploads.
- **🔒 Secure JWT Persistence**: Automatic token storage and recovery using `expo-secure-store` with zero circular-dependency issues.
- **📡 WebSocket Chat Streaming**: Persistent chat channel leveraging WebSockets for low-latency streaming assistant responses.
- **✅ Schema Validation**: Robust client-side validation using `zod` for registration and login fields.

---

## 🛠️ Technical Stack

- **Framework**: Expo v56.0.0 (React Native)
- **Routing**: Expo Router (File-based navigation)
- **State Management**: @tanstack/react-query v5
- **Networking**: Axios Client & WebSockets
- **Secure Storage**: Expo Secure Store
- **Styling**: Vanilla React Native stylesheet with Reanimated & Linear Gradient
- **Validation**: Zod

---

## 📁 Project Directory Structure

```text
src/
├── app/                  # File-based routing entrypoints (Expo Router)
│   ├── auth/             # Welcome, Login, and Signup screens
│   ├── drawer/           # Main application shell (Home & Settings)
│   └── _layout.tsx       # Root application layout provider
├── components/           # Reusable UI elements
│   ├── auth/             # Fields, Social login, and Auth background mesh
│   ├── chat/             # Message items, Header, Inputs, and suggestions
│   └── ui/               # Glassmorphic cards, buttons, and loading states
├── constants/            # Layout limits, Spacing, and Theme palettes
├── hooks/                # Custom React Hooks
│   ├── queries.ts        # TanStack Query mutations and query hooks
│   └── useChatStream.ts  # Real-time WebSocket streaming handlers
├── services/             # Axios API client services
│   ├── rag/              # RAG session endpoints
│   ├── user/             # User Auth endpoints
│   └── index.ts          # Consolidated Client class with request interceptors
└── utils/                # Utilities & helpers
    ├── auth.ts           # Token storage and session persistence manager
    └── queryClient.ts    # TanStack Query client instantiation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Verify that the base backend server URL inside the service client (`src/services/index.ts`) matches your active backend instance (default is `http://192.168.1.4:3000`).

### 3. Clear Cache and Start Metro
Because the project uses modern ESM formats for TanStack Query, the Metro Bundler resolver config has been updated. Start your server resetting the cache:
```bash
npx expo start -c
```

### 4. Codebase Linting & Compilation Verification
Verify type checks and clean compilation:
```bash
npx tsc --noEmit
```

---

## 🔒 Security & Session Flow

1. **Interception**: Every HTTP request sent using the service client automatically retrieves the JWT token asynchronously from `expo-secure-store` and appends it to the `Authorization` header.
2. **Auto-Login**: When launching the app, the startup routine checks for an active secure token. If found, it authenticates the user immediately and routes them directly to the main workspace.
