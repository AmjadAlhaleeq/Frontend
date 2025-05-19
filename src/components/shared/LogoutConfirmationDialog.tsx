
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
import { Button } from "@/components/ui/button"; // For styling the action button

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="dark:bg-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-white">Are you sure you want to log out?</AlertDialogTitle>
          <AlertDialogDescription className="dark:text-gray-400">
            You will be returned to the home page and will need to log in again to access your profile and reservations.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} className="dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            Cancel
          </AlertDialogCancel>
          {/* Apply Button variant styling for consistency */}
          <Button onClick={onConfirm} variant="destructive"> 
            Log Out
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmationDialog;
