import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code,
  Key,
  Zap,
  Shield,
  FileText,
  Network,
  Brain,
  BookOpen,
  Copy,
  ExternalLink,
  ArrowRight,
  Terminal,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import hrpmLogo from "@/assets/human-rights-logo.png";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Api = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const endpoints = [
    {
      name: "Analyze Document",
      method: "POST",
      path: "/functions/v1/analyze-document",
      description: "Extract events, entities, and discrepancies from documents using AI",
      auth: true,
      body: `{
  "documentText": "string",
  "documentType": "legal" | "news" | "report",
  "caseId": "uuid (optional)"
}`
    },
    {
      name: "Intel Chat",
      method: "POST",
      path: "/functions/v1/intel-chat",
      description: "AI-powered conversational interface for case intelligence queries",
      auth: true,
      body: `{
  "message": "string",
  "conversationHistory": [],
  "caseId": "uuid (optional)"
}`
    },
    {
      name: "Pattern Detector",
      method: "POST",
      path: "/functions/v1/pattern-detector",
      description: "Detect behavioral patterns and anomalies across case data",
      auth: true,
      body: `{
  "caseId": "uuid",
  "analysisType": "behavioral" | "temporal" | "network"
}`
    },
    {
      name: "Threat Profiler",
      method: "POST",
      path: "/functions/v1/threat-profiler",
      description: "Generate threat assessments and risk profiles for entities",
      auth: true,
      body: `{
  "entityId": "uuid",
  "caseId": "uuid (optional)"
}`
    },
    {
      name: "Generate Report",
      method: "POST",
      path: "/functions/v1/generate-report",
      description: "Generate comprehensive investigation reports in multiple formats",
      auth: true,
      body: `{
  "caseId": "uuid",
  "reportType": "executive" | "detailed" | "timeline",
  "format": "pdf" | "markdown"
}`
    },
    {
      name: "Fetch Legal Precedents",
      method: "POST",
      path: "/functions/v1/fetch-legal-precedents",
      description: "Search and retrieve relevant legal precedents from case law databases",
      auth: true,
      body: `{
  "query": "string",
  "jurisdiction": "string (optional)",
  "yearRange": { "start": number, "end": number }
}`
    },
    {
      name: "Analyze Rights Violations",
      method: "POST",
      path: "/functions/v1/analyze-rights-violations",
      description: "Analyze text for potential human rights violations against international frameworks",
      auth: true,
      body: `{
  "text": "string",
  "frameworks": ["UDHR", "ICCPR", "ICESCR"]
}`
    },
    {
      name: "Generate Appeal Summary",
      method: "POST",
      path: "/functions/v1/generate-appeal-summary",
      description: "Generate AI-powered appeal summaries for legal proceedings",
      auth: true,
      body: `{
  "caseId": "uuid",
  "summaryType": "brief" | "comprehensive",
  "focusAreas": ["procedural", "constitutional", "human_rights"]
}`
    }
  ];

  const codeExamples = {
    javascript: `// Initialize Supabase client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)

// Analyze a document
const analyzeDocument = async (documentText) => {
  const { data, error } = await supabase.functions.invoke('analyze-document', {
    body: {
      documentText,
      documentType: 'legal'
    }
  })
  
  if (error) throw error
  return data
}

// Use Intel Chat
const askIntelChat = async (message, history = []) => {
  const { data, error } = await supabase.functions.invoke('intel-chat', {
    body: {
      message,
      conversationHistory: history
    }
  })
  
  if (error) throw error
  return data
}`,
    python: `# Install: pip install supabase
from supabase import create_client

supabase = create_client(
    "YOUR_SUPABASE_URL",
    "YOUR_SUPABASE_ANON_KEY"
)

# Analyze a document
def analyze_document(document_text: str, doc_type: str = "legal"):
    response = supabase.functions.invoke(
        "analyze-document",
        invoke_options={
            "body": {
                "documentText": document_text,
                "documentType": doc_type
            }
        }
    )
    return response

# Pattern detection
def detect_patterns(case_id: str, analysis_type: str = "behavioral"):
    response = supabase.functions.invoke(
        "pattern-detector",
        invoke_options={
            "body": {
                "caseId": case_id,
                "analysisType": analysis_type
            }
        }
    )
    return response`,
    curl: `# Analyze Document
curl -X POST 'https://ccdyqmjvzzoftzbzbqlu.supabase.co/functions/v1/analyze-document' \\
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "documentText": "Your document text here",
    "documentType": "legal"
  }'

# Intel Chat
curl -X POST 'https://ccdyqmjvzzoftzbzbqlu.supabase.co/functions/v1/intel-chat' \\
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "message": "What patterns exist in this case?",
    "conversationHistory": []
  }'

# Generate Report
curl -X POST 'https://ccdyqmjvzzoftzbzbqlu.supabase.co/functions/v1/generate-report' \\
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "caseId": "your-case-uuid",
    "reportType": "executive",
    "format": "pdf"
  }'`
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={hrpmLogo} 
              alt="HRPM Logo" 
              className="w-10 h-10 transition-all duration-300 group-hover:scale-110"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground tracking-tight">HRPM</span>
              <span className="text-[10px] text-foreground/60 leading-tight">API Documentation</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/docs" className="text-sm text-foreground/70 hover:text-primary transition-colors">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Docs
            </Link>
            <a 
              href="https://github.com/BackCheck/justice-unveiled" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-foreground/70 hover:text-primary transition-colors"
            >
              <Code className="w-4 h-4 inline mr-1" />
              GitHub
            </a>
            <LanguageSwitcher />
            <Button size="sm" variant="outline" asChild>
              <Link to="/auth">Get API Key</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border/30 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/30">
              <Zap className="w-3 h-3 mr-1" />
              REST API v1
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              HRPM <span className="text-primary">API</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Integrate human rights investigation intelligence into your applications. 
              Access AI-powered document analysis, pattern detection, and legal research capabilities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/auth">
                  <Key className="w-4 h-4 mr-2" />
                  Get API Key
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="https://github.com/BackCheck/justice-unveiled" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary" />
            Quick Start
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">1. Get Your API Key</CardTitle>
                <CardDescription>
                  Sign up and generate your API credentials from the dashboard
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">2. Authenticate</CardTitle>
                <CardDescription>
                  Include your access token in the Authorization header
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">3. Make Requests</CardTitle>
                <CardDescription>
                  Call endpoints to analyze documents, detect patterns, and more
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Code Examples */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript">
                <TabsList className="mb-4">
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>
                {Object.entries(codeExamples).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang}>
                    <div className="relative">
                      <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
                        <code>{code}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-16 border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Network className="w-6 h-6 text-primary" />
            API Endpoints
          </h2>
          
          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <Card key={index} className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    {endpoint.auth && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Auth Required
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">{endpoint.name}</CardTitle>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <p className="text-xs text-muted-foreground mb-2">Request Body:</p>
                    <pre className="bg-muted/50 rounded-lg p-3 text-xs overflow-x-auto">
                      <code>{endpoint.body}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-6 right-2"
                      onClick={() => copyToClipboard(endpoint.body)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b border-border/30 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Key Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <Brain className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">AI-Powered Analysis</CardTitle>
                <CardDescription>
                  Advanced NLP for document analysis, entity extraction, and pattern detection
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Secure by Default</CardTitle>
                <CardDescription>
                  JWT authentication, RLS policies, and encrypted data at rest
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <FileText className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Legal Intelligence</CardTitle>
                <CardDescription>
                  Access case law, precedents, and human rights framework analysis
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <Network className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Real-time Updates</CardTitle>
                <CardDescription>
                  WebSocket support for live data streaming and collaboration
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join researchers and human rights organizations using HRPM API to power their investigations.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button size="lg" asChild>
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/docs">Read Documentation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Human Rights Protection Movement
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link>
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <a 
              href="https://github.com/BackCheck/justice-unveiled" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Api;
