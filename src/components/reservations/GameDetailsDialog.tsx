import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, MapPin, Users, BadgePlus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useReservation, Reservation } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GameDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  isAdmin?: boolean;
  onStatusChange?: (status: Reservation['status']) => void;
  currentUserId: string;
  actualMaxPlayers: number;
}

/**
 * GameDetailsDialog component
 * Shows detailed information about a specific game reservation
 */
const GameDetailsDialog: React.FC<GameDetailsDialogProps> = ({
  isOpen,
  onClose,
  reservation,
  isAdmin = false,
  onStatusChange,
  currentUserId,
  actualMaxPlayers
}) => {
  const { toast } = useToast();
  const { updateReservationStatus } = useReservation();

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'EEE, MMM d, yyyy');
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  // Filter players by status (joined, waiting)
  const confirmedPlayers = reservation.lineup?.filter(
    (player) => player.status === 'confirmed'
  ) || [];
  
  const waitingListPlayers = reservation.waitingList || [];

  // Handle status change
  const handleStatusChange = (status: Reservation['status']) => {
    if (onStatusChange) {
      onStatusChange(status);
      toast({
        title: "Status Updated",
        description: `Reservation status updated to ${status}`,
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-between">
            {reservation.title || reservation.pitchName}
            <Badge 
              className={cn(
                "text-xs",
                reservation.status === 'open' 
                  ? "bg-green-500" 
                  : reservation.status === 'full' 
                  ? "bg-orange-500" 
                  : "bg-gray-500"
              )}
            >
              {reservation.status}
            </Badge>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-3">
              {/* Date and Time */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(reservation.date)} at {reservation.time}
              </div>

              {/* Location link */}
              {reservation.location && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(reservation.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-600 dark:hover:text-teal-400 underline"
                  >
                    {reservation.location}
                  </a>
                </div>
              )}

              {/* Players Joined */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4 mr-2" />
                {confirmedPlayers.length}/{actualMaxPlayers} Players Joined
              </div>

              {/* Player List */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Players:</h4>
                <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                  {confirmedPlayers.map((player) => (
                    <li key={player.userId}>{player.playerName || player.userId}</li>
                  ))}
                  {confirmedPlayers.length === 0 && (
                    <li className="text-gray-400">No players have joined yet</li>
                  )}
                </ul>
              </div>
              
              {/* Waiting List */}
              {waitingListPlayers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Waiting List:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                    {waitingListPlayers.map((userId) => (
                      <li key={userId}>{userId}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Admin Controls */}
              {isAdmin && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Controls:</h4>
                  <div className="flex items-center space-x-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Change Status:</p>
                    <Select onValueChange={handleStatusChange} defaultValue={reservation.status}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder={reservation.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GameDetailsDialog;
