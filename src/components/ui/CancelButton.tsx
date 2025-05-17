// components/CancelButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface CancelButtonProps {
  reservationId: number;
  onCancel: (id: number) => void;
}

const CancelButton = ({ reservationId, onCancel }: CancelButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfirmCancel = () => {
    onCancel(reservationId);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 group transition-colors"
      >
        <Trash2 className="h-4 w-4 mr-1 text-red-400 group-hover:text-red-600 transition-colors" />
        Cancel Reservation
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirm Cancellation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this reservation? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="secondary">Go Back</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CancelButton;
