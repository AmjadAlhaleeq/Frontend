
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader, ShieldAlert, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define player interface since it's missing from ReservationContext
interface Player {
  userId: string;
  playerName?: string;
  status: 'joined' | 'waiting';
}

interface SuspendPlayerDialogProps {
  players?: Player[]; // Make this optional to support both usage patterns
  playerId?: string;  // Add this to support direct player ID passing
  playerName?: string; // Add player name for direct access
  playerEmail?: string; // Add player email for direct access
  isOpen: boolean;
  onClose: () => void;
  onSuspend: (playerId: string, reason: string) => Promise<void>;
}

/**
 * SuspendPlayerDialog Component
 * Used by admins to suspend players after a game is completed
 */
const SuspendPlayerDialog: React.FC<SuspendPlayerDialogProps> = ({
  players = [],
  playerId: initialPlayerId = "",
  playerName: initialPlayerName = "",
  isOpen,
  onClose,
  onSuspend
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(initialPlayerId);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const { toast } = useToast();
  
  // If we have a direct playerId passed, use that (for backward compatibility)
  React.useEffect(() => {
    if (initialPlayerId) {
      setSelectedPlayerId(initialPlayerId);
    }
  }, [initialPlayerId]);
  
  const handleSubmit = async () => {
    if (!selectedPlayerId) {
      toast({
        title: "No player selected",
        description: "Please select a player to suspend",
        variant: "destructive"
      });
      return;
    }
    
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for the suspension",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSuspend(selectedPlayerId, reason);
      toast({
        title: "Player Suspended",
        description: "The player has been suspended successfully",
      });
      
      // Reset form and close dialog
      setSelectedPlayerId("");
      setReason("");
      onClose();
    } catch (error) {
      console.error("Error suspending player:", error);
      toast({
        title: "Error",
        description: "Failed to suspend player. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShieldAlert className="h-5 w-5 mr-2 text-red-500" />
            Suspend Player
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="player-select">Select Player*</Label>
            {/* Show selection dropdown only if we have a player list and no direct player ID */}
            {players.length > 0 && !initialPlayerId ? (
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger id="player-select">
                  <SelectValue placeholder="Select a player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map(player => (
                    <SelectItem key={player.userId} value={player.userId}>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        {player.playerName || `Player ${player.userId.slice(0, 4)}`}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              // Just show the player name if it's directly passed
              <div className="px-3 py-2 border rounded-md flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                {initialPlayerName || `Player ${selectedPlayerId.slice(0, 4)}`}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="suspension-reason">Reason for Suspension*</Label>
            <Textarea
              id="suspension-reason"
              placeholder="Explain why this player is being suspended..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This information will be visible to the player and administrators.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedPlayerId || !reason.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Suspend Player"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuspendPlayerDialog;
