import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Users, Award, ShieldCheck, Star, Zap, BadgePlus } from "lucide-react";
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

  // Default stats filled for typing & destructuring safety
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

  // Compose stats for backend or fallback playerStats, with typing safety
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
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
                <Avatar className="h-20 w-20 mb-4">
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
              <div className="space-y-3">
                <h4 className="font-medium text-center">Statistics</h4>
                <div className="grid grid-cols-2 gap-2">
                  <StatBlock icon={Trophy} label="Games Played" value={matches || gamesPlayed} />
                  <StatBlock icon={BadgePlus} label="Goals Scored" value={goals || goalsScored} />
                  <StatBlock icon={Zap} label="Assists" value={assists} />
                  <StatBlock icon={ShieldCheck} label="Clean Sheets" value={cleanSheets || cleansheets} />
                  <StatBlock icon={Award} label="MVP Awards" value={mvp || mvps} />
                  <StatBlock icon={Star} label="Wins" value={wins} />
                  <StatBlock icon={Star} label="Interceptions" value={interceptions} />
                </div>
              </div>

              {/* Badges */}
              {profileData?.badges && profileData.badges.length > 0 && (
                <div>
                  <h4 className="font-medium text-center mt-4 mb-2">Badges</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {profileData.badges.map(badge => (
                      <Badge key={badge._id} className="border border-yellow-300 bg-yellow-50 text-yellow-700">
                        {badge.name} (Lv{badge.level})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex justify-center mt-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active Player
                </Badge>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StatBlock = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) => (
  <Card>
    <CardContent className="p-3 text-center">
      <div className="flex items-center justify-center mb-1">
        <Icon className="h-4 w-4 text-teal-600 mr-1" />
        <span className="text-lg font-semibold">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </CardContent>
  </Card>
);

export default PlayerProfileDialog;
