import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageItem } from "@/components/chat/MessageItem";
import { Suggestions } from "@/components/chat/Suggestions";
import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";
import { useChatMessagesQuery } from "@/hooks/queries";
import { useChatStream } from "@/hooks/useChatStream";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];

  const { chatId: routeChatId } = useLocalSearchParams<{ chatId?: string }>();

  const {
    messages,
    setMessages,
    inputText,
    setInputText,
    isTyping,
    isStreamingActive,
    chatId,
    setChatId,
    flatListRef,
    handleSend,
    handleClear,
  } = useChatStream();

  // Load chat session if selected from history
  const { data: dbMessages, isFetching } = useChatMessagesQuery(
    routeChatId && routeChatId !== "" ? routeChatId : null,
  );

  useEffect(() => {
    if (routeChatId && routeChatId !== "") {
      if (dbMessages) {
        // Map messages to internal format
        const mapped = dbMessages.map((msg: any) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }));
        setMessages(mapped);
        setChatId(routeChatId);
      }
    } else {
      // Starting a new chat
      handleClear();
    }
  }, [routeChatId, dbMessages]);

  // Animation Refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const statusPulseAnim = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

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
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    );

    // Active status indicator pulsing animation
    const statusPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(statusPulseAnim, {
          toValue: 1.25,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(statusPulseAnim, {
          toValue: 1.0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    statusPulse.start();

    return () => {
      pulse.stop();
      statusPulse.stop();
    };
  }, []);

  // Animation for the typing indicator dot loaders
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ChatHeader theme={theme} statusPulseAnim={statusPulseAnim} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          style={styles.keyboardView}
        >
          {isFetching ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : messages.length === 0 ? (
            /* Welcome Empty State */
            <FlatList
              style={{ flex: 1 }}
              data={[]}
              renderItem={null}
              ListHeaderComponent={
                <Suggestions
                  theme={theme}
                  pulseAnim={pulseAnim}
                  onSelectSuggestion={handleSend}
                />
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
              renderItem={({ item, index }) => (
                <MessageItem
                  message={item}
                  isStreaming={
                    index === messages.length - 1 && isStreamingActive
                  }
                  theme={theme}
                  scheme={scheme}
                />
              )}
              ListFooterComponent={
                isTyping ? (
                  /* Floating Typing Loader indicator inside Chat List */
                  <View style={styles.messageRow}>
                    <View
                      style={[
                        styles.assistantAvatar,
                        { backgroundColor: theme.backgroundElement },
                      ]}
                    >
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

          <ChatInput
            theme={theme}
            inputText={inputText}
            onChangeText={setInputText}
            onSend={() => handleSend()}
            insets={insets}
          />
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
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: "stretch",
  },

  keyboardView: {
    flex: 1,
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
  assistantAvatar: {
    width: 46,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.12)",
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
});
