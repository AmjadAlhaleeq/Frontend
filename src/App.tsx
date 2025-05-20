import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route } from "react-router-dom";
import "@/lib/theme";

import Index from "./pages/Index";
import ScrollToTop from "./components/shared/ScrollToTop";
import { ReservationProvider } from "./context/ReservationContext";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Initialize QueryClient for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Only retry failed queries once
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    },
  },
});

/**
 * Main App component
 * Sets up routing, providers, and app structure
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ReservationProvider>
        <BrowserRouter>
          <ScrollToTop /> {/* Scroll to top on page change */}
          <Toaster />
          <Sonner />
          {/* Add the PrivacyPolicy route */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Index />
        </BrowserRouter>
      </ReservationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
