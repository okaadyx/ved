import { getToken } from "@/utils/auth";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function initAuth() {
      const token = await getToken();
      if (!active) return;
      if (token) {
        router.replace("/drawer");
      } else {
        router.replace("/auth/welcome");
      }
      setLoading(false);
    }
    const timer = setTimeout(() => {
      initAuth();
    }, 100);

    return () => {
      active = false;
      clearTimeout(timer);
    };
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
