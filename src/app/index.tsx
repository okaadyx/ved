import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { getToken } from "@/utils/auth";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = await getToken();
      if (token) {
        router.replace("/drawer/index" as any);
      } else {
        router.replace("/auth/welcome" as any);
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0F172A",
        }}
      >
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return null;
}

