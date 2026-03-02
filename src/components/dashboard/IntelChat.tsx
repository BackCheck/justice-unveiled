import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { openReportWindow } from "@/lib/reportShell";
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
  PlusCircle,
  Download,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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
  const [reportSections, setReportSections] = useState<number[]>([]);
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

  const addToReport = useCallback((msgIndex: number) => {
    setReportSections(prev => {
      if (prev.includes(msgIndex)) return prev;
      toast.success("Section added to report");
      return [...prev, msgIndex];
    });
  }, []);

  const downloadFullReport = useCallback(async () => {
    const now = format(new Date(), "MMMM d, yyyy 'at' h:mm a");
    const sections = reportSections
      .sort((a, b) => a - b)
      .map((idx, sectionNum) => {
        const msg = messages[idx];
        if (!msg) return "";
        let userQuestion = "";
        for (let i = idx - 1; i >= 0; i--) {
          if (messages[i].role === "user") {
            userQuestion = messages[i].content;
            break;
          }
        }
        // Convert markdown-style content to basic HTML
        const htmlContent = msg.content
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/^### (.*$)/gm, "<h4>$1</h4>")
          .replace(/^## (.*$)/gm, "<h3>$1</h3>")
          .replace(/^# (.*$)/gm, "<h2>$1</h2>")
          .replace(/^- (.*$)/gm, "<li>$1</li>")
          .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
          .replace(/\n{2,}/g, "</p><p>")
          .replace(/\n/g, "<br/>");

        return `
          <div class="section">
            <div class="section-header">Section ${sectionNum + 1}</div>
            ${userQuestion ? `<div class="query"><strong>Query:</strong> ${userQuestion.replace(/</g, "&lt;")}</div>` : ""}
            <div class="content"><p>${htmlContent}</p></div>
          </div>`;
      })
      .filter(Boolean);

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Intelligence Communication Report</title>
<style>
  @page { size: A4; margin: 20mm 18mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Georgia', 'Times New Roman', serif; color: #1a1a1a; line-height: 1.7; background: #fff; }
  .cover { page-break-after: always; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 90vh; text-align: center; border: 3px double #0087C1; padding: 60px 40px; }
  .cover-badge { background: #0087C1; color: #fff; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 6px 20px; border-radius: 2px; margin-bottom: 30px; }
  .cover h1 { font-size: 28px; color: #0a2540; margin: 20px 0 10px; font-weight: 700; }
  .cover .subtitle { font-size: 14px; color: #555; margin-bottom: 30px; }
  .cover .meta { font-size: 11px; color: #888; line-height: 2; }
  .classification { background: #fef3cd; border: 1px solid #ffc107; color: #856404; text-align: center; padding: 8px; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 24px; }
  .section { margin-bottom: 32px; page-break-inside: avoid; }
  .section-header { font-size: 13px; font-weight: 700; color: #0087C1; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid #0087C1; padding-bottom: 6px; margin-bottom: 16px; }
  .query { background: #f0f7ff; border-left: 3px solid #0087C1; padding: 10px 14px; margin-bottom: 14px; font-size: 13px; color: #333; font-style: italic; }
  .content { font-size: 13px; color: #222; }
  .content p { margin-bottom: 10px; }
  .content h2, .content h3, .content h4 { color: #0a2540; margin: 16px 0 8px; }
  .content h2 { font-size: 18px; }
  .content h3 { font-size: 15px; }
  .content h4 { font-size: 13px; }
  .content ul { padding-left: 20px; margin: 8px 0; }
  .content li { margin-bottom: 4px; }
  .content strong { color: #0a2540; }
  .divider { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
  .footer { margin-top: 40px; border-top: 2px solid #0087C1; padding-top: 16px; text-align: center; font-size: 10px; color: #888; }
  .footer .org { font-weight: 700; color: #0a2540; font-size: 11px; }
  .footer .tagline { color: #0087C1; font-weight: 600; margin-top: 4px; }
  .disclaimer { background: #f9f9f9; border: 1px solid #e0e0e0; padding: 14px 18px; margin-top: 24px; font-size: 10px; color: #666; line-height: 1.6; }
  .conf-footer { background: #c0392b; color: #fff; text-align: center; padding: 6px; font-size: 10px; letter-spacing: 1px; position: fixed; bottom: 0; left: 0; right: 0; }
  @media print { .conf-footer { position: fixed; } }
</style></head><body>
  <div class="cover">
    <div class="cover-badge">Public Interest Intelligence Document</div>
    <h1>Intelligence Communication Report</h1>
    <div class="subtitle">Compiled from Live Comm + AI Briefings</div>
    <div class="meta">
      Generated: ${now}<br/>
      Sections: ${sections.length}<br/>
      Classification: Confidential — Advocacy Use Only<br/>
      Platform: HRPM.org — Human Rights Protection & Monitoring
    </div>
  </div>

  <div class="classification">Strictly Confidential — Only for Advocacy Work</div>

  ${sections.join('<hr class="divider"/>')}

  <div class="disclaimer">
    <strong>Disclaimer:</strong> This report is published in good faith for public-interest documentation and advocacy purposes.
    Allegations remain subject to judicial determination. HRPM does not provide legal advice.
    This publication is issued without malice and solely for documentation, transparency, and human rights advocacy purposes.
  </div>

  <div class="footer">
    <div class="org">Human Rights Protection & Monitoring (HRPM.org)</div>
    <div>Independent Public-Interest Documentation & Monitoring Platform</div>
    <div>36 Robinson Road, #20-01 City House, Singapore 068877 · info@hrpm.org · +65 31 290 390</div>
    <div class="tagline">Documenting injustice. Demanding accountability.</div>
  </div>

  <div class="conf-footer">Strictly Confidential — Only for Advocacy Work</div>
</body></html>`;

    await openReportWindow(html);
    toast.success("Full report generated — use Print → Save as PDF");
  }, [reportSections, messages]);

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
              {messages.map((msg, i) => {
                const isAdded = reportSections.includes(i);
                return (
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
                    
                    <div className={`max-w-[80%] ${msg.role === "assistant" ? "space-y-1.5" : ""}`}>
                      <div
                        className={`rounded-lg px-4 py-2 ${
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
                      
                      {msg.role === "assistant" && !isLoading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 text-xs gap-1.5 ${isAdded ? "text-chart-2" : "text-muted-foreground hover:text-primary"}`}
                          onClick={() => addToReport(i)}
                          disabled={isAdded}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" />
                              Added to Report
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3 h-3" />
                              Add to Report
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {msg.role === "user" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-chart-2/10 text-chart-2">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              
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

        {/* Download Full Report */}
        {reportSections.length > 0 && (
          <div className="mx-4 mb-2">
            <Button
              onClick={downloadFullReport}
              className="w-full gap-2"
              variant="default"
            >
              <Download className="w-4 h-4" />
              Download Full Report ({reportSections.length} {reportSections.length === 1 ? "section" : "sections"})
            </Button>
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
