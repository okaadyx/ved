import { Spacing } from "@/constants/theme";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { EyeIcon } from "./AuthIcons";

interface AuthInputProps extends Omit<TextInputProps, "secureTextEntry"> {
  label: string;
  theme: any;
  renderIcon: (focused: boolean) => React.ReactNode;
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
}

export function AuthInput({
  label,
  theme,
  renderIcon,
  secureTextEntry = false,
  rightElement,
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
  autoCorrect,
  keyboardType,
  ...rest
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
          {label}
        </Text>
        {rightElement}
      </View>
      <View
        style={[
          styles.inputFieldWrapper,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: focused ? "#7C5CFF" : "rgba(128, 128, 128, 0.12)",
            borderWidth: focused ? 1.5 : 1,
          },
        ]}
      >
        {renderIcon(focused)}
        <TextInput
          style={[styles.inputField, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <EyeIcon color={theme.textSecondary} show={showPassword} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    gap: Spacing.two,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputFieldWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputField: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    marginLeft: 12,
    paddingVertical: 10,
  },
  eyeButton: {
    padding: 4,
  },
});
