import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Send,
  Sparkles,
  User,
  Bot,
  Loader2,
  AlertCircle,
  Scale,
  Users,
  Clock,
  Search,
  FileText,
  Gavel,
  Radio,
  Shield,
} from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const caseCommsSuggestions = [
  { icon: Users, text: "Who are the main antagonists and their connections?" },
  { icon: Clock, text: "What is the timeline of the FIA raid and its aftermath?" },
  { icon: Shield, text: "Summarize the key evidence fabrication findings" },
  { icon: Scale, text: "What procedural violations led to the acquittal?" },
];

const legalSuggestions = [
  { icon: Gavel, text: "Draft a High Court submission for PECA §33 violations" },
  { icon: FileText, text: "Generate a statement on chain-of-custody failures" },
  { icon: Scale, text: "Prepare jurisdiction-aware positioning for Sindh High Court" },
  { icon: Shield, text: "Auto-generate a comprehensive case report for appeal" },
];

const searchSuggestions = [
  { icon: Search, text: "Search for NADRA contract termination evidence" },
  { icon: Search, text: "Find all events involving SI Imran Saad" },
  { icon: Search, text: "Enrich entity profile for Major Mumtaz Shah" },
  { icon: Search, text: "Cross-reference FIA raid timeline with forensic evidence" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/intel-chat`;

export const IntelChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("comms");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    setError(null);
    setIsLoading(true);
    setActiveTab("comms");
    
    const userMsg: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    let assistantContent = "";
    
    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent, timestamp: new Date() }];
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
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) throw new Error("Rate limit exceeded. Please try again in a moment.");
        if (resp.status === 402) throw new Error("AI credits exhausted. Please contact support.");
        throw new Error("Failed to get response from AI.");
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
          if (jsonStr === "[DONE]") { streamDone = true; break; }
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

  const handleSuggestion = (question: string) => {
    if (isLoading) return;
    streamChat(question);
  };

  const SuggestionGrid = ({ suggestions }: { suggestions: typeof caseCommsSuggestions }) => (
    <div className="grid sm:grid-cols-2 gap-2">
      {suggestions.map((q, i) => {
        const Icon = q.icon;
        return (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="justify-start text-left h-auto py-2.5 px-3 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
            onClick={() => handleSuggestion(q.text)}
            disabled={isLoading}
          >
            <Icon className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
            <span className="text-sm">{q.text}</span>
          </Button>
        );
      })}
    </div>
  );

  return (
    <Card className="glass-card flex flex-col border-primary/10">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Radio className="w-5 h-5 text-primary" />
            Live Comm + AI
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 border-primary/30 gap-1">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="bg-chart-2/10 border-chart-2/30 text-chart-2 gap-1">
              <Radio className="w-3 h-3" />
              Live
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Case-based live comms · AI-assisted discussions · Auto-generated legal submissions
        </p>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground text-sm py-4">
                <Bot className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="font-medium text-foreground/70">Intelligence Analyst Ready</p>
                <p className="text-xs mt-1">Ask about the case, generate legal documents, or search evidence</p>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                  <TabsTrigger value="comms" className="text-xs gap-1.5 data-[state=active]:bg-background">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Case Comms</span>
                    <span className="sm:hidden">Comms</span>
                  </TabsTrigger>
                  <TabsTrigger value="legal" className="text-xs gap-1.5 data-[state=active]:bg-background">
                    <Gavel className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Legal Drafts</span>
                    <span className="sm:hidden">Legal</span>
                  </TabsTrigger>
                  <TabsTrigger value="search" className="text-xs gap-1.5 data-[state=active]:bg-background">
                    <Search className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Search & Enrich</span>
                    <span className="sm:hidden">Search</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="comms" className="mt-3">
                  <SuggestionGrid suggestions={caseCommsSuggestions} />
                </TabsContent>
                <TabsContent value="legal" className="mt-3">
                  <SuggestionGrid suggestions={legalSuggestions} />
                </TabsContent>
                <TabsContent value="search" className="mt-3">
                  <SuggestionGrid suggestions={searchSuggestions} />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent/50"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-[10px] opacity-60 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {msg.role === "user" && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-chart-2/10 text-chart-2">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-accent/50 rounded-lg px-4 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mb-2 p-2 bg-destructive/10 border border-destructive/30 rounded-md flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border/50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about evidence, draft legal submissions, search entities..."
              className="min-h-[44px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntelChat;
