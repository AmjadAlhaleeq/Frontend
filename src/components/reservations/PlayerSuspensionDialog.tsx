
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserX, UserMinus } from "lucide-react";

interface PlayerSuspensionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  playerId: string;
  onConfirm: (playerId: string, suspensionDays: number, reason: string) => void;
  actionType?: 'kick' | 'suspend';
}

/**
 * Dialog for admin to suspend/kick a player with reason and duration
 */
const PlayerSuspensionDialog: React.FC<PlayerSuspensionDialogProps> = ({
  isOpen,
  onClose,
  playerName,
  playerId,
  onConfirm,
  actionType = 'suspend'
}) => {
  const [suspensionDays, setSuspensionDays] = useState(1);
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      return;
    }
    
    onConfirm(playerId, suspensionDays, reason.trim());
    
    // Reset form
    setSuspensionDays(1);
    setReason("");
  };

  const getTitle = () => {
    return actionType === 'kick' ? 'Kick Player' : 'Suspend Player';
  };

  const getDescription = () => {
    return actionType === 'kick' 
      ? `Remove ${playerName} from this game and suspend them from future games.`
      : `Suspend ${playerName} from joining games for a specified period.`;
  };

  const getIcon = () => {
    return actionType === 'kick' ? <UserMinus className="h-4 w-4" /> : <UserX className="h-4 w-4" />;
  };

  const getButtonText = () => {
    return actionType === 'kick' ? 'Kick & Suspend Player' : 'Suspend Player';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suspension-days">Suspension Duration (Days)</Label>
              <Input
                id="suspension-days"
                type="number"
                min="1"
                max="365"
                value={suspensionDays}
                onChange={(e) => setSuspensionDays(parseInt(e.target.value) || 1)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Player will be suspended for {suspensionDays} day{suspensionDays > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for {actionType === 'kick' ? 'Kicking' : 'Suspension'}</Label>
              <Textarea
                id="reason"
                placeholder={`Enter the reason for ${actionType === 'kick' ? 'kicking' : 'suspending'} this player...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={!reason.trim()}
            >
              {getIcon()}
              {getButtonText()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSuspensionDialog;
