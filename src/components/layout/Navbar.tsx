
import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X, User, LogOut, Calendar } from "lucide-react";
import LoginDialog from "../auth/LoginDialog";
import LogoutConfirmationDialog from "../shared/LogoutConfirmationDialog";
import Logo from "../shared/Logo";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  
  // Use the useAuth hook
  const { isAuthenticated, user, logout: authLogout } = useAuth();

  const location = useLocation();

  // Set active link styles
  const getNavClassName = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? "font-medium text-teal-600 dark:text-teal-400"
      : "text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400";
  };

  // Check user role on mount and when authentication changes
  useEffect(() => {
    const checkUserRole = () => {
      const storedRole = localStorage.getItem("userRole");
      setUserRole(storedRole);
    };

    checkUserRole();

    // Add event listener for localStorage changes
    window.addEventListener("storage", checkUserRole);
    window.addEventListener("loginStatusChanged", checkUserRole);

    return () => {
      window.removeEventListener("storage", checkUserRole);
      window.removeEventListener("loginStatusChanged", checkUserRole);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    // Use the auth logout function
    authLogout();
    
    // Close the dialog
    setIsLogoutDialogOpen(false);
    
    // Show success message
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    
    // Close mobile menu if open
    setMobileMenuOpen(false);
    
    // Navigate to home page
    navigate('/');
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle successful login
  const handleLoginSuccess = (role: 'admin' | 'player', userDetails?: any) => {
    setUserRole(role);
    setIsLoginDialogOpen(false);
    
    // Dispatch custom event to notify other components
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <NavLink to="/" className={getNavClassName}>
                Home
              </NavLink>
              <NavLink to="/pitches" className={getNavClassName}>
                Pitches
              </NavLink>
              <NavLink to="/reservations" className={getNavClassName}>
                Reservations
              </NavLink>
              <NavLink to="/leaderboards" className={getNavClassName}>
                Leaderboards
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 via-blue-500 to-teal-400 flex items-center justify-center text-white text-sm font-bold">
                      {user.firstName?.[0]?.toUpperCase() || 'U'}
                      {user.lastName?.[0]?.toUpperCase() || ''}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole !== "admin" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer flex w-full items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/my-bookings" className="cursor-pointer flex w-full items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>My Bookings</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => setIsLogoutDialogOpen(true)}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                className="text-sm"
                onClick={() => setIsLoginDialogOpen(true)}
              >
                Login / Sign up
              </Button>
            )}

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Toggle Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="pr-0">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <NavLink
                    to="/"
                    className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/pitches"
                    className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pitches
                  </NavLink>
                  <NavLink
                    to="/reservations"
                    className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Reservations
                  </NavLink>
                  <NavLink
                    to="/leaderboards"
                    className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Leaderboards
                  </NavLink>
                  {isAuthenticated && userRole !== "admin" && (
                    <>
                      <NavLink
                        to="/profile"
                        className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </NavLink>
                      <NavLink
                        to="/my-bookings"
                        className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Bookings
                      </NavLink>
                    </>
                  )}
                  {userRole === "admin" && (
                    <NavLink
                      to="/admin/add-pitch"
                      className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Add Pitch
                    </NavLink>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
      />

      {/* Login Dialog */}
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
};

export default Navbar;
