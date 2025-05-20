
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Star, Zap, Shield } from "lucide-react";
import { UserStats } from '@/context/ReservationContext';

interface PlayerBadgesProps {
  userId: string;
  userStats?: UserStats;
}

const PlayerBadges = ({ userId, userStats }: PlayerBadgesProps) => {
  // If userStats is not provided, we could fetch it here from context if needed
  const stats = userStats || { 
    gamesPlayed: 0, 
    goals: 0, 
    assists: 0, 
    cleansheets: 0, 
    mvps: 0 
  };
  
  // Define badge thresholds
  const badgeThresholds = {
    games: [5, 10, 25, 50, 100],
    goals: [1, 5, 10, 25, 50],
    assists: [1, 5, 10, 25, 50],
    mvps: [1, 3, 5, 10, 15],
    cleansheets: [1, 3, 5, 10, 15]
  };

  // Generate badges based on stats
  const getBadgeLevel = (stat: number, thresholds: number[]): number => {
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (stat >= thresholds[i]) return i + 1;
    }
    return 0;
  };

  const getProgressToNextLevel = (stat: number, thresholds: number[]): number => {
    for (let i = 0; i < thresholds.length; i++) {
      if (stat < thresholds[i]) {
        const prevThreshold = i > 0 ? thresholds[i - 1] : 0;
        return Math.min(100, Math.floor(((stat - prevThreshold) / (thresholds[i] - prevThreshold)) * 100));
      }
    }
    return 100;
  };

  // Badge categories
  const badgeCategories = [
    {
      title: "Games Played",
      icon: <Trophy className="h-5 w-5" />,
      level: getBadgeLevel(stats.gamesPlayed, badgeThresholds.games),
      progress: getProgressToNextLevel(stats.gamesPlayed, badgeThresholds.games),
      current: stats.gamesPlayed,
      next: badgeThresholds.games.find(t => t > stats.gamesPlayed) || "Max"
    },
    {
      title: "Goal Scorer",
      icon: <Star className="h-5 w-5" />,
      level: getBadgeLevel(stats.goals, badgeThresholds.goals),
      progress: getProgressToNextLevel(stats.goals, badgeThresholds.goals),
      current: stats.goals,
      next: badgeThresholds.goals.find(t => t > stats.goals) || "Max"
    },
    {
      title: "Playmaker",
      icon: <Zap className="h-5 w-5" />,
      level: getBadgeLevel(stats.assists, badgeThresholds.assists),
      progress: getProgressToNextLevel(stats.assists, badgeThresholds.assists),
      current: stats.assists,
      next: badgeThresholds.assists.find(t => t > stats.assists) || "Max"
    },
    {
      title: "MVP",
      icon: <Award className="h-5 w-5" />,
      level: getBadgeLevel(stats.mvps, badgeThresholds.mvps),
      progress: getProgressToNextLevel(stats.mvps, badgeThresholds.mvps),
      current: stats.mvps,
      next: badgeThresholds.mvps.find(t => t > stats.mvps) || "Max"
    },
    {
      title: "Goalkeeper",
      icon: <Shield className="h-5 w-5" />,
      level: getBadgeLevel(stats.cleansheets, badgeThresholds.cleansheets),
      progress: getProgressToNextLevel(stats.cleansheets, badgeThresholds.cleansheets),
      current: stats.cleansheets,
      next: badgeThresholds.cleansheets.find(t => t > stats.cleansheets) || "Max"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Player Achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {badgeCategories.map((badge) => (
            <div 
              key={badge.title} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4">
                <div className={`p-2 rounded-full ${badge.level > 0 ? "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{badge.title}</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Level {badge.level > 0 ? badge.level : "Locked"}
                    </span>
                    <span className="text-gray-500">
                      {badge.current} / {badge.next}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-teal-500 dark:bg-teal-400 h-2 rounded-full" 
                      style={{ width: `${badge.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerBadges;
