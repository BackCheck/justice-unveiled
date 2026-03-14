import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bot,
  Loader2,
  AlertCircle,
  Terminal,
  ChevronRight,
  Shield,
  Scale,
  FileText,
  Users,
  Circle,
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
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-chart-2/30 bg-chart-2/10 font-mono text-xs tracking-wider uppercase text-chart-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Live Intel Terminal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 font-['Playfair_Display',serif]">
            Ask Our AI About HRPM
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Have questions about the platform, our cases, or human rights documentation? Our AI analyst can help.
          </p>
        </div>

        {/* Terminal Window */}
        <div className="max-w-3xl mx-auto rounded-lg border border-border/60 overflow-hidden shadow-xl shadow-black/10 dark:shadow-black/40">
          {/* Terminal Title Bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/80 dark:bg-muted/50 border-b border-border/60">
            <div className="flex items-center gap-1.5">
              <Circle className="w-3 h-3 fill-destructive text-destructive/80" />
              <Circle className="w-3 h-3 fill-chart-5 text-chart-5/80" />
              <Circle className="w-3 h-3 fill-chart-2 text-chart-2/80" />
            </div>
            <div className="flex-1 text-center">
              <span className="font-mono text-[11px] text-muted-foreground tracking-wide">
                hrpm@intel-analyst:~
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-chart-2">
              <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
              CONNECTED
            </div>
          </div>

          {/* Terminal Body */}
          <div className="bg-card dark:bg-[hsl(200,30%,6%)]">
            <ScrollArea className="h-[340px] p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="space-y-4 font-mono">
                  {/* Boot sequence */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p><span className="text-chart-2">✓</span> System initialized</p>
                    <p><span className="text-chart-2">✓</span> Intel database connected</p>
                    <p><span className="text-chart-2">✓</span> AI analyst ready</p>
                    <p className="text-primary mt-2">
                      Type a query or select a topic below:
                    </p>
                  </div>
                  <div className="space-y-1.5 mt-4">
                    {suggestions.map((q, i) => {
                      const Icon = q.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => streamChat(q.text)}
                          disabled={isLoading}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded border border-border/40 bg-muted/30 dark:bg-muted/20 hover:border-chart-2/50 hover:bg-chart-2/5 transition-all group font-mono text-xs text-muted-foreground hover:text-foreground"
                        >
                          <ChevronRight className="w-3 h-3 text-chart-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{q.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-sm">
                  {messages.map((msg, i) => (
                    <div key={i}>
                      {msg.role === "user" ? (
                        <div className="flex items-start gap-2">
                          <span className="text-chart-2 shrink-0 select-none text-xs font-bold mt-0.5">
                            ❯
                          </span>
                          <span className="text-foreground text-xs whitespace-pre-wrap">
                            {msg.content}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 mt-1">
                          <span className="text-primary shrink-0 select-none text-xs font-bold mt-0.5">
                            ◆
                          </span>
                          <span className="text-muted-foreground text-xs whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex items-center gap-2">
                      <span className="text-primary text-xs font-bold">◆</span>
                      <span className="inline-flex gap-1 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" />
                      </span>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Error */}
            {error && (
              <div className="mx-4 mb-2 flex items-center gap-2 text-xs font-mono text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>ERROR: {error}</span>
              </div>
            )}

            {/* Terminal Input */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-border/40 px-4 py-3 flex items-center gap-2 bg-muted/20 dark:bg-muted/10"
            >
              <span className="text-chart-2 font-mono text-sm font-bold select-none">❯</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter query..."
                className="flex-1 bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageAIChat;
