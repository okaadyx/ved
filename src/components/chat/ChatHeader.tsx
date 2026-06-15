import React from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "expo-router";
import { Spacing } from "@/constants/theme";

interface ChatHeaderProps {
  theme: any;
  showClear: boolean;
  onClear: () => void;
  statusPulseAnim: Animated.Value;
}

export const ChatHeader = ({ theme, showClear, onClear, statusPulseAnim }: ChatHeaderProps) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          onPress={() => (navigation as any).toggleDrawer()}
          style={{ marginRight: Spacing.two }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 24, color: theme.text }}>☰</Text>
        </TouchableOpacity>
        <View style={styles.statusDotWrapper}>
          <View style={styles.headerAvatar}>
            <Text style={{ fontSize: 18 }}>🤖</Text>
          </View>
          <Animated.View
            style={[
              styles.activeStatusDot,
              { transform: [{ scale: statusPulseAnim }] },
            ]}
          />
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text, fontWeight: "700" }]}>
            Aether AI
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Active Now
          </Text>
        </View>
      </View>

      {showClear && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClear}
          activeOpacity={0.7}
        >
          <Text style={styles.clearText}>
            Clear Chat
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.1)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  statusDotWrapper: {
    position: "relative",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeStatusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#10B981",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  headerTitle: {
    fontSize: 15,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: -2,
  },
  clearButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  clearText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
});
