
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Award, Star, Users, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color = "text-teal-600 dark:text-teal-400" }) => (
  <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
    <div className={cn("p-2 rounded-full bg-gray-100 dark:bg-gray-700 mb-2", color)}>
      {icon}
    </div>
    <p className="text-xl font-semibold">{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

interface PlayerBadgeProps {
  name: string;
  icon: React.ReactNode;
  description: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  earned: boolean;
}

const badgeColors = {
  bronze: "bg-amber-200 text-amber-800",
  silver: "bg-gray-300 text-gray-800",
  gold: "bg-yellow-300 text-yellow-800",
  platinum: "bg-blue-200 text-blue-800"
};

const PlayerBadge: React.FC<PlayerBadgeProps> = ({ name, icon, description, level, earned }) => (
  <div className={cn(
    "relative p-3 rounded-lg flex items-center space-x-3 border",
    earned 
      ? `border-${level === 'bronze' ? 'amber' : level === 'silver' ? 'gray' : level === 'gold' ? 'yellow' : 'blue'}-300 bg-white dark:bg-gray-800` 
      : "border-gray-200 dark:border-gray-700 opacity-50 bg-gray-50 dark:bg-gray-800/50"
  )}>
    <div className={cn(
      "p-2 rounded-full",
      earned ? badgeColors[level] : "bg-gray-200 text-gray-500"
    )}>
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-medium">{name}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    {!earned && (
      <div className="absolute top-1 right-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
        Locked
      </div>
    )}
  </div>
);

interface PlayerStatsProps {
  stats: {
    matches: number;
    wins: number;
    goals: number;
    assists: number;
    cleansheets: number;
    tackles: number;
    mvps: number;
  };
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats }) => {
  const badges = [
    {
      name: "Goal Scorer",
      icon: <Star className="h-4 w-4" />,
      description: "Score 5 or more goals",
      level: "bronze" as const,
      earned: stats.goals >= 5
    },
    {
      name: "Playmaker",
      icon: <Users className="h-4 w-4" />,
      description: "Make 10 or more assists",
      level: "silver" as const,
      earned: stats.assists >= 10
    },
    {
      name: "MVP",
      icon: <Award className="h-4 w-4" />,
      description: "Earn 3 MVP awards",
      level: "gold" as const,
      earned: stats.mvps >= 3
    },
    {
      name: "Champion",
      icon: <Trophy className="h-4 w-4" />,
      description: "Win 15 or more matches",
      level: "platinum" as const,
      earned: stats.wins >= 15
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-teal-700 dark:text-teal-400">Player Statistics</CardTitle>
          <CardDescription>Your performance in all games</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <StatItem 
              icon={<Users className="h-4 w-4" />} 
              label="Matches" 
              value={stats.matches} 
            />
            <StatItem 
              icon={<Trophy className="h-4 w-4" />} 
              label="Wins" 
              value={stats.wins} 
              color="text-green-600 dark:text-green-400" 
            />
            <StatItem 
              icon={<Star className="h-4 w-4" />} 
              label="Goals" 
              value={stats.goals} 
              color="text-blue-600 dark:text-blue-400"
            />
            <StatItem 
              icon={<User className="h-4 w-4" />} 
              label="Assists" 
              value={stats.assists} 
              color="text-purple-600 dark:text-purple-400"
            />
            <StatItem 
              icon={<Award className="h-4 w-4" />} 
              label="MVPs" 
              value={stats.mvps} 
              color="text-yellow-600 dark:text-yellow-400"
            />
            <StatItem 
              icon={<Trophy className="h-4 w-4" />} 
              label="Clean Sheets" 
              value={stats.cleansheets} 
              color="text-cyan-600 dark:text-cyan-400"
            />
            <StatItem 
              icon={<Users className="h-4 w-4" />} 
              label="Tackles" 
              value={stats.tackles} 
              color="text-orange-600 dark:text-orange-400"
            />
            <StatItem 
              icon={<Award className="h-4 w-4" />} 
              label="Win Rate" 
              value={`${stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0}%`} 
              color="text-indigo-600 dark:text-indigo-400"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-teal-700 dark:text-teal-400">Player Badges</CardTitle>
          <CardDescription>Achievements you've earned or can work towards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
            {badges.map(badge => (
              <PlayerBadge
                key={badge.name}
                name={badge.name}
                icon={badge.icon}
                description={badge.description}
                level={badge.level}
                earned={badge.earned}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerStats;
