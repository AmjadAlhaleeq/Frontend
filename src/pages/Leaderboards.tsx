
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Target, 
  Users, 
  Shield, 
  Zap,
  Search,
  Filter,
  Medal,
  Crown,
  Star,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Player {
  id: string;
  name: string;
  avatar?: string;
  gamesPlayed: number;
  wins: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  interceptions: number;
  mvpScore: number;
  previousRank?: number;
  rankChange?: 'up' | 'down' | 'same';
}

const mockPlayers: Player[] = [
  { 
    id: "1", 
    name: "Alex Johnson", 
    gamesPlayed: 24, 
    wins: 18, 
    goals: 32, 
    assists: 12, 
    cleanSheets: 8, 
    interceptions: 45,
    mvpScore: 95.2,
    previousRank: 2,
    rankChange: 'up'
  },
  { 
    id: "2", 
    name: "Maria Santos", 
    gamesPlayed: 22, 
    wins: 16, 
    goals: 28, 
    assists: 15, 
    cleanSheets: 6, 
    interceptions: 38,
    mvpScore: 89.7,
    previousRank: 1,
    rankChange: 'down'
  },
  { 
    id: "3", 
    name: "David Chen", 
    gamesPlayed: 20, 
    wins: 14, 
    goals: 24, 
    assists: 18, 
    cleanSheets: 10, 
    interceptions: 52,
    mvpScore: 87.3,
    previousRank: 3,
    rankChange: 'same'
  },
  { 
    id: "4", 
    name: "Sarah Williams", 
    gamesPlayed: 25, 
    wins: 15, 
    goals: 20, 
    assists: 22, 
    cleanSheets: 5, 
    interceptions: 41,
    mvpScore: 85.1,
    previousRank: 5,
    rankChange: 'up'
  },
  { 
    id: "5", 
    name: "Mike Rodriguez", 
    gamesPlayed: 18, 
    wins: 12, 
    goals: 35, 
    assists: 8, 
    cleanSheets: 3, 
    interceptions: 29,
    mvpScore: 83.8,
    previousRank: 4,
    rankChange: 'down'
  }
];

const Leaderboards = () => {
  const [sortBy, setSortBy] = useState<keyof Player>('mvpScore');
  const [searchTerm, setSearchTerm] = useState("");
  
  const sortedPlayers = [...mockPlayers]
    .filter(player => 
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy] as number;
      const bValue = b[sortBy] as number;
      return bValue - aValue;
    });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-amber-600" />;
    return <span className="text-xl font-bold text-gray-500">#{rank}</span>;
  };

  const getRankChangeIcon = (change?: string) => {
    switch (change) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const sortOptions = [
    { key: 'mvpScore', label: 'MVP Score', icon: Star },
    { key: 'wins', label: 'Wins', icon: Trophy },
    { key: 'goals', label: 'Goals', icon: Target },
    { key: 'assists', label: 'Assists', icon: Users },
    { key: 'cleanSheets', label: 'Clean Sheets', icon: Shield },
    { key: 'interceptions', label: 'Interceptions', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Player Leaderboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Track performance and dominate the competition
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as keyof Player)}>
                  <SelectTrigger className="w-48 border-0 bg-gray-50 focus:bg-white">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(({ key, label, icon: Icon }) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2" />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <div className="space-y-4">
          {sortedPlayers.map((player, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;
            
            return (
              <Card 
                key={player.id}
                className={`
                  transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0
                  ${isTopThree 
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 shadow-lg border-l-4 border-l-yellow-400' 
                    : 'bg-white/80 backdrop-blur-sm shadow-md'
                  }
                `}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Left Section */}
                    <div className="flex items-center space-x-6">
                      {/* Rank & Change */}
                      <div className="flex flex-col items-center">
                        {getRankIcon(rank)}
                        <div className="flex items-center mt-1">
                          {getRankChangeIcon(player.rankChange)}
                        </div>
                      </div>

                      {/* Avatar & Info */}
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                          <AvatarImage src={player.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                            {getInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{player.name}</h3>
                          <p className="text-gray-600">{player.gamesPlayed} games played</p>
                          {isTopThree && (
                            <Badge className="mt-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
                              Top Performer
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-6 text-center">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-2xl font-bold text-purple-600">{player.mvpScore}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">MVP</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-2xl font-bold text-green-600">{player.wins}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Wins</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Target className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-2xl font-bold text-red-600">{player.goals}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Goals</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-2xl font-bold text-blue-600">{player.assists}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Assists</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Shield className="h-4 w-4 text-cyan-500 mr-1" />
                          <span className="text-2xl font-bold text-cyan-600">{player.cleanSheets}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Clean Sheets</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Zap className="h-4 w-4 text-orange-500 mr-1" />
                          <span className="text-2xl font-bold text-orange-600">{player.interceptions}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Interceptions</p>
                      </div>
                    </div>

                    {/* Mobile Stats */}
                    <div className="md:hidden grid grid-cols-2 gap-3 text-center">
                      <div>
                        <span className="text-lg font-bold text-purple-600">{player.mvpScore}</span>
                        <p className="text-xs text-gray-500">MVP</p>
                      </div>
                      <div>
                        <span className="text-lg font-bold text-green-600">{player.wins}</span>
                        <p className="text-xs text-gray-500">Wins</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {sortedPlayers.length === 0 && (
          <Card className="text-center py-12 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboards;
