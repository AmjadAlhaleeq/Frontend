
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
import { UserPlus, UserMinus } from "lucide-react";

interface WaitlistConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gameName: string;
  gameDate: string;
  gameTime: string;
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
  gameName,
  gameDate,
  gameTime,
  isJoining
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isJoining ? "Join waiting list?" : "Leave waiting list?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <p className="mb-2">
              {isJoining 
                ? "You are about to join the waiting list for:" 
                : "You are about to leave the waiting list for:"}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-3">
              <p className="font-medium text-teal-700 dark:text-teal-400">{gameName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{gameDate} at {gameTime}</p>
            </div>
            {isJoining ? (
              <p>You'll be notified if a spot becomes available.</p>
            ) : (
              <p>You'll no longer be in line for this game if spots open up.</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className={isJoining ? "bg-teal-600 hover:bg-teal-700" : "bg-amber-600 hover:bg-amber-700"}
          >
            {isJoining ? (
              <>
                <UserPlus className="h-4 w-4 mr-1.5" />
                Join Waiting List
              </>
            ) : (
              <>
                <UserMinus className="h-4 w-4 mr-1.5" />
                Leave Waiting List
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WaitlistConfirmationDialog;
