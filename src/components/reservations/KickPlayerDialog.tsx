
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserMinus, Loader } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface KickPlayerDialogProps {
  playerId: string;
  playerName: string;
  email: string;
  gameTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKick: (playerId: string, reason: string) => void;
}

/**
 * Dialog for kicking players from a specific game with reason
 */
const KickPlayerDialog: React.FC<KickPlayerDialogProps> = ({
  playerId,
  playerName,
  email,
  gameTitle,
  open,
  onOpenChange,
  onKick
}) => {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast({
        title: "Missing reason",
        description: "Please provide a reason for removing this player",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      onKick(playerId, reason);
      toast({
        title: "Player removed",
        description: `${playerName} has been removed from the game.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove player. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form when dialog closes
  const handleCloseChange = (isOpen: boolean) => {
    if (!isOpen) {
      setReason("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <UserMinus className="mr-2 h-5 w-5 text-red-500" />
            Remove Player from Game
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Player:</p>
            <p className="text-sm">{playerName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Game:</p>
            <p className="text-sm">{gameTitle}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="kickReason">Reason for Removal</Label>
            <Textarea
              id="kickReason"
              placeholder="Please provide a reason for removing this player..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleCloseChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove Player
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KickPlayerDialog;
