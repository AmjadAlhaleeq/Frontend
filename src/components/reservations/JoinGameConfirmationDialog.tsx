
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
import { UserPlus } from "lucide-react";

interface JoinGameConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gameName: string;
  gameDate: string;
  gameTime: string;
}

/**
 * JoinGameConfirmationDialog component
 * Shows a confirmation dialog when a user tries to join a game
 */
const JoinGameConfirmationDialog: React.FC<JoinGameConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  gameName,
  gameDate,
  gameTime
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Join this game?</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="mb-2">You are about to join:</p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-3">
              <p className="font-medium text-teal-700 dark:text-teal-400">{gameName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{gameDate} at {gameTime}</p>
            </div>
            <p>By joining, you commit to attending this game. Please cancel in advance if you can't make it.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-teal-600 hover:bg-teal-700">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Join Game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default JoinGameConfirmationDialog;
