
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ReservationProvider } from "@/context/ReservationContext";
import Layout from "@/components/layout/Layout";
import ScrollToTop from "@/components/shared/ScrollToTop";

// Pages
import Index from "@/pages/Index";
import Home from "@/pages/Home";
import Reservations from "@/pages/Reservations";
import ReservationsEnhanced from "@/pages/ReservationsEnhanced";
import Profile from "@/pages/Profile";
import PlayerProfile from "@/pages/PlayerProfile";
import PlayerProfileById from "@/pages/PlayerProfileById";
import Pitches from "@/pages/Pitches";
import AddPitch from "@/pages/admin/AddPitch";
import Leaderboards from "@/pages/Leaderboards";
import MyBookings from "@/pages/MyBookings";
import AboutPage from "@/pages/AboutPage";
import Rules from "@/pages/Rules";
import Faq from "@/pages/Faq";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";

import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Main application component
 * Sets up routing, providers, and global configurations
 */
function App() {
  useEffect(() => {
    console.log("App initialized");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <ReservationProvider>
            <ScrollToTop />
            <Layout>
              <Routes>
                <Route path="/*" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route
                  path="/reservations-enhanced"
                  element={<ReservationsEnhanced />}
                />
                <Route path="/profile" element={<Profile />} />
                <Route path="/player/:playerId" element={<PlayerProfile />} />
                <Route
                  path="/player-profile/:playerId"
                  element={<PlayerProfileById />}
                />
                <Route path="/pitches" element={<Pitches />} />
                <Route path="/admin/add-pitch" element={<AddPitch />} />
                <Route path="/leaderboards" element={<Leaderboards />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <Toaster />
          </ReservationProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
