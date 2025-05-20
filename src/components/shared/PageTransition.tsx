
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition component
 * Handles smooth transitions between routes with loading state
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Show loading state
    setIsLoading(true);
    
    // Simulate page loading time
    // In a real API-based app, this would be replaced with actual data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600); // Short delay for better UX
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading page..." />;
  }
  
  return <>{children}</>;
};

export default PageTransition;
