
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
import { Trash2, XCircle, Calendar as CalendarIcon, Clock } from "lucide-react"; // Renamed Calendar to CalendarIcon to avoid conflict
import { motion } from "framer-motion";

interface CancelConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pitchName: string;
  date: string;
  time: string;
}

const CancelConfirmationDialog: React.FC<CancelConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  pitchName,
  date,
  time,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border-0 shadow-lg max-w-md mx-auto">
        <AlertDialogHeader>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-red-600">Cancel Reservation</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-center px-4">
            Are you sure you want to cancel your reservation for{" "}
            <span className="font-semibold text-gray-800">{pitchName}</span>
            {" on "}
            <span className="font-semibold text-gray-800">{date}</span>
            {" at "}
            <span className="font-semibold text-gray-800">{time}</span>?
            <div className="mt-2 text-sm text-gray-500">
              This action cannot be undone and your spot will be made available to other players.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-red-50 p-4 rounded-md my-2">
          <div className="flex items-start">
            <CalendarIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" /> {/* Changed to CalendarIcon */}
            <div className="text-sm text-red-700">
              <span className="font-medium">Important:</span> Cancelling less than 24 hours before the game may affect your booking reputation.
            </div>
          </div>
        </div>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-800 transition-colors">
            Keep Reservation
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:scale-105"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Confirm Cancellation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelConfirmationDialog;
