
import React, { useState } from "react";
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
import { Calendar, Clock, MapPin, Users, AlertTriangle, Ban } from "lucide-react";
import HighlightsList from "./HighlightsList";
import { Reservation } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";
import SuspendPlayerForm from "./SuspendPlayerForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
 * Includes highlights, and admin controls
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  
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
  
  // Get player name from lineup or use "You" for current user
  const getPlayerName = (playerId: string) => {
    const player = reservation.lineup.find(p => p.userId === playerId);
    return player 
      ? (player.userId === currentUserId ? "You" : (player.playerName || `Player ${player.userId}`))
      : `Unknown Player`;
  };

  // Handle player suspension
  const handleSuspendPlayer = (playerId: string, playerName: string, duration: number, reason: string) => {
    // In a real application, this would call an API to suspend the player
    // For now, we'll just show a toast notification
    toast({
      title: "Player Suspended",
      description: `${playerName} has been suspended for ${duration} day${duration > 1 ? 's' : ''}.`,
    });
    
    setShowSuspendForm(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-gray-800 border dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-teal-700 dark:text-teal-400">
            {reservation.title || reservation.pitchName}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Game details for {formatDate(reservation.date)} at {reservation.time}
          </DialogDescription>
        </DialogHeader>

        {showSuspendForm ? (
          <SuspendPlayerForm 
            reservationId={reservation.id}
            onCancel={() => setShowSuspendForm(false)}
            onSuspend={handleSuspendPlayer}
          />
        ) : (
          <div className="flex flex-col flex-grow overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="details">Game Details</TabsTrigger>
                <TabsTrigger value="players">Players</TabsTrigger>
              </TabsList>
              
              <div className="overflow-y-auto pr-2 flex-grow">
                <TabsContent value="details" className="space-y-4 mt-0">
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
                </TabsContent>
                
                <TabsContent value="players" className="space-y-4 mt-0">
                  {/* Players who participated */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-700 dark:text-gray-200">Players ({reservation.lineup.filter(p => p.status === 'joined').length}/{actualMaxPlayers})</h4>
                      {isAdmin && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
                          onClick={() => setShowSuspendForm(true)}
                        >
                          <Ban className="h-3.5 w-3.5 mr-1.5" />
                          Suspend Player
                        </Button>
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md">
                      <div className="divide-y divide-gray-200 dark:divide-gray-600">
                        {reservation.lineup
                          .filter(player => player.status === 'joined')
                          .map((player, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between py-2 px-3"
                            >
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center mr-2.5 text-xs font-medium text-teal-800 dark:text-teal-200">
                                  {player.playerName ? player.playerName.charAt(0).toUpperCase() : 'P'}
                                </div>
                                <span className="text-sm font-medium">
                                  {player.userId === currentUserId ? "You" : (player.playerName || `Player ${player.userId}`)}
                                </span>
                              </div>
                              {index < 5 ? (
                                <Badge className="bg-teal-500">Starting</Badge>
                              ) : (
                                <Badge className="bg-blue-500">Substitute</Badge>
                              )}
                            </div>
                          ))
                        }
                      </div>
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
                </TabsContent>
              </div>
            </Tabs>

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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsDialog;
