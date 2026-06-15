import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Clipboard,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "expo-router";

const colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
};

const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
};

const MaxContentWidth = 800;

const getApiUrl = () => {
  return "http://192.168.1.4:3000";
};

const getWsUrl = () => {
  const apiUrl = getApiUrl();
  return apiUrl.replace(/^http/, "ws") + "/rag/chat";
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  {
    title: "💡 Brainstorm ideas",
    subtitle: "Productivity app concepts",
    prompt: "Brainstorm 3 unique app ideas for a personal productivity tool.",
  },
  {
    title: "💻 Explain code",
    subtitle: "JavaScript closures",
    prompt: "Explain JavaScript closures with a clear code example.",
  },
  {
    title: "✉️ Draft email",
    subtitle: "Request project feedback",
    prompt:
      "Draft a polite email to a client requesting feedback on a project.",
  },
  {
    title: "🎨 UI Palettes",
    subtitle: "Sleek dark mode apps",
    prompt: "Suggest 3 premium color palettes for a sleek dark mode app.",
  },
];

const CursorSymbol = () => {
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    );
    blink.start();
    return () => blink.stop();
  }, []);

  return (
    <Animated.Text
      style={{
        opacity: blinkAnim,
        fontSize: 16,
        color: "#8B5CF6",
        fontWeight: "bold",
      }}
    >
      ▊
    </Animated.Text>
  );
};

