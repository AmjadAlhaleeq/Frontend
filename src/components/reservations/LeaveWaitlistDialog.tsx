
import React from 'react';
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
import { Calendar, Clock, UserMinus, AlertTriangle } from "lucide-react";
import { Reservation } from "@/types/reservation";

interface LeaveWaitlistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reservation: Reservation;
  isLoading?: boolean;
}

const LeaveWaitlistDialog: React.FC<LeaveWaitlistDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reservation,
  isLoading = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserMinus className="h-5 w-5 mr-2 text-red-600" />
            Leave Waiting List
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to leave the waiting list?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
            <span className="font-medium text-red-800 dark:text-red-200">Warning</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">
            You'll lose your position and won't be notified if spots become available
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-teal-700 dark:text-teal-400">
            {reservation.pitchName || reservation.title}
          </h3>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-2" />
            {reservation.date}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            {reservation.time}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={onConfirm}
            loading={isLoading}
          >
            <UserMinus className="h-4 w-4 mr-1" />
            Leave Waiting List
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveWaitlistDialog;
