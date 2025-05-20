
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
import EditPitch from "./admin/EditPitch";
import MyBookings from "./MyBookings";
import Layout from "@/components/layout/Layout";

/**
 * Main routing component for the application
 * Defines all available routes and their corresponding components
 * 
 * @remarks
 * Routes are designed to work with the MongoDB/Node.js backend API endpoints
 */
const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  
  // Check for first-time login redirect only once on component mount
  useEffect(() => {
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
  }, [navigate, location.pathname]);
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home isFirstTimeLogin={isFirstTimeLogin} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/pitches" element={<Pitches />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/leaderboards" element={<Leaderboards />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/admin/add-pitch" element={<AddPitch />} />
        <Route path="/admin/edit-pitch/:id" element={<EditPitch />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default Index;
