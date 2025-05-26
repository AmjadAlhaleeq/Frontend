
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStats } from "@/types/reservation";
import {
  Calendar,
  Target,
  Zap,
  ShieldCheck,
  Trophy,
  Star,
  Users
} from "lucide-react";

interface PlayerStatsProps {
  stats: UserStats & { interceptions?: number };
  className?: string;
}

const StatItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) => (
  <div className="flex flex-col items-center flex-1 justify-center">
    <Icon className="h-7 w-7 text-teal-500 mb-1" />
    <div className="text-lg font-bold">{value ?? 0}</div>
    <div className="text-xs text-muted-foreground text-center">{label}</div>
  </div>
);

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Player Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row flex-wrap gap-2 justify-between">
          <StatItem icon={Calendar} label="Games Played" value={stats.gamesPlayed} />
          <StatItem icon={Target} label="Goals Scored" value={stats.goalsScored} />
          <StatItem icon={Users} label="Assists" value={stats.assists} />
          <StatItem icon={Zap} label="Interceptions" value={stats.interceptions ?? 0} />
          <StatItem icon={ShieldCheck} label="Clean Sheets" value={stats.cleansheets} />
          <StatItem icon={Trophy} label="MVP Awards" value={stats.mvps} />
          <StatItem icon={Star} label="Wins" value={stats.wins} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStats;
