# 🌌 VED Mobile Client — Cross-Platform AI Assistant App

The premium, cross-platform mobile client application for the **VED** ecosystem. Built on **Expo SDK** and **React Native**, it features a cutting-edge Glassmorphism design system, persistent secure authentication, and real-time WebSocket token streaming.

---

## ⚡ Key Features

*   **✨ Glassmorphism Design System**: Frosted overlays (`rgba(255,255,255,0.08)`), radial gradient glows, and fluid layout transitions.
*   **📡 WebSocket Token Streaming**: High-speed, real-time message stream updating the UI incrementally as tokens arrive.
*   **🔒 Secure Credentials Store**: Sensitive user JWT auth tokens are encrypted on-device via iOS Keychain / Android KeyStore.
*   **🔄 Efficient Server Caching**: Driven by TanStack Query (React Query) for smart cache invalidation and profile updates.
*   **🛠️ Document Management Hub**: In-app document uploads and deletions synced in real-time with the backend vector store.

---

## 🧱 Client Architecture Directory

```text
src/
├── app/              # File-based navigation structure (Onboarding, Login, Drawer)
├── components/       # Component library divided by features (auth, chat, ui)
│   ├── auth/         # Login forms, logo views, social buttons
│   ├── chat/         # Message bubbles, interactive inputs, suggestion chips
│   └── ui/           # Custom glass cards, loaders, ambient glows
├── constants/        # Design system styles, typography, and color tokens
├── hooks/            # Queries, mutations, and WebSocket event subscribers
├── services/         # REST API clients
└── utils/            # Keychain management & local IP address config
```

---

## ⚙️ Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Connect to the Backend
During local development, the client automatically resolves your development computer's local IP address on port `3000` to establish the WebSocket connection.
*   Make sure your computer and mobile testing device are connected to the **same Wi-Fi network**.
*   Alternatively, you can configure your custom backend API URL inside `src/utils/config.ts` or `app.json`.

### 3. Start Development Server
```bash
npx expo start -c
```
*   Scan the QR code in the terminal using the **Expo Go** application on your device.

---

## 📦 Building Standalone APKs

You can compile standalone Android installation files (`.apk`) using two different methods:

### Method A: Local Gradle Build
To build the release APK directly on your local workstation (requires Android SDK and Java JDK installed):

1.  **Generate native directories**:
    ```bash
    npx expo prebuild
    ```
2.  **Compile release APK**:
    ```bash
    cd android
    ./gradlew assembleRelease
    ```
3.  The output APK will be saved at:
    `android/app/build/outputs/apk/release/app-release.apk`

### Method B: EAS Cloud Build (Recommended)
To trigger a remote build on Expo's build servers using Expo Application Services (EAS):

1.  **Install EAS CLI**:
    ```bash
    npm install -g eas-cli
    ```
2.  **Start Build**:
    ```bash
    npx eas-cli build --platform android --profile preview
    ```
3.  Once the build completes, the CLI will output a direct download link for the installable `.apk` file.

---

## 📲 Access Locally Compiled Release APK
* **Workspace Root**: [app-release.apk](../app-release.apk)
* **Standard Build Output**: [app-release.apk](./android/app/build/outputs/apk/release/app-release.apk)

