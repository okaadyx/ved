import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

/**
 * Persists the authentication token securely.
 */
export async function saveToken(token: string) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error("Failed to save auth token securely:", error);
  }
}

/**
 * Retrieves the stored token from secure store.
 */
export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Failed to retrieve auth token securely:", error);
    return null;
  }
}

/**
 * Removes the stored token from secure store.
 */
export async function removeToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Failed to delete auth token securely:", error);
  }
}
