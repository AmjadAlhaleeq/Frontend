import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, X, LogIn, Moon, Sun, Globe, User, Calendar, Trophy, Home, LogOut, MapPin, Edit3, Users, Star, UserCircle, Mail, Phone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import Logo from "../shared/Logo";
import LoginDialog from "@/components/auth/LoginDialog";
import LogoutConfirmationDialog from "@/components/shared/LogoutConfirmationDialog"; // Import confirmation dialog

// Define UserProfileData interface (can be moved to a shared types file)
interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: string;
  city: string;
  favoritePosition: string;
  phoneNumber: string;
  email: string;
  avatarUrl?: string; // Optional avatar URL
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'player' | null>(null);
  const [currentUserDetails, setCurrentUserDetails] = useState<UserProfileData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate
  const { language, setLanguage, t } = useLanguage();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isLogoutConfirmatioOpen, setIsLogoutConfirmationOpen] = useState(false); // State for logout dialog

  // Effect to initialize auth state and theme from localStorage
  useEffect(() => {
    // Initialize authentication state
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUserRole = localStorage.getItem('userRole') as 'admin' | 'player' | null;
    const storedUserDetails = localStorage.getItem('currentUser');

    if (storedIsLoggedIn === 'true' && storedUserRole) {
      setIsLoggedIn(true);
      setUserRole(storedUserRole);
      if (storedUserDetails) {
        setCurrentUserDetails(JSON.parse(storedUserDetails));
      }
    }

    // Initialize theme based on localStorage or default to light mode
    const localTheme = localStorage.getItem('theme');
    if (localTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else { 
      // Defaults to light if localTheme is 'light' or null
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      // If no theme was set, explicitly set it to light in localStorage
      if (!localTheme) {
        localStorage.setItem('theme', 'light');
      }
    }
  }, []);

  // Effect to listen for profile updates (e.g., avatar change)
  useEffect(() => {
    const handleProfileUpdate = () => {
      const storedUserDetails = localStorage.getItem('currentUser');
      if (storedUserDetails) {
        setCurrentUserDetails(JSON.parse(storedUserDetails));
        // Optional: toast to indicate avatar updated in navbar if desired
        // toast({ title: "Navbar Updated", description: "User details refreshed." });
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount


  const toggleMenu = () => setIsOpen(!isOpen);
  
  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Persist theme choice
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // Persist theme choice
    }
    toast({
      title: newIsDarkMode ? t('nav.darkMode') : t('nav.lightMode'),
      duration: 2000,
    });
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    toast({
      title: newLanguage === 'en' ? 'Switched to English' : 'تم التحويل إلى العربية',
      duration: 2000,
    });
  };

  /**
   * Initiates the logout process by opening the confirmation dialog.
   */
  const initiateLogout = () => {
    setIsLogoutConfirmationOpen(true);
  };

  /**
   * Handles confirmed user logout.
   * Clears user state, localStorage, shows toast, and navigates to home.
   */
  const confirmLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentUserDetails(null);
    // Clear from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    
    toast({
      title: t('nav.logout'),
      description: "You have been successfully logged out.",
      duration: 3000,
    });
    
    setIsLogoutConfirmationOpen(false); // Close the dialog
    if (isOpen) setIsOpen(false); // Close mobile menu if open
    navigate('/'); // Redirect to home page
  };


  const handleLoginButtonClick = () => {
    setIsLoginDialogOpen(true);
  };

  /**
   * Handles successful login (or sign-up).
   * @param role - The role of the logged-in user ('admin' | 'player').
   * @param userDetails - Optional details of the logged-in user.
   */
  const handleLoginSuccess = (role: 'admin' | 'player', userDetails?: UserProfileData) => {
    setIsLoggedIn(true);
    setUserRole(role);
    if (userDetails) {
      setCurrentUserDetails(userDetails);
      // localStorage is already set by LoginDialog, but good to be consistent
      // If LoginDialog didn't set it, we would set it here:
      // localStorage.setItem('currentUser', JSON.stringify(userDetails));
    } else {
        // Attempt to load from localStorage if not directly passed (e.g. refresh scenario)
        const storedUserDetails = localStorage.getItem('currentUser');
        if (storedUserDetails) setCurrentUserDetails(JSON.parse(storedUserDetails));
    }
    // localStorage.setItem('isLoggedIn', 'true'); // Set by LoginDialog
    // localStorage.setItem('userRole', role); // Set by LoginDialog
    setIsLoginDialogOpen(false);
    toast({
      title: t('nav.login'),
      description: `Welcome back, ${userDetails?.firstName || 'User'}! You are logged in as ${role}.`,
      duration: 3000,
    });
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Determine user's display name and avatar fallback
  const displayName = currentUserDetails?.firstName ? `${currentUserDetails.firstName} ${currentUserDetails.lastName?.[0] || ''}.` : (userRole ? (userRole.charAt(0).toUpperCase() + userRole.slice(1)) : "User");
  const avatarFallback = currentUserDetails?.firstName ? currentUserDetails.firstName.charAt(0).toUpperCase() : (userRole ? userRole.charAt(0).toUpperCase() : "U");

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/">
                  <Logo />
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-2">
                <NavLink to="/" icon={<Home size={18} />} text={t('nav.home')} isActive={isActive("/")} />
                <NavLink to="/pitches" icon={<MapPin size={18} />} text={t('nav.pitches')} isActive={isActive("/pitches")} />
                <NavLink to="/reservations" icon={<Calendar size={18} />} text={t('nav.reservations')} isActive={isActive("/reservations")} />
                <NavLink to="/leaderboards" icon={<Trophy size={18} />} text={t('nav.leaderboards')} isActive={isActive("/leaderboards")} />
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="text-gray-600 dark:text-gray-300 hover:text-bokit-500 dark:hover:text-bokit-400"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={toggleLanguage}
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-bokit-500 dark:hover:text-bokit-400"
                aria-label="Change language"
              >
                <Globe size={20} />
                <span className="ms-1">{language === 'en' ? 'العربية' : 'English'}</span>
              </Button>

              {isLoggedIn ? (
                <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative p-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUserDetails?.avatarUrl || `https://ui-avatars.com/api/?name=${currentUserDetails?.firstName}+${currentUserDetails?.lastName}&background=random`} alt={displayName} />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border dark:border-gray-700">
                    <DropdownMenuItem asChild className="hover:!bg-gray-100 dark:hover:!bg-gray-700">
                      <Link to="/profile" className="flex items-center text-gray-700 dark:text-gray-200">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t('nav.profile')}</span>
                      </Link>
                    </DropdownMenuItem>
                    {userRole === 'admin' && (
                       <DropdownMenuItem asChild className="hover:!bg-gray-100 dark:hover:!bg-gray-700">
                         <Link to="/admin/add-pitch" className="flex items-center text-bokit-600 dark:text-bokit-400">
                           <MapPin className="mr-2 h-4 w-4" /> 
                           <span>Add Pitch</span>
                         </Link>
                       </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="hover:!bg-gray-100 dark:hover:!bg-gray-700">
                      <Link to="/reservations" className="flex items-center text-gray-700 dark:text-gray-200">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{t('nav.bookings')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 hover:!text-red-600 focus:!text-red-600 dark:hover:!bg-red-700/20" onClick={initiateLogout}> {/* Changed to initiateLogout */}
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('nav.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleLoginButtonClick} className="flex items-center bg-bokit-500 hover:bg-bokit-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>{t('nav.login')}</span>
                </Button>
              )}
            </div>
             <div className="flex items-center md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="mr-1 text-gray-600 dark:text-gray-300 hover:text-bokit-500 dark:hover:text-bokit-400"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>

              <Button 
                variant="ghost" 
                onClick={toggleLanguage}
                aria-label="Change language"
                className="mr-1 text-gray-600 dark:text-gray-300 hover:text-bokit-500 dark:hover:text-bokit-400"
              >
                <Globe size={20} />
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={toggleMenu} 
                aria-expanded={isOpen}
                aria-label="Toggle mobile menu"
                className="text-gray-600 dark:text-gray-300 hover:text-bokit-500 dark:hover:text-bokit-400"
              >
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink to="/" text={t('nav.home')} isActive={isActive("/")} onClick={() => setIsOpen(false)} />
            <MobileNavLink to="/pitches" text={t('nav.pitches')} isActive={isActive("/pitches")} onClick={() => setIsOpen(false)} />
            <MobileNavLink to="/reservations" text={t('nav.reservations')} isActive={isActive("/reservations")} onClick={() => setIsOpen(false)} />
            <MobileNavLink to="/leaderboards" text={t('nav.leaderboards')} isActive={isActive("/leaderboards")} onClick={() => setIsOpen(false)} />
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="px-5 space-y-2">
              {isLoggedIn ? (
                <>
                   <div className="flex items-center px-2 py-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUserDetails?.avatarUrl || `https://ui-avatars.com/api/?name=${currentUserDetails?.firstName}+${currentUserDetails?.lastName}&background=random`} alt={displayName} />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-base font-medium text-gray-800 dark:text-white">{displayName}</p>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{userRole === 'admin' ? 'Admin' : 'Player'}</p>
                      </div>
                    </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-700 dark:text-gray-200"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/profile">
                      <User className="mr-2 h-5 w-5" />
                      <span>{t('nav.profile')}</span>
                    </Link>
                  </Button>
                  {userRole === 'admin' && (
                     <Button 
                        variant="ghost" 
                        className="w-full justify-start text-bokit-600 dark:text-bokit-400"
                        asChild
                        onClick={() => setIsOpen(false)}
                      >
                       <Link to="/admin/add-pitch">
                         <MapPin className="mr-2 h-5 w-5" /> 
                         <span>Add Pitch</span>
                       </Link>
                     </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-700 dark:text-gray-200"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/reservations">
                      <Calendar className="mr-2 h-5 w-5" />
                      <span>{t('nav.bookings')}</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-500 hover:!text-red-600 focus:!text-red-600 dark:hover:!bg-red-700/20"
                    onClick={() => { initiateLogout(); setIsOpen(false); }} // Changed to initiateLogout
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    <span>{t('nav.logout')}</span>
                  </Button>
                </>
              ) : (
                 <Button 
                  onClick={() => { handleLoginButtonClick(); setIsOpen(false); }} 
                  className="w-full justify-start bg-bokit-500 hover:bg-bokit-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  <span>{t('nav.login')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      <LoginDialog 
        isOpen={isLoginDialogOpen} 
        onClose={() => setIsLoginDialogOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />
      {/* Add Logout Confirmation Dialog instance */}
      <LogoutConfirmationDialog
        isOpen={isLogoutConfirmatioOpen}
        onClose={() => setIsLogoutConfirmationOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

// NavLink component with dark mode compatibility
const NavLink = ({ to, icon, text, isActive }: { to: string; icon: React.ReactNode; text: string; isActive: boolean }) => (
  <Link
    to={to}
    className={`group inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors 
    ${isActive 
      ? "bg-bokit-50 text-bokit-600 dark:bg-bokit-900/20 dark:text-bokit-400" 
      : "text-gray-600 dark:text-gray-300 hover:text-bokit-500 dark:hover:text-bokit-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
  >
    <span className="inline-flex items-center space-x-2">
      {icon}
      <span className="ms-1">{text}</span>
    </span>
  </Link>
);

// MobileNavLink component with dark mode compatibility and onClick to close menu
const MobileNavLink = ({ to, text, isActive, onClick }: { to: string; text: string; isActive: boolean; onClick: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`block px-3 py-2 rounded-md text-base font-medium 
    ${isActive 
      ? "bg-bokit-50 text-bokit-600 dark:bg-bokit-900/20 dark:text-bokit-400" 
      : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/80 hover:text-bokit-500 dark:hover:text-bokit-400"}`}
  >
    {text}
  </Link>
);

export default Navbar;
