
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
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { Reservation } from "@/types/reservation";

interface JoinWaitlistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reservation: Reservation;
  isLoading?: boolean;
}

const JoinWaitlistDialog: React.FC<JoinWaitlistDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reservation,
  isLoading = false,
}) => {
  const waitlistPosition = (reservation.waitList?.length || 0) + 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-amber-600" />
            Join Game (Waiting List)
          </DialogTitle>
          <DialogDescription>
            The game is full, but you can still join and will be automatically added to the waiting list.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
            <span className="font-medium text-amber-800 dark:text-amber-200">
              Game is Full
            </span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            You'll be automatically added to the waiting list and notified if a spot becomes available.
          </p>
        </div>

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
              (FULL)
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
            className="bg-amber-600 hover:bg-amber-700"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Join Waiting List
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinWaitlistDialog;
