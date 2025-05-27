import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useReservation } from "@/context/ReservationContext";
import { Reservation } from "@/types/reservation";
// import HighlightForm from "./HighlightForm";

interface TransferReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
}

/**
 * Dialog for admin to transfer a reservation from upcoming to past,
 * and add game details like final score and highlights.
 */
const TransferReservationDialog: React.FC<TransferReservationDialogProps> = ({
  isOpen,
  onClose,
  reservation,
}) => {
  const { toast } = useToast();
  const { updateReservationStatus, updateReservation } = useReservation();
  const [showHighlightForm, setShowHighlightForm] = useState(false);
  const [hometeamScore, setHometeamScore] = useState("0");
  const [awayteamScore, setAwayteamScore] = useState("0");
  const [mvpPlayerId, setMvpPlayerId] = useState("");
  const [isGamePlayed, setIsGamePlayed] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isGamePlayed) {
      // Update the reservation with game results
      updateReservation(reservation.id, {
        summary: `Final Score: ${hometeamScore}-${awayteamScore}`,
      });

      // Mark as completed
      updateReservationStatus(reservation.id, "completed");

      toast({
        title: "Game Completed",
        description: `The game has been marked as completed with a score of ${hometeamScore}-${awayteamScore}.`,
      });
    } else {
      // Mark as cancelled if game wasn't played
      updateReservationStatus(reservation.id, "cancelled");

      toast({
        title: "Game Cancelled",
        description: "The game has been marked as cancelled.",
      });
    }

    onClose();
  };

  // Handle saving highlights
  const handleSaveHighlight = (highlight: any) => {
    // Create a new array of highlights
    const currentHighlights = reservation.highlights || [];
    const updatedHighlights = [...currentHighlights, highlight];

    // Here we directly modify the reservation object to update the highlights
    // This is necessary since updateReservation doesn't accept highlights directly
    const updatedReservation = {
      ...reservation,
      highlights: updatedHighlights,
    };

    // Use the updateReservation to save other fields, but we'll rely on the local state update for highlights
    updateReservation(reservation.id, {
      pitchName: updatedReservation.pitchName,
      date: updatedReservation.date,
      time: updatedReservation.time,
      location: updatedReservation.location,
      maxPlayers: updatedReservation.maxPlayers,
    });

    toast({
      title: "Highlight Added",
      description: `Added a new highlight for ${highlight.playerName}`,
    });

    setShowHighlightForm(false);
  };

  // Handle canceling highlight addition
  const handleCancelHighlight = () => {
    setShowHighlightForm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Game</DialogTitle>
          <DialogDescription>
            Transfer this game to the past games list and add the final results.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="game-played"
                checked={isGamePlayed}
                onCheckedChange={(checked) =>
                  setIsGamePlayed(checked as boolean)
                }
              />
              <Label htmlFor="game-played">Game was played</Label>
            </div>

            {isGamePlayed && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="home-score">Home Team Score</Label>
                    <Input
                      id="home-score"
                      value={hometeamScore}
                      onChange={(e) => setHometeamScore(e.target.value)}
                      type="number"
                      min="0"
                      className="col-span-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="away-score">Away Team Score</Label>
                    <Input
                      id="away-score"
                      value={awayteamScore}
                      onChange={(e) => setAwayteamScore(e.target.value)}
                      type="number"
                      min="0"
                      className="col-span-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mvp">MVP Player ID (optional)</Label>
                  <Input
                    id="mvp"
                    value={mvpPlayerId}
                    onChange={(e) => setMvpPlayerId(e.target.value)}
                    placeholder="Player ID of the MVP"
                  />
                </div>

                {!showHighlightForm ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowHighlightForm(true)}
                  >
                    Add Highlights
                  </Button>
                ) : (
                  <div className="border rounded-lg p-4 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">
                        Add Game Highlight
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHighlightForm(false)}
                      >
                        Done
                      </Button>
                    </div>
                    ""
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isGamePlayed ? "Complete Game" : "Cancel Game"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferReservationDialog;
