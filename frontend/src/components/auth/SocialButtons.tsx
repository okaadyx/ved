import { Spacing } from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SocialButtonsProps {
  theme: any;
  onGooglePress?: () => void;
  onApplePress?: () => void;
  dividerText?: string;
}

const AppleIcon = ({ color, theme }: { color: string; theme: any }) => (
  <View style={styles.appleWrapper}>
    {/* Leaf */}
    <View style={[styles.appleLeaf, { backgroundColor: color }]} />
    {/* Main Body */}
    <View style={styles.appleBodyRow}>
      <View style={[styles.appleLeft, { backgroundColor: color }]} />
      <View style={[styles.appleRight, { backgroundColor: color }]} />
    </View>
    {/* Bite Cutout Mask */}
    <View style={[styles.appleBite, { backgroundColor: theme.backgroundElement }]} />
  </View>
);

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
          <View style={styles.socialButtonContent}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={[styles.socialButtonText, { color: theme.text }]}>
              Google
            </Text>
          </View>
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
          <View style={styles.socialButtonContent}>
            <AppleIcon color={theme.text} theme={theme} />
            <Text style={[styles.socialButtonText, { color: theme.text }]}>
              Apple
            </Text>
          </View>
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
  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    fontWeight: "900",
    fontSize: 17,
    color: "#4285F4",
    marginRight: 8,
  },
  appleWrapper: {
    width: 14,
    height: 16,
    justifyContent: "flex-end",
    alignItems: "center",
    marginRight: 8,
    position: "relative",
  },
  appleLeaf: {
    width: 4.5,
    height: 4.5,
    borderTopLeftRadius: 4.5,
    borderBottomRightRadius: 4.5,
    position: "absolute",
    top: 1,
    right: 2,
    transform: [{ rotate: "-25deg" }],
  },
  appleBodyRow: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
  },
  appleLeft: {
    width: 7,
    height: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginRight: -2,
  },
  appleRight: {
    width: 7,
    height: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginLeft: -2,
  },
  appleBite: {
    position: "absolute",
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
    right: -1.5,
    bottom: 3.5,
  },
});
