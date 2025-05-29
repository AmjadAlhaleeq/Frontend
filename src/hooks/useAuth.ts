
import { useState, useEffect } from 'react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  age: number;
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
    const userData = localStorage.getItem('user');

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
    const handleLogin = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
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
        }
      }
    };

    const handleLogout = () => {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null
      });
    };

    window.addEventListener('userLoggedIn', handleLogin);
    window.addEventListener('userLoggedOut', handleLogout);

    return () => {
      window.removeEventListener('userLoggedIn', handleLogin);
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  };

  return {
    ...authState,
    logout
  };
};
