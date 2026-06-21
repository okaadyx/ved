import CustomDrawerContent from "@/components/drawer/CustomDrawerContent";
import { Drawer } from "expo-router/drawer";
import { useColorScheme } from "react-native";

const colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
  },
};

export default function Layout() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? colors.dark : colors.light;

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.background,
        },
        drawerActiveTintColor: theme.text,
        drawerActiveBackgroundColor: theme.backgroundSelected,
        drawerInactiveTintColor: theme.textSecondary,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "600",
        },
      }}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="documents" />
    </Drawer>
  );
}
