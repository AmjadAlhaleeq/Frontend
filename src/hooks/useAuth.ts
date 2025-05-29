
import { useState, useEffect } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city: string;
  age: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export const useAuth = () => {
  // Set default state to not authenticated
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  useEffect(() => {
    // Check for existing auth data on mount
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    // Only set authenticated if both token and user data exist
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

    // Listen for login/logout events
    const handleLoginStatusChange = () => {
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
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null
        });
      }
    };

    window.addEventListener('loginStatusChanged', handleLoginStatusChange);
    window.addEventListener('userLoggedIn', handleLoginStatusChange);
    window.addEventListener('userLoggedOut', handleLoginStatusChange);

    return () => {
      window.removeEventListener('loginStatusChanged', handleLoginStatusChange);
      window.removeEventListener('userLoggedIn', handleLoginStatusChange);
      window.removeEventListener('userLoggedOut', handleLoginStatusChange);
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
