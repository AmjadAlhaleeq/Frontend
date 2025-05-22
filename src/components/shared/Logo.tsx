
import React from 'react';

interface LogoProps {
  height?: number;
}

/**
 * Logo component that displays the BOKIT logo
 * @param {number} height - Optional height for the logo
 */
const Logo: React.FC<LogoProps> = ({ height = 48 }) => {
  // Use provided logo image with increased default height from 32 to 48
  return (
    <div className="flex items-center">
      <img 
        src="/lovable-uploads/66037887-c922-44d5-a33c-2c43bf8b3d23.png" 
        alt="BOKIT Logo" 
        style={{ height: `${height}px` }}
        className="h-12 object-contain" // Increased from h-8 to h-12
      />
    </div>
  );
};

export default Logo;
