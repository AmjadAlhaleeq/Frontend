
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

export interface SuspendPlayerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string | null;
  onSuspend: (playerId: string, reason: string) => void;
}

/**
 * SuspendPlayerForm component
 * Form dialog for suspending a player with a reason
 */
const SuspendPlayerForm: React.FC<SuspendPlayerFormProps> = ({
  open,
  onOpenChange,
  playerId,
  onSuspend,
}) => {
  const [reasonType, setReasonType] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerId && (reasonType || customReason)) {
      const finalReason = reasonType === "other" ? customReason : reasonType;
      onSuspend(playerId, finalReason);
      resetForm();
    }
  };

  const resetForm = () => {
    setReasonType("");
    setCustomReason("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-amber-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Suspend Player
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label className="text-base">Player ID: {playerId}</Label>
              <p className="text-sm text-muted-foreground mt-1">
                This player will be suspended from future games until an admin lifts the suspension.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reasonType">Suspension Reason</Label>
              <Select value={reasonType} onValueChange={setReasonType}>
                <SelectTrigger id="reasonType">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unsportsmanlike_conduct">Unsportsmanlike Conduct</SelectItem>
                  <SelectItem value="repeated_absences">Repeated Absences</SelectItem>
                  <SelectItem value="payment_issue">Payment Issue</SelectItem>
                  <SelectItem value="violent_behavior">Violent Behavior</SelectItem>
                  <SelectItem value="other">Other (Please Specify)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {reasonType === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customReason">Custom Reason</Label>
                <Textarea
                  id="customReason"
                  placeholder="Please provide details about the suspension reason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!reasonType || (reasonType === "other" && !customReason)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Suspend Player
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SuspendPlayerForm;
