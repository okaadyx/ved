import { Dimensions, StyleSheet, View, useColorScheme } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface AuthBackgroundProps {
  glowOpacityMultiplier?: number;
}

export function AuthBackground({ glowOpacityMultiplier = 1 }: AuthBackgroundProps) {
  const scheme = useColorScheme();

  return (
    <View style={[StyleSheet.absoluteFill, styles.glowContainer]}>
      <View
        style={[
          styles.glowCircle1,
          {
            backgroundColor:
              scheme === "dark"
                ? `rgba(124, 92, 255, ${0.05 * glowOpacityMultiplier})`
                : `rgba(124, 92, 255, ${0.12 * glowOpacityMultiplier})`,
          },
        ]}
      />
      <View
        style={[
          styles.glowCircle2,
          {
            backgroundColor:
              scheme === "dark"
                ? `rgba(94, 234, 212, ${0.04 * glowOpacityMultiplier})`
                : `rgba(94, 234, 212, ${0.08 * glowOpacityMultiplier})`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glowContainer: {
    overflow: "hidden",
  },
  glowCircle1: {
    position: "absolute",
    top: -200,
    left: -150,
    width: SCREEN_WIDTH * 1.3,
    height: SCREEN_WIDTH * 1.3,
    borderRadius: (SCREEN_WIDTH * 1.3) / 2,
    opacity: 0.8,
  },
  glowCircle2: {
    position: "absolute",
    bottom: -150,
    right: -100,
    width: SCREEN_WIDTH * 1.1,
    height: SCREEN_WIDTH * 1.1,
    borderRadius: (SCREEN_WIDTH * 1.1) / 2,
    opacity: 0.6,
  },
});
