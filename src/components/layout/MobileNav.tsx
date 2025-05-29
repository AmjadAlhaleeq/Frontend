
import React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  userRole: string | null;
}

const MobileNav = ({ isOpen, onOpenChange, isAuthenticated, userRole }: MobileNavProps) => {
  const closeMobileMenu = () => onOpenChange(false);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
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
            onClick={closeMobileMenu}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          <NavLink
            to="/"
            className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
            onClick={closeMobileMenu}
          >
            Home
          </NavLink>
          <NavLink
            to="/pitches"
            className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
            onClick={closeMobileMenu}
          >
            Pitches
          </NavLink>
          <NavLink
            to="/reservations"
            className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
            onClick={closeMobileMenu}
          >
            Reservations
          </NavLink>
          <NavLink
            to="/leaderboards"
            className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
            onClick={closeMobileMenu}
          >
            Leaderboards
          </NavLink>
          {isAuthenticated && userRole !== "admin" && (
            <>
              <NavLink
                to="/profile"
                className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
                onClick={closeMobileMenu}
              >
                Profile
              </NavLink>
              <NavLink
                to="/my-bookings"
                className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
                onClick={closeMobileMenu}
              >
                My Bookings
              </NavLink>
            </>
          )}
          {userRole === "admin" && (
            <NavLink
              to="/admin/add-pitch"
              className="flex items-center px-4 py-2 hover:bg-accent rounded-md"
              onClick={closeMobileMenu}
            >
              Add Pitch
            </NavLink>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
