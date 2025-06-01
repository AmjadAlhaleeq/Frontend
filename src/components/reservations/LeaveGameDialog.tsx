
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
import LoadingButton from "@/components/ui/loading-button";
import { UserMinus, AlertTriangle, Calendar, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LeaveGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gameName: string;
  gameDate: string;
  gameTime: string;
  isPenalty: boolean;
  timeToGame?: string;
  cannotLeave?: boolean;
  isLoading?: boolean;
}

const LeaveGameDialog: React.FC<LeaveGameDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  gameName,
  gameDate,
  gameTime,
  isPenalty,
  timeToGame,
  cannotLeave = false,
  isLoading = false
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={isPenalty || cannotLeave ? "text-red-600" : ""}>
            {cannotLeave ? (
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Cannot Leave Game
              </div>
            ) : isPenalty ? (
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Warning: Penalty May Apply
              </div>
            ) : (
              "Leave this game?"
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <p className="mb-2">You are about to leave:</p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-3">
              <p className="font-medium text-teal-700 dark:text-teal-400">{gameName}</p>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  {gameDate}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {gameTime}
                </div>
              </div>
            </div>
            
            {cannotLeave ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-3 rounded-md mb-3">
                <p className="text-red-600 dark:text-red-400 font-medium">Cannot Leave Game</p>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  You cannot leave a game less than 6 hours before it starts ({timeToGame} remaining).
                  Please contact the admin if you have an emergency.
                </p>
              </div>
            ) : isPenalty ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-3 rounded-md mb-3">
                <p className="text-red-600 dark:text-red-400 font-medium">Penalty Warning</p>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  You're leaving with less than 6 hours before the game starts ({timeToGame} remaining).
                  This may result in penalties such as temporary suspension from future games.
                </p>
              </div>
            ) : (
              <p>Are you sure you want to leave this game?</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          {!cannotLeave && (
            <LoadingButton
              onClick={onConfirm}
              loading={isLoading}
              className={isPenalty ? 
                "bg-red-600 hover:bg-red-700 text-white" : 
                "bg-amber-600 hover:bg-amber-700 text-white"
              }
            >
              <UserMinus className="h-4 w-4 mr-1.5" />
              {isPenalty ? "Leave Anyway" : "Leave Game"}
            </LoadingButton>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeaveGameDialog;
