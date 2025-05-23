
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Ban, AlertTriangle } from "lucide-react";

interface SuspendPlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuspend: (reason: string, duration: number) => void;
  playerName: string;
  playerEmail: string;
}

// Suspension reasons
const SUSPENSION_REASONS = [
  "No-show without notification",
  "Repeated cancellations",
  "Unsportsmanlike conduct",
  "Aggressive behavior",
  "Payment issues",
  "Other (please specify)"
];

// Suspension durations in days
const SUSPENSION_DURATIONS = [
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
  { value: 30, label: "1 month" },
  { value: 90, label: "3 months" },
  { value: 180, label: "6 months" },
  { value: 365, label: "1 year" }
];

/**
 * SuspendPlayerDialog component
 * Allows admins to suspend players with a reason and duration
 */
const SuspendPlayerDialog: React.FC<SuspendPlayerDialogProps> = ({
  isOpen,
  onClose,
  onSuspend,
  playerName,
  playerEmail
}) => {
  const [selectedReason, setSelectedReason] = useState<string | undefined>();
  const [customReason, setCustomReason] = useState("");
  const [suspensionDuration, setSuspensionDuration] = useState<string>("7");
  
  const handleSuspend = () => {
    // Determine the reason text
    const finalReason = selectedReason === "Other (please specify)" 
      ? customReason 
      : selectedReason || "";
    
    if (!finalReason) {
      // Could add validation here
      return;
    }
    
    // Call the onSuspend handler with the reason and duration
    onSuspend(finalReason, parseInt(suspensionDuration));
    
    // Reset the form
    setSelectedReason(undefined);
    setCustomReason("");
    setSuspensionDuration("7");
    onClose();
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Suspend Player
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mb-4">
              <p>You are about to suspend player:</p>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md my-2">
                <p className="font-medium">{playerName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{playerEmail}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This player will be unable to join games for the selected duration.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="suspensionReason" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Reason for suspension*
                </label>
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger id="suspensionReason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUSPENSION_REASONS.map(reason => (
                      <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedReason === "Other (please specify)" && (
                  <Textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please provide details..."
                    className="mt-2"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="suspensionDuration" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Suspension duration*
                </label>
                <Select value={suspensionDuration} onValueChange={setSuspensionDuration}>
                  <SelectTrigger id="suspensionDuration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUSPENSION_DURATIONS.map(duration => (
                      <SelectItem key={duration.value} value={duration.value.toString()}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSuspend}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Ban className="h-4 w-4 mr-1.5" />
            Suspend Player
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SuspendPlayerDialog;
