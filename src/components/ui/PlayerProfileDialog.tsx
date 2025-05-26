
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
  Trophy,   // Wins
  Award,    // MVP
  Zap,      // Interceptions
  Target,   // Goals
  Users,    // Assists
  Shield,   // Clean sheets
  Calendar, // Games Played
  Star,
  Check,
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

const ICON_CLASSES = "h-7 w-7 mx-auto";

const statConfig = [
  {
    key: "gamesPlayed",
    label: "Games Played",
    icon: Calendar,
    color: "text-gray-700",
  },
  {
    key: "goals",
    label: "Goals Scored",
    icon: Target,
    color: "text-green-600",
  },
  {
    key: "assists",
    label: "Assists",
    icon: Users,
    color: "text-blue-600",
  },
  {
    key: "cleansheets",
    label: "Clean Sheets",
    icon: Shield,
    color: "text-cyan-600",
  },
  {
    key: "mvps",
    label: "MVP Awards",
    icon: Award,
    color: "text-purple-700",
  },
  {
    key: "wins",
    label: "Wins",
    icon: Trophy,
    color: "text-yellow-600",
  },
  {
    key: "interceptions",
    label: "Interceptions",
    icon: Zap,
    color: "text-orange-600",
  }
];

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

  // Map stats from API (prefer backend, fallback to prop)
  const stats = {
    gamesPlayed: profileData?.stats?.gamesPlayed ?? playerStats?.gamesPlayed ?? 0,
    goals: profileData?.stats?.goals ?? playerStats?.goals ?? 0,
    assists: profileData?.stats?.assists ?? playerStats?.assists ?? 0,
    cleansheets: profileData?.stats?.cleanSheets ?? playerStats?.cleansheets ?? 0,
    mvps: profileData?.stats?.mvp ?? playerStats?.mvps ?? 0,
    wins: profileData?.stats?.wins ?? playerStats?.wins ?? 0,
    interceptions: profileData?.stats?.interceptions ?? playerStats?.interceptions ?? 0,
  };

  // Colorful badge border by level 5+ = gold, 3+ = blue, else neutral
  const getBadgeLevelColor = (level: number) => {
    if (level >= 5) return "border-yellow-500 bg-yellow-200/80 text-yellow-900 shadow-[0_2px_8px_#fde04760]";
    if (level >= 3) return "border-blue-400 bg-blue-100 text-blue-900";
    return "border-gray-200 bg-gray-50 text-gray-700";
  };
  // Icon for badge level
  const getBadgeIcon = (level: number) => {
    if (level >= 5) return <Check className="inline ml-1 text-yellow-500" />;
    if (level >= 3) return <Star className="inline ml-1 text-blue-400" />;
    return null;
  };

  // --- UI ---
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] rounded-xl shadow-lg border-2 border-teal-200 bg-gradient-to-br from-white to-slate-100 animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <span className="text-teal-700">Player Profile</span>
            <Shield className="h-6 w-6 text-teal-500" />
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : (
            <>
              {/* Avatar + Info */}
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-3 ring-4 ring-teal-300 ring-offset-4 shadow-md">
                  {profileData?.profilePicture ? (
                    <AvatarImage src={profileData.profilePicture} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-3xl font-bold">
                      {getInitials(profileData ? `${profileData.firstName} ${profileData.lastName}` : playerName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="text-xl font-bold text-teal-700">
                  {profileData ? `${profileData.firstName} ${profileData.lastName}` : (playerName || `Player ${playerId.substring(0, 6)}`)}
                </h3>
                <p className="text-sm text-gray-400">ID: {playerId.substring(0,8)}</p>
                {profileData && (
                  <>
                    {profileData.city && (
                      <p className="text-xs text-gray-500">{profileData.city}</p>
                    )}
                    {profileData.bio && (
                      <p className="text-xs mt-1">{profileData.bio}</p>
                    )}
                  </>
                )}
              </div>
              {/* Stats */}
              <div>
                <h4 className="font-medium text-center mb-3 text-gray-800">Player Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 justify-center items-end">
                  {statConfig.map((s, idx) => (
                    <StatBlock
                      key={s.key}
                      icon={s.icon}
                      label={s.label}
                      value={stats[s.key as keyof typeof stats] ?? 0}
                      iconColor={s.color}
                      highlight={idx < 2}
                    />
                  ))}
                </div>
              </div>
              {/* Badges */}
              <TooltipProvider>
                {profileData?.badges && profileData.badges.length > 0 && (
                  <div>
                    <h4 className="font-medium text-center mt-6 mb-2 text-gray-700">Player Badges</h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {profileData.badges.map(badge => (
                        <Tooltip key={badge._id}>
                          <TooltipTrigger asChild>
                            <UiBadge
                              className={`border-2 py-2 px-3 rounded-2xl shadow font-medium flex items-center gap-1 transition-transform hover:scale-110 cursor-pointer duration-150 ${getBadgeLevelColor(badge.level)}`}
                            >
                              <span className="text-base">{badge.name}</span>
                              <span className="ml-1 text-xs font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-gray-200">
                                Lv{badge.level}
                              </span>
                              {getBadgeIcon(badge.level)}
                            </UiBadge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-center py-2 px-4 text-xs font-medium shadow bg-yellow-50 border-yellow-200">
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
  iconColor = "",
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  iconColor?: string;
  highlight?: boolean;
}) => (
  <Card className={`rounded-xl border-2 ${highlight ? "border-primary shadow-lg scale-105" : "border-gray-100 shadow-sm"}`}>
    <CardContent className="py-2 px-3 text-center flex flex-col items-center">
      <Icon className={`${ICON_CLASSES} ${iconColor} ${highlight ? "scale-125" : ""}`} />
      <span className={`text-lg font-bold mt-1 ${highlight ? "text-primary" : ""}`}>{value ?? 0}</span>
      <span className={`text-xs ${highlight ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
    </CardContent>
  </Card>
);

export default PlayerProfileDialog;

