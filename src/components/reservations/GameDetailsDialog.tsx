
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  CircleCheck,
  CircleX,
  UserCheck,
  UserMinus,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Reservation, Player } from "@/context/ReservationContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface GameDetailsDialogProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  actualMaxPlayers: number;
  onStatusChange?: (status: "open" | "full" | "completed" | "cancelled") => void;
  currentUserId: string;
}

/**
 * GameDetailsDialog component
 * Shows detailed information about a reservation, including location, date, time, and players
 * Admins have options to change reservation status
 */
const GameDetailsDialog: React.FC<GameDetailsDialogProps> = ({
  reservation,
  isOpen,
  onClose,
  isAdmin,
  onStatusChange,
  currentUserId,
  actualMaxPlayers
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEEE, MMMM d, yyyy");
    } catch (error) {
      console.error("Error parsing date:", error);
      return dateStr;
    }
  };

  const isUserInLineup = reservation.lineup?.some(
    (player) => player.userId === currentUserId && player.status === "confirmed"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500 hover:bg-green-600";
      case "full":
        return "bg-amber-500 hover:bg-amber-600";
      case "completed":
        return "bg-blue-500 hover:bg-blue-600";
      case "cancelled":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const handleStatusChange = (status: "open" | "full" | "completed" | "cancelled") => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  const getInitials = (player: Player) => {
    if (player.playerName) {
      const names = player.playerName.split(" ");
      if (names.length > 1) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    return player.userId.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex justify-between items-start">
            <span className="mr-3">{reservation.title || "Game Reservation"}</span>
            <Badge className={getStatusColor(reservation.status)}>
              {reservation.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg space-y-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>{formatDate(reservation.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>{reservation.time}</span>
              {reservation.duration && (
                <span className="text-gray-500 ml-1">
                  ({reservation.duration})
                </span>
              )}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span>{reservation.location}</span>
              {reservation.location && (
                <a
                  href={reservation.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center ml-2 text-blue-500 hover:underline"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span className="text-xs">Map</span>
                </a>
              )}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              <span>
                {reservation.playersJoined} / {reservation.maxPlayers} players
              </span>
              {reservation.waitingList && reservation.waitingList.length > 0 && (
                <Badge variant="outline" className="ml-2 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/30">
                  +{reservation.waitingList.length} waiting
                </Badge>
              )}
            </div>
          </div>

          {/* Players list */}
          <div>
            <h3 className="text-md font-semibold mb-2">Players</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {reservation.lineup && reservation.lineup.length > 0 ? (
                reservation.lineup
                  .filter((player) => player.status === "confirmed")
                  .map((player, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center p-2 rounded-md border",
                        player.userId === currentUserId
                          ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30"
                          : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <Avatar className="h-7 w-7 mr-2">
                        <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs">
                          {getInitials(player)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm truncate">
                        {player.playerName || `Player ${idx + 1}`}
                        {player.userId === currentUserId && (
                          <span className="ml-1 text-xs text-teal-600 dark:text-teal-400">
                            (You)
                          </span>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="col-span-full text-center py-3 text-gray-500 italic text-sm">
                  No players have joined yet
                </div>
              )}
            </div>
          </div>

          {/* Waiting list */}
          {reservation.waitingList && reservation.waitingList.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500" />
                Waiting List
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {reservation.waitingList.map((userId, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center p-2 rounded-md border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/10",
                      userId === currentUserId && "border-amber-400"
                    )}
                  >
                    <UserMinus className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm truncate">
                      {userId === currentUserId ? "You" : `Waiting User ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin controls */}
          {isAdmin && onStatusChange && (
            <>
              <Separator className="my-4" />

              <div>
                <h3 className="text-md font-semibold mb-2">Admin Controls</h3>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={
                      reservation.status === "open" ? "default" : "outline"
                    }
                    onClick={() => handleStatusChange("open")}
                    className={
                      reservation.status === "open"
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }
                    size="sm"
                  >
                    <CircleCheck className="mr-1.5 h-4 w-4" />
                    Open
                  </Button>
                  <Button
                    variant={
                      reservation.status === "full" ? "default" : "outline"
                    }
                    onClick={() => handleStatusChange("full")}
                    className={
                      reservation.status === "full"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : ""
                    }
                    size="sm"
                  >
                    <UserCheck className="mr-1.5 h-4 w-4" />
                    Full
                  </Button>
                  <Button
                    variant={
                      reservation.status === "completed" ? "default" : "outline"
                    }
                    onClick={() => handleStatusChange("completed")}
                    className={
                      reservation.status === "completed"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }
                    size="sm"
                  >
                    <CircleCheck className="mr-1.5 h-4 w-4" />
                    Completed
                  </Button>
                  <Button
                    variant={
                      reservation.status === "cancelled" ? "default" : "outline"
                    }
                    onClick={() => handleStatusChange("cancelled")}
                    className={
                      reservation.status === "cancelled"
                        ? "bg-red-600 hover:bg-red-700"
                        : ""
                    }
                    size="sm"
                  >
                    <CircleX className="mr-1.5 h-4 w-4" />
                    Cancelled
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsDialog;
