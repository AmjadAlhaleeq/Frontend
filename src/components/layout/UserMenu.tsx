
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Calendar } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { getMyProfile } from "@/lib/userApi";

interface UserMenuProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  userRole: string | null;
  onLogout: () => void;
}

const UserMenu = ({ user: initialUser, userRole, onLogout }: UserMenuProps) => {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    // Fetch complete user profile including profile picture
    const fetchUserProfile = async () => {
      try {
        const response = await getMyProfile();
        if (response.status === 'success' && response.data?.user) {
          const backendUser = response.data.user;
          const updatedUser = {
            firstName: backendUser.firstName,
            lastName: backendUser.lastName,
            email: backendUser.email,
            profilePicture: backendUser.profilePicture
          };
          setUser(updatedUser);
          
          // Update localStorage with new user data including profile picture
          const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const newUserData = { ...currentUserData, ...updatedUser };
          localStorage.setItem('currentUser', JSON.stringify(newUserData));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Continue with the initial user data if fetch fails
      }
    };

    if (initialUser) {
      fetchUserProfile();
    }
  }, [initialUser]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative p-1 rounded-full hover:bg-transparent"
        >
          <UserAvatar user={user} size="sm" />
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
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
