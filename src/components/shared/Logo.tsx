
import React from 'react';

interface LogoProps {
  height?: number;
}

/**
 * Logo component that displays the BOKIT logo
 * @param {number} height - Optional height for the logo
 */
const Logo: React.FC<LogoProps> = ({ height = 64 }) => {  // Increased default height from 48 to 64
  return (
    <div className="flex items-center">
      <img 
        src="/lovable-uploads/66037887-c922-44d5-a33c-2c43bf8b3d23.png" 
        alt="BOKIT Logo" 
        style={{ height: `${height}px` }}
        className="h-16 object-contain" // Increased from h-12 to h-16
      />
    </div>
  );
};

export default Logo;
