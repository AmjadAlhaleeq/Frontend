
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Goal, Zap, Clock, Award, BadgeCheck } from "lucide-react";

interface Badge {
  id: string;
  icon: React.ReactNode;
  name: string;
  description: string;
  earned: boolean;
  progress?: number;
  color: string;
}

interface PlayerBadgesProps {
  userId: string;
  className?: string;
}

/**
 * PlayerBadges component
 * Displays achievement badges a player has earned or is working towards
 */
const PlayerBadges: React.FC<PlayerBadgesProps> = ({ userId, className }) => {
  // In a real app, these would be fetched from an API based on user achievements
  const badges: Badge[] = [
    {
      id: 'first-game',
      icon: <Clock className="h-6 w-6" />,
      name: 'First Match',
      description: 'Completed your first game',
      earned: true,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'goal-scorer',
      icon: <Goal className="h-6 w-6" />,
      name: 'Goal Scorer',
      description: 'Scored your first goal',
      earned: true,
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'playmaker',
      icon: <Zap className="h-6 w-6" />,
      name: 'Playmaker',
      description: 'Made 5 assists',
      earned: false,
      progress: 60,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'mvp',
      icon: <Trophy className="h-6 w-6" />,
      name: 'MVP',
      description: 'Named MVP in a game',
      earned: false,
      progress: 0,
      color: 'bg-amber-100 text-amber-700'
    },
    {
      id: 'veteran',
      icon: <Award className="h-6 w-6" />,
      name: 'Veteran',
      description: 'Played 10+ games',
      earned: false,
      progress: 30,
      color: 'bg-red-100 text-red-700'
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          <div className="flex items-center">
            <BadgeCheck className="mr-2 h-5 w-5 text-teal-500" />
            Achievements & Badges
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div 
              key={badge.id} 
              className={`p-3 rounded-lg ${badge.earned ? badge.color : 'bg-gray-100 text-gray-500'} relative`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-2 rounded-full mb-2 ${badge.earned ? 'opacity-100' : 'opacity-60'}`}>
                  {badge.icon}
                </div>
                <h3 className="text-sm font-medium">{badge.name}</h3>
                <p className="text-xs mt-1">{badge.description}</p>
                
                {!badge.earned && badge.progress !== undefined && (
                  <div className="w-full mt-2 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-teal-600 h-1.5 rounded-full" 
                      style={{ width: `${badge.progress}%` }}
                    ></div>
                  </div>
                )}
                
                {badge.earned && (
                  <span className="absolute -top-1 -right-1 bg-teal-500 rounded-full p-0.5">
                    <Star className="h-3 w-3 text-white" fill="white" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerBadges;
