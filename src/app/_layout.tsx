import { queryClient } from "@/utils/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { LogBox } from "react-native";

// Ignore deprecation warnings from third-party packages that have not yet migrated
LogBox.ignoreLogs([
  "InteractionManager has been deprecated",
]);

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="drawer" />
      </Stack>
    </QueryClientProvider>
  );
}
