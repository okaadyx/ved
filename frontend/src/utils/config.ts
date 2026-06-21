/**
 * Dynamically resolves the API base URL.
 * During development, it extracts the host IP address from Expo's Metro server configuration
 * so that physical devices and emulators connect seamlessly to the backend without hardcoded IPs.
 */
export const getApiUrl = (): string => {
  // Allow overriding via environment variables (e.g. EXPO_PUBLIC_API_URL)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Default to the Render API URL
  return "https://ved-ze45.onrender.com";
};

/**
 * Dynamically resolves the WebSocket URL for the RAG chat stream.
 */
export const getWsUrl = (): string => {
  const apiUrl = getApiUrl();
  return apiUrl.replace(/^http/, "ws") + "/rag/chat";
};
