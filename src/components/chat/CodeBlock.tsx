import React, { useState } from "react";
import {
  Clipboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Spacing } from "@/constants/theme";
import { CursorSymbol } from "./CursorSymbol";

interface CodeBlockProps {
  lang: string;
  code: string;
  theme: any;
  showCursor: boolean;
}

export const CodeBlock = ({ lang, code, theme, showCursor }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View
      style={[styles.codeBlock, { backgroundColor: theme.backgroundSelected }]}
    >
      <View style={styles.codeBlockHeader}>
        <Text style={[styles.codeBlockLang, { color: theme.textSecondary }]}>
          {lang ? lang.toUpperCase() : "CODE"}
        </Text>
        <TouchableOpacity
          onPress={handleCopy}
          activeOpacity={0.7}
          style={styles.copyButton}
        >
          <Text style={[styles.copyButtonText, { color: theme.textSecondary }]}>
            {copied ? "Copied!" : "Copy"}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.codeScrollView}
      >
        <Text style={[styles.codeBlockText, { color: theme.text }]}>
          {code}
          {showCursor && <CursorSymbol />}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  codeBlock: {
    borderRadius: 8,
    padding: 12,
    marginVertical: Spacing.three,
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.12)",
  },
  codeBlockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.15)",
    paddingBottom: 6,
    marginBottom: 8,
  },
  codeBlockLang: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  codeBlockText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 13.5,
    lineHeight: 19,
  },
  codeScrollView: {
    marginTop: 2,
  },
  copyButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "rgba(128, 128, 128, 0.12)",
  },
  copyButtonText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
