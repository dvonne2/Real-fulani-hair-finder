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
import QuizResults from "./pages/QuizResults";

const App = () => (
  <QueryProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/results" element={<Results />} />
          <Route path="/results/:submissionId" element={<QuizResults />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <HealthBadge />
    </TooltipProvider>
  </QueryProvider>
);

export default App;

