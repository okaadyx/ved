import { Spacing } from "@/constants/theme";
import { Message } from "@/types/chat";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Clipboard,
  ColorSchemeName,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { CodeBlock } from "./CodeBlock";
import { CursorSymbol } from "./CursorSymbol";

interface MessageItemProps {
  message: Message;
  isStreaming: boolean;
  theme: any;
  scheme: ColorSchemeName;
}

const renderMarkdownLine = (text: string, showCursor: boolean = false) => {
  // Limit bold matches to 150 characters to prevent accidental bolding of entire responses or large paragraphs
  const regex = /\*\*(.{1,150}?)\*\*/g;

  if (!text.includes("**") && !showCursor) {
    return text;
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let index = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }
    elements.push(
      <Text key={`b-${index++}`} style={{ fontWeight: "bold" }}>
        {match[1]}
      </Text>,
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  if (showCursor) {
    elements.push(<CursorSymbol key="cursor" />);
  }

  return elements;
};

export const MessageItem = React.memo(({ message, isStreaming, theme, scheme }: MessageItemProps) => {
  const isUser = message.role === "user";
  const [copiedResponse, setCopiedResponse] = useState(false);

  const formatTime = (date: Date | string | number) => {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) {
      return "";
    }
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleCopyResponse = () => {
    Clipboard.setString(message.content);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const renderMessageContent = (
    content: string,
    isUser: boolean,
    isStreaming: boolean = false,
  ) => {
        if (isUser) {
      return (
        <Text
          selectable={true}
          style={{
            color: scheme === "dark" ? "#ffffff" : "#000000",
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          {content}
        </Text>
      );
    }

    if (!content) {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginVertical: 4,
          }}
        >
          <ActivityIndicator size="small" color="#7C5CFF" />
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>
            Generating...
          </Text>
        </View>
      );
    }

    const parts = content.split("```");
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const lines = part.split("\n");
        const lang = lines[0].trim();
        const code = lines.slice(1).join("\n").trim();

        const showCursorHere = isStreaming && index === parts.length - 1;

        return (
          <CodeBlock
            key={index}
            lang={lang}
            code={code}
            theme={theme}
            showCursor={showCursorHere}
          />
        );
      }

      const blocks = part.split("\n\n");
      const isLastPart = index === parts.length - 1;

      return (
        <View key={index}>
          {blocks.map((block, blockIdx) => {
            const isLastBlock = isLastPart && blockIdx === blocks.length - 1;
            const trimmedBlock = block.trim();

            if (trimmedBlock === "") {
              return null;
            }

            const headingMatch = block.match(/^(#{1,6})\s+([\s\S]*)$/);
            if (headingMatch) {
              const level = headingMatch[1].length;
              const headingText = headingMatch[2].trim();
              const fontSize =
                level === 1 ? 22 : level === 2 ? 20 : level === 3 ? 18 : 16;
              const fontWeight = "700";
              const marginTop = Spacing.three;
              const marginBottom = Spacing.one;

              return (
                <Text
                  key={blockIdx}
                  selectable={true}
                  style={{
                    fontSize,
                    fontWeight,
                    marginTop,
                    marginBottom,
                    color: theme.text,
                  }}
                >
                  {renderMarkdownLine(headingText, isStreaming && isLastBlock)}
                </Text>
              );
            }

            const isNumberedList = /^\s*\d+\.\s+/.test(block);
            const isBulletList = /^\s*([•\-*])\s+/.test(block);

            if (isNumberedList || isBulletList) {
              const lines = block.split("\n");
              return (
                <View key={blockIdx} style={{ marginVertical: Spacing.one }}>
                  {lines.map((line, lineIdx) => {
                    const isLastLine = lineIdx === lines.length - 1;
                    const showCursorHere =
                      isStreaming && isLastBlock && isLastLine;
                    const trimmedLine = line.trim();

                    const numListMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
                    if (numListMatch) {
                      const num = numListMatch[1];
                      const listText = numListMatch[2];
                      return (
                        <View key={lineIdx} style={styles.bulletRow}>
                          <Text
                            style={[
                              styles.bulletDot,
                              { color: theme.text, fontWeight: "600" },
                            ]}
                          >
                            {num}.
                          </Text>
                          <Text
                            selectable={true}
                            style={[styles.bulletText, { color: theme.text }]}
                          >
                            {renderMarkdownLine(listText, showCursorHere)}
                          </Text>
                        </View>
                      );
                    }

                    if (
                      trimmedLine.startsWith("•") ||
                      trimmedLine.startsWith("-") ||
                      trimmedLine.startsWith("*")
                    ) {
                      const cleanedLine = line.replace(/^\s*([•\-*])\s*/, "");
                      return (
                        <View key={lineIdx} style={styles.bulletRow}>
                          <Text
                            style={[styles.bulletDot, { color: theme.text }]}
                          >
                            •
                          </Text>
                          <Text
                            selectable={true}
                            style={[styles.bulletText, { color: theme.text }]}
                          >
                            {renderMarkdownLine(cleanedLine, showCursorHere)}
                          </Text>
                        </View>
                      );
                    }

                    if (trimmedLine === "") return null;
                    return (
                      <Text
                        key={lineIdx}
                        selectable={true}
                        style={[
                          styles.paragraph,
                          { color: theme.text, marginLeft: Spacing.four },
                        ]}
                      >
                        {renderMarkdownLine(line, showCursorHere)}
                      </Text>
                    );
                  })}
                </View>
              );
            }

            const lines = block.split("\n");
            return (
              <Text
                key={blockIdx}
                selectable={true}
                style={[styles.paragraph, { color: theme.text }]}
              >
                {lines.map((line, lineIdx) => {
                  const isLastLine = lineIdx === lines.length - 1;
                  const showCursorHere =
                    isStreaming && isLastBlock && isLastLine;
                  return (
                    <Text key={lineIdx}>
                      {lineIdx > 0 ? "\n" : ""}
                      {renderMarkdownLine(line, showCursorHere)}
                    </Text>
                  );
                })}
              </Text>
            );
          })}
        </View>
      );
    });
  };

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.userRow : styles.assistantRow,
      ]}
    >
      {!isUser && (
        <View style={[styles.assistantAvatar, { backgroundColor: theme.backgroundElement }]}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.avatarImage}
          />
        </View>
      )}

      <View style={!isUser ? styles.assistantContentContainer : undefined}>
        {!isUser && (
          <Text style={[styles.assistantName, { color: theme.textSecondary }]}>
            VED
          </Text>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser
              ? [
                styles.userBubble,
                {
                  backgroundColor:
                    scheme === "dark"
                      ? "rgba(124, 92, 255, 0.2)"
                      : "rgba(124, 92, 255, 0.08)",
                },
              ]
              : styles.assistantBubble,
            !isUser ? styles.assistantTextBody : undefined,
          ]}
        >
          {renderMessageContent(message.content, isUser, isStreaming)}
        </View>

        <View style={styles.bubbleFooter}>
          <Text style={[styles.timestampText, { color: theme.textSecondary }]}>
            {formatTime(message.timestamp)}
          </Text>
          {!isUser && !isStreaming && message.content && (
            <TouchableOpacity
              onPress={handleCopyResponse}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionButtonText, { color: theme.textSecondary }]}>
                {copiedResponse ? "Copied" : "Copy"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  messageRow: {
    marginVertical: Spacing.two,
    width: "100%",
  },
  userRow: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
    maxWidth: "85%",
  },
  assistantRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "flex-start",
    width: "100%",
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.12)",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  assistantContentContainer: {
    flex: 1,
  },
  assistantName: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "700",
  },
  assistantTextBody: {
    paddingRight: 8,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    borderRadius: 22,
    elevation: 0.5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  assistantBubble: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 2,
  },
  bubbleFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 12,
  },
  timestampText: {
    fontSize: 9.5,
  },
  actionButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "rgba(128, 128, 128, 0.08)",
  },
  actionButtonText: {
    fontSize: 9.5,
    fontWeight: "600",
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 4,
    paddingLeft: Spacing.two,
  },
  bulletDot: {
    marginRight: Spacing.two,
    fontSize: 16,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
});
