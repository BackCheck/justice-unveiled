import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/intel-chat`;

const suggestions = [
  "What is HRPM and how does it work?",
  "Tell me about documented cases",
  "How can I submit evidence?",
  "What violations has HRPM tracked?",
];

const FloatingAiAssistant = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const maxChars = 2000;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        !(event.target as Element)?.closest(".floating-ai-button")
      ) {
        setIsChatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    const userMsg: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    let assistantContent = "";
    const upsert = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed to get response");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;

      while (!done) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        buf += decoder.decode(value, { stream: true });
        let ni: number;
        while ((ni = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, ni);
          buf = buf.slice(ni + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const c = JSON.parse(json).choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch {
      upsert("Sorry, I couldn't process that request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (message.trim() && !isLoading) streamChat(message.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={cn(
          "floating-ai-button relative w-14 h-14 rounded-full flex items-center justify-center",
          "transition-all duration-300 hover:scale-110 active:scale-95",
          "shadow-[0_0_20px_hsl(var(--primary)/0.5),0_0_40px_hsl(var(--primary)/0.3)]",
          "hover:shadow-[0_0_30px_hsl(var(--primary)/0.7),0_0_50px_hsl(var(--primary)/0.5)]",
          "bg-gradient-to-br from-primary to-chart-2 border-2 border-primary-foreground/20"
        )}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping bg-primary/30" style={{ animationDuration: "2s" }} />
        {isChatOpen ? (
          <X className="w-6 h-6 text-primary-foreground relative z-10" />
        ) : (
          <Bot className="w-6 h-6 text-primary-foreground relative z-10" />
        )}
      </button>

      {/* Chat Panel */}
      {isChatOpen && (
        <div
          ref={chatRef}
          className={cn(
            "absolute bottom-20 right-0 w-[380px] max-w-[calc(100vw-2rem)]",
            "rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl",
            "shadow-2xl shadow-primary/10 overflow-hidden",
            "animate-scale-in"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">HRPM AI Assistant</p>
                <p className="text-[10px] text-muted-foreground">Powered by Live Comm + AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/30">
                <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
                Live
              </span>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="h-[320px] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <Bot className="w-10 h-10 mx-auto mb-2 text-primary/40" />
                  <p className="text-sm font-medium text-foreground/70">
                    How can I help you?
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ask about HRPM, cases, or human rights
                  </p>
                </div>
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => streamChat(s)}
                      disabled={isLoading}
                      className={cn(
                        "w-full text-left text-sm px-3 py-2 rounded-lg",
                        "border border-border/40 bg-muted/30",
                        "hover:border-primary/30 hover:bg-primary/5 transition-all",
                        "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-foreground border border-border/30"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/30 p-3">
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className={cn(
                  "flex-1 bg-muted/30 border border-border/40 rounded-xl px-3 py-2",
                  "text-sm text-foreground placeholder:text-muted-foreground",
                  "resize-none outline-none focus:border-primary/50 transition-colors"
                )}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-200",
                  "bg-primary text-primary-foreground",
                  "hover:opacity-90 active:scale-95",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>
                  Press{" "}
                  <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono">
                    Shift+Enter
                  </kbd>{" "}
                  for new line
                </span>
              </div>
              <span>
                {message.length}/{maxChars}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { FloatingAiAssistant };
