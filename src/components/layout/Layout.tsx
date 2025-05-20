import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { LanguageProvider } from '@/context/LanguageContext';
import { useLanguage } from '@/context/LanguageContext';
import PageTransition from "../shared/PageTransition";

interface LayoutProps {
  children: React.ReactNode;
}

// This component wraps the main application with language context
const LanguageWrapper: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LanguageProvider>
      <LayoutContent>{children}</LayoutContent>
    </LanguageProvider>
  );
};

// This component receives language context and applies appropriate styling
const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
  const { language } = useLanguage();
  
  useEffect(() => {
    // Set the document direction based on language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Add the appropriate font class to the body
    if (language === 'ar') {
      document.body.classList.add('font-arabic');
      document.body.classList.remove('font-sans');
    } else {
      document.body.classList.remove('font-arabic');
      document.body.classList.add('font-sans');
    }
  }, [language]);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
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

// We export the wrapper as the default component
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <LanguageWrapper>{children}</LanguageWrapper>;
};

export default Layout;
