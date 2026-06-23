import { AuthBackground } from "@/components/auth/AuthBackground";
import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];


  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();


    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <AuthBackground glowOpacityMultiplier={scheme === "dark" ? 1.6 : 1.25} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.contentContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >

          <View style={styles.header} />
          <View style={styles.orbWrapper}>
            <Animated.View
              style={[
                styles.orbOuterRing,
                {
                  borderColor: scheme === "dark" ? "rgba(124, 92, 255, 0.25)" : "rgba(124, 92, 255, 0.15)",
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              <View style={[styles.orbNode, { backgroundColor: "#7C5CFF", top: 10, left: 10 }]} />
              <View style={[styles.orbNode, { backgroundColor: "#5EEAD4", bottom: 10, right: 10 }]} />
            </Animated.View>

            <Animated.View
              style={[
                styles.orbInnerRing,
                {
                  borderColor: scheme === "dark" ? "rgba(94, 234, 212, 0.3)" : "rgba(94, 234, 212, 0.2)",
                  transform: [{ rotate: spin }, { scale: pulseAnim }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.orbCore,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: scheme === "dark" ? "rgba(124, 92, 255, 0.15)" : "rgba(124, 92, 255, 0.1)",
                  shadowColor: "#7C5CFF",
                },
              ]}
            >
              <Text style={{ fontSize: 48 }}>🧠</Text>
            </Animated.View>
          </View>

          <View style={styles.textGroup}>
            <Text style={[styles.title, { color: theme.text }]}>
              Meet VED
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Your Personal Knowledge AI
            </Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={() => router.push("/auth/signup")}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                Log In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestLink}
              activeOpacity={0.7}
              onPress={() => router.push("/drawer")}
            >
              <Text style={[styles.guestLinkText, { color: theme.textSecondary }]}>
                Continue as Guest
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            By signing up, you agree to our Terms of Service & Privacy Policy.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.15)",
  },
  logoEmoji: {
    fontSize: 18,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  orbWrapper: {
    height: 230,
    width: 230,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginVertical: Spacing.three,
  },
  orbOuterRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  orbInnerRing: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
  },
  orbNode: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  orbCore: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  textGroup: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 44,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  buttonGroup: {
    width: "100%",
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  primaryButton: {
    backgroundColor: "#7C5CFF",
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C5CFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  guestLink: {
    alignItems: "center",
    paddingVertical: Spacing.one,
  },
  guestLinkText: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footerText: {
    fontSize: 11,
    textAlign: "center",
    opacity: 0.6,
  },
});
