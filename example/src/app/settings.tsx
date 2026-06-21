import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function SettingScreen() {
  return (
    <SafeAreaProvider>
      <View style={{ top: 100 }}>
        <Text style={{ color: "red", fontSize: 20 }}>settings</Text>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});
