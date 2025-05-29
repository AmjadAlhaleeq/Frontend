
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, User, LogOut, Settings, Calendar } from "lucide-react";
import LoginDialog from "../auth/LoginDialog";
import LogoutConfirmationDialog from "../shared/LogoutConfirmationDialog";
import Logo from "../shared/Logo";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const location = useLocation();

  // Set active link styles
  const getNavClassName = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? "font-medium text-teal-600 dark:text-teal-400"
      : "text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400";
  };

  // Check login status on mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const storedUser = localStorage.getItem("currentUser");
      const storedRole = localStorage.getItem("userRole");

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
          setIsLoggedIn(true);
          setUserRole(storedRole);
        } catch (e) {
          console.error("Error parsing user data:", e);
          setIsLoggedIn(false);
          setCurrentUser(null);
          setUserRole(null);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUserRole(null);
      }
    };

    checkLoginStatus();

    // Add event listener for localStorage changes
    window.addEventListener("storage", checkLoginStatus);
    
    // Custom event for login status changes within the app
    window.addEventListener("loginStatusChanged", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("loginStatusChanged", checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    
    // Update state
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRole(null);
    
    // Close the dialog
    setIsLogoutDialogOpen(false);
    
    // Show success message
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    
    // Close mobile menu if open
    setMobileMenuOpen(false);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("loginStatusChanged"));
    
    // Navigate to home page
    navigate('/');
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle successful login
  const handleLoginSuccess = (role: 'admin' | 'player', userDetails?: any) => {
    setIsLoggedIn(true);
    setCurrentUser(userDetails);
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
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0 ring-2 ring-transparent hover:ring-teal-200 transition-all duration-200"
                  >
                    <Avatar className="h-10 w-10 shadow-lg ring-2 ring-white dark:ring-gray-800">
                      <AvatarImage
                        src={currentUser?.photo}
                        alt={`${currentUser?.firstName} ${currentUser?.lastName}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white font-semibold text-sm shadow-inner">
                        {currentUser?.firstName?.[0] || 'U'}
                        {currentUser?.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser?.firstName} {currentUser?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.email}
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
                  {isLoggedIn && userRole !== "admin" && (
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
