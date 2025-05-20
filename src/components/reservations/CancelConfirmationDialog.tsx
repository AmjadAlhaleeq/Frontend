
import React from 'react';
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

export interface CancelConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pitchName?: string;
  date?: string;
  time?: string;
}

/**
 * CancelConfirmationDialog component
 * Displays a confirmation dialog before cancelling a reservation
 */
const CancelConfirmationDialog: React.FC<CancelConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  pitchName = "this game",
  date = "the scheduled date",
  time = "the scheduled time"
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel your reservation for {pitchName} on {date} at {time}?
            <br /><br />
            This action cannot be undone and will notify all players who have joined.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Yes, Cancel Game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelConfirmationDialog;
