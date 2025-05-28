import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Medal,
  Award,
  Target,
  Users,
  Crown,
  Gamepad2,
  Shield,
  Zap,
} from "lucide-react";
import { LeaderboardPlayer, LeaderboardType } from "@/lib/leaderboardApi";
import LeaderboardSkeleton from "@/components/ui/leaderboard-skeleton";
import PlayerProfileDialog from "@/components/ui/PlayerProfileDialog";

interface ModernLeaderboardProps {
  players: LeaderboardPlayer[];
  loading: boolean;
  onRefresh?: () => void;
  onUpdateSort?: (type: LeaderboardType) => void;
  currentType: LeaderboardType;
  typeConfig?: {
    key: LeaderboardType;
    label: string;
    icon: any;
    color: string;
    description: string;
  };
  onPlayerClick?: (playerId: string) => void;
}

const ModernLeaderboard: React.FC<ModernLeaderboardProps> = ({
  players = [],
  loading = false,
  currentType = "goals",
  typeConfig = {},
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const handlePlayerClick = (playerId: string) => {
    console.log("ModernLeaderboard - Opening profile for player:", playerId);
    
    // Log current user info for debugging
    const userRole = localStorage.getItem('userRole');
    const currentUser = localStorage.getItem('currentUser');
    console.log("ModernLeaderboard - Current user role:", userRole);
    console.log("ModernLeaderboard - Current user data:", currentUser);
    
    setSelectedPlayerId(playerId);
    setIsProfileDialogOpen(true);
  };

  const handleCloseProfileDialog = () => {
    setIsProfileDialogOpen(false);
    setSelectedPlayerId(null);
  };

  // Get rank icon based on position
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Trophy className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
              {rank}
            </span>
          </div>
        );
    }
  };

  // Get stat icon based on type
  const getStatIcon = (type: LeaderboardType) => {
    switch (type) {
      case "goals":
        return <Target className="h-5 w-5" />;
      case "assists":
        return <Users className="h-5 w-5" />;
      case "wins":
        return <Trophy className="h-5 w-5" />;
      case "mvp":
        return <Award className="h-5 w-5" />;
      case "interceptions":
        return <Zap className="h-5 w-5" />;
      case "cleanSheets":
        return <Shield className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  // Format stat value and description based on type
  const formatStatValue = (
    player: LeaderboardPlayer,
    type: LeaderboardType
  ) => {
    const { statValue, matches } = player;

    switch (type) {
      case "goals":
        return {
          main: statValue,
          sub:
            matches > 0
              ? `${(statValue / matches).toFixed(1)} per game`
              : "0.0 per game",
        };
      case "assists":
        return {
          main: statValue,
          sub:
            matches > 0
              ? `${(statValue / matches).toFixed(1)} per game`
              : "0.0 per game",
        };
      case "wins":
        return {
          main: statValue,
          sub:
            matches > 0
              ? `${((statValue / matches) * 100).toFixed(1)}% win rate`
              : "0% win rate",
        };
      case "mvp":
        return {
          main: statValue,
          sub:
            matches > 0
              ? `${(statValue / matches).toFixed(1)} per game`
              : "0.0 per game",
        };
      case "interceptions":
        return {
          main: statValue,
          sub:
            matches > 0
              ? `${(statValue / matches).toFixed(1)} per game`
              : "0.0 per game",
        };
      case "cleanSheets":
        return {
          main: statValue,
          sub:
            matches > 0
              ? `${((statValue / matches) * 100).toFixed(1)}% clean sheet rate`
              : "0% clean sheet rate",
        };
      default:
        return {
          main: statValue,
          sub: `${matches} matches`,
        };
    }
  };

  // Get player initials for avatar fallback
  const getPlayerInitials = (player: LeaderboardPlayer) => {
    const first = player.firstName || "";
    const last = player.lastName || "";
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "U";
  };

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  if (!players || players.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Trophy className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No players found for the {currentType.replace("_", " ")}{" "}
            leaderboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {players.map((player, index) => {
          const stats = formatStatValue(player, currentType);
          const isTopThree = player.rank <= 3;

          // Define card styling based on rank
          const getCardStyling = (rank: number) => {
            switch (rank) {
              case 1:
                return "border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/20 dark:border-yellow-500";
              case 2:
                return "border-2 border-gray-400 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800/20 dark:border-gray-400";
              case 3:
                return "border-2 border-amber-600 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/20 dark:border-amber-600";
              default:
                return "";
            }
          };

          return (
            <Card
              key={player.userId}
              className={`transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02] ${getCardStyling(
                player.rank
              )}`}
              onClick={() => handlePlayerClick(player.userId)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex-shrink-0">{getRankIcon(player.rank)}</div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={player.profilePicture || player.avatar}
                      alt={player.name}
                    />
                    <AvatarFallback className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 font-semibold">
                      {getPlayerInitials(player)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {player.name || "Unknown Player"}
                      </h3>
                      {isTopThree && (
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            player.rank === 1
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : player.rank === 2
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          }`}
                        >
                          #{player.rank}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stats.sub}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Gamepad2 className="h-3 w-3" />
                        {player.matches} games
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                      {getStatIcon(currentType)}
                      <span>{stats.main}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {currentType.replace("_", " ")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Player Profile Dialog - Updated to ensure proper admin access */}
      {selectedPlayerId && (
        <PlayerProfileDialog
          isOpen={isProfileDialogOpen}
          onClose={handleCloseProfileDialog}
          playerId={selectedPlayerId}
        />
      )}
    </>
  );
};

export default ModernLeaderboard;
