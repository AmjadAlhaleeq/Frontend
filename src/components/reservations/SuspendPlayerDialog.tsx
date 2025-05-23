
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation } from "@/context/ReservationContext";
import { sendPlayerSuspensionNotification } from "@/utils/emailNotifications";
import { format, addDays } from "date-fns";

interface SuspendPlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName: string;
  playerEmail: string;
}

/**
 * Dialog component for suspending a player
 * Used by admins to suspend players with a reason and duration
 * Sends a notification email to the suspended player
 */
const SuspendPlayerDialog: React.FC<SuspendPlayerDialogProps> = ({
  isOpen,
  onClose,
  playerId,
  playerName,
  playerEmail
}) => {
  const [duration, setDuration] = useState<number>(7);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { suspendPlayer } = useReservation();
  
  const handleSuspend = async () => {
    if (!reason.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a reason for suspension",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate end date for email notification
      const endDate = format(addDays(new Date(), duration), "MMMM d, yyyy");
      
      // Call the context function to suspend player
      suspendPlayer(playerId, duration, reason);
      
      // Send email notification to the player
      await sendPlayerSuspensionNotification(
        playerEmail, 
        { duration, reason, endDate }
      );
      
      toast({
        title: "Player suspended",
        description: `${playerName} has been suspended for ${duration} days and notified via email.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error suspending player:", error);
      toast({
        title: "Action failed",
        description: "Failed to suspend player. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <Ban className="mr-2 h-5 w-5" />
            Suspend Player
          </DialogTitle>
          <DialogDescription>
            This will temporarily block {playerName} from joining games for {duration} days.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md flex items-start space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="text-sm text-red-700 dark:text-red-300">
            A notification email will be sent to {playerEmail} explaining the suspension.
          </div>
        </div>
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="duration">Suspension Duration</Label>
            <Select 
              value={duration.toString()} 
              onValueChange={(value) => setDuration(parseInt(value, 10))}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for Suspension</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this player is being suspended"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSuspend} 
            variant="destructive"
            disabled={isSubmitting || !reason.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Suspending...</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              <>Confirm Suspension</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuspendPlayerDialog;
