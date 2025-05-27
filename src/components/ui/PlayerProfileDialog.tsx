import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Trophy, // Wins
  Award, // MVP
  Zap, // Interceptions
  Target, // Goals
  Users, // Assists
  Shield, // Clean sheets
  Calendar, // Games Played
  Star,
  Check,
} from "lucide-react";
import { BackendUserProfile } from "@/hooks/usePlayerProfile";
import { UserStats } from "@/types/reservation";

interface PlayerProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName?: string;
  fetchProfile?: (userId: string) => void;
  profileData?: BackendUserProfile;
  loading?: boolean;
  error?: string | null;
  playerStats: UserStats;
}

const ICON_CLASSES = "h-7 w-7 mx-auto";

const statConfig = [
  {
    key: "matches",
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
    key: "cleanSheets",
    label: "Clean Sheets",
    icon: Shield,
    color: "text-cyan-600",
  },
  {
    key: "mvp",
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
  },
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
  playerStats,
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
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(
      0
    )}`.toUpperCase();
  };

  // Map stats from API (prefer backend, fallback to prop)
  const stats = {
    matches: profileData?.stats?.matches ?? playerStats?.matches ?? 0,
    goals: profileData?.stats?.goals ?? playerStats?.goals ?? 0,
    assists: profileData?.stats?.assists ?? playerStats?.assists ?? 0,
    cleanSheets: profileData?.stats?.cleanSheets ?? playerStats?.cleanSheets ?? 0,
    mvp: profileData?.stats?.mvp ?? playerStats?.mvp ?? 0,
    wins: profileData?.stats?.wins ?? playerStats?.wins ?? 0,
    interceptions: profileData?.stats?.interceptions ?? playerStats?.interceptions ?? 0,
  };

  // Badge level color system - Bronze/Silver/Gold
  const getBadgeLevelColor = (level: number) => {
    if (level >= 3)
      return "border-yellow-500 bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-900 shadow-[0_4px_12px_rgba(234,179,8,0.3)]";
    if (level >= 2)
      return "border-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 shadow-[0_4px_12px_rgba(156,163,175,0.3)]";
    return "border-amber-600 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 shadow-[0_4px_12px_rgba(217,119,6,0.3)]";
  };

  // Badge level names
  const getBadgeLevelName = (level: number) => {
    if (level >= 3) return "Gold";
    if (level >= 2) return "Silver";
    return "Bronze";
  };

  // Check if player is suspended
  const isSuspended =
    profileData?.suspended && new Date(profileData.suspendedUntil) > new Date();
  const suspensionDaysLeft = isSuspended
    ? Math.ceil(
        (new Date(profileData.suspendedUntil).getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

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
                    <AvatarImage
                      src={profileData.profilePicture}
                      alt="Profile"
                    />
                  ) : (
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-3xl font-bold">
                      {getInitials(
                        profileData
                          ? `${profileData.firstName} ${profileData.lastName}`
                          : playerName
                      )}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="text-xl font-bold text-teal-700">
                  {profileData
                    ? `${profileData.firstName} ${profileData.lastName}`
                    : playerName || `Player ${playerId.substring(0, 6)}`}
                </h3>
                <p className="text-sm text-gray-400">
                  ID: {playerId.substring(0, 8)}
                </p>
                {profileData && (
                  <>
                    {profileData.city && (
                      <p className="text-xs text-gray-500">
                        {profileData.city}
                      </p>
                    )}
                    {profileData.bio && (
                      <p className="text-xs mt-1">{profileData.bio}</p>
                    )}
                  </>
                )}

                {/* Suspension Status */}
                {isSuspended && (
                  <div className="mt-2 px-3 py-1 bg-red-100 border border-red-300 rounded-full">
                    <p className="text-xs font-medium text-red-700">
                      Suspended ({suspensionDaysLeft} days left)
                    </p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div>
                <h4 className="font-medium text-center mb-3 text-gray-800">
                  Player Statistics
                </h4>
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

              {/* Badges - Only show collected badges */}
              <TooltipProvider>
                {profileData?.badges && profileData.badges.length > 0 && (
                  <div>
                    <h4 className="font-medium text-center mt-6 mb-4 text-gray-700">
                      Collected Badges
                    </h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {profileData.badges.map((badge) => (
                        <Tooltip key={badge._id}>
                          <TooltipTrigger asChild>
                            <UiBadge
                              className={`border-2 py-3 px-4 rounded-2xl shadow-lg font-medium flex items-center gap-2 transition-all hover:scale-110 cursor-pointer duration-200 ${getBadgeLevelColor(
                                badge.level
                              )}`}
                            >
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-bold">
                                  {badge.name}
                                </span>
                                <span className="text-xs font-semibold opacity-75">
                                  {getBadgeLevelName(badge.level)} Lv
                                  {badge.level}
                                </span>
                              </div>
                            </UiBadge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-center py-3 px-4 text-sm font-medium shadow-lg bg-white border-2 border-gray-200 rounded-lg">
                            <div className="space-y-1">
                              <p className="font-bold">{badge.name}</p>
                              <p className="text-gray-600">
                                {badge.description || "No description"}
                              </p>
                              {badge.requiredValue && (
                                <p className="text-xs text-blue-600 font-medium">
                                  Required: {badge.requiredValue} to achieve
                                  this badge
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}
              </TooltipProvider>

              {/* Status Badge */}
              <div className="flex justify-center mt-4">
                <UiBadge
                  variant="outline"
                  className={`font-semibold px-5 py-1 text-base ${
                    isSuspended
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  {isSuspended ? "Suspended Player" : "Active Player"}
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
  <Card
    className={`rounded-xl border-2 ${
      highlight
        ? "border-primary shadow-lg scale-105"
        : "border-gray-100 shadow-sm"
    }`}
  >
    <CardContent className="py-2 px-3 text-center flex flex-col items-center">
      <Icon
        className={`${ICON_CLASSES} ${iconColor} ${
          highlight ? "scale-125" : ""
        }`}
      />
      <span
        className={`text-lg font-bold mt-1 ${highlight ? "text-primary" : ""}`}
      >
        {value ?? 0}
      </span>
      <span
        className={`text-xs ${
          highlight ? "font-semibold" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </CardContent>
  </Card>
);

export default PlayerProfileDialog;
