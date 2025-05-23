
import React from "react";
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
import { Users, AlertTriangle } from "lucide-react";

interface WaitlistConfirmationDialogProps {
  isOpen: boolean;  // Changed from open
  onClose: () => void;
  onConfirm: () => void;
  gameTitle: string;
  isJoining: boolean;
}

/**
 * WaitlistConfirmationDialog component
 * Shows a confirmation dialog when a user tries to join or leave a waitlist
 */
const WaitlistConfirmationDialog: React.FC<WaitlistConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  gameTitle,
  isJoining
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            {isJoining ? (
              <>
                <Users className="mr-2 h-5 w-5 text-amber-500" />
                Join Waiting List
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                Leave Waiting List
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isJoining ? (
              <>
                <p className="mb-2">You are about to join the waiting list for:</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-3">
                  <p className="font-medium text-amber-600 dark:text-amber-400">{gameTitle}</p>
                </div>
                <p>You'll be notified if a spot becomes available. You can leave the waiting list at any time.</p>
              </>
            ) : (
              <>
                <p className="mb-2">You are about to leave the waiting list for:</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-3">
                  <p className="font-medium text-amber-600 dark:text-amber-400">{gameTitle}</p>
                </div>
                <p>You'll lose your position in the waiting list. Are you sure?</p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isJoining ? "Join Waiting List" : "Leave Waiting List"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WaitlistConfirmationDialog;
