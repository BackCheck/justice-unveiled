import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NetworkPage from "./pages/Network";
import EvidencePage from "./pages/Evidence";
import UploadsPage from "./pages/Uploads";
import IntelBriefing from "./pages/IntelBriefing";
import About from "./pages/About";
import InternationalAnalysis from "./pages/InternationalAnalysis";
import Auth from "./pages/Auth";
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
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/network" element={<ProtectedRoute><NetworkPage /></ProtectedRoute>} />
            <Route path="/evidence" element={<ProtectedRoute><EvidencePage /></ProtectedRoute>} />
            <Route path="/uploads" element={<ProtectedRoute><UploadsPage /></ProtectedRoute>} />
            <Route path="/intel-briefing" element={<ProtectedRoute><IntelBriefing /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/international" element={<ProtectedRoute><InternationalAnalysis /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
