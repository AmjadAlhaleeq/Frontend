
import React from 'react';

interface LogoProps {
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ height = 32 }) => {
  return (
    <div className="flex items-center">
      <span className="text-[#0F766E] dark:text-[#34d399] font-bold text-xl">
        BOK<span className="text-gray-800 dark:text-white">IT</span>
      </span>
      <span className="ml-1 bg-[#0F766E] text-white text-xs px-1.5 py-0.5 rounded-md">
        PLAY
      </span>
    </div>
  );
};

export default Logo;
