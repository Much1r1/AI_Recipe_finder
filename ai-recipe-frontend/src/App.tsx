import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "@/pages/Index";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import Auth from "@/pages/Auth";
import SnapPageActual from "@/pages/SnapPage";
import HydrationPageActual from "@/pages/HydrationPage";
import FastingPageActual from "@/pages/FastingPage";
import NotFound from "@/pages/NotFound";
import {
  StatsPage,
  MealsPage,
  ShopPage,
  CommunityPage,
  GoalsPage,
  SnapPage,
  BatchCookPage,
  ScannerPage,
  HydrationPage,
  FastingPage
} from "@/pages/Placeholders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" attribute="class">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/meals" element={<MealsPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/snap" element={<SnapPageActual />} />
            <Route path="/tracker" element={<SnapPageActual />} />
            <Route path="/meal-planner" element={<BatchCookPage />} />
            <Route path="/batch-cook" element={<BatchCookPage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/hydration" element={<HydrationPageActual />} />
            <Route path="/fasting" element={<FastingPageActual />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
