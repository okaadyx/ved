import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Text } from "react-native";
import { Spacing } from "@/constants/theme";

interface ChatInputProps {
  theme: any;
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  insets: any;
}

export const ChatInput = ({ theme, inputText, onChangeText, onSend, insets }: ChatInputProps) => {
  const isSendDisabled = !inputText.trim();

  return (
    <View
      style={[
        styles.inputWrapper,
        { paddingBottom: Math.max(insets.bottom, Spacing.three) },
      ]}
    >
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Message Aether..."
          placeholderTextColor={theme.textSecondary}
          value={inputText}
          onChangeText={onChangeText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: !isSendDisabled
                ? "#6366F1"
                : "rgba(99, 102, 241, 0.15)",
            },
          ]}
          activeOpacity={0.7}
          disabled={isSendDisabled}
          onPress={onSend}
        >
          <Text
            style={{
              color: !isSendDisabled ? "#ffffff" : theme.textSecondary,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            ↑
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    backgroundColor: "transparent",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 26,
    borderWidth: 1.5,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
});
