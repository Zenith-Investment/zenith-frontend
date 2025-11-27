"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { getAccessToken, getErrorMessage } from "@/lib/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface SuggestedQuestion {
  text: string;
  category: string | null;
}

export interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface ChatMessageResponse {
  id: string;
  session_id: string;
  message: ChatMessage;
  suggested_questions: SuggestedQuestion[];
}

interface ChatHistoryResponse {
  sessions: ChatSession[];
  messages: ChatMessage[];
}

// Fetch chat history
async function fetchChatHistory(sessionId?: string): Promise<ChatHistoryResponse> {
  const params = sessionId ? { session_id: sessionId } : {};
  const response = await api.get("/chat/history", { params });
  return response.data;
}

// Send chat message
async function sendChatMessage(message: string, sessionId?: string): Promise<ChatMessageResponse> {
  const response = await api.post("/chat/message", {
    message,
    session_id: sessionId,
  });
  return response.data;
}

// Clear chat history
async function clearChatHistory(): Promise<void> {
  await api.delete("/chat/history");
}

// Submit feedback
async function submitFeedback(
  messageId: string,
  feedbackType: "like" | "dislike",
  comment?: string
): Promise<void> {
  await api.post("/chat/feedback", {
    message_id: messageId,
    feedback_type: feedbackType,
    comment,
  });
}

export function useChatSessions() {
  return useQuery({
    queryKey: ["chat-sessions"],
    queryFn: () => fetchChatHistory(),
  });
}

export function useChatHistory(sessionId?: string) {
  return useQuery({
    queryKey: ["chat-history", sessionId],
    queryFn: () => fetchChatHistory(sessionId),
    enabled: !!sessionId,
  });
}

export function useClearChatHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearChatHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
    },
  });
}

export function useChatFeedback() {
  return useMutation({
    mutationFn: ({
      messageId,
      feedbackType,
      comment,
    }: {
      messageId: string;
      feedbackType: "like" | "dislike";
      comment?: string;
    }) => submitFeedback(messageId, feedbackType, comment),
  });
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const loadSession = useCallback(async (sid: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const history = await fetchChatHistory(sid);
      setMessages(history.messages);
      setSessionId(sid);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, useStreaming = false) => {
      if (!content.trim()) return;

      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setError(null);
      setSuggestedQuestions([]);

      if (useStreaming) {
        // Streaming mode
        setIsStreaming(true);
        abortControllerRef.current = new AbortController();

        const assistantMessage: ChatMessage = {
          id: `temp-assistant-${Date.now()}`,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        try {
          const token = getAccessToken();
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/chat/message/stream`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                message: content.trim(),
                session_id: sessionId,
              }),
              signal: abortControllerRef.current.signal,
            }
          );

          if (!response.ok) {
            throw new Error("Falha ao enviar mensagem");
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error("Stream não disponível");
          }

          let fullContent = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                  if (parsed.content) {
                    fullContent += parsed.content;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessage.id
                          ? { ...msg, content: fullContent }
                          : msg
                      )
                    );
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

          queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            setError(getErrorMessage(err));
            // Remove the empty assistant message on error
            setMessages((prev) =>
              prev.filter((msg) => msg.id !== assistantMessage.id)
            );
          }
        } finally {
          setIsStreaming(false);
          abortControllerRef.current = null;
        }
      } else {
        // Non-streaming mode
        setIsLoading(true);

        try {
          const response = await sendChatMessage(content.trim(), sessionId || undefined);

          if (!sessionId) {
            setSessionId(response.session_id);
          }

          // Update user message with real ID
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === userMessage.id ? { ...msg } : msg
            )
          );

          // Add assistant message
          setMessages((prev) => [...prev, response.message]);
          setSuggestedQuestions(response.suggested_questions);

          queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      }
    },
    [sessionId, queryClient]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    setSuggestedQuestions([]);
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await clearChatHistory();
      setMessages([]);
      setSessionId(null);
      setSuggestedQuestions([]);
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [queryClient]);

  return {
    messages,
    sessionId,
    isLoading,
    isStreaming,
    error,
    suggestedQuestions,
    sendMessage,
    stopStreaming,
    startNewChat,
    loadSession,
    clearHistory,
  };
}
