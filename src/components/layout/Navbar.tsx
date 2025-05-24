
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Removed: import { useAuth } from "@/context/AuthContext";
// Removed: import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
}

// Removed all logout logic since AuthContext does not exist

const NavbarProfileDropdown = ({ user }) => {
  const { toast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Logout simply navigates to login (simulate logout)
  const handleLogout = async () => {
    toast({
      title: "Logged out",
      description: "This is a simulated logout.",
    });
    window.location.href = "/login";
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-30 py-2">
      <div className="p-3 border-b flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatarUrl || ""} />
          <AvatarFallback>{user.name?.charAt(0) ?? "U"}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-bold text-sm">{user.name}</div>
          <div className="text-xs text-gray-600">{user.email}</div>
        </div>
      </div>
      {/* Removed Add Pitch option */}
      <Button variant="ghost" className="w-full justify-start px-4 py-2 text-red-500 hover:bg-red-50" onClick={handleLogout}>
        <span className="mr-2">🔓</span>
        Log out
      </Button>
    </div>
  );
};

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { toast } = useToast();

  // Define handleLogout here for the dropdown in this component
  const handleLogout = async () => {
    toast({
      title: "Logged out",
      description: "This is a simulated logout.",
    });
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <a href="/" className="text-xl font-bold text-gray-800 dark:text-white">
                Football Reservations
              </a>
            </div>
          </div>
          <div className="md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {/* Use optional chaining for safety */}
              {user?.name ? (
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl || ""} />
                          <AvatarFallback>{user.name?.charAt(0) ?? "U"}</AvatarFallback>
                        </Avatar>
                        <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {user.name}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50" align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <a href="/login" className="text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400">
                    Login
                  </a>
                  <a href="/register" className="text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400">
                    Register
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

