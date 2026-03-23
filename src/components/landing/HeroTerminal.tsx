import { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertCircle, Shield, Scale, FileText, Users } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const suggestions = [
  { icon: Shield, text: "What is HRPM?" },
  { icon: Scale, text: "What cases are documented?" },
  { icon: FileText, text: "How can I submit evidence?" },
  { icon: Users, text: "Tell me about Case #001" },
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

const HeroTerminal = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    setError(null);
    setIsLoading(true);
    const userMsg: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    let assistantContent = "";
    const upsert = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant")
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
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
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
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
    } catch (e) {
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
    <div className="rounded-xl border border-border/40 overflow-hidden shadow-2xl shadow-primary/10 bg-card/80 backdrop-blur-xl">
      {/* Title bar — macOS style */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 dark:bg-[hsl(200,25%,8%)] border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[hsl(0,70%,55%)]" />
          <span className="w-3 h-3 rounded-full bg-[hsl(45,80%,55%)]" />
          <span className="w-3 h-3 rounded-full bg-[hsl(120,50%,45%)]" />
        </div>
        <div className="flex-1 text-center">
          <span className="font-mono text-[11px] text-muted-foreground tracking-wide">
            hrpm ~ intel-terminal
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-chart-2">
          <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
          LIVE
        </div>
      </div>

      {/* Terminal body */}
      <div className="bg-card dark:bg-[hsl(200,30%,4%)] font-mono text-xs">
        <div className="h-[340px] overflow-y-auto p-4 scroll-smooth">
          {/* Boot sequence */}
          <div className="text-chart-2 text-[10px] space-y-0.5 mb-3 select-none">
            <p>$ hrpm --init</p>
            <p className="text-muted-foreground">╭──────────────────────────────────╮</p>
            <p className="text-primary font-bold">│  HRPM Intel Terminal v2.0        │</p>
            <p className="text-muted-foreground/70">│  The AI that documents injustice │</p>
            <p className="text-muted-foreground">╰──────────────────────────────────╯</p>
            <p className="mt-1">Starting session...</p>
            <p className="text-chart-2">✓ Database connected</p>
            <p className="text-chart-2">✓ AI analyst ready</p>
            <p className="text-chart-2">✓ Connected to HRPM, BackcheckGroup</p>
          </div>

          {/* Suggestions or messages */}
          {messages.length === 0 ? (
            <div className="space-y-1.5">
              <p className="text-muted-foreground/50 text-[10px] mb-2">hrpm&gt; Select a query or type below:</p>
              {suggestions.map((q, i) => {
                const Icon = q.icon;
                return (
                  <button
                    key={i}
                    onClick={() => streamChat(q.text)}
                    disabled={isLoading}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded border border-border/30 bg-muted/10 hover:border-chart-2/40 hover:bg-chart-2/5 transition-all group"
                  >
                    <span className="text-chart-2 opacity-0 group-hover:opacity-100 transition-opacity select-none text-[10px]">❯</span>
                    <Icon className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors text-[11px]">{q.text}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {messages.map((msg, i) => (
                <div key={i}>
                  {msg.role === "user" ? (
                    <div className="flex items-start gap-1.5">
                      <span className="text-chart-2 shrink-0 select-none font-bold text-[10px]">hrpm@user:~$</span>
                      <span className="text-foreground whitespace-pre-wrap text-[11px]">{msg.content}</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5 mt-0.5">
                      <span className="text-primary shrink-0 select-none font-bold text-[10px]">[INTEL]</span>
                      <span className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-[11px]">{stripMarkdown(msg.content)}</span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-bold select-none text-[10px]">[INTEL]</span>
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse [animation-delay:0.4s]" />
                  </span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-2 flex items-center gap-1.5 text-destructive bg-destructive/10 border border-destructive/20 rounded px-2 py-1.5 text-[10px]">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>ERROR: {error}</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border/30 px-4 py-2.5 flex items-center gap-2 bg-muted/10 dark:bg-[hsl(200,20%,6%)]"
        >
          <span className="text-chart-2 font-bold select-none shrink-0 text-[10px]">hrpm@user:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter query..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/40 outline-none caret-chart-2 text-[11px]"
            disabled={isLoading}
            spellCheck={false}
          />
          <span className="text-chart-2 animate-pulse select-none text-xs">▊</span>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HeroTerminal;
