
import React from "react";
import { format, parseISO } from "date-fns";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import PitchLineup from "@/components/PitchLineup";
import HighlightsList from "./HighlightsList";
import { Reservation } from "@/context/ReservationContext";

interface GameDetailsDialogProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onStatusChange?: (status: 'open' | 'full' | 'completed' | 'cancelled') => void;
  currentUserId: string;
  actualMaxPlayers: number;
}

/**
 * GameDetailsDialog component
 * Displays detailed information about a game/reservation
 * Includes player lineup, highlights, and admin controls
 */
const GameDetailsDialog: React.FC<GameDetailsDialogProps> = ({
  reservation,
  isOpen,
  onClose,
  isAdmin = false,
  onStatusChange,
  currentUserId,
  actualMaxPlayers
}) => {
  // Format date for display
  const formatDate = (dateString: string, dateFormat: string = "EEEE, MMMM do, yyyy") => {
    try {
      const date = parseISO(dateString);
      return format(date, dateFormat);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  };
  
  // Check if current user is in the lineup
  const isUserInLineup = reservation.lineup.some(player => 
    player.userId === currentUserId && player.status === 'joined'
  );
  
  // Get player name from lineup or use "You" for current user
  const getPlayerName = (playerId: string) => {
    const player = reservation.lineup.find(p => p.userId === playerId);
    return player 
      ? (player.userId === currentUserId ? "You" : (player.playerName || `Player ${player.userId}`))
      : `Unknown Player`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[80vh] flex flex-col bg-white dark:bg-gray-800 border dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-teal-700 dark:text-teal-400">
            {reservation.pitchName}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Game details for {formatDate(reservation.date)} at {reservation.time}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-grow pr-2">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-2 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{formatDate(reservation.date)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-2 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{reservation.time}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-2 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  {reservation.playersJoined}/{actualMaxPlayers} players
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-2 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{reservation.location}</span>
              </div>
            </div>
            
            {/* Admin status controls */}
            {isAdmin && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Game Status:</span>
                  <Badge className={
                    reservation.status === 'open' ? 'bg-green-500' :
                    reservation.status === 'full' ? 'bg-amber-500' :
                    reservation.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                  }>
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm">Change to:</span>
                  <Select 
                    onValueChange={(value) => onStatusChange && onStatusChange(value as any)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select..." />
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
          
          {/* Player lineup section */}
          <div>
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Team Lineup</h4>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
              <PitchLineup
                maxPlayers={actualMaxPlayers}
                players={reservation.lineup.map(p => 
                  p.status === 'joined' ? (p.userId === currentUserId ? "You" : p.playerName || `Player ${p.userId}`) : null
                )}
              />
            </div>
          </div>

          {/* Waiting list section if any */}
          {reservation.waitingList.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Waiting List</h4>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                <ul className="space-y-1.5">
                  {reservation.waitingList.map((playerId, index) => (
                    <li key={index} className="text-sm flex items-center">
                      <span className="w-6 text-center text-gray-500 mr-2">{index + 1}.</span>
                      <span>{getPlayerName(playerId)}</span>
                      {playerId === currentUserId && (
                        <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                          You
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Game highlights section */}
          <div>
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Game Highlights</h4>
            {reservation.highlights && reservation.highlights.length > 0 ? (
              <HighlightsList 
                reservationId={reservation.id}
                isAdmin={isAdmin} 
              />
            ) : (
              <p className="text-sm text-muted-foreground dark:text-gray-400 italic">
                No highlights have been recorded for this game.
              </p>
            )}
          </div>
        </div>
        
        {/* Dialog footer with close button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsDialog;
