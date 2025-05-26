import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Calendar,      // Games Played
  BadgePlus,     // Goals Scored
  Zap,           // Assists
  ShieldCheck,   // Clean Sheets
  Award,         // MVP
  Star,          // Wins
  Check,         // Level up or completed
} from "lucide-react";
import { BackendUserProfile } from "@/hooks/usePlayerProfile";

interface PlayerProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName?: string;
  fetchProfile?: (userId: string) => void;
  profileData?: BackendUserProfile;
  loading?: boolean;
  error?: string | null;
  // fallback stats for static profiles
  playerStats?: {
    gamesPlayed: number;
    goals: number;
    assists: number;
    wins: number;
    interceptions?: number;
    cleansheets?: number;
    mvps?: number;
  };
}

interface PlayerStatsType {
  matches: number;
  gamesPlayed: number;
  goals: number;
  goalsScored: number;
  assists: number;
  wins: number;
  mvp: number;
  mvps: number;
  cleanSheets: number;
  cleansheets: number;
  interceptions: number;
}

const ICON_CLASSES = "h-7 w-7 text-teal-500 mb-1 mx-auto";

const PlayerProfileDialog: React.FC<PlayerProfileDialogProps> = ({
  isOpen,
  onClose,
  playerId,
  playerName,
  fetchProfile,
  profileData,
  loading,
  error,
  playerStats
}) => {
  useEffect(() => {
    if (isOpen && fetchProfile && playerId) {
      fetchProfile(playerId);
    }
  }, [isOpen, fetchProfile, playerId]);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  // Default stats
  const defaultStats: PlayerStatsType = {
    matches: 0,
    gamesPlayed: 0,
    goals: 0,
    goalsScored: 0,
    assists: 0,
    wins: 0,
    mvp: 0,
    mvps: 0,
    cleanSheets: 0,
    cleansheets: 0,
    interceptions: 0,
  };

  // Compose stats with strict mapping from the backend (don't fudge numbers!)
  // For MVP, show profileData.stats.mvp or playerStats.mvps as is, don't mix with games played.
  const statsSource: PlayerStatsType = {
    ...defaultStats,
    ...(profileData?.stats || {}),
    ...(playerStats || {}),
  };

  const {
    matches,
    gamesPlayed,
    goals,
    goalsScored,
    assists,
    wins,
    mvp,
    mvps,
    cleanSheets,
    cleansheets,
    interceptions,
  } = statsSource;

  // --- Visual utilities ---
  // Show clean badge adornments for higher-level badges
  const getBadgeLevelColor = (level: number) => {
    if (level >= 5) return "border-yellow-400 bg-yellow-100 text-yellow-900 shadow-[0_2px_8px_#fde04740]";
    if (level >= 3) return "border-blue-400 bg-blue-100 text-blue-900";
    return "border-gray-300 bg-gray-50 text-gray-800";
  };

  // For badge icons, make higher level more shiny
  const getBadgeIcon = (level: number) => {
    if (level >= 5) return <Check className="inline ml-1 text-yellow-500" />;
    if (level >= 3) return <Star className="inline ml-1 text-blue-400" />;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Player Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Profile state */}
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : (
            <>
              {/* Avatar and Info */}
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4 ring ring-teal-300 ring-offset-2">
                  {profileData?.profilePicture ? (
                    <AvatarImage src={profileData.profilePicture} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-lg font-semibold">
                      {getInitials(profileData?.firstName + ' ' + profileData?.lastName || playerName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="text-xl font-semibold">
                  {profileData ? `${profileData.firstName} ${profileData.lastName}` : (playerName || `Player ${playerId.substring(0, 6)}`)}
                </h3>
                <p className="text-sm text-muted-foreground">Player ID: {playerId.substring(0,8)}</p>
                {profileData && profileData.city && (
                  <p className="text-sm text-gray-400">{profileData.city}</p>
                )}
                {profileData && profileData.bio && (
                  <p className="text-xs mt-1">{profileData.bio}</p>
                )}
              </div>

              {/* Stats */}
              <div>
                <h4 className="font-medium text-center mb-4">Player Statistics</h4>
                <div className="flex flex-row flex-wrap gap-y-2 gap-x-8 justify-center items-end">
                  <StatBlock icon={Calendar} label="Games Played" value={gamesPlayed || matches} />
                  <StatBlock icon={BadgePlus} label="Goals Scored" value={goalsScored || goals} />
                  <StatBlock icon={Zap} label="Assists" value={assists} />
                  <StatBlock icon={ShieldCheck} label="Clean Sheets" value={cleansheets || cleanSheets} />
                  <StatBlock icon={Award} label="MVP Awards" value={mvps || mvp} />
                  <StatBlock icon={Star} label="Wins" value={wins} />
                </div>
                <div className="flex flex-col items-center mt-4">
                  <StatBlock
                    icon={Check}
                    label="Interceptions"
                    value={interceptions}
                    highlight
                  />
                </div>
              </div>

              {/* Badges */}
              <TooltipProvider>
              {profileData?.badges && profileData.badges.length > 0 && (
                <div>
                  <h4 className="font-medium text-center mt-6 mb-2">Player Badges</h4>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {profileData.badges.map(badge => (
                      <Tooltip key={badge._id}>
                        <TooltipTrigger asChild>
                          <UiBadge
                            className={`border py-2 px-3 rounded-xl shadow-sm font-medium flex items-center gap-1 ${getBadgeLevelColor(badge.level)}`}
                          >
                            <span className="text-base">
                              {badge.name}
                            </span>
                            <span className="ml-1 text-xs font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-gray-200">
                              Lv{badge.level}
                            </span>
                            {getBadgeIcon(badge.level)}
                          </UiBadge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-center py-2 px-4 text-xs font-medium">
                          {badge.description || "No description"}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
              </TooltipProvider>

              {/* Status Badge */}
              <div className="flex justify-center mt-4">
                <UiBadge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-semibold px-5 py-1 text-base">
                  Active Player
                </UiBadge>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StatBlock = ({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  highlight?: boolean;
}) => (
  <Card className={highlight ? "border-2 border-primary shadow-lg scale-105" : ""}>
    <CardContent className="py-2 px-4 text-center">
      <div className={`flex flex-col items-center justify-center mb-1`}>
        <Icon className={ICON_CLASSES + (highlight ? " text-primary" : "")} />
        <span className={`text-lg font-bold ${highlight ? "text-primary" : ""}`}>{value}</span>
      </div>
      <p className={`text-xs ${highlight ? "text-primary font-semibold" : "text-muted-foreground"}`}>{label}</p>
    </CardContent>
  </Card>
);

export default PlayerProfileDialog;
