import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import NotFound from "./pages/NotFound";

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
            <Route path="/timeline" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/uploads" element={<UploadsPage />} />
            <Route path="/intel-briefing" element={<IntelBriefing />} />
            <Route path="/about" element={<About />} />
            <Route path="/international" element={<InternationalAnalysis />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
