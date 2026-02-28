import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CaseFilterProvider } from "@/contexts/CaseFilterContext";
import { CookieConsent } from "@/components/CookieConsent";
import { LogoSpinner } from "@/components/ui/LogoSpinner";

// Lazy-load all pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Index = lazy(() => import("./pages/Index"));
const NetworkPage = lazy(() => import("./pages/Network"));
const EvidencePage = lazy(() => import("./pages/Evidence"));
const UploadsPage = lazy(() => import("./pages/Uploads"));
const IntelBriefing = lazy(() => import("./pages/IntelBriefing"));
const About = lazy(() => import("./pages/About"));
const InternationalAnalysis = lazy(() => import("./pages/InternationalAnalysis"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Analyze = lazy(() => import("./pages/Analyze"));
const CasesList = lazy(() => import("./pages/CasesList"));
const CaseProfile = lazy(() => import("./pages/CaseProfile"));
const Investigations = lazy(() => import("./pages/Investigations"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const ViolationDetail = lazy(() => import("./pages/ViolationDetail"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const EntityDetail = lazy(() => import("./pages/EntityDetail"));
const Reconstruction = lazy(() => import("./pages/Reconstruction"));
const Correlation = lazy(() => import("./pages/Correlation"));
const Compliance = lazy(() => import("./pages/Compliance"));
const RegulatoryHarm = lazy(() => import("./pages/RegulatoryHarm"));
const Contact = lazy(() => import("./pages/Contact"));
const LegalIntelligence = lazy(() => import("./pages/LegalIntelligence"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const LegalResearch = lazy(() => import("./pages/LegalResearch"));
const Api = lazy(() => import("./pages/Api"));
const HowToUse = lazy(() => import("./pages/HowToUse"));
const Documentation = lazy(() => import("./pages/Documentation"));
const ThreatProfilerPage = lazy(() => import("./pages/ThreatProfilerPage"));
const Changelog = lazy(() => import("./pages/Changelog"));
const AnalysisHistory = lazy(() => import("./pages/AnalysisHistory"));
const OsintToolkit = lazy(() => import("./pages/OsintToolkit"));
const Landing = lazy(() => import("./pages/Landing"));
const ReportCenter = lazy(() => import("./pages/ReportCenter"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes  
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <LogoSpinner size="lg" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CaseFilterProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/cases" element={<CasesList />} />
            <Route path="/cases/:caseId" element={<CaseProfile />} />
            <Route path="/timeline" element={<Index />} />
            <Route path="/who-what-why" element={<About />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/uploads" element={<UploadsPage />} />
            <Route path="/intel-briefing" element={<IntelBriefing />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/international" element={<InternationalAnalysis />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/investigations" element={<Investigations />} />
            <Route path="/reconstruction" element={<Reconstruction />} />
            <Route path="/correlation" element={<Correlation />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/regulatory-harm" element={<RegulatoryHarm />} />
            <Route path="/legal-intelligence" element={<LegalIntelligence />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/legal-research" element={<LegalResearch />} />
            <Route path="/api" element={<Api />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/threat-profiler" element={<ThreatProfilerPage />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/analysis-history" element={<AnalysisHistory />} />
            <Route path="/osint-toolkit" element={<OsintToolkit />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
            <Route path="/violations/:type/:violationId" element={<ViolationDetail />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/entities/:entityId" element={<EntityDetail />} />
            <Route path="/welcome" element={<Landing />} />
            <Route path="/reports" element={<ReportCenter />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <CookieConsent />
          </CaseFilterProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
