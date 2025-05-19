import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/lib/theme";

import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Pitches from "./pages/Pitches";
import Reservations from "./pages/Reservations";
import Leaderboards from "./pages/Leaderboards";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { ReservationProvider } from "./context/ReservationContext";
import AddPitch from "./pages/admin/AddPitch";
import AboutPage from "./pages/AboutPage";
import Faq from "./pages/Faq";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Rules from "./pages/Rules";
import ScrollToTop from "./components/shared/ScrollToTop"; // Import ScrollToTop

// Initialize QueryClient for data fetching
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ScrollToTop /> {/* Add ScrollToTop here */}
        <ReservationProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path="/pitches"
              element={
                <Layout>
                  <Pitches />
                </Layout>
              }
            />
            <Route
              path="/reservations"
              element={
                <Layout>
                  <Reservations />
                </Layout>
              }
            />
            <Route
              path="/leaderboards"
              element={
                <Layout>
                  <Leaderboards />
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <Profile />
                </Layout>
              }
            />
            <Route
              path="/admin/add-pitch"
              element={
                <Layout>
                  <AddPitch />
                </Layout>
              }
            />
            <Route
              path="/about"
              element={
                <Layout>
                  <AboutPage />
                </Layout>
              }
            />
            <Route
              path="/Faq"
              element={
                <Layout>
                  <Faq />
                </Layout>
              }
            />
            <Route
              path="/Privacy-Policy"
              element={
                <Layout>
                  <PrivacyPolicy />
                </Layout>
              }
            />
            <Route
              path="/Rules"
              element={
                <Layout>
                  <Rules />
                </Layout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ReservationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
