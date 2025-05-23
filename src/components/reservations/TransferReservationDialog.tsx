
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useReservation, Reservation } from "@/context/ReservationContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransferReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReservation: Reservation | null;
  onConfirm: () => void;
}

/**
 * TransferReservationDialog component
 * Allows an admin to transfer all players from one reservation to another
 */
const TransferReservationDialog: React.FC<TransferReservationDialogProps> = ({
  isOpen,
  onClose,
  selectedReservation,
  onConfirm
}) => {
  const { toast } = useToast();
  const { reservations, editReservation } = useReservation();
  const [targetReservation, setTargetReservation] = useState<Reservation | null>(null);

  const handleConfirm = () => {
    if (!selectedReservation || !targetReservation) return;
    
    // Get the data we want to transfer
    const dataToTransfer: Partial<Reservation> = {
      lineup: selectedReservation.lineup,
      playersJoined: selectedReservation.playersJoined,
      waitingList: selectedReservation.waitingList,
      // Only include summary if it exists
      ...(selectedReservation.summary && { summary: selectedReservation.summary })
    };
    
    // Update the target reservation with the transferred data
    editReservation(targetReservation.id, dataToTransfer);
    
    // Close the dialog and confirm the transfer
    onClose();
    onConfirm();
  };

  const filteredReservations = [...reservations]
    .filter(res => 
      res.id !== selectedReservation?.id &&
      !res.highlights &&
      res.status !== 'cancelled'
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Players</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="target-reservation" className="text-right text-sm font-medium leading-none text-gray-800 dark:text-gray-100 col-span-1">
              Target Reservation
            </label>
            <Select onValueChange={(value) => setTargetReservation(reservations.find(r => r.id === Number(value)) || null)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a reservation to transfer to" />
              </SelectTrigger>
              <SelectContent>
                {filteredReservations.map((reservation) => (
                  <SelectItem key={reservation.id} value={reservation.id.toString()}>
                    {reservation.title || reservation.pitchName} - {reservation.date} at {reservation.time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleConfirm}>Confirm Transfer</Button>
      </DialogContent>
    </Dialog>
  );
};

export default TransferReservationDialog;
