
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  UserPlus,
  UserMinus,
  Trash2,
  Eye,
  FileText,
  UserX,
  AlertCircle,
  Timer,
} from "lucide-react";
import { Reservation } from "@/types/reservation";
import { cn } from "@/lib/utils";
import PlayerSuspensionDialog from "./PlayerSuspensionDialog";

interface ReservationCardEnhancedProps {
  reservation: Reservation;
  userRole: "admin" | "player" | null;
  currentUserId: string;
  isUserJoined: boolean;
  isUserInWaitlist: boolean;
  isFull: boolean;
  onJoinGame: () => void;
  onLeaveGame: () => void;
  onJoinWaitlist: () => void;
  onLeaveWaitlist: () => void;
  onViewDetails: () => void;
  onDeleteReservation?: () => void;
  onKickPlayer?: (playerId: string, suspensionDays: number, reason: string) => void;
  onAddSummary?: () => void;
  pitchImage?: string;
}

const ReservationCardEnhanced: React.FC<ReservationCardEnhancedProps> = ({
  reservation,
  userRole,
  currentUserId,
  isUserJoined,
  isUserInWaitlist,
  isFull,
  onJoinGame,
  onLeaveGame,
  onJoinWaitlist,
  onLeaveWaitlist,
  onViewDetails,
  onDeleteReservation,
  onKickPlayer,
  onAddSummary,
  pitchImage,
}) => {
  const [kickDialog, setKickDialog] = useState<{open: boolean, playerId: string, playerName: string} | null>(null);
  
  const isCompleted = reservation.status === "completed";
  const hasGameSummary =
    reservation.summary &&
    typeof reservation.summary === "object" &&
    (reservation.summary as any)?.completed;

  // Check if reservation is in progress (started but not completed)
  const gameDateTime = new Date(`${reservation.date}T${reservation.time || '00:00'}`);
  const now = new Date();
  const isInProgress = reservation.status === "upcoming" && gameDateTime <= now;
  
  // Check if we can join waitlist (3 days before to game end)
  const threeDaysBeforeGame = new Date(gameDateTime.getTime() - (3 * 24 * 60 * 60 * 1000));
  const canJoinWaitlist = now >= threeDaysBeforeGame && now <= gameDateTime;
  
  // Check if we can kick players (until game is completed)
  const canKickPlayers = userRole === "admin" && !isCompleted && reservation.lineup && reservation.lineup.length > 0;

  const getStatusBadge = () => {
    if (isInProgress) {
      return (
        <Badge className="bg-orange-500 text-white animate-pulse">
          <Timer className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    if (isCompleted) {
      return <Badge className="bg-blue-500 text-white">Completed</Badge>;
    }
    if (isFull) {
      return <Badge className="bg-amber-500 text-white">Full</Badge>;
    }
    return <Badge className="bg-green-500 text-white">Available</Badge>;
  };

  const handleKickPlayer = (playerId: string, playerName: string) => {
    setKickDialog({ open: true, playerId, playerName });
  };

  const confirmKickPlayer = (playerId: string, suspensionDays: number, reason: string) => {
    if (onKickPlayer) {
      onKickPlayer(playerId, suspensionDays, reason);
    }
    setKickDialog(null);
  };

  const handleLocationClick = () => {
    const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(reservation.location)}`;
    window.open(googleMapsUrl, '_blank');
  };

  const renderPlayerActions = () => {
    if (userRole === "admin" || !currentUserId) return null;

    if (isUserJoined) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={onLeaveGame}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <UserMinus className="h-4 w-4 mr-1" />
          Leave Game
        </Button>
      );
    }

    if (isUserInWaitlist) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={onLeaveWaitlist}
          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
        >
          <UserMinus className="h-4 w-4 mr-1" />
          Leave Waitlist
        </Button>
      );
    }

    // Show join waitlist button if game is full and within the allowed time window
    if (isFull && canJoinWaitlist) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={onJoinWaitlist}
          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Join Waitlist
        </Button>
      );
    }

    // Show join game button if not full
    if (!isFull) {
      return (
        <Button
          size="sm"
          onClick={onJoinGame}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Join Game
        </Button>
      );
    }

    return null;
  };

  const renderAdminActions = () => {
    if (userRole !== "admin") return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {!isCompleted && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteReservation}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}

        {isCompleted && !hasGameSummary && (
          <Button
            size="sm"
            onClick={onAddSummary}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <FileText className="h-4 w-4 mr-1" />
            Add Summary
          </Button>
        )}

        {/* Show waitlist management buttons */}
        {reservation.waitList && reservation.waitList.length > 0 && (
          <div className="w-full mt-2">
            <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Waitlist: {reservation.waitList.length} player(s)
            </div>
            <div className="flex flex-wrap gap-1">
              {reservation.waitList.slice(0, 2).map((userId: string, index: number) => (
                <Button
                  key={userId}
                  variant="outline"
                  size="sm"
                  onClick={onLeaveWaitlist}
                  className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-7"
                >
                  <UserMinus className="h-3 w-3 mr-1" />
                  Remove #{index + 1}
                </Button>
              ))}
              {reservation.waitList.length > 2 && (
                <span className="text-xs text-gray-500 self-center">
                  +{reservation.waitList.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Show joined players with kick option */}
        {canKickPlayers && (
          <div className="w-full mt-2">
            <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Kick players from game
            </div>
            <div className="flex flex-wrap gap-1">
              {reservation.lineup.slice(0, 3).map((player: any) => (
                <Button
                  key={player.userId}
                  variant="outline"
                  size="sm"
                  onClick={() => handleKickPlayer(player.userId, player.name)}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-7"
                >
                  <UserX className="h-3 w-3 mr-1" />
                  Kick {player.name?.split(' ')[0]}
                </Button>
              ))}
              {reservation.lineup.length > 3 && (
                <span className="text-xs text-gray-500 self-center">
                  +{reservation.lineup.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-lg shadow-md border p-4 hover:shadow-lg transition-all duration-200",
          isCompleted && "border-blue-200 bg-blue-50 dark:bg-blue-900/20",
          isInProgress && "border-orange-200 bg-orange-50 dark:bg-orange-900/20"
        )}
      >
        {/* Pitch Image */}
        {pitchImage && (
          <div className="h-32 w-full rounded-md overflow-hidden mb-4">
            <img
              src={pitchImage}
              alt={reservation.pitchName || reservation.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-teal-700 dark:text-teal-400">
            {reservation.pitchName || reservation.title}
          </h3>
          {getStatusBadge()}
        </div>

        {/* Game Details */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-2" />
            {reservation.date}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            {reservation.time}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-2" />
            <button 
              onClick={handleLocationClick}
              className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:underline transition-colors"
            >
              {reservation.location}
            </button>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4 mr-2" />
            {reservation.playersJoined}/{reservation.maxPlayers} players
            {reservation.waitList && reservation.waitList.length > 0 && (
              <span className="ml-2 text-amber-600">
                (+{reservation.waitList.length} waiting)
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>

          <div className="flex gap-2">{renderPlayerActions()}</div>
        </div>

        {/* Admin Actions */}
        {renderAdminActions()}
      </div>

      {/* Kick Player Dialog */}
      {kickDialog && (
        <PlayerSuspensionDialog
          isOpen={kickDialog.open}
          onClose={() => setKickDialog(null)}
          playerName={kickDialog.playerName}
          playerId={kickDialog.playerId}
          onConfirm={confirmKickPlayer}
          actionType="kick"
        />
      )}
    </>
  );
};

export default ReservationCardEnhanced;
