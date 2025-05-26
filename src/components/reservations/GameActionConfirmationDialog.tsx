
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
import { UserPlus, UserMinus, Clock, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

interface GameActionConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'join' | 'leave';
  gameName: string;
  gameDate: string;
  gameTime: string;
  gameLocation?: string;
  price?: number;
}

/**
 * Confirmation dialog for joining or leaving a game
 * Provides clear game details and action confirmation
 */
const GameActionConfirmationDialog: React.FC<GameActionConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  gameName,
  gameDate,
  gameTime,
  gameLocation,
  price
}) => {
  const isJoining = action === 'join';
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isJoining ? (
              <>
                <UserPlus className="h-5 w-5 text-teal-600" />
                Join Game?
              </>
            ) : (
              <>
                <UserMinus className="h-5 w-5 text-red-600" />
                Leave Game?
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                {isJoining 
                  ? "You are about to join this game:" 
                  : "Are you sure you want to leave this game?"}
              </p>
              
              {/* Game Details Card */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-teal-700 dark:text-teal-400">
                  {gameName}
                </h4>
                
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(new Date(gameDate), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{gameTime}</span>
                  </div>
                  
                  {gameLocation && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{gameLocation}</span>
                    </div>
                  )}
                  
                  {price && isJoining && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Price: {price} JD per player</span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isJoining 
                  ? "By joining, you commit to attending this game. Please cancel in advance if you can't make it."
                  : "Your spot will become available for other players on the waiting list."}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={isJoining 
              ? "bg-teal-600 hover:bg-teal-700" 
              : "bg-red-600 hover:bg-red-700"}
          >
            {isJoining ? (
              <>
                <UserPlus className="h-4 w-4 mr-1.5" />
                Join Game
              </>
            ) : (
              <>
                <UserMinus className="h-4 w-4 mr-1.5" />
                Leave Game
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GameActionConfirmationDialog;
