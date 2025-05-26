
import React from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Trash2,
  FileText,
  Eye,
  UserPlus,
  UserMinus,
  AlertCircle,
} from "lucide-react";
import { Reservation } from "@/context/ReservationContext";

interface ReservationCardProps {
  reservation: Reservation;
  userId: string;
  userRole: "admin" | "player";
  onJoin: (id: number, playerName?: string) => void;
  onCancel: (id: number, userId: string) => void;
  onJoinWaitingList: (id: number, userId: string) => void;
  onLeaveWaitingList: (id: number, userId: string) => void;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  isFull: boolean;
  onDeleteReservation?: (id: number) => void;
  onViewDetails: (reservation: Reservation) => void;
  onAddSummary?: (reservation: Reservation) => void;
  isUserLoggedIn: boolean;
  pitchImage?: string;
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
  isUserLoggedIn,
  pitchImage,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      e.stopPropagation();
      return;
    }
    onViewDetails(reservation);
  };

  const isJoined = isUserLoggedIn && isUserJoined(reservation.id, userId);
  const isInWaitingList = isUserLoggedIn && reservation.waitingList?.includes(userId);
  const currentPlayers = reservation.lineup?.length || 0;
  const actualMaxPlayers = reservation.maxPlayers + 2;
  const gameIsFull = currentPlayers >= actualMaxPlayers;
  const waitingListCount = reservation.waitingList?.length || 0;

  let formattedDate = "Invalid Date";
  try {
    if (reservation.date) {
      formattedDate = format(parseISO(reservation.date), "MMM d");
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    formattedDate = reservation.date?.substring(0, 10) || "Invalid Date";
  }

  const getCardImage = () => {
    if (pitchImage) return pitchImage;
    if (reservation.backgroundImage) return reservation.backgroundImage;
    return `https://source.unsplash.com/400x200/?football,pitch,${encodeURIComponent(reservation.pitchName || 'football').split(" ").join(",")}`;
  };

  const renderActionButtons = () => {
    if (!isUserLoggedIn) {
      return (
        <Button 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            onJoin(reservation.id);
          }}
          className="bg-teal-500 hover:bg-teal-600 text-white"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Login to Join
        </Button>
      );
    }

    if (userRole === 'admin') {
      return (
        <div className="flex gap-2">
          {onAddSummary && reservation.status === 'upcoming' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onAddSummary(reservation);
              }}
            >
              <FileText className="h-4 w-4 mr-1" />
              Summary
            </Button>
          )}
          {onDeleteReservation && (
            <Button 
              size="sm" 
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteReservation(reservation.id);
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(reservation);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
        </div>
      );
    }

    // Player actions
    if (isJoined) {
      return (
        <div className="flex gap-2 items-center">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Joined
          </Badge>
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(reservation.id, userId);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <UserMinus className="h-4 w-4 mr-1" />
            Leave
          </Button>
        </div>
      );
    }

    if (isInWaitingList) {
      return (
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
            Waiting List #{reservation.waitingList?.indexOf(userId)! + 1}
          </Badge>
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onLeaveWaitingList(reservation.id, userId);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <UserMinus className="h-4 w-4 mr-1" />
            Leave List
          </Button>
        </div>
      );
    }

    if (gameIsFull) {
      if (waitingListCount >= 3) {
        return (
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Full</Badge>
            <span className="text-sm text-muted-foreground">Waiting list full</span>
          </div>
        );
      }
      return (
        <Button 
          size="sm" 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onJoinWaitingList(reservation.id, userId);
          }}
          className="border-amber-500 text-amber-600 hover:bg-amber-50"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Join Waiting List
        </Button>
      );
    }

    return (
      <Button 
        size="sm" 
        onClick={(e) => {
          e.stopPropagation();
          onJoin(reservation.id);
        }}
        className="bg-teal-500 hover:bg-teal-600 text-white"
      >
        <UserPlus className="h-4 w-4 mr-1" />
        Join Game
      </Button>
    );
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-teal-500"
      onClick={handleCardClick}
    >
      <div className="relative h-32 sm:h-40">
        <img
          src={getCardImage()}
          alt={reservation.pitchName}
          className="w-full h-full object-cover rounded-t-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://source.unsplash.com/400x200/?football,pitch";
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge 
            className={`${
              reservation.status === 'upcoming' ? 'bg-green-500' : 
              reservation.status === 'completed' ? 'bg-blue-500' :
              'bg-red-500'
            }`}
          >
            {(reservation.status || 'upcoming').charAt(0).toUpperCase() + (reservation.status || 'upcoming').slice(1)}
          </Badge>
        </div>
        {gameIsFull && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Full
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
              {reservation.title || reservation.pitchName}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{reservation.city || reservation.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {reservation.startTime && reservation.endTime 
                  ? `${reservation.startTime} - ${reservation.endTime}`
                  : reservation.time || "Time TBD"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">
                {currentPlayers}/{actualMaxPlayers} players
                {waitingListCount > 0 && (
                  <span className="text-amber-600 ml-1">
                    (+{waitingListCount} waiting)
                  </span>
                )}
              </span>
            </div>
            {reservation.price && (
              <span className="text-sm font-medium text-teal-600">
                ${reservation.price}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            {renderActionButtons()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationCard;
