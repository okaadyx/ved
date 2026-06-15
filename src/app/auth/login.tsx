import { AuthBackground } from "@/components/auth/AuthBackground";
import { BackIcon, LockIcon, MailIcon } from "@/components/auth/AuthIcons";
import { AuthInput } from "@/components/auth/AuthInput";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please fill in all fields.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Please fill in all fields.")
    .min(6, "Password must be at least 6 characters."),
});

import { useLoginMutation } from "@/hooks/queries";

export default function LoginScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLoginMutation();

  const handleLogin = () => {
    setError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.replace("/drawer/index" as any);
        },
        onError: (err: any) => {
          const errMsg =
            err.response?.data?.message || err.message || "Login failed.";
          setError(errMsg);
        },
      }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <AuthBackground />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <BackIcon color={theme.text} />
            </TouchableOpacity>


            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Access your Aether AI assistant account
              </Text>
            </View>

            <View style={styles.form}>
              {error && (
                <View style={styles.errorAlert}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              )}

              <AuthInput
                label="Email Address"
                theme={theme}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                renderIcon={(focused) => (
                  <MailIcon color={focused ? "#6366F1" : theme.textSecondary} />
                )}
              />

              <AuthInput
                label="Password"
                theme={theme}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                renderIcon={(focused) => (
                  <LockIcon color={focused ? "#6366F1" : theme.textSecondary} />
                )}
                rightElement={
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={[styles.forgotPasswordText, { color: "#6366F1" }]}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                }
              />

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { opacity: loginMutation.isPending ? 0.8 : 1 },
                ]}
                onPress={handleLogin}
                disabled={loginMutation.isPending}
                activeOpacity={0.8}
              >
                {loginMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            <SocialButtons theme={theme} />

            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/signup")} activeOpacity={0.7}>
                <Text style={[styles.signUpLink, { color: "#6366F1" }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.12)",
    marginBottom: Spacing.five,
  },
  header: {
    marginBottom: Spacing.five,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: Spacing.two,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: Spacing.four,
  },
  errorAlert: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.one,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#6366F1",
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.two,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.six,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});
