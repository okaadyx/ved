import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
let memoryToken: string | null = null;

/**
 * Persists the authentication token securely, falling back to localStorage or memory if needed.
 */
export async function saveToken(token: string) {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(TOKEN_KEY, token);
      } else {
        memoryToken = token;
      }
    } else {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(TOKEN_KEY, token);
        } else {
          memoryToken = token;
        }
      }
    }
    console.log("[saveToken] Token saved successfully.");
  } catch (error) {
    console.error("[saveToken] Failed to save auth token securely:", error);
    memoryToken = token;
  }
}

/**
 * Retrieves the stored token from secure store, falling back to localStorage or memory if needed.
 */
export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(TOKEN_KEY);
      }
      return memoryToken;
    } else {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      } else {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(TOKEN_KEY);
        }
        return memoryToken;
      }
    }
  } catch (error) {
    console.error("[getToken] Failed to retrieve auth token securely:", error);
    return memoryToken;
  }
}

/**
 * Removes the stored token from secure store, falling back to localStorage or memory if needed.
 */
export async function removeToken() {
  try {
    memoryToken = null;
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    } else {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } else {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(TOKEN_KEY);
        }
      }
    }
    console.log("[removeToken] Token removed successfully.");
  } catch (error) {
    console.error("[removeToken] Failed to delete auth token securely:", error);
  }
}
