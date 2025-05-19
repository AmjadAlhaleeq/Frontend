
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStats } from "@/context/ReservationContext";
import {
  Award,
  Flag,
  SoccerBall,
  Footprints,
  Goal,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Trophy,
  User,
  Zap,
} from "lucide-react";

interface PlayerStatsProps {
  stats: UserStats;
  className?: string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Player Statistics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4">
          <User className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium leading-none">Games Played</p>
            <p className="text-lg font-bold">{stats.gamesPlayed}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <SoccerBall className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium leading-none">Goals Scored</p>
            <p className="text-lg font-bold">{stats.goalsScored}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Zap className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium leading-none">Assists</p>
            <p className="text-lg font-bold">{stats.assists}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ShieldCheck className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium leading-none">Clean Sheets</p>
            <p className="text-lg font-bold">{stats.cleansheets}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ShieldAlert className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium leading-none">Yellow Cards</p>
            <p className="text-lg font-bold">{stats.yellowCards}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Swords className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium leading-none">Red Cards</p>
            <p className="text-lg font-bold">{stats.redCards}</p>
          </div>
        </div>
         <div className="flex items-center space-x-4">
          <Trophy className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium leading-none">MVP Awards</p>
            <p className="text-lg font-bold">{stats.mvps}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStats;
