import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  X,
  ChevronRight,
  Award,
  Star,
  UserX,
  AlertTriangle,
  Trash2,
  Edit,
  Goal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Reservation } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";
import SuspendPlayerForm from "./SuspendPlayerForm";
import HighlightForm from "./HighlightForm";
import HighlightsList from "./HighlightsList";
import CancelConfirmationDialog from "./CancelConfirmationDialog";
import TransferReservationDialog from "./TransferReservationDialog";

interface GameDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation;
}

const GameDetailsDialog: React.FC<GameDetailsDialogProps> = ({
  open,
  onOpenChange,
  reservation,
}) => {
  const { toast } = useToast();
  const [isPlayerSuspensionOpen, setIsPlayerSuspensionOpen] = useState(false);
  const [isHighlightFormOpen, setIsHighlightFormOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handleOpenSuspendPlayer = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setIsPlayerSuspensionOpen(true);
  };

  const handlePlayerSuspension = (playerId: string, reason: string) => {
    // Implement suspension logic here
    toast({
      title: "Player Suspended",
      description: `Player ${playerId} has been suspended for: ${reason}`,
    });
    setIsPlayerSuspensionOpen(false);
  };

  const handleRemovePlayer = (playerId: string) => {
    // Implement remove player logic here
    toast({
      title: "Player Removed",
      description: `Player ${playerId} has been removed from the game.`,
    });
  };

  const handleCancelReservation = () => {
    // Implement cancel reservation logic here
    toast({
      title: "Reservation Cancelled",
      description: "This reservation has been cancelled.",
    });
    onOpenChange(false);
  };

  const handleTransferReservation = (newReservationId: string) => {
    // Implement transfer reservation logic here
    toast({
      title: "Reservation Transferred",
      description: `Reservation has been transferred to ${newReservationId}.`,
    });
    setIsTransferDialogOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Game Details</h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Game Info */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <CalendarDays className="h-5 w-5 text-gray-500" />
              <span>{reservation.date}</span>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <span>{reservation.time}</span>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span>{reservation.location}</span>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <Users className="h-5 w-5 text-gray-500" />
              <span>
                {reservation.playersJoined} / {reservation.maxPlayers} Players
              </span>
            </div>

            <Separator className="my-4" />

            <h3 className="text-md font-semibold mb-2">Players Joined</h3>
            <div className="space-y-3">
              {reservation.lineup.map((player) => (
                <div key={player.userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${player.playerName}`} />
                      <AvatarFallback>{player.playerName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{player.playerName}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenSuspendPlayer(player.userId)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemovePlayer(player.userId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Game Management */}
          <div>
            <h3 className="text-md font-semibold mb-2">Game Management</h3>
            <div className="space-y-3">
              <Button onClick={() => setIsHighlightFormOpen(true)} className="w-full">
                Add Highlight
              </Button>
              <Button className="w-full">Edit Game Details</Button>
              <Button onClick={() => setIsTransferDialogOpen(true)} className="w-full">
                Transfer Reservation
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsCancelDialogOpen(true)}
                className="w-full"
              >
                Cancel Game
              </Button>
            </div>

            <Separator className="my-4" />

            <h3 className="text-md font-semibold mb-2">Game Highlights</h3>
            <HighlightsList highlights={reservation.highlights} />
          </div>
        </div>

        {/* Highlight Form Dialog */}
        <HighlightForm
          open={isHighlightFormOpen}
          onOpenChange={setIsHighlightFormOpen}
        />

        {/* Suspend Player Dialog */}
        <SuspendPlayerForm
          open={isPlayerSuspensionOpen}
          onOpenChange={setIsPlayerSuspensionOpen}
          playerId={selectedPlayerId}
          onSuspend={handlePlayerSuspension}
        />

        {/* Cancel Confirmation Dialog */}
        <CancelConfirmationDialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          onConfirm={handleCancelReservation}
        />

        {/* Transfer Reservation Dialog */}
        <TransferReservationDialog
          open={isTransferDialogOpen}
          onOpenChange={setIsTransferDialogOpen}
          onConfirm={handleTransferReservation}
        />
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsDialog;
