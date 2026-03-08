import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  Loader2,
  AlertCircle,
  Radio,
  Shield,
  Scale,
  FileText,
  Users,
} from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  { icon: Shield, text: "What is HRPM and how does it help?" },
  { icon: Scale, text: "What kind of cases does HRPM document?" },
  { icon: FileText, text: "How can I submit evidence of a violation?" },
  { icon: Users, text: "Tell me about Case #001 — Danish Thanvi vs Agencies" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/intel-chat`;

const HomepageAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    setError(null);
    setIsLoading(true);

    const userMsg: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    let assistantContent = "";

    const upsertAssistant = (chunk: string) => {
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

      if (!resp.ok) {
        if (resp.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
        if (resp.status === 402) throw new Error("AI credits exhausted.");
        throw new Error("Failed to get response.");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {}
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
  };

  return (
    <section className="border-t border-border/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/30 gap-1.5">
            <Radio className="w-3 h-3" />
            Live AI Assistant
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Ask Our AI About HRPM
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Have questions about the platform, our cases, or human rights documentation? Our AI analyst can help.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto border-border/40 bg-card/60 overflow-hidden">
          <CardContent className="p-0">
            {/* Messages */}
            <ScrollArea className="h-[320px] p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground text-sm py-6">
                    <Bot className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-foreground/70">AI Intelligence Analyst</p>
                    <p className="text-xs mt-1">
                      Ask anything about HRPM, documented cases, or how to contribute
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {suggestions.map((q, i) => {
                      const Icon = q.icon;
                      return (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2.5 px-3 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
                          onClick={() => streamChat(q.text)}
                          disabled={isLoading}
                        >
                          <Icon className="w-4 h-4 mr-2 shrink-0 text-primary" />
                          <span className="text-sm">{q.text}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <Avatar className="w-7 h-7 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <Bot className="w-3.5 h-3.5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent/50 text-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3 items-center">
                      <Avatar className="w-7 h-7 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Bot className="w-3.5 h-3.5" />
                        </AvatarFallback>
                      </Avatar>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Error */}
            {error && (
              <div className="mx-4 mb-2 flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-md p-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-border/30 p-3 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about HRPM, cases, or human rights..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none px-2"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isLoading}
                className="gap-1.5"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HomepageAIChat;
