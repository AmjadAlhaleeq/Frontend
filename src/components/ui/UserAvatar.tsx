
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const UserAvatar = ({ user, size = "md", className }: UserAvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const getInitials = () => {
    const first = user.firstName?.[0]?.toUpperCase() || '';
    const last = user.lastName?.[0]?.toUpperCase() || '';
    return first + last || 'U';
  };

  return (
    <Avatar className={cn(
      sizeClasses[size],
      "ring-2 ring-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
      className
    )}>
      {user.profilePicture && (
        <AvatarImage 
          src={user.profilePicture} 
          alt={`${user.firstName} ${user.lastName}`}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-gradient-to-br from-purple-400 via-blue-500 to-teal-400 text-white font-semibold">
        {getInitials() || <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
