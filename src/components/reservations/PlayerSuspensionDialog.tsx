import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Loader } from "lucide-react";

interface PlayerSuspensionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  playerId: string;
  onConfirm: (playerId: string, days: number, reason: string) => void;
}

const PlayerSuspensionDialog: React.FC<PlayerSuspensionDialogProps> = ({
  isOpen,
  onClose,
  playerName,
  playerId,
  onConfirm
}) => {
  const { toast } = useToast();
  const [suspensionDays, setSuspensionDays] = useState("1");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason for suspension.",
        variant: "destructive",
      });
      return;
    }

    const days = parseInt(suspensionDays);
    if (days < 1 || days > 365) {
      toast({
        title: "Invalid Duration",
        description: "Suspension days must be between 1 and 365.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onConfirm(playerId, days, reason);
      
      toast({
        title: "Player Kicked & Suspended",
        description: `${playerName} has been kicked from the game and suspended for ${days} day${days > 1 ? 's' : ''}.`,
      });
      
      setReason("");
      setSuspensionDays("1");
      onClose();
    } catch (error) {
      toast({
        title: "Failed to Kick Player",
        description: error instanceof Error ? error.message : "Failed to kick and suspend the player",
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
            <AlertTriangle className="h-5 w-5 mr-2" />
            Kick & Suspend Player
          </DialogTitle>
          <DialogDescription>
            Remove {playerName} from this game and suspend them from joining future games.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suspension-days">Suspension Duration</Label>
            <Select value={suspensionDays} onValueChange={setSuspensionDays}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">1 week</SelectItem>
                <SelectItem value="14">2 weeks</SelectItem>
                <SelectItem value="30">1 month</SelectItem>
                <SelectItem value="90">3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-days">Custom Days (optional)</Label>
            <Input
              id="custom-days"
              type="number"
              min="1"
              max="365"
              value={suspensionDays}
              onChange={(e) => setSuspensionDays(e.target.value)}
              placeholder="Enter custom number of days"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Suspension *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the reason for suspension (e.g., unsportsmanlike conduct, no-show, etc.)"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting && <Loader className="h-4 w-4 mr-2 animate-spin" />}
            Kick & Suspend Player
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSuspensionDialog;
