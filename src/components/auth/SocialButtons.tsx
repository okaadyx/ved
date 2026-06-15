import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Spacing } from "@/constants/theme";

interface SocialButtonsProps {
  theme: any;
  onGooglePress?: () => void;
  onApplePress?: () => void;
  dividerText?: string;
}

export function SocialButtons({
  theme,
  onGooglePress,
  onApplePress,
  dividerText = "or continue with",
}: SocialButtonsProps) {
  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.backgroundSelected }]} />
        <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
          {dividerText}
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.backgroundSelected }]} />
      </View>

      {/* Social Buttons */}
      <View style={styles.socialRow}>
        <TouchableOpacity
          style={[
            styles.socialButton,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.backgroundSelected,
            },
          ]}
          onPress={onGooglePress}
          activeOpacity={0.7}
        >
          <Text style={[styles.socialButtonText, { color: theme.text }]}>
            <Text style={{ color: "#EA4335", fontWeight: "800" }}>G</Text>oogle
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.socialButton,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.backgroundSelected,
            },
          ]}
          onPress={onApplePress}
          activeOpacity={0.7}
        >
          <Text style={[styles.socialButtonText, { color: theme.text }]}>
             Apple
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.five,
    gap: Spacing.three,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "500",
  },
  socialRow: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  socialButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
