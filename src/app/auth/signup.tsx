import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Colors, Spacing, MaxContentWidth } from "@/constants/theme";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthInput } from "@/components/auth/AuthInput";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { BackIcon, UserIcon, MailIcon, LockIcon } from "@/components/auth/AuthIcons";

export default function SignupScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = () => {
    setError(null);

    // Validation checks
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    // Simulate Auth Registration API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/drawer/index");
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background Aurora Mesh Glows */}
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
            {/* Back Button */}
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <BackIcon color={theme.text} />
            </TouchableOpacity>

            {/* Header Section */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Join Aether AI and experience intelligent workspace collaboration
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              {error && (
                <View style={styles.errorAlert}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              )}

              {/* Name Field */}
              <AuthInput
                label="Full Name"
                theme={theme}
                placeholder="Enter your name"
                autoCapitalize="words"
                autoCorrect={false}
                value={name}
                onChangeText={setName}
                renderIcon={(focused) => (
                  <UserIcon color={focused ? "#6366F1" : theme.textSecondary} />
                )}
              />

              {/* Email Field */}
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

              {/* Password Field */}
              <AuthInput
                label="Password"
                theme={theme}
                placeholder="Create password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                renderIcon={(focused) => (
                  <LockIcon color={focused ? "#6366F1" : theme.textSecondary} />
                )}
              />

              {/* Confirm Password Field */}
              <AuthInput
                label="Confirm Password"
                theme={theme}
                placeholder="Confirm password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                renderIcon={(focused) => (
                  <LockIcon color={focused ? "#6366F1" : theme.textSecondary} />
                )}
              />

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.submitButton, { opacity: isLoading ? 0.8 : 1 }]}
                onPress={handleSignup}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Social Buttons */}
            <SocialButtons theme={theme} dividerText="or sign up with" />

            {/* Navigation Bottom Footer */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")} activeOpacity={0.7}>
                <Text style={[styles.signUpLink, { color: "#6366F1" }]}>Log In</Text>
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
