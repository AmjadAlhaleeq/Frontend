import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./Home";
import Profile from "./Profile";
import Pitches from "./Pitches";
import Reservations from "./Reservations";
import Leaderboards from "./Leaderboards";
import AboutPage from "./AboutPage";
import Faq from "./Faq";
import Rules from "./Rules";
import NotFound from "./NotFound";
import AddPitch from "./admin/AddPitch";
// import EditPitch from "./admin/EditPitch";
import MyBookings from "./MyBookings";
import Layout from "@/components/layout/Layout";
import PrivacyPolicy from "./PrivacyPolicy";
import PageTransition from "@/components/shared/PageTransition";

/**
 * Main routing component for the application
 * Defines all available routes and their corresponding components
 */
const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);

  // Check for first-time login redirect and handle login/logout redirects
  useEffect(() => {
    // Initialize storage if needed
    if (!localStorage.getItem("pitches")) {
      localStorage.setItem("pitches", JSON.stringify([]));
    }
    if (!localStorage.getItem("reservations")) {
      localStorage.setItem("reservations", JSON.stringify([]));
    }

    // Handle first time login
    const firstTimeLogin = localStorage.getItem("firstTimeLogin");

    if (firstTimeLogin === "true") {
      // Mark that we've handled this first-time login
      setIsFirstTimeLogin(true);
      // Clear the flag so it only happens once
      localStorage.removeItem("firstTimeLogin");

      // If we're not on the home page, redirect there
      if (location.pathname !== "/") {
        navigate("/");
      }
      // Else the Home component will handle the welcome messages
    }

    // Handle user login event listener
    const handleLogin = () => {
      console.log("User logged in, refreshing the page");
      // When user logs in successfully, we don't need to reload the whole page
      // The navbar and other components will be updated through the loginStatusChanged event
    };

    // Handle logout event listener
    const handleLogout = () => {
      console.log("User logged out, redirecting to home page");
      // When user logs out, redirect to home page and reload
      navigate("/");
      setTimeout(() => window.location.reload(), 100);
    };

    window.addEventListener("userLoggedIn", handleLogin);
    window.addEventListener("userLoggedOut", handleLogout);

    // Cleanup
    return () => {
      window.removeEventListener("userLoggedIn", handleLogin);
      window.removeEventListener("userLoggedOut", handleLogout);
    };
  }, [navigate, location.pathname]);

  return (
    <Layout>
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
          path="/admin/add-pitch"
          element={
            <PageTransition>
              <AddPitch />
            </PageTransition>
          }
        />
        {/* <Route path="/admin/edit-pitch/:id" element={<PageTransition><EditPitch /></PageTransition>} /> */}
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </Layout>
  );
};

export default Index;
