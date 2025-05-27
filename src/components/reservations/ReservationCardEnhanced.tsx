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
  CheckCircle,
} from "lucide-react";
import { Reservation } from "@/types/reservation";
import { cn } from "@/lib/utils";

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
  onCompleteGame?: () => void;
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
  onCompleteGame,
  onAddSummary,
  pitchImage,
}) => {
  const isCompleted = reservation.status === "completed";
  const hasGameSummary =
    reservation.summary &&
    typeof reservation.summary === "object" &&
    (reservation.summary as any)?.completed;

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge className="bg-blue-500 text-white">Completed</Badge>;
    }
    if (isFull) {
      return <Badge className="bg-amber-500 text-white">Full</Badge>;
    }
    return <Badge className="bg-green-500 text-white">Available</Badge>;
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

    if (isFull) {
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
  };

  const renderAdminActions = () => {
    if (userRole !== "admin") return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {!isCompleted && (
          <>
            <Button
              size="sm"
              onClick={onCompleteGame}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteReservation}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </>
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
      </div>
    );
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-md border p-4 hover:shadow-lg transition-all duration-200",
        isCompleted && "border-blue-200 bg-blue-50 dark:bg-blue-900/20"
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
          {reservation.location}
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4 mr-2" />
          {reservation.playersJoined}/{reservation.maxPlayers} players
          {reservation.waitingList && reservation.waitingList.length > 0 && (
            <span className="ml-2 text-amber-600">
              (+{reservation.waitingList.length} waiting)
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
  );
};

export default ReservationCardEnhanced;
