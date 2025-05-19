
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Profile from "./Profile";
import Pitches from "./Pitches";
import Reservations from "./Reservations";
import Leaderboards from "./Leaderboards";
import AboutPage from "./AboutPage";
import Faq from "./Faq";
import Rules from "./Rules";
import NotFound from "./NotFound";
import PlayerLineup from "./PlayerLineup";
import AddPitch from "./admin/AddPitch";
import Layout from "@/components/layout/Layout";

/**
 * Main routing component for the application
 * Defines all available routes and their corresponding components
 */
const Index = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/pitches" element={<Pitches />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/leaderboards" element={<Leaderboards />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/lineup" element={<PlayerLineup />} />
        <Route path="/admin/add-pitch" element={<AddPitch />} />
        <Route path="/admin/edit-pitch/:id" element={<AddPitch />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default Index;
