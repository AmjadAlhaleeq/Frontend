
import React from "react";
import { 
  Trophy, 
  Target, 
  Users, 
  Shield, 
  Zap,
  Medal,
  TrendingUp
} from "lucide-react";

interface PlayerStatsProps {
  stats: {
    matches: number;
    wins: number;
    mvp: number;
    goals: number;
    assists: number;
    interceptions: number;
    cleanSheets: number;
  };
  isLoading?: boolean;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const winPercentage = stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;

  const statItems = [
    {
      label: "Matches",
      value: stats.matches,
      icon: Users,
      color: "bg-blue-500",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200"
    },
    {
      label: "Wins", 
      value: stats.wins,
      icon: Trophy,
      color: "bg-yellow-500",
      bgColor: "from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-200"
    },
    {
      label: "Win Rate",
      value: `${winPercentage}%`,
      icon: TrendingUp,
      color: "bg-green-500",
      bgColor: "from-green-50 to-green-100", 
      borderColor: "border-green-200"
    },
    {
      label: "Goals",
      value: stats.goals,
      icon: Target,
      color: "bg-red-500",
      bgColor: "from-red-50 to-red-100",
      borderColor: "border-red-200"
    },
    {
      label: "Assists",
      value: stats.assists,
      icon: Zap,
      color: "bg-purple-500",
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200"
    },
    {
      label: "MVP Awards",
      value: stats.mvp,
      icon: Medal,
      color: "bg-amber-500",
      bgColor: "from-amber-50 to-amber-100",
      borderColor: "border-amber-200"
    },
    {
      label: "Clean Sheets",
      value: stats.cleanSheets,
      icon: Shield,
      color: "bg-teal-500",
      bgColor: "from-teal-50 to-teal-100",
      borderColor: "border-teal-200"
    },
    {
      label: "Interceptions",
      value: stats.interceptions,
      icon: Zap,
      color: "bg-indigo-500",
      bgColor: "from-indigo-50 to-indigo-100",
      borderColor: "border-indigo-200"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div
            key={index}
            className={`group p-4 bg-gradient-to-br ${stat.bgColor} rounded-xl border ${stat.borderColor} hover:scale-105 transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-12 h-12 ${stat.color} rounded-full flex items-center justify-center shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-gray-600 truncate">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerStats;
