
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/ui/loading-button";
import { Calendar, Clock, MapPin, Users, UserPlus } from "lucide-react";
import { Reservation } from "@/types/reservation";

interface JoinGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reservation: Reservation;
  isLoading?: boolean;
}

const JoinGameDialog: React.FC<JoinGameDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reservation,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-green-600" />
            Join Game
          </DialogTitle>
          <DialogDescription>
            Confirm that you want to join this game
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-teal-700 dark:text-teal-400">
            {reservation.pitchName || reservation.title}
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-2" />
              {reservation.date}
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-2" />
              {reservation.time}
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-2" />
              {reservation.location}
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4 mr-2" />
              {reservation.playersJoined}/{reservation.maxPlayers} players
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton
            onClick={onConfirm}
            loading={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Join Game
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGameDialog;
