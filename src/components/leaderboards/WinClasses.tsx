
import React from "react";
import { Trophy, Medal, Award, Users, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface WinClassProps {
  playerName: string;
  gamesPlayed: number;
  wins: number;
  winClass: string;
  position: number;
}

/**
 * Win Classes component for Leaderboards
 * Shows different player achievement levels based on number of wins
 */
const WinClasses: React.FC = () => {
  // Sample win classes data (in a real app, this would come from an API or context)
  const winClasses: WinClassProps[] = [
    {
      playerName: "Alex Johnson",
      gamesPlayed: 45,
      wins: 31,
      winClass: "Master",
      position: 1
    },
    {
      playerName: "Sam Wilson",
      gamesPlayed: 38,
      wins: 24,
      winClass: "Expert",
      position: 2
    },
    {
      playerName: "Jordan Lee",
      gamesPlayed: 42,
      wins: 24,
      winClass: "Expert",
      position: 3
    },
    {
      playerName: "Taylor Smith",
      gamesPlayed: 32,
      wins: 17,
      winClass: "Professional",
      position: 4
    },
    {
      playerName: "Casey Brown",
      gamesPlayed: 39,
      wins: 20,
      winClass: "Professional",
      position: 5
    }
  ];

  /**
   * Get appropriate icon based on win class
   * @param winClass - The win class string
   * @returns JSX icon element
   */
  const getWinClassIcon = (winClass: string): JSX.Element => {
    switch (winClass.toLowerCase()) {
      case "master":
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case "expert":
        return <Medal className="h-5 w-5 text-blue-500" />;
      case "professional":
        return <Award className="h-5 w-5 text-green-500" />;
      case "amateur":
        return <Users className="h-5 w-5 text-gray-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-purple-500" />;
    }
  };

  /**
   * Get color scheme based on win class
   * @param winClass - The win class string
   * @returns Object containing color classes
   */
  const getWinClassColors = (winClass: string): { bg: string; text: string; progress: string } => {
    switch (winClass.toLowerCase()) {
      case "master":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/20",
          text: "text-yellow-800 dark:text-yellow-400",
          progress: "bg-yellow-500"
        };
      case "expert":
        return {
          bg: "bg-blue-100 dark:bg-blue-900/20",
          text: "text-blue-800 dark:text-blue-400",
          progress: "bg-blue-500"
        };
      case "professional":
        return {
          bg: "bg-green-100 dark:bg-green-900/20",
          text: "text-green-800 dark:text-green-400",
          progress: "bg-green-500"
        };
      case "amateur":
        return {
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-800 dark:text-gray-400",
          progress: "bg-gray-500"
        };
      default:
        return {
          bg: "bg-purple-100 dark:bg-purple-900/20",
          text: "text-purple-800 dark:text-purple-400",
          progress: "bg-purple-500"
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
          Win Classes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {winClasses.map((player) => {
            const colors = getWinClassColors(player.winClass);
            return (
              <div key={player.playerName} className="relative">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div className="font-semibold w-6 text-center text-gray-800 dark:text-gray-200">
                      {player.position}
                    </div>
                    <div className="ml-2">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {player.playerName}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center mt-0.5">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{player.gamesPlayed} games</span>
                        <span className="mx-1">•</span>
                        <span>{player.wins} wins</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`flex items-center ${colors.bg} ${colors.text} border-0`}>
                    {getWinClassIcon(player.winClass)}
                    <span className="ml-1">{player.winClass}</span>
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress
                    value={player.wins}
                    max={player.gamesPlayed > 0 ? player.gamesPlayed : 1}
                    className={`h-2 w-full ${colors.progress}`}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[40px] text-right">
                    {player.wins} W
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WinClasses;
