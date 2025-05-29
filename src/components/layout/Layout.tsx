
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import PageTransition from "../shared/PageTransition";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component that wraps all pages
 * Provides consistent structure with navbar, main content, and footer
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-6 md:px-6">
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
