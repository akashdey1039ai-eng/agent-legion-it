import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { SecurityProvider } from "@/components/SecurityProvider";
import { ProductionReadyWrapper } from "@/components/ProductionReadyWrapper";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SalesforceCallback from "./pages/SalesforceCallback";
import HubSpotCallback from "./pages/HubSpotCallback";
import AIAgents from "./pages/AIAgents";
import CRM from "./pages/CRM";

// QueryClient for React Query state management
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SecurityProvider>
        <ProductionReadyWrapper>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/ai-agents" element={<AIAgents />} />
                <Route path="/salesforce-callback" element={<SalesforceCallback />} />
                <Route path="/hubspot-callback" element={<HubSpotCallback />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ProductionReadyWrapper>
      </SecurityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