const renderMarkdownLine = (text: string, showCursor: boolean = false) => {
  const regex = /\*\*(.*?)\*\*/g;

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

const CodeBlock = ({
  lang,
  code,
  theme,
  showCursor,
}: {
  lang: string;
  code: string;
  theme: any;
  showCursor: boolean;
}) => {
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? colors.dark : colors.light;
  const flatListRef = useRef<FlatList>(null);

  // Animation Refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const statusPulseAnim = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // Clean up references for intervals
  const streamingIntervalRef = useRef<any>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const streamingBufferRef = useRef("");
  const flushIntervalRef = useRef<any>(null);

  const cleanupStream = () => {
    setIsStreamingActive(false);
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    if (flushIntervalRef.current) {
      clearInterval(flushIntervalRef.current);
      flushIntervalRef.current = null;
    }
    streamingBufferRef.current = "";
  };

  useEffect(() => {
    // Pulse animation for AI Avatar when empty
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    // Pulse animation for green active status dot
    const statusPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(statusPulseAnim, {
          toValue: 1.5,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(statusPulseAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    statusPulse.start();

    return () => {
      pulse.stop();
      statusPulse.stop();
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
      cleanupStream();
    };
  }, []);

  // Typing dots animation
  useEffect(() => {
    let anim1: Animated.CompositeAnimation | null = null;
    let anim2: Animated.CompositeAnimation | null = null;
    let anim3: Animated.CompositeAnimation | null = null;

    if (isTyping) {
      const animateDot = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1.0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        );
      };

      anim1 = animateDot(dot1, 0);
      anim2 = animateDot(dot2, 150);
      anim3 = animateDot(dot3, 300);

      anim1.start();
      anim2.start();
      anim3.start();
    } else {
      dot1.setValue(0.3);
      dot2.setValue(0.3);
      dot3.setValue(0.3);
    }

    return () => {
      anim1?.stop();
      anim2?.stop();
      anim3?.stop();
    };
  }, [isTyping]);

  const handleSend = (textToSend?: string) => {
    const messageText = textToSend || inputText;
    if (!messageText.trim()) return;

    // Clean up any existing stream first
    cleanupStream();

    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    if (!textToSend) {
      setInputText("");
    }

    setIsTyping(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 60);

    const wsUrl = getWsUrl();
    const assistantMsgId = (Date.now() + 1).toString();

    // Initialize stream state
    streamingBufferRef.current = "";
    let assistantMessageCreated = false;

    console.log("Connecting to WebSocket:", wsUrl);
    setIsStreamingActive(true);
    const ws = new WebSocket(wsUrl);
    webSocketRef.current = ws;

    // Start a throttled flush interval to update React state
    flushIntervalRef.current = setInterval(() => {
      const bufferedContent = streamingBufferRef.current;
      if (!bufferedContent) return;

      setIsTyping(false);

      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.id === assistantMsgId) {
          if (lastMsg.content !== bufferedContent) {
            return prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: bufferedContent }
                : msg,
            );
          }
          return prev;
        } else {
          assistantMessageCreated = true;
          return [
            ...prev,
            {
              id: assistantMsgId,
              role: "assistant",
              content: bufferedContent,
              timestamp: new Date(),
            },
          ];
        }
      });

      // Scroll to end (non-animated for performance during fast stream)
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 80);

    ws.onopen = () => {
      console.log("WebSocket connection opened");
      // Send the query message to the RAG server
      ws.send(
        JSON.stringify({
          type: "chat",
          query: messageText.trim(),
          chatId: chatId,
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data.toString());

        if (response.type === "chatId") {
          setChatId(response.chatId);
        } else if (response.type === "content") {
          // Append chunk to the buffer instead of setting state directly (reduces re-renders)
          streamingBufferRef.current += response.content;
        } else if (response.type === "done") {
          // Stream completed successfully, close WebSocket
          ws.close();
          if (flushIntervalRef.current) {
            clearInterval(flushIntervalRef.current);
            flushIntervalRef.current = null;
          }
          setIsTyping(false);

          // Final flush to ensure no remaining buffer is lost
          const finalContent = streamingBufferRef.current;
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.id === assistantMsgId) {
              return prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, content: finalContent }
                  : msg,
              );
            } else {
              return [
                ...prev,
                {
                  id: assistantMsgId,
                  role: "assistant",
                  content: finalContent,
                  timestamp: new Date(),
                },
              ];
            }
          });

          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 50);
        } else if (response.type === "error") {
          console.error("Server error:", response.message);
          handleStreamError(response.message);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    const handleStreamError = (errorMsg: string) => {
      ws.close();
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
        flushIntervalRef.current = null;
      }
      setIsTyping(false);

      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        const errorContent = `⚠️ Error: ${errorMsg}`;
        if (lastMsg && lastMsg.id === assistantMsgId) {
          return prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: errorContent } : msg,
          );
        } else {
          return [
            ...prev,
            {
              id: assistantMsgId,
              role: "assistant",
              content: errorContent,
              timestamp: new Date(),
            },
          ];
        }
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      handleStreamError(
        "Failed to connect to RAG server. Make sure the backend is running.",
      );
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      webSocketRef.current = null;
      setIsStreamingActive(false);
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
        flushIntervalRef.current = null;
      }
      setIsTyping(false);
    };
  };

  const handleClear = () => {
    cleanupStream();
    setMessages([]);
    setChatId(null);
    setIsTyping(false);
  };

  const renderMessageContent = (
    content: string,
    isUser: boolean,
    isStreaming: boolean = false,
  ) => {
    if (isUser) {
      return (
        <Text
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
          <ActivityIndicator size="small" color="#8B5CF6" />
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>
            Generating...
          </Text>
        </View>
      );
    }

    const parts = content.split("```");
    return parts.map((part, index) => {
      // Odd indices are code blocks
      if (index % 2 === 1) {
        const lines = part.split("\n");
        const lang = lines[0].trim();
        const code = lines.slice(1).join("\n").trim();

        // Show cursor inside code block if it's the very end and streaming
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

      // Even indices are text blocks (can contain paragraphs, headers, lists)
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

            // 1. Headers Check
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

            // 2. List Check
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
                            style={[styles.bulletText, { color: theme.text }]}
                          >
                            {renderMarkdownLine(cleanedLine, showCursorHere)}
                          </Text>
                        </View>
                      );
                    }

                    // Fallback for lines inside a list block that aren't prefixed
                    if (trimmedLine === "") return null;
                    return (
                      <Text
                        key={lineIdx}
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

            // 3. Default Paragraph
            const lines = block.split("\n");
            return (
              <Text
                key={blockIdx}
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background Aurora Mesh Glows */}
      <View style={[StyleSheet.absoluteFill, styles.glowContainer]}>
        <View
          style={[
            styles.glowCircle1,
            {
              backgroundColor:
                scheme === "dark"
                  ? "rgba(139, 92, 246, 0.08)"
                  : "rgba(139, 92, 246, 0.15)",
            },
          ]}
        />
        <View
          style={[
            styles.glowCircle2,
            {
              backgroundColor:
                scheme === "dark"
                  ? "rgba(20, 184, 166, 0.06)"
                  : "rgba(20, 184, 166, 0.12)",
            },
          ]}
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Chat Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => (navigation as any).toggleDrawer()}
              style={{ marginRight: Spacing.two }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 24, color: theme.text }}>☰</Text>
            </TouchableOpacity>
            <View style={styles.statusDotWrapper}>
              <View style={styles.headerAvatar}>
                <Text style={{ fontSize: 18 }}>🤖</Text>
              </View>
              <Animated.View
                style={[
                  styles.activeStatusDot,
                  { transform: [{ scale: statusPulseAnim }] },
                ]}
              />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text, fontWeight: "700" }]}>
                Aether AI
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: theme.textSecondary, fontSize: 11 }]}
              >
                Active Now
              </Text>
            </View>
          </View>

          {messages.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearText}>
                Clear Chat
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          style={styles.keyboardView}
        >
          {messages.length === 0 ? (
            /* Welcome Empty State */
            <FlatList
              style={{ flex: 1 }}
              data={[]}
              renderItem={null}
              ListHeaderComponent={
                <View style={styles.emptyContainer}>
                  <Animated.View
                    style={[
                      styles.emptyAvatarGlow,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <View style={styles.emptyAvatar}>
                      <Text style={{ fontSize: 44 }}>✨</Text>
                    </View>
                  </Animated.View>

                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    Chat with Aether
                  </Text>

                  <Text
                    style={[styles.emptySubtitleText, { color: theme.textSecondary }]}
                  >
                    Ask questions, debug code, draft essays, or design beautiful
                    layouts in real-time.
                  </Text>

                  <View style={styles.suggestionsContainer}>
                    {SUGGESTIONS.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.suggestionCard,
                          { backgroundColor: theme.backgroundElement },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => handleSend(item.prompt)}
                      >
                        <Text
                          style={[styles.suggestionTitle, { color: theme.text, fontWeight: "700" }]}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={[styles.suggestionSub, { color: theme.textSecondary }]}
                        >
                          {item.subtitle}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              }
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            /* Message List */
            <FlatList
              style={{ flex: 1 }}
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              renderItem={({ item, index }) => {
                const isUser = item.role === "user";
                const isLastMsg = index === messages.length - 1;
                const isStreaming = isLastMsg && isStreamingActive;

                if (isUser) {
                  return (
                    <View style={[styles.messageRow, styles.userRow]}>
                      <View
                        style={[
                          styles.messageBubble,
                          styles.userBubble,
                          {
                            backgroundColor:
                              scheme === "dark" ? "#2F2F2F" : "#E2E8F0",
                          },
                        ]}
                      >
                        {renderMessageContent(item.content, true)}
                      </View>
                    </View>
                  );
                }

                // Assistant layout (ChatGPT/Gemini style)
                return (
                  <View style={[styles.messageRow, styles.assistantRow]}>
                    <View
                      style={[
                        styles.assistantAvatar,
                        {
                          backgroundColor:
                            scheme === "dark" ? "#312E81" : "#E0E7FF",
                          borderColor:
                            scheme === "dark"
                              ? "rgba(99, 102, 241, 0.3)"
                              : "rgba(99, 102, 241, 0.1)",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: scheme === "dark" ? "#E0E7FF" : "#4F46E5",
                        }}
                      >
                        ✨
                      </Text>
                    </View>
                    <View style={styles.assistantContentContainer}>
                      <View style={styles.assistantTextBody}>
                        {renderMessageContent(item.content, false, isStreaming)}
                      </View>
                    </View>
                  </View>
                );
              }}
              ListFooterComponent={
                isTyping && !isStreamingActive ? (
                  <View style={[styles.messageRow, styles.assistantRow]}>
                    <View
                      style={[
                        styles.assistantAvatar,
                        {
                          backgroundColor:
                            scheme === "dark" ? "#312E81" : "#E0E7FF",
                          borderColor:
                            scheme === "dark"
                              ? "rgba(99, 102, 241, 0.3)"
                              : "rgba(99, 102, 241, 0.1)",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: scheme === "dark" ? "#E0E7FF" : "#4F46E5",
                        }}
                      >
                        ✨
                      </Text>
                    </View>
                    <View style={styles.assistantContentContainer}>
                      <View style={styles.typingContainer}>
                        <Animated.View
                          style={[styles.typingDot, { opacity: dot1 }]}
                        />
                        <Animated.View
                          style={[styles.typingDot, { opacity: dot2 }]}
                        />
                        <Animated.View
                          style={[styles.typingDot, { opacity: dot3 }]}
                        />
                      </View>
                    </View>
                  </View>
                ) : null
              }
            />
          )}

          {/* Chat Input Container */}
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
                onChangeText={setInputText}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: inputText.trim()
                      ? "#6366F1"
                      : "rgba(99, 102, 241, 0.15)",
                  },
                ]}
                activeOpacity={0.7}
                disabled={!inputText.trim()}
                onPress={() => handleSend()}
              >
                <Text
                  style={{
                    color: inputText.trim() ? "#ffffff" : theme.textSecondary,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  ↑
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  glowContainer: {
    overflow: "hidden",
    zIndex: -1,
  },
  glowCircle1: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.8,
    ...Platform.select({
      web: {
        filter: "blur(90px)",
      },
    }),
  },
  glowCircle2: {
    position: "absolute",
    bottom: -150,
    left: -150,
    width: 450,
    height: 450,
    borderRadius: 225,
    opacity: 0.65,
    ...Platform.select({
      web: {
        filter: "blur(110px)",
      },
    }),
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: "stretch",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.1)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  statusDotWrapper: {
    position: "relative",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeStatusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#10B981",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  headerTitle: {
    fontSize: 15,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: -2,
  },
  clearButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  clearText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
  keyboardView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
  },
  emptyAvatarGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.four,
    ...Platform.select({
      web: {
        boxShadow: "0 0 30px rgba(99, 102, 241, 0.2)",
      },
    }),
  },
  emptyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.two,
    fontSize: 28,
    fontWeight: "700",
  },
  emptySubtitleText: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    justifyContent: "center",
    width: "100%",
  },
  suggestionCard: {
    width: Platform.OS === "web" ? "47%" : "46%",
    minWidth: 140,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.08)",
    ...Platform.select({
      web: {
        transition: "transform 0.2s ease, background-color 0.2s ease",
        cursor: "pointer",
        ":hover": {
          transform: "translateY(-2px)",
        },
      },
    }),
  },
  suggestionTitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  suggestionSub: {
    fontSize: 11,
  },
  messagesList: {
    padding: Spacing.four,
    gap: Spacing.four,
    flexGrow: 1,
  },
  messageRow: {
    marginVertical: Spacing.two,
    width: "100%",
  },
  userRow: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
    maxWidth: "80%",
  },
  assistantRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "flex-start",
    width: "100%",
  },
  assistantAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.12)",
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
    elevation: 0.5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  userBubble: {
    borderRadius: 22,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.08)",
  },
  timestamp: {
    fontSize: 9,
    marginTop: 4,
    marginHorizontal: 8,
  },
  timestampLeft: {
    fontSize: 9,
    marginTop: 6,
    alignSelf: "flex-start",
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
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    width: 36,
    height: 12,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8B5CF6",
  },
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
    paddingLeft: Spacing.four,
    paddingRight: Spacing.two,
    paddingVertical: Platform.OS === "web" ? Spacing.two : Spacing.one,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingVertical: Platform.OS === "web" ? 8 : 4,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  } as any,
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.two,
  },
});
