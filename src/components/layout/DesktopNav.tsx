
import React from "react";
import { NavLink } from "react-router-dom";

const DesktopNav = () => {
  const getNavClassName = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? "font-medium text-teal-600 dark:text-teal-400"
      : "text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400";
  };

  return (
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
  );
};

export default DesktopNav;
