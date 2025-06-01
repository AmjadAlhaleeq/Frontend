
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
      // Handle waitList format consistently
      const waitList = (reservation as any).waitList || [];
      
      console.log('Raw waitList from reservation:', waitList);
      console.log('Reservation object:', reservation);
      
      if (!waitList || waitList.length === 0) {
        console.log('No waiting list data found');
        setWaitingPlayers([]);
        return;
      }

      setIsLoading(true);
      try {
        // Check if waitList contains full player objects (backend format)
        if (waitList[0] && typeof waitList[0] === 'object' && waitList[0]._id) {
          console.log('Using backend format with full player objects');
          // Backend format: waitList contains full player objects with complete info
          const players = waitList.map((player: any) => ({
            _id: player._id,
            firstName: player.firstName,
            lastName: player.lastName,
            email: player.email || '',
            phoneNumber: player.phone || player.phoneNumber || '',
            city: player.city || '',
            age: player.age,
            profilePicture: player.profilePicture,
            preferredPosition: player.preferredPosition || '',
            bio: player.bio || '',
          }));
          console.log('Processed players from backend format:', players);
          setWaitingPlayers(players);
        } else if (typeof waitList[0] === 'string') {
          console.log('Using frontend format with player IDs');
          // Frontend format: waitList contains user IDs, need to fetch player details
          const playerIds = waitList.filter((id: any) => typeof id === 'string');
          if (playerIds.length > 0) {
            const players = await getMultiplePlayersByIds(playerIds);
            console.log('Fetched players for IDs:', players);
            setWaitingPlayers(players);
          }
        } else {
          console.log('Unknown waitList format:', waitList);
          console.log('First item type:', typeof waitList[0]);
          console.log('First item value:', waitList[0]);
          setWaitingPlayers([]);
        }
      } catch (error) {
        console.error("Error fetching waiting list players:", error);
        toast({
          title: "Error",
          description: "Failed to load waiting list players",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitingListPlayers();
  }, [reservation, toast]);

  // Get waitList consistently
  const waitList = (reservation as any).waitList || [];
  
  console.log('Final waitList for display:', waitList);
  console.log('Processed waiting players:', waitingPlayers);
  
  if (!waitList || waitList.length === 0) {
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
          Waiting List ({waitList.length})
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
