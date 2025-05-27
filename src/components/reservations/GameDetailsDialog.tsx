
import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  UserMinus,
  UserX,
  Shield,
  Star,
  Zap,
  Target,
  Save,
  Trophy,
} from "lucide-react";
import { Reservation } from "@/types/reservation";
import WaitingListDisplay from "./WaitingListDisplay";
import TransferReservationDialog from "./TransferReservationDialog";
import PlayerSuspensionDialog from "./PlayerSuspensionDialog";

interface GameDetailsDialogProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onStatusChange: (status: "upcoming" | "completed" | "cancelled") => void;
  currentUserId: string;
  actualMaxPlayers: number;
  onKickPlayer?: (reservationId: number, playerId: string) => void;
  onSuspendPlayer?: (playerId: string, suspensionDays: number, reason: string) => void;
  pitchImage?: string;
  onPlayerClick?: (playerId: string, playerName?: string) => void;
}

const GameDetailsDialog: React.FC<GameDetailsDialogProps> = ({
  reservation,
  isOpen,
  onClose,
  isAdmin,
  onStatusChange,
  currentUserId,
  actualMaxPlayers,
  onKickPlayer,
  onSuspendPlayer,
  pitchImage,
  onPlayerClick,
}) => {
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [suspensionDialog, setSuspensionDialog] = useState<{
    isOpen: boolean;
    playerName: string;
    playerId: string;
    action: 'kick' | 'suspend';
  }>({
    isOpen: false,
    playerName: "",
    playerId: "",
    action: 'kick'
  });

  const currentPlayers = reservation.lineup?.length || 0;

  let formattedDate = "Invalid Date";
  try {
    if (reservation.date) {
      formattedDate = format(parseISO(reservation.date), "EEEE, MMMM d, yyyy");
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    formattedDate = reservation.date?.substring(0, 10) || "Invalid Date";
  }

  const getCardImage = () => {
    if (pitchImage) return pitchImage;
    if (reservation.backgroundImage) return reservation.backgroundImage;
    return `https://source.unsplash.com/800x400/?football,pitch,${encodeURIComponent(
      reservation.pitchName || "football"
    )
      .split(" ")
      .join(",")}`;
  };

  // FIXED: Separate kick and suspend handlers
  const handleKickPlayer = (playerId: string, playerName: string) => {
    setSuspensionDialog({
      isOpen: true,
      playerName,
      playerId,
      action: 'kick'
    });
  };

  const handleSuspendPlayer = (playerId: string, playerName: string) => {
    setSuspensionDialog({
      isOpen: true,
      playerName,
      playerId,
      action: 'suspend'
    });
  };

  const handleSuspensionConfirm = (playerId: string, suspensionDays: number, reason: string) => {
    if (suspensionDialog.action === 'kick' && onKickPlayer) {
      onKickPlayer(reservation.id, playerId);
    } else if (suspensionDialog.action === 'suspend' && onSuspendPlayer) {
      onSuspendPlayer(playerId, suspensionDays, reason);
    }
    setSuspensionDialog({ isOpen: false, playerName: "", playerId: "", action: 'kick' });
  };

  const handleAddPlayerFromWaitlist = (userId: string) => {
    // This would need to be implemented in the parent component
    console.log("Adding player from waitlist:", userId);
  };

  const handleRemoveFromWaitlist = (userId: string) => {
    // This would need to be implemented in the parent component
    console.log("Removing from waitlist:", userId);
  };

  const renderPlayerItem = (player: any, index: number) => (
    <div
      key={player.userId}
      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      onClick={() => onPlayerClick?.(player.userId, player.name)}
    >
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-500 w-6">
          {index + 1}
        </span>
        <Avatar className="h-8 w-8">
          <AvatarImage src={player.avatarUrl} alt={player.name} />
          <AvatarFallback>
            {player.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium text-sm">{player.name}</p>
          <p className="text-xs text-muted-foreground">
            Joined {new Date(player.joinedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {/* FIXED: Separate kick and suspend buttons for admin */}
      {isAdmin && player.userId !== currentUserId && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleKickPlayer(player.userId, player.name);
            }}
            className="h-8 text-xs text-orange-600 hover:text-orange-700 hover:border-orange-300"
          >
            <UserMinus className="h-3.5 w-3.5 mr-1" />
            Kick
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleSuspendPlayer(player.userId, player.name);
            }}
            className="h-8 text-xs text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <UserX className="h-3.5 w-3.5 mr-1" />
            Suspend
          </Button>
        </div>
      )}
    </div>
  );

  const renderHighlights = () => {
    if (!reservation.highlights || reservation.highlights.length === 0) {
      return (
        <div className="text-center p-4 text-muted-foreground">
          <p>No highlights recorded for this game</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {reservation.highlights.map((highlight, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {highlight.type === "goal" && (
                  <Target className="h-5 w-5 text-green-600" />
                )}
                {highlight.type === "assist" && (
                  <Zap className="h-5 w-5 text-blue-600" />
                )}
                {highlight.type === "save" && (
                  <Shield className="h-5 w-5 text-purple-600" />
                )}
                {highlight.type === "mvp" && (
                  <Trophy className="h-5 w-5 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {highlight.playerName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {highlight.type.charAt(0).toUpperCase() +
                    highlight.type.slice(1)}
                  {highlight.minute && ` - ${highlight.minute}'`}
                </p>
              </div>
            </div>
            {highlight.description && (
              <p className="text-xs text-muted-foreground max-w-xs">
                {highlight.description}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {reservation.title || reservation.pitchName}
            </DialogTitle>
            <DialogDescription>Game details and player lineup</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Game Image */}
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <img
                  src={getCardImage()}
                  alt={reservation.pitchName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://source.unsplash.com/800x400/?football,pitch";
                  }}
                />
                <div className="absolute top-4 right-4">
                  <Badge
                    className={`${
                      reservation.status === "upcoming"
                        ? "bg-green-500"
                        : reservation.status === "completed"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                  >
                    {(reservation.status || "upcoming")
                      .charAt(0)
                      .toUpperCase() +
                      (reservation.status || "upcoming").slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Game Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>
                      {reservation.startTime && reservation.endTime
                        ? `${reservation.startTime} - ${reservation.endTime}`
                        : reservation.time || "Time TBD"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>{reservation.city || reservation.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span>
                      {currentPlayers}/{actualMaxPlayers} players
                    </span>
                  </div>
                </div>
              </div>

              {/* Player Lineup */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Player Lineup ({currentPlayers})
                </h3>
                <div className="space-y-2">
                  {reservation.lineup && reservation.lineup.length > 0 ? (
                    reservation.lineup.map((player, index) =>
                      renderPlayerItem(player, index)
                    )
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No players have joined this game yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Waiting List - Only show for admin */}
              {isAdmin && (
                <WaitingListDisplay
                  reservation={reservation}
                  onAddPlayerFromWaitlist={handleAddPlayerFromWaitlist}
                  onRemoveFromWaitlist={handleRemoveFromWaitlist}
                />
              )}

              {/* Game Highlights */}
              {reservation.status === "completed" && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Game Highlights
                  </h3>
                  {renderHighlights()}
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && reservation.status === "upcoming" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => setShowTransferDialog(true)}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Complete Game
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <TransferReservationDialog
        isOpen={showTransferDialog}
        onClose={() => setShowTransferDialog(false)}
        reservation={reservation}
      />

      {/* Suspension Dialog */}
      <PlayerSuspensionDialog
        isOpen={suspensionDialog.isOpen}
        onClose={() => setSuspensionDialog({ isOpen: false, playerName: "", playerId: "", action: 'kick' })}
        playerName={suspensionDialog.playerName}
        playerId={suspensionDialog.playerId}
        onConfirm={handleSuspensionConfirm}
        actionType={suspensionDialog.action}
      />
    </>
  );
};

export default GameDetailsDialog;
