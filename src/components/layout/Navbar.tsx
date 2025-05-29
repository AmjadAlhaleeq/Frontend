
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LoginDialog from "../auth/LoginDialog";
import LogoutConfirmationDialog from "../shared/LogoutConfirmationDialog";
import Logo from "../shared/Logo";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";
import DesktopNav from "./DesktopNav";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  
  const { isAuthenticated, user, logout: authLogout } = useAuth();
  const location = useLocation();

  // Check user role on mount and when authentication changes
  useEffect(() => {
    const checkUserRole = () => {
      const storedRole = localStorage.getItem("userRole");
      setUserRole(storedRole);
    };

    checkUserRole();
    window.addEventListener("storage", checkUserRole);
    window.addEventListener("loginStatusChanged", checkUserRole);

    return () => {
      window.removeEventListener("storage", checkUserRole);
      window.removeEventListener("loginStatusChanged", checkUserRole);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    authLogout();
    setIsLogoutDialogOpen(false);
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLoginSuccess = (role: 'admin' | 'player', userDetails?: any) => {
    setUserRole(role);
    setIsLoginDialogOpen(false);
    
    // Store updated user data with profile picture if available
    if (userDetails) {
      localStorage.setItem('currentUser', JSON.stringify(userDetails));
    }
    
    window.dispatchEvent(new Event("loginStatusChanged"));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <Logo />
              <span className="font-bold inline-block sr-only">FootballApp</span>
            </Link>
            <DesktopNav />
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <UserMenu 
                user={user} 
                userRole={userRole} 
                onLogout={() => setIsLogoutDialogOpen(true)} 
              />
            ) : (
              <Button 
                variant="outline" 
                className="text-sm"
                onClick={() => setIsLoginDialogOpen(true)}
              >
                Login / Sign up
              </Button>
            )}

            <MobileNav 
              isOpen={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
              isAuthenticated={isAuthenticated}
              userRole={userRole}
            />
          </div>
        </div>
      </div>

      <LogoutConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
      />

      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
};

export default Navbar;
