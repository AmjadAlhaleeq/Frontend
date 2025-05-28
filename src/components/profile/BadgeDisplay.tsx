
import React from "react";
import { 
  Target, 
  Users, 
  Trophy, 
  Award, 
  Star, 
  Shield, 
  Zap,
  Crown,
  Medal,
  Flame
} from "lucide-react";

interface Badge {
  _id: string;
  name: string;
  description: string;
  level: number;
}

interface BadgeDisplayProps {
  badges: Badge[];
  isLoading?: boolean;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges, isLoading = false }) => {
  // Get icon and colors based on badge name and level
  const getBadgeConfig = (badgeName: string, level: number) => {
    const badgeType = badgeName.toLowerCase();
    
    // Determine icon based on badge type
    let Icon = Award; // default
    if (badgeType.includes('goal') || badgeType.includes('hunter')) {
      Icon = Target;
    } else if (badgeType.includes('assist') || badgeType.includes('playmaker')) {
      Icon = Users;
    } else if (badgeType.includes('mvp') || badgeType.includes('champion')) {
      Icon = Crown;
    } else if (badgeType.includes('win') || badgeType.includes('victory')) {
      Icon = Trophy;
    } else if (badgeType.includes('clean') || badgeType.includes('defense')) {
      Icon = Shield;
    } else if (badgeType.includes('intercept') || badgeType.includes('tackle')) {
      Icon = Zap;
    } else if (badgeType.includes('streak') || badgeType.includes('fire')) {
      Icon = Flame;
    } else if (badgeType.includes('star') || badgeType.includes('legend')) {
      Icon = Star;
    } else if (badgeType.includes('medal') || badgeType.includes('honor')) {
      Icon = Medal;
    }

    // Colors based on level (1=Bronze, 2=Silver, 3=Gold)
    switch (level) {
      case 1:
        return {
          bg: "from-amber-50 to-orange-50",
          border: "border-amber-300",
          icon: "bg-gradient-to-br from-amber-400 to-amber-600",
          iconColor: "text-white",
          text: "text-amber-800",
          badge: "🥉",
          name: "Bronze",
          Icon
        };
      case 2:
        return {
          bg: "from-gray-50 to-slate-100",
          border: "border-gray-300",
          icon: "bg-gradient-to-br from-gray-400 to-gray-600",
          iconColor: "text-white",
          text: "text-gray-800",
          badge: "🥈",
          name: "Silver",
          Icon
        };
      case 3:
        return {
          bg: "from-yellow-50 to-amber-50",
          border: "border-yellow-300",
          icon: "bg-gradient-to-br from-yellow-400 to-yellow-600",
          iconColor: "text-white",
          text: "text-yellow-800",
          badge: "🥇",
          name: "Gold",
          Icon
        };
      default:
        return {
          bg: "from-amber-50 to-orange-50",
          border: "border-amber-300",
          icon: "bg-gradient-to-br from-amber-400 to-amber-600",
          iconColor: "text-white",
          text: "text-amber-800",
          badge: "🥉",
          name: "Bronze",
          Icon
        };
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-6 bg-gray-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-3"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
            <Award className="h-10 w-10 text-amber-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Badges Yet
        </h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          Earn badges by achieving great performances in matches!
          Your first badge is waiting.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {badges.map((badge) => {
        const config = getBadgeConfig(badge.name, badge.level);
        const Icon = config.Icon;
        
        return (
          <div
            key={badge._id}
            className={`group p-6 bg-gradient-to-br ${config.bg} rounded-2xl border ${config.border} hover:scale-105 transition-all duration-200 cursor-pointer`}
          >
            <div className="flex items-center gap-4">
              <div className={`flex-shrink-0 w-16 h-16 ${config.icon} rounded-full flex items-center justify-center transition-colors shadow-lg`}>
                <Icon className={`h-8 w-8 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate mb-1">
                  {badge.name}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {badge.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{config.badge}</span>
                  <span className={`text-sm font-medium ${config.text}`}>
                    {config.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BadgeDisplay;
