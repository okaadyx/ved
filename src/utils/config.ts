import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Dynamically resolves the API base URL.
 * During development, it extracts the host IP address from Expo's Metro server configuration
 * so that physical devices and emulators connect seamlessly to the backend without hardcoded IPs.
 */
export const getApiUrl = (): string => {
  // Constants.expoConfig?.hostUri is typically available in development builds / Expo Go
  // and points to the Metro packager host (e.g. "192.168.1.6:8081")
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:3000`;
  }

  // Fallback for emulator environments when hostUri is not resolved
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:3000";
    }
  }

  // Default fallback to the current development host IP
  return "http://192.168.1.6:3000";
};

/**
 * Dynamically resolves the WebSocket URL for the RAG chat stream.
 */
export const getWsUrl = (): string => {
  const apiUrl = getApiUrl();
  return apiUrl.replace(/^http/, "ws") + "/rag/chat";
};
