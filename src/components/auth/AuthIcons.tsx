import React from "react";
import { StyleSheet, View } from "react-native";

interface IconProps {
  color: string;
}

export const BackIcon = ({ color }: IconProps) => (
  <View style={styles.iconContainer}>
    <View style={[styles.backLine, { backgroundColor: color }]} />
    <View style={[styles.backArrow, { borderColor: color }]} />
  </View>
);

export const UserIcon = ({ color }: IconProps) => (
  <View style={styles.iconContainer}>
    <View style={[styles.userHead, { borderColor: color }]} />
    <View style={[styles.userBody, { borderColor: color }]} />
  </View>
);

export const MailIcon = ({ color }: IconProps) => (
  <View style={styles.iconContainer}>
    <View style={[styles.mailBody, { borderColor: color }]} />
    <View style={[styles.mailFlap, { borderBottomColor: color, borderRightColor: color }]} />
  </View>
);

export const LockIcon = ({ color }: IconProps) => (
  <View style={styles.iconContainer}>
    <View style={[styles.lockShackle, { borderColor: color }]} />
    <View style={[styles.lockBody, { borderColor: color }]} />
  </View>
);

interface EyeIconProps extends IconProps {
  show: boolean;
}

export const EyeIcon = ({ color, show }: EyeIconProps) => (
  <View style={styles.iconContainer}>
    <View style={[styles.eyeIris, { borderColor: color }]} />
    <View style={[styles.eyePupil, { backgroundColor: color }]} />
    {!show && <View style={[styles.eyeSlash, { backgroundColor: color }]} />}
  </View>
);

const styles = StyleSheet.create({
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backLine: {
    width: 13,
    height: 2,
    borderRadius: 1,
  },
  backArrow: {
    position: "absolute",
    left: 3,
    width: 8,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "45deg" }],
  },
  userHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    marginBottom: 2,
  },
  userBody: {
    width: 16,
    height: 6,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderWidth: 1.5,
    borderBottomWidth: 0,
  },
  mailBody: {
    width: 18,
    height: 13,
    borderRadius: 2.5,
    borderWidth: 1.5,
  },
  mailFlap: {
    position: "absolute",
    top: 4,
    width: 7,
    height: 7,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    transform: [{ rotate: "45deg" }],
  },
  lockBody: {
    width: 16,
    height: 12,
    borderRadius: 2.5,
    borderWidth: 1.5,
    marginTop: 4,
  },
  lockShackle: {
    width: 10,
    height: 8,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    marginBottom: -4,
  },
  eyeIris: {
    width: 18,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  eyePupil: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  eyeSlash: {
    position: "absolute",
    width: 20,
    height: 1.5,
    transform: [{ rotate: "-45deg" }],
  },
});
