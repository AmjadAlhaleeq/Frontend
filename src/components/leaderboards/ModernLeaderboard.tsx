
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Search, Filter, Crown, Medal, Star } from "lucide-react";
import LeaderboardSkeleton from "@/components/ui/leaderboard-skeleton";

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
    mvpScore?: number;
    interceptions?: number;
  };
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
  const [sortBy, setSortBy] = useState<keyof Player['stats']>('wins');
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>(players);

  // Mock data for demo (replace with API call)
  const mockPlayers: Player[] = [
    {
      _id: "1",
      name: "Rolando Daugherty",
      email: "rolando@example.com",
      avatar: "",
      stats: {
        gamesPlayed: 30,
        wins: 9,
        losses: 4,
        draws: 2,
        goals: 32,
        assists: 12,
        cleanSheets: 8,
        rating: 9.2,
        winRate: 75,
        mvpScore: 95.2,
        interceptions: 45
      }
    },
    {
      _id: "2", 
      name: "Brenda Franey",
      email: "brenda@example.com",
      stats: {
        gamesPlayed: 39,
        wins: 8,
        losses: 5,
        draws: 1,
        goals: 28,
        assists: 15,
        cleanSheets: 6,
        rating: 8.9,
        winRate: 72.7,
        mvpScore: 89.7,
        interceptions: 38
      }
    },
    {
      _id: "3",
      name: "Rolando Kilback", 
      email: "kilback@example.com",
      stats: {
        gamesPlayed: 19,
        wins: 8,
        losses: 4,
        draws: 2,
        goals: 24,
        assists: 18,
        cleanSheets: 10,
        rating: 8.7,
        winRate: 70,
        mvpScore: 87.3,
        interceptions: 52
      }
    },
    {
      _id: "4",
      name: "Esther Pacocha", 
      email: "esther@example.com",
      stats: {
        gamesPlayed: 38,
        wins: 7,
        losses: 6,
        draws: 3,
        goals: 20,
        assists: 14,
        cleanSheets: 5,
        rating: 8.5,
        winRate: 65,
        mvpScore: 85.1,
        interceptions: 42
      }
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
        const aValue = a.stats[sortBy] || 0;
        const bValue = b.stats[sortBy] || 0;
        return bValue - aValue;
      })
      .slice(0, 50);
    
    setFilteredPlayers(filtered);
  }, [players, searchTerm, sortBy]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-amber-600" />;
    return (
      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
        <span className="text-sm font-bold text-blue-600">{rank}</span>
      </div>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const sortOptions = [
    { key: 'wins', label: 'Wins' },
    { key: 'goals', label: 'Goals' },
    { key: 'assists', label: 'Assists' },
    { key: 'cleanSheets', label: 'Clean Sheets' },
    { key: 'rating', label: 'MVP Score' },
    { key: 'interceptions', label: 'Tackles' },
  ];

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Current Season Top 10</h1>
        <p className="text-gray-600">Track top performers across seasons</p>
      </div>

      {/* Stats Tabs */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {sortOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key as keyof Player['stats'])}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Player List */}
      <div className="space-y-3">
        {filteredPlayers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredPlayers.map((player, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;
            
            return (
              <Card 
                key={player._id}
                className={`transition-all duration-200 hover:shadow-md ${
                  isTopThree ? 'border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-transparent' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {getRankIcon(rank)}
                    </div>
                    
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback className="bg-blue-600 text-white font-semibold">
                        {getInitials(player.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{player.name}</h3>
                      <p className="text-sm text-gray-600">Matches played: {player.stats.gamesPlayed}</p>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-blue-600 flex items-center space-x-1">
                        <Trophy className="h-5 w-5" />
                        <span>{player.stats[sortBy] || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ModernLeaderboard;
