import { Suspense } from "react";
import { lazyWithRetry as lazy } from "@/lib/lazyWithRetry";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CaseFilterProvider } from "@/contexts/CaseFilterContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { CookieConsent } from "@/components/CookieConsent";
import { ModuleGate } from "@/components/ModuleGate";

import { LogoSpinner } from "@/components/ui/LogoSpinner";

// Lazy-load all pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const HomePage = lazy(() => import("./pages/HomePage"));
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
const OsintCommands = lazy(() => import("./pages/OsintCommands"));
const OsintLabOnboarding = lazy(() => import("./pages/OsintLabOnboarding"));
const Landing = lazy(() => import("./pages/Landing"));
const EntityReview = lazy(() => import("./pages/EntityReview"));
const SubmitCase = lazy(() => import("./pages/SubmitCase"));
const AddEvidence = lazy(() => import("./pages/AddEvidence"));
const ReportCenter = lazy(() => import("./pages/ReportCenter"));
const AnalyzeHub = lazy(() => import("./pages/AnalyzeHub"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Commitment = lazy(() => import("./pages/Commitment"));
const FinancialAbuse = lazy(() => import("./pages/FinancialAbuse"));

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
    <AccessibilityProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CaseFilterProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/cases" element={<CasesList />} />
            <Route path="/cases/:caseId" element={<CaseProfile />} />
            <Route path="/timeline" element={<ModuleGate route="/timeline"><Index /></ModuleGate>} />
            <Route path="/about" element={<About />} />
            <Route path="/network" element={<ModuleGate route="/network"><NetworkPage /></ModuleGate>} />
            <Route path="/evidence" element={<ModuleGate route="/evidence"><EvidencePage /></ModuleGate>} />
            <Route path="/uploads" element={<ModuleGate route="/uploads"><UploadsPage /></ModuleGate>} />
            <Route path="/intel-briefing" element={<ModuleGate route="/intel-briefing"><IntelBriefing /></ModuleGate>} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/international" element={<ModuleGate route="/international"><InternationalAnalysis /></ModuleGate>} />
            <Route path="/analyze" element={<ModuleGate route="/analyze"><AnalyzeHub /></ModuleGate>} />
            <Route path="/analyze/ai" element={<Navigate to="/analyze?tool=ai" replace />} />
            <Route path="/investigations" element={<ModuleGate route="/investigations"><Investigations /></ModuleGate>} />
            <Route path="/reconstruction" element={<ModuleGate route="/reconstruction"><Reconstruction /></ModuleGate>} />
            <Route path="/correlation" element={<ModuleGate route="/correlation"><Correlation /></ModuleGate>} />
            <Route path="/compliance" element={<ModuleGate route="/compliance"><Compliance /></ModuleGate>} />
            <Route path="/regulatory-harm" element={<ModuleGate route="/regulatory-harm"><RegulatoryHarm /></ModuleGate>} />
            <Route path="/financial-abuse" element={<ModuleGate route="/financial-abuse"><FinancialAbuse /></ModuleGate>} />
            <Route path="/legal-intelligence" element={<ModuleGate route="/legal-intelligence"><LegalIntelligence /></ModuleGate>} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/legal-research" element={<ModuleGate route="/legal-research"><LegalResearch /></ModuleGate>} />
            <Route path="/api" element={<Api />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/threat-profiler" element={<ModuleGate route="/threat-profiler"><ThreatProfilerPage /></ModuleGate>} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/analysis-history" element={<ModuleGate route="/analysis-history"><AnalysisHistory /></ModuleGate>} />
            <Route path="/osint-toolkit" element={<ModuleGate route="/osint-toolkit"><OsintToolkit /></ModuleGate>} />
            <Route path="/osint-commands" element={<ModuleGate route="/osint-commands"><OsintCommands /></ModuleGate>} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/entity-review" element={<EntityReview />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
            <Route path="/violations/:type/:violationId" element={<ViolationDetail />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/entities/:entityId" element={<EntityDetail />} />
            <Route path="/welcome" element={<Landing />} />
            <Route path="/evidence/new" element={<SubmitCase />} />
            <Route path="/submit-case" element={<SubmitCase />} />
            <Route path="/cases/:caseId/add-evidence" element={<AddEvidence />} />
            <Route path="/reports" element={<ModuleGate route="/reports"><ReportCenter /></ModuleGate>} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/commitment" element={<Commitment />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <CookieConsent />
          
          </CaseFilterProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </AccessibilityProvider>
  </QueryClientProvider>
);

export default App;
