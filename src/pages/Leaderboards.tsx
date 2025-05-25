
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Target, Users, Calendar, Medal, Star, TrendingUp } from "lucide-react";

interface Player {
  id: string;
  name: string;
  avatar?: string;
  gamesPlayed: number;
  wins: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  rating: number;
}

const mockPlayers: Player[] = [
  { id: "1", name: "Alex Johnson", gamesPlayed: 24, wins: 18, goals: 32, assists: 12, cleanSheets: 8, rating: 9.2 },
  { id: "2", name: "Maria Santos", gamesPlayed: 22, wins: 16, goals: 28, assists: 15, cleanSheets: 6, rating: 8.9 },
  { id: "3", name: "David Chen", gamesPlayed: 20, wins: 14, goals: 24, assists: 18, cleanSheets: 10, rating: 8.7 },
  { id: "4", name: "Sarah Williams", gamesPlayed: 25, wins: 15, goals: 20, assists: 22, cleanSheets: 5, rating: 8.5 },
  { id: "5", name: "Mike Rodriguez", gamesPlayed: 18, wins: 12, goals: 35, assists: 8, cleanSheets: 3, rating: 8.3 },
  { id: "6", name: "Emma Thompson", gamesPlayed: 21, wins: 13, goals: 16, assists: 25, cleanSheets: 12, rating: 8.1 },
  { id: "7", name: "James Wilson", gamesPlayed: 19, wins: 11, goals: 22, assists: 14, cleanSheets: 7, rating: 7.9 },
  { id: "8", name: "Lisa Brown", gamesPlayed: 23, wins: 14, goals: 18, assists: 16, cleanSheets: 9, rating: 7.8 },
];

const StatCard = ({ icon: Icon, title, value, subtitle, color = "teal" }: {
  icon: any;
  title: string;
  value: string | number;
  subtitle: string;
  color?: string;
}) => (
  <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
    <CardContent className="p-6">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const PlayerRankCard = ({ player, rank }: { player: Player; rank: number }) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">🥇 Champion</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 hover:bg-gray-500 text-white">🥈 Runner-up</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 hover:bg-amber-700 text-white">🥉 Third</Badge>;
    return <Badge variant="outline" className="font-medium">#{rank}</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={player.avatar} />
              <AvatarFallback className="bg-teal-600 text-white font-semibold">
                {getInitials(player.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{player.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rating: {player.rating}/10</p>
            </div>
          </div>
          {getRankBadge(rank)}
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{player.goals}</p>
            <p className="text-xs text-gray-500">Goals</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{player.assists}</p>
            <p className="text-xs text-gray-500">Assists</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{player.wins}</p>
            <p className="text-xs text-gray-500">Wins</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Leaderboards = () => {
  const [sortBy, setSortBy] = useState<'rating' | 'goals' | 'wins' | 'assists'>('rating');
  
  const sortedPlayers = [...mockPlayers].sort((a, b) => {
    switch (sortBy) {
      case 'goals': return b.goals - a.goals;
      case 'wins': return b.wins - a.wins;
      case 'assists': return b.assists - a.assists;
      default: return b.rating - a.rating;
    }
  });

  const totalGames = mockPlayers.reduce((sum, p) => sum + p.gamesPlayed, 0);
  const totalGoals = mockPlayers.reduce((sum, p) => sum + p.goals, 0);
  const activePlayers = mockPlayers.length;
  const avgRating = (mockPlayers.reduce((sum, p) => sum + p.rating, 0) / mockPlayers.length).toFixed(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Player Leaderboards</h1>
        <p className="text-gray-600 dark:text-gray-400">Track performance and compete with fellow players</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Active Players"
          value={activePlayers}
          subtitle="This season"
          color="teal"
        />
        <StatCard
          icon={Calendar}
          title="Games Played"
          value={totalGames}
          subtitle="Total matches"
          color="blue"
        />
        <StatCard
          icon={Target}
          title="Total Goals"
          value={totalGoals}
          subtitle="Season goals"
          color="green"
        />
        <StatCard
          icon={Star}
          title="Avg Rating"
          value={avgRating}
          subtitle="Player performance"
          color="yellow"
        />
      </div>

      {/* Sort Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Sort Rankings By</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'rating' as const, label: 'Overall Rating', icon: Star },
              { key: 'goals' as const, label: 'Goals Scored', icon: Target },
              { key: 'wins' as const, label: 'Games Won', icon: Trophy },
              { key: 'assists' as const, label: 'Assists', icon: Users },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={sortBy === key ? "default" : "outline"}
                onClick={() => setSortBy(key)}
                className={`${
                  sortBy === key 
                    ? "bg-teal-600 hover:bg-teal-700" 
                    : "hover:bg-teal-50 dark:hover:bg-teal-900/20"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Player Rankings */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Medal className="h-6 w-6 mr-2 text-teal-600" />
          Player Rankings
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedPlayers.map((player, index) => (
            <PlayerRankCard key={player.id} player={player} rank={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
