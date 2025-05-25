
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Target, 
  Users, 
  TrendingUp, 
  Medal, 
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Player {
  _id: string;
  name: string;
  avatar?: string;
  email: string;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    rating: number;
    winRate: number;
  };
  previousRank?: number;
  rankChange?: 'up' | 'down' | 'same';
}

interface LeaderboardProps {
  players?: Player[];
  loading?: boolean;
  onRefresh?: () => void;
  apiEndpoint?: string;
}

const ModernLeaderboard: React.FC<LeaderboardProps> = ({
  players = [],
  loading = false,
  onRefresh,
  apiEndpoint
}) => {
  const [sortBy, setSortBy] = useState<keyof Player['stats']>('rating');
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>(players);

  // Mock data for demo (replace with API call)
  const mockPlayers: Player[] = [
    {
      _id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "",
      stats: {
        gamesPlayed: 24,
        wins: 18,
        losses: 4,
        draws: 2,
        goals: 32,
        assists: 12,
        cleanSheets: 8,
        rating: 9.2,
        winRate: 75
      },
      previousRank: 2,
      rankChange: 'up'
    },
    {
      _id: "2", 
      name: "Maria Santos",
      email: "maria@example.com",
      stats: {
        gamesPlayed: 22,
        wins: 16,
        losses: 5,
        draws: 1,
        goals: 28,
        assists: 15,
        cleanSheets: 6,
        rating: 8.9,
        winRate: 72.7
      },
      previousRank: 1,
      rankChange: 'down'
    },
    {
      _id: "3",
      name: "David Chen", 
      email: "david@example.com",
      stats: {
        gamesPlayed: 20,
        wins: 14,
        losses: 4,
        draws: 2,
        goals: 24,
        assists: 18,
        cleanSheets: 10,
        rating: 8.7,
        winRate: 70
      },
      previousRank: 3,
      rankChange: 'same'
    }
  ];

  useEffect(() => {
    const data = players.length > 0 ? players : mockPlayers;
    
    const filtered = data
      .filter(player => 
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = a.stats[sortBy];
        const bValue = b.stats[sortBy];
        return bValue - aValue;
      });
    
    setFilteredPlayers(filtered);
  }, [players, searchTerm, sortBy]);

  const getRankBadge = (rank: number) => {
    const badges = {
      1: { icon: "🏆", color: "bg-yellow-500 text-white", label: "Champion" },
      2: { icon: "🥈", color: "bg-gray-400 text-white", label: "Runner-up" },
      3: { icon: "🥉", color: "bg-amber-600 text-white", label: "Third" }
    };
    
    const badge = badges[rank as keyof typeof badges];
    if (badge) {
      return (
        <Badge className={`${badge.color} hover:${badge.color}/80`}>
          {badge.icon} {badge.label}
        </Badge>
      );
    }
    return <Badge variant="outline" className="font-medium">#{rank}</Badge>;
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
    { key: 'rating', label: 'Overall Rating', icon: Star },
    { key: 'goals', label: 'Goals Scored', icon: Target },
    { key: 'wins', label: 'Games Won', icon: Trophy },
    { key: 'winRate', label: 'Win Rate', icon: TrendingUp },
    { key: 'assists', label: 'Assists', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Medal className="h-6 w-6 text-teal-600" />
              <span>Player Leaderboard</span>
            </div>
            {onRefresh && (
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as keyof Player['stats'])}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
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
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading leaderboard...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredPlayers.map((player, index) => (
            <Card 
              key={player._id}
              className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-l-4"
              style={{
                borderLeftColor: index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : '#e5e7eb'
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-500 w-8">
                        #{index + 1}
                      </span>
                      {getRankChangeIcon(player.rankChange)}
                    </div>
                    
                    <Avatar className="h-14 w-14 border-2 border-gray-200">
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback className="bg-teal-600 text-white font-semibold text-lg">
                        {getInitials(player.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{player.name}</h3>
                      <p className="text-sm text-gray-600">{player.email}</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{player.stats.rating.toFixed(1)}/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-2xl font-bold text-teal-600">{player.stats.goals}</p>
                        <p className="text-xs text-gray-500">Goals</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{player.stats.assists}</p>
                        <p className="text-xs text-gray-500">Assists</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{player.stats.winRate}%</p>
                        <p className="text-xs text-gray-500">Win Rate</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {getRankBadge(index + 1)}
                      <p className="text-xs text-gray-500 mt-1">
                        {player.stats.gamesPlayed} games played
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ModernLeaderboard;
