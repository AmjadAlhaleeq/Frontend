import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Reservation } from "@/types/reservation";

interface WaitingListDisplayProps {
  reservation: Reservation;
  onAddPlayerFromWaitlist: (userId: string) => void;
  onRemoveFromWaitlist: (userId: string) => void;
}

/**
 * WaitingListDisplay component
 * Shows a list of players on the waiting list for admins
 */
const WaitingListDisplay: React.FC<WaitingListDisplayProps> = ({
  reservation,
  onAddPlayerFromWaitlist,
  onRemoveFromWaitlist
}) => {
  const [waitingPlayers, setWaitingPlayers] = useState<Array<{ userId: string, name: string }>>([]);
  
  useEffect(() => {
    // Get player details from localStorage for the waiting list
    const getPlayerDetails = () => {
      if (!reservation.waitingList || reservation.waitingList.length === 0) {
        return [];
      }
      
      return reservation.waitingList.map(userId => {
        // Try to get user details from localStorage
        try {
          const userString = localStorage.getItem(`user_${userId}`);
          if (userString) {
            const user = JSON.parse(userString);
            return { userId, name: user.name || `User ${userId.slice(0, 4)}` };
          }
        } catch (error) {
          console.error("Error getting user details:", error);
        }
        // Fallback if user details not found
        return { userId, name: `User ${userId.slice(0, 4)}` };
      });
    };
    
    setWaitingPlayers(getPlayerDetails());
  }, [reservation.waitingList]);

  if (!reservation.waitingList || reservation.waitingList.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
        <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No players on the waiting list</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-4">
      <h4 className="font-medium mb-3 flex items-center">
        <Users className="h-4 w-4 mr-2" />
        Waiting List ({waitingPlayers.length})
      </h4>
      
      <ScrollArea className="h-60">
        <div className="space-y-2">
          {waitingPlayers.map((player) => (
            <div 
              key={player.userId} 
              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm"
            >
              <span className="font-medium">{player.name}</span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onAddPlayerFromWaitlist(player.userId)}
                  className="h-8 text-xs"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Add
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onRemoveFromWaitlist(player.userId)}
                  className="h-8 text-xs text-red-500 hover:text-red-600 hover:border-red-300"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WaitingListDisplay;
