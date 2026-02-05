import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import CaseLawLibrary from "./pages/CaseLawLibrary";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NewsHub from "./pages/NewsHub";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Public content pages */}
            <Route path="/case-law" element={<CaseLawLibrary />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/news" element={<NewsHub />} />
            
            {/* Public preview routes - accessible to all, with teaser for non-authenticated */}
            <Route path="/cases" element={<CasesList />} />
            <Route path="/cases/:caseId" element={<ProtectedRoute><CaseProfile /></ProtectedRoute>} />
            <Route path="/timeline" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/uploads" element={<ProtectedRoute><UploadsPage /></ProtectedRoute>} />
            <Route path="/intel-briefing" element={<ProtectedRoute><IntelBriefing /></ProtectedRoute>} />
            <Route path="/international" element={<ProtectedRoute><InternationalAnalysis /></ProtectedRoute>} />
            <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
            <Route path="/investigations" element={<ProtectedRoute><Investigations /></ProtectedRoute>} />
            <Route path="/reconstruction" element={<ProtectedRoute><Reconstruction /></ProtectedRoute>} />
            <Route path="/correlation" element={<ProtectedRoute><Correlation /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
            <Route path="/regulatory-harm" element={<ProtectedRoute><RegulatoryHarm /></ProtectedRoute>} />
            <Route path="/legal-intelligence" element={<ProtectedRoute><LegalIntelligence /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/events/:eventId" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
            <Route path="/violations/:type/:violationId" element={<ProtectedRoute><ViolationDetail /></ProtectedRoute>} />
            <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
            <Route path="/entities/:entityId" element={<ProtectedRoute><EntityDetail /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
