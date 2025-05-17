
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, X, LogIn, Moon, Sun, Globe, User, Calendar, Trophy, Home, LogOut, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import Logo from "../shared/Logo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    toast({
      title: isDarkMode ? t('nav.lightMode') : t('nav.darkMode'),
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast({
      title: t('nav.logout'),
      duration: 3000,
    });
  };

  const handleLogin = () => {
    // In a real app, this would open a login modal
    setIsLoggedIn(true);
    toast({
      title: t('nav.login'),
      duration: 3000,
    });
  };

  // Check if the current path matches the NavLink path
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and main links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <Logo />
              </Link>
            </div>
            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-2">
              <NavLink to="/" icon={<Home size={18} />} text={t('nav.home')} isActive={isActive("/")} />
              <NavLink to="/pitches" icon={<MapPin size={18} />} text={t('nav.pitches')} isActive={isActive("/pitches")} />
              <NavLink to="/reservations" icon={<Calendar size={18} />} text={t('nav.reservations')} isActive={isActive("/reservations")} />
              <NavLink to="/leaderboards" icon={<Trophy size={18} />} text={t('nav.leaderboards')} isActive={isActive("/leaderboards")} />
            </div>
          </div>

          {/* Right side - User actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={toggleLanguage}
              className="flex items-center space-x-1"
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
                      <AvatarImage src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3" alt="Profile" />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('nav.profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/reservations" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{t('nav.bookings')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('nav.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" />
                <span>{t('nav.login')}</span>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="mr-1"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>

            <Button 
              variant="ghost" 
              onClick={toggleLanguage}
              aria-label="Change language"
              className="mr-1"
            >
              <Globe size={20} />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={toggleMenu} 
              aria-expanded="false"
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

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink to="/" text={t('nav.home')} isActive={isActive("/")} />
            <MobileNavLink to="/pitches" text={t('nav.pitches')} isActive={isActive("/pitches")} />
            <MobileNavLink to="/reservations" text={t('nav.reservations')} isActive={isActive("/reservations")} />
            <MobileNavLink to="/leaderboards" text={t('nav.leaderboards')} isActive={isActive("/leaderboards")} />
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="px-5 space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={toggleLanguage}
                aria-label="Change language"
              >
                <Globe className="mr-2 h-5 w-5" />
                <span>{language === 'en' ? 'العربية' : 'English'}</span>
              </Button>
              
              {isLoggedIn ? (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/profile">
                      <User className="mr-2 h-5 w-5" />
                      <span>{t('nav.profile')}</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/reservations">
                      <Calendar className="mr-2 h-5 w-5" />
                      <span>{t('nav.bookings')}</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-500"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    <span>{t('nav.logout')}</span>
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleLogin} 
                  className="w-full justify-start"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  <span>{t('nav.login')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Desktop Navigation Link
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

// Mobile Navigation Link
const MobileNavLink = ({ to, text, isActive }: { to: string; text: string; isActive: boolean }) => (
  <Link
    to={to}
    className={`block px-3 py-2 rounded-md text-base font-medium 
    ${isActive 
      ? "bg-bokit-50 text-bokit-600 dark:bg-bokit-900/20 dark:text-bokit-400" 
      : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
  >
    {text}
  </Link>
);

export default Navbar;
