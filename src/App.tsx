import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import QueryProvider from "@/providers/QueryProvider";
import HealthBadge from "@/components/HealthBadge";
import Results from "./pages/Results";
import ResultDetail from "./pages/ResultDetail";

const App = () => (
  <QueryProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quiz" element={<Quiz />} />
<<<<<<< HEAD
          <Route path="/admin" element={<Admin />} />
=======
          <Route path="/results" element={<Results />} />
          <Route path="/results/:id" element={<ResultDetail />} />
>>>>>>> a38d435 (feat: backend integration infrastructure\n\n- Add API service layer (config, health, quiz endpoints)\n- Add React Query provider with caching\n- Add TypeScript types for API responses\n- Add HealthBadge component\n- Wire quiz submission to backend\n- Add loading/error/toast states\n- Install axios and React Query dependencies)
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <HealthBadge />
    </TooltipProvider>
  </QueryProvider>
);

export default App;
