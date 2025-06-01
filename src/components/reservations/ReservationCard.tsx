
import React from "react";
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
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { Reservation } from "@/types/reservation";

interface ReservationCardProps {
  reservation: Reservation;
  userId: string;
  userRole: "admin" | "player";
  onJoin: () => void;
  onCancel: () => void;
  onJoinWaitingList: () => void;
  onLeaveWaitingList: () => void;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  isFull: boolean;
  onDeleteReservation?: () => void;
  onViewDetails?: (reservation: Reservation) => void;
  onAddSummary?: (reservation: Reservation) => void;
  onKickPlayer?: (playerId: string, playerName: string) => void;
  isUserLoggedIn: boolean;
  pitchImage?: string;
  isUserInWaitingList?: (reservation: Reservation) => boolean;
  loadingStates?: Record<string, boolean>;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  userId,
  userRole,
  onJoin,
  onCancel,
  onJoinWaitingList,
  onLeaveWaitingList,
  isUserJoined,
  isFull,
  onDeleteReservation,
  onViewDetails,
  onAddSummary,
  onKickPlayer,
  isUserLoggedIn,
  pitchImage,
  isUserInWaitingList,
  loadingStates = {},
}) => {
  const joined = isUserJoined(reservation.id, userId);
  const inWaitingList = isUserInWaitingList ? isUserInWaitingList(reservation) : false;
  const isCompleted = reservation.status === "completed";
  const hasGameSummary = reservation.summary && typeof reservation.summary === "object" && (reservation.summary as any)?.completed;
  
  // Get waiting list count - handle both backend format (waitList) and frontend format (waitList)
  const waitList = reservation.waitList || [];
  const waitingListCount = Array.isArray(waitList) ? waitList.length : 0;

  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reservation.location && reservation.location.startsWith('http')) {
      window.open(reservation.location, '_blank');
    }
  };

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
    if (userRole === "admin" || !isUserLoggedIn) return null;

    if (joined) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={loadingStates[`leave-${reservation.id}`]}
        >
          <UserMinus className="h-4 w-4 mr-1" />
          Leave Game
        </Button>
      );
    }

    if (inWaitingList) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onLeaveWaitingList();
          }}
          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          disabled={loadingStates[`waitlist-${reservation.id}`]}
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
          onClick={(e) => {
            e.stopPropagation();
            onJoinWaitingList();
          }}
          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          disabled={loadingStates[`waitlist-${reservation.id}`]}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Join Waitlist
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onJoin();
        }}
        className="bg-green-600 hover:bg-green-700 text-white"
        disabled={loadingStates[`join-${reservation.id}`]}
      >
        <UserPlus className="h-4 w-4 mr-1" />
        Join Game
      </Button>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-200 mb-4">
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

      {/* Header with Title and Pitch Name */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-teal-700 dark:text-teal-400 mb-1">
            {reservation.title}
          </h3>
          {reservation.pitchName && (
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              📍 {reservation.pitchName}
            </p>
          )}
        </div>
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
            className="hover:text-teal-600 hover:underline flex items-center"
          >
            {reservation.city || reservation.location}
            {reservation.location && reservation.location.startsWith('http') && (
              <ExternalLink className="h-3 w-3 ml-1" />
            )}
          </button>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4 mr-2" />
          {reservation.playersJoined}/{reservation.maxPlayers} players
          {waitingListCount > 0 && (
            <span className="ml-2 text-amber-600">
              (+{waitingListCount} waiting)
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(reservation);
          }}
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>

        <div className="flex gap-2">{renderPlayerActions()}</div>
      </div>

      {/* Admin Actions */}
      {userRole === "admin" && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {!isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteReservation?.();
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={loadingStates[`delete-${reservation.id}`]}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}

          {isCompleted && !hasGameSummary && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddSummary?.(reservation);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <FileText className="h-4 w-4 mr-1" />
              Add Summary
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationCard;
