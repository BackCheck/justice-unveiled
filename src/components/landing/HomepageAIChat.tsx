import { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  AlertCircle,
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

const stripMarkdown = (text: string): string =>
  text
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, "").replace(/```/g, ""))
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[>\-\*]\s+/gm, "• ")
    .replace(/`([^`]+)`/g, "$1");

const ASCII_BANNER = `
██╗  ██╗██████╗ ██████╗ ███╗   ███╗
██║  ██║██╔══██╗██╔══██╗████╗ ████║
███████║██████╔╝██████╔╝██╔████╔██║
██╔══██║██╔══██╗██╔═══╝ ██║╚██╔╝██║
██║  ██║██║  ██║██║     ██║ ╚═╝ ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝     ╚═╝

[SYSTEM INITIALIZED] — Intel Terminal v2.0

✓ Database connected
✓ AI analyst ready
✓ Awaiting query...

Type a question or select a topic below:`;

const HomepageAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClick = () => inputRef.current?.focus();
    const el = terminalRef.current;
    el?.addEventListener("click", handleClick);
    return () => el?.removeEventListener("click", handleClick);
  }, []);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <section className="border-t border-border/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 font-['Playfair_Display',serif]">
            Live Intel Terminal
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Ask our AI analyst about HRPM, cases, or human rights documentation.
          </p>
        </div>

        {/* Terminal Window */}
        <div
          ref={terminalRef}
          className="max-w-4xl mx-auto rounded-lg border border-border/60 overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/60"
        >
          {/* ── Terminal Title Bar ── */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/80 dark:bg-[hsl(200,20%,10%)] border-b border-border/60">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[hsl(0,70%,55%)]" />
              <span className="w-3 h-3 rounded-full bg-[hsl(45,80%,55%)]" />
              <span className="w-3 h-3 rounded-full bg-[hsl(120,50%,45%)]" />
            </div>
            <div className="flex-1 text-center">
              <span className="font-mono text-[11px] text-muted-foreground tracking-wide">
                hrpm@intel-analyst:~$ | Interactive Terminal v2.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-chart-2">
              <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
              ONLINE
            </div>
          </div>

          {/* ── Terminal Body ── */}
          <div className="bg-card dark:bg-[hsl(200,30%,4%)] font-mono text-xs sm:text-sm">
            <div className="h-[420px] overflow-y-auto p-4 sm:p-6 scroll-smooth" id="terminal-scroll">
              {/* Welcome banner (always shown) */}
              <pre className="text-chart-2 whitespace-pre leading-tight text-[9px] sm:text-[11px] select-none mb-2">
                {ASCII_BANNER}
              </pre>

              {/* Suggestion buttons (shown when no messages) */}
              {messages.length === 0 && (
                <div className="space-y-1.5 mt-4">
                  {suggestions.map((q, i) => {
                    const Icon = q.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => streamChat(q.text)}
                        disabled={isLoading}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded border border-border/30 bg-muted/20 dark:bg-muted/10 hover:border-chart-2/50 hover:bg-chart-2/5 transition-all group"
                      >
                        <span className="text-chart-2 opacity-0 group-hover:opacity-100 transition-opacity select-none">
                          ❯
                        </span>
                        <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                          {q.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Message history */}
              {messages.length > 0 && (
                <div className="space-y-3 mt-4">
                  {messages.map((msg, i) => (
                    <div key={i}>
                      {msg.role === "user" ? (
                        <div className="flex items-start gap-2">
                          <span className="text-chart-2 shrink-0 select-none font-bold">
                            hrpm@user:~$
                          </span>
                          <span className="text-foreground whitespace-pre-wrap">
                            {msg.content}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 mt-1">
                          <span className="text-primary shrink-0 select-none font-bold">
                            [INTEL]
                          </span>
                          <span className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {stripMarkdown(msg.content)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold select-none">[INTEL]</span>
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse [animation-delay:0.4s]" />
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-3 flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>ERROR: {error}</span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Terminal Input ── */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-border/40 px-4 sm:px-6 py-3 flex items-center gap-2 bg-muted/20 dark:bg-[hsl(200,20%,6%)]"
            >
              <span className="text-chart-2 font-bold select-none shrink-0">
                hrpm@user:~$
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter query..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 outline-none caret-chart-2"
                disabled={isLoading}
                autoFocus
                spellCheck={false}
              />
              <span className="text-chart-2 animate-pulse select-none">█</span>
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

            {/* ── Terminal Footer ── */}
            <div className="border-t border-border/30 px-4 sm:px-6 py-2 bg-muted/10 dark:bg-[hsl(200,20%,5%)]">
              <p className="text-[10px] text-muted-foreground/60 text-center">
                Type a question and press Enter • Select a topic above to get started • Powered by HRPM Intel AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageAIChat;
