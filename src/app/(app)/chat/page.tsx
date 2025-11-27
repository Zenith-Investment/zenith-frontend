"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Square,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChat, useChatSessions, useChatFeedback, type ChatMessage } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

const INITIAL_SUGGESTIONS = [
  "Quais são os melhores FIIs para investir hoje?",
  "Como diversificar minha carteira de investimentos?",
  "Qual a diferença entre CDB e Tesouro Direto?",
  "Analise minha carteira atual e sugira melhorias",
];

function MessageBubble({
  message,
  onFeedback,
}: {
  message: ChatMessage;
  onFeedback?: (type: "like" | "dislike") => void;
}) {
  const isUser = message.role === "user";
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  const handleFeedback = (type: "like" | "dislike") => {
    setFeedback(type);
    onFeedback?.(type);
  };

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "flex flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted rounded-tl-sm"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        {!isUser && message.content && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                feedback === "like" && "text-green-500"
              )}
              onClick={() => handleFeedback("like")}
              disabled={feedback !== null}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                feedback === "dislike" && "text-red-500"
              )}
              onClick={() => handleFeedback("dislike")}
              disabled={feedback !== null}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onClearHistory,
  isLoading,
}: {
  sessions: { id: string; title: string | null; message_count: number }[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onClearHistory: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/30">
      <div className="p-4">
        <Button className="w-full justify-start" onClick={onNewChat}>
          <Plus className="mr-2 h-4 w-4" />
          Nova conversa
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="px-2 py-8 text-center text-sm text-muted-foreground">
            Nenhuma conversa ainda
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  currentSessionId === session.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {session.title || `Conversa (${session.message_count} msgs)`}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {sessions.length > 0 && (
        <div className="border-t p-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={onClearHistory}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Limpar historico
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
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
  } = useChat();

  const { data: sessionsData, isLoading: sessionsLoading } = useChatSessions();
  const feedbackMutation = useChatFeedback();

  const sessions = sessionsData?.sessions || [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;

    const message = input;
    setInput("");
    await sendMessage(message, true); // Use streaming by default
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInput("");
    await sendMessage(suggestion, true);
  };

  const handleFeedback = (messageId: string, type: "like" | "dislike") => {
    feedbackMutation.mutate({ messageId, feedbackType: type });
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-screen flex-col">
      <Header
        title="Chat com IA"
        description="Seu assistente de investimentos pessoal"
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ChatSidebar
          sessions={sessions}
          currentSessionId={sessionId}
          onSelectSession={loadSession}
          onNewChat={startNewChat}
          onClearHistory={clearHistory}
          isLoading={sessionsLoading}
        />

        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {showWelcome ? (
              <div className="flex h-full flex-col items-center justify-center">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mb-2 text-2xl font-semibold">
                  Como posso ajudar?
                </h2>
                <p className="mb-8 max-w-md text-center text-muted-foreground">
                  Sou seu assistente de investimentos. Posso ajudar com analise
                  de ativos, recomendacoes personalizadas e educacao financeira.
                </p>
                <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
                  {INITIAL_SUGGESTIONS.map((suggestion, i) => (
                    <Card
                      key={i}
                      className="cursor-pointer transition-colors hover:bg-muted"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <CardContent className="p-4">
                        <p className="text-sm">{suggestion}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onFeedback={(type) => handleFeedback(message.id, type)}
                  />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-muted px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Pensando...
                      </span>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Suggested questions */}
                {suggestedQuestions.length > 0 && !isLoading && !isStreaming && (
                  <div className="pt-4">
                    <p className="mb-2 text-xs text-muted-foreground">
                      Perguntas sugeridas:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.map((q, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleSuggestionClick(q.text)}
                        >
                          {q.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t bg-background p-4">
            <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua pergunta sobre investimentos..."
                  disabled={isLoading}
                  className="flex-1"
                />
                {isStreaming ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={stopStreaming}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                A IA pode cometer erros. Sempre verifique as informacoes antes
                de tomar decisoes de investimento.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
