import { useState, useRef, useEffect, useCallback } from "react";
import { FlatList } from "react-native";
import axios from "axios";
import { Message } from "@/types/chat";
import { getToken } from "@/utils/auth";
import { useQueryClient } from "@tanstack/react-query";

const getApiUrl = () => {
  return "http://192.168.1.4:3000";
};

const getWsUrl = () => {
  const apiUrl = getApiUrl();
  return apiUrl.replace(/^http/, "ws") + "/rag/chat";
};

// Global cache for access token
let cachedToken: string | null = null;

const fetchToken = async (): Promise<string> => {
  // Try to use the securely stored session token first
  const storedToken = await getToken();
  if (storedToken) return storedToken;

  if (cachedToken) return cachedToken;

  const apiUrl = getApiUrl();
  const testEmail = "testuser@aether.ai";
  const testPassword = "Password123!";
  const testName = "Test User";

  try {
    console.log("Attempting auto-login for testing...");
    const loginRes = await axios.post(`${apiUrl}/user/login`, {
      email: testEmail,
      password: testPassword,
    });
    if (loginRes.data && loginRes.data.data && loginRes.data.data.token) {
      cachedToken = loginRes.data.data.token;
      console.log("Auto-login successful!");
      return cachedToken!;
    }
  } catch (loginError: any) {
    console.log(
      "Login failed, attempting auto-registration...",
      loginError?.response?.data || loginError.message
    );
    try {
      const regRes = await axios.post(`${apiUrl}/user/register`, {
        email: testEmail,
        password: testPassword,
        name: testName,
      });
      if (regRes.data && regRes.data.data && regRes.data.data.token) {
        cachedToken = regRes.data.data.token;
        console.log("Auto-registration successful!");
        return cachedToken!;
      }
    } catch (regError: any) {
      console.error(
        "Auto-registration failed:",
        regError?.response?.data || regError.message
      );
      throw new Error("Authentication failed. Please verify backend status.");
    }
  }
  throw new Error("Unable to authenticate.");
};

export const useChatStream = () => {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Clean up references for intervals & socket
  const streamingIntervalRef = useRef<any>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const streamingBufferRef = useRef("");
  const flushIntervalRef = useRef<any>(null);

  const cleanupStream = useCallback(() => {
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
  }, []);

  const handleClear = useCallback(() => {
    cleanupStream();
    setMessages([]);
    setChatId(null);
    setIsTyping(false);
  }, [cleanupStream]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupStream();
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, [cleanupStream]);

  const handleSend = useCallback(
    async (textToSend?: string) => {
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

      const assistantMsgId = (Date.now() + 1).toString();

      // Fetch JWT token automatically
      let token: string;
      try {
        token = await fetchToken();
      } catch (err: any) {
        console.error("Auth error:", err);
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: "assistant",
            content: `⚠️ Authentication Error: ${err.message}`,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const wsUrl = `${getWsUrl()}?token=${encodeURIComponent(token)}`;

      // Initialize stream state
      streamingBufferRef.current = "";
      let assistantMessageCreated = false;

      console.log("Connecting to WebSocket with token...");
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

      const handleStreamError = (errorMsg: string) => {
        ws.close();
        if (flushIntervalRef.current) {
          clearInterval(flushIntervalRef.current);
          flushIntervalRef.current = null;
        }
        setIsTyping(false);
        setIsStreamingActive(false);

        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          const errorContent = `⚠️ Error: ${errorMsg}`;
          if (lastMsg && lastMsg.id === assistantMsgId) {
            return prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: errorContent }
                : msg,
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

      ws.onopen = () => {
        console.log("WebSocket connection opened");
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
            queryClient.invalidateQueries({ queryKey: ["chats"] });
          } else if (response.type === "content") {
            streamingBufferRef.current += response.content;
          } else if (response.type === "done") {
            ws.close();
            if (flushIntervalRef.current) {
              clearInterval(flushIntervalRef.current);
              flushIntervalRef.current = null;
            }
            setIsTyping(false);
            setIsStreamingActive(false);
            queryClient.invalidateQueries({ queryKey: ["chats"] });

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

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        handleStreamError(
          "Failed to connect to RAG server. Make sure the backend is running.",
        );
      };
    },
    [inputText, chatId, cleanupStream]
  );

  return {
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
  };
};
