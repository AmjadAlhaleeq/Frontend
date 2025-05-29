
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./Home";
import Profile from "./Profile";
import PlayerProfileById from "./PlayerProfileById";
import Pitches from "./Pitches";
import Reservations from "./Reservations";
import Leaderboards from "./Leaderboards";
import AboutPage from "./AboutPage";
import Faq from "./Faq";
import Rules from "./Rules";
import NotFound from "./NotFound";
import AddPitch from "./admin/AddPitch";
import ForgotPassword from "./ForgotPassword";
import MyBookings from "./MyBookings";
import PrivacyPolicy from "./PrivacyPolicy";
import PageTransition from "@/components/shared/PageTransition";

/**
 * Main routing component for the application
 * Defines all available routes and their corresponding components
 * Handles first-time login redirects and localStorage initialization
 */
const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);

  // Initialize app and handle first-time login
  useEffect(() => {
    // Initialize localStorage with default data if needed
    if (!localStorage.getItem("pitches")) {
      localStorage.setItem("pitches", JSON.stringify([]));
    }
    if (!localStorage.getItem("reservations")) {
      localStorage.setItem("reservations", JSON.stringify([]));
    }

    // Handle first-time login flow
    const firstTimeLogin = localStorage.getItem("firstTimeLogin");
    if (firstTimeLogin === "true") {
      setIsFirstTimeLogin(true);
      localStorage.removeItem("firstTimeLogin");

      // Redirect to home page for first-time users
      if (location.pathname !== "/") {
        navigate("/");
      }
    }

    // Event listeners for login/logout events
    const handleLogin = () => {
      console.log("User logged in, refreshing components");
    };

    const handleLogout = () => {
      console.log("User logged out, redirecting to home page");
      navigate("/");
      setTimeout(() => window.location.reload(), 100);
    };

    window.addEventListener("userLoggedIn", handleLogin);
    window.addEventListener("userLoggedOut", handleLogout);

    return () => {
      window.removeEventListener("userLoggedIn", handleLogin);
      window.removeEventListener("userLoggedOut", handleLogout);
    };
  }, [navigate, location.pathname]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PageTransition>
            <Home isFirstTimeLogin={isFirstTimeLogin} />
          </PageTransition>
        }
      />
      <Route
        path="/profile"
        element={
          <PageTransition>
            <Profile />
          </PageTransition>
        }
      />
      <Route
        path="/player-profile/:playerId"
        element={
          <PageTransition>
            <PlayerProfileById />
          </PageTransition>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <PageTransition>
            <MyBookings />
          </PageTransition>
        }
      />
      <Route
        path="/pitches"
        element={
          <PageTransition>
            <Pitches />
          </PageTransition>
        }
      />
      <Route
        path="/reservations"
        element={
          <PageTransition>
            <Reservations />
          </PageTransition>
        }
      />
      <Route
        path="/leaderboards"
        element={
          <PageTransition>
            <Leaderboards />
          </PageTransition>
        }
      />
      <Route
        path="/about"
        element={
          <PageTransition>
            <AboutPage />
          </PageTransition>
        }
      />
      <Route
        path="/faq"
        element={
          <PageTransition>
            <Faq />
          </PageTransition>
        }
      />
      <Route
        path="/rules"
        element={
          <PageTransition>
            <Rules />
          </PageTransition>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <PageTransition>
            <PrivacyPolicy />
          </PageTransition>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PageTransition>
            <ForgotPassword />
          </PageTransition>
        }
      />
      <Route
        path="/admin/add-pitch"
        element={
          <PageTransition>
            <AddPitch />
          </PageTransition>
        }
      />
      <Route
        path="*"
        element={
          <PageTransition>
            <NotFound />
          </PageTransition>
        }
      />
    </Routes>
  );
};

export default Index;
