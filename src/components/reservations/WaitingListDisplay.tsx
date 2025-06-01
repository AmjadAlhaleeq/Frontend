
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, X, Loader } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Reservation } from "@/types/reservation";
import { getMultiplePlayersByIds, PlayerProfile } from "@/services/playerApi";
import { useToast } from "@/hooks/use-toast";

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
  onRemoveFromWaitlist,
}) => {
  const [waitingPlayers, setWaitingPlayers] = useState<PlayerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWaitingListPlayers = async () => {
      if (!reservation.waitingList || reservation.waitingList.length === 0) {
        setWaitingPlayers([]);
        return;
      }

      setIsLoading(true);
      try {
        const players = await getMultiplePlayersByIds(reservation.waitingList);
        setWaitingPlayers(players);
      } catch (error) {
        console.error("Error fetching waiting list players:", error);
        toast({
          title: "Error",
          description: "Failed to load waiting list players",
          variant: "destructive",
        });
        
        // Fallback to localStorage approach
        const fallbackPlayers = reservation.waitingList.map((userId) => {
          try {
            const userString = localStorage.getItem(`user_${userId}`);
            if (userString) {
              const user = JSON.parse(userString);
              return {
                _id: userId,
                firstName: user.firstName || 'Unknown',
                lastName: user.lastName || 'Player',
                email: user.email || '',
              };
            }
          } catch (error) {
            console.error("Error parsing user from localStorage:", error);
          }

          return {
            _id: userId,
            firstName: 'User',
            lastName: userId.slice(0, 4),
            email: '',
          };
        });
        
        setWaitingPlayers(fallbackPlayers as PlayerProfile[]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitingListPlayers();
  }, [reservation.waitingList, toast]);

  if (!reservation.waitingList || reservation.waitingList.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
        <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No players on the waiting list
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-4">
        <h4 className="font-medium mb-3 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Waiting List ({reservation.waitingList.length})
        </h4>
        <div className="flex items-center justify-center p-4">
          <Loader className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading players...</span>
        </div>
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
              key={player._id}
              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm"
            >
              <div className="flex-1">
                <span className="font-medium">
                  {player.firstName} {player.lastName}
                </span>
                {player.email && (
                  <p className="text-xs text-gray-500">{player.email}</p>
                )}
                {player.preferredPosition && (
                  <p className="text-xs text-blue-600">{player.preferredPosition}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddPlayerFromWaitlist(player._id)}
                  className="h-8 text-xs"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRemoveFromWaitlist(player._id)}
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
