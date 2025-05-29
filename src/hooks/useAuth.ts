
import { useState, useEffect } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  age?: string;
  profilePicture?: string;
  preferredPosition?: string;
  bio?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export const useAuth = () => {
  // Always start with logged out state
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  useEffect(() => {
    // Clear any existing auth data on initial load to ensure logout by default
    const clearAuthOnLoad = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isLoggedIn');
    };
    
    clearAuthOnLoad();

    // Check for existing auth data after clearing
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('currentUser');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setAuthState({
            isAuthenticated: true,
            user,
            token
          });
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      }
    };

    // Listen for auth events
    const handleAuthEvents = () => {
      checkAuthStatus();
    };

    window.addEventListener('loginStatusChanged', handleAuthEvents);
    window.addEventListener('userLoggedIn', handleAuthEvents);
    window.addEventListener('userLoggedOut', handleAuthEvents);

    return () => {
      window.removeEventListener('loginStatusChanged', handleAuthEvents);
      window.removeEventListener('userLoggedIn', handleAuthEvents);
      window.removeEventListener('userLoggedOut', handleAuthEvents);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
    window.dispatchEvent(new Event('userLoggedOut'));
  };

  return {
    ...authState,
    logout
  };
};
