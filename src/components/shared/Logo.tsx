import React from "react";

interface LogoProps {
  height?: number;
}

/**
 * Logo component that displays the BOKIT logo
 * @param {number} height - Optional height for the logo
 */
const Logo: React.FC<LogoProps> = ({ height = 100 }) => {
  return (
    <div className="flex items-center">
      <img
        src="/BOKIT-uploads/Logo.png"
        alt="BOKIT Logo"
        style={{ height: `${height}px` }}
        className="h-16 object-contain"
      />
    </div>
  );
};

export default Logo;
