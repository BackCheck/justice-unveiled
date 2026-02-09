import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieConsent } from "@/components/CookieConsent";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NetworkPage from "./pages/Network";
import EvidencePage from "./pages/Evidence";
import UploadsPage from "./pages/Uploads";
import IntelBriefing from "./pages/IntelBriefing";
import About from "./pages/About";
import InternationalAnalysis from "./pages/InternationalAnalysis";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel";
import Analyze from "./pages/Analyze";
import CasesList from "./pages/CasesList";
import CaseProfile from "./pages/CaseProfile";
import Investigations from "./pages/Investigations";
import NotFound from "./pages/NotFound";
import EventDetail from "./pages/EventDetail";
import ViolationDetail from "./pages/ViolationDetail";
import Watchlist from "./pages/Watchlist";
import EntityDetail from "./pages/EntityDetail";
import Reconstruction from "./pages/Reconstruction";
import Correlation from "./pages/Correlation";
import Compliance from "./pages/Compliance";
import RegulatoryHarm from "./pages/RegulatoryHarm";
import Contact from "./pages/Contact";
import LegalIntelligence from "./pages/LegalIntelligence";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import LegalResearch from "./pages/LegalResearch";
import Api from "./pages/Api";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Landing />} />
            <Route path="/cases" element={<CasesList />} />
            <Route path="/cases/:caseId" element={<CaseProfile />} />
            <Route path="/timeline" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/uploads" element={<UploadsPage />} />
            <Route path="/intel-briefing" element={<IntelBriefing />} />
            <Route path="/about" element={<About />} />
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
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
            <Route path="/violations/:type/:violationId" element={<ViolationDetail />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/entities/:entityId" element={<EntityDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
