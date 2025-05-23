
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Award,
  Check,
  Goal,
  Save,
  Shield,
  Star,
  Loader,
  Clipboard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Reservation } from "@/context/ReservationContext";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AddReservationSummaryProps {
  reservation: Reservation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSummary: (summary: any) => void;
}

/**
 * Component for adding stats and summary to a completed reservation
 */
const AddReservationSummary: React.FC<AddReservationSummaryProps> = ({
  reservation,
  open,
  onOpenChange,
  onSubmitSummary
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState({
    mvpPlayerId: "",
    mostGoalsPlayerId: "",
    mostAssistsPlayerId: "",
    bestDefenderPlayerId: "",
    matchNotes: "",
    finalScore: "",
  });

  const playerOptions = reservation.lineup || [];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      onSubmitSummary({
        ...summary,
        reservationId: reservation.id,
      });
      
      toast({
        title: "Summary Added",
        description: "The game summary has been successfully added.",
      });
      
      onOpenChange(false);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add game summary. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding summary:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Game Summary: {reservation.title || reservation.pitchName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add game stats and summary for record keeping and leaderboards
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="finalScore" className="flex items-center">
              <Clipboard className="h-4 w-4 mr-2 text-muted-foreground" />
              Final Score
            </Label>
            <Input
              id="finalScore"
              placeholder="e.g., Team A 3 - 2 Team B"
              value={summary.finalScore}
              onChange={(e) => setSummary({ ...summary, finalScore: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mvp" className="flex items-center">
              <Star className="h-4 w-4 mr-2 text-amber-500" />
              MVP (Most Valuable Player)
            </Label>
            <select
              id="mvp"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={summary.mvpPlayerId}
              onChange={(e) => setSummary({ ...summary, mvpPlayerId: e.target.value })}
            >
              <option value="">Select MVP</option>
              {playerOptions.map((player) => (
                <option key={`mvp-${player.userId}`} value={player.userId}>
                  {player.playerName || `Player ${player.userId.substring(0, 4)}`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topScorer" className="flex items-center">
              <Goal className="h-4 w-4 mr-2 text-green-500" />
              Top Goal Scorer
            </Label>
            <select
              id="topScorer"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={summary.mostGoalsPlayerId}
              onChange={(e) => setSummary({ ...summary, mostGoalsPlayerId: e.target.value })}
            >
              <option value="">Select Top Scorer</option>
              {playerOptions.map((player) => (
                <option key={`scorer-${player.userId}`} value={player.userId}>
                  {player.playerName || `Player ${player.userId.substring(0, 4)}`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topAssists" className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-blue-500" />
              Most Assists
            </Label>
            <select
              id="topAssists"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={summary.mostAssistsPlayerId}
              onChange={(e) => setSummary({ ...summary, mostAssistsPlayerId: e.target.value })}
            >
              <option value="">Select Player with Most Assists</option>
              {playerOptions.map((player) => (
                <option key={`assists-${player.userId}`} value={player.userId}>
                  {player.playerName || `Player ${player.userId.substring(0, 4)}`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="defender" className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-purple-500" />
              Best Defender
            </Label>
            <select
              id="defender"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={summary.bestDefenderPlayerId}
              onChange={(e) => setSummary({ ...summary, bestDefenderPlayerId: e.target.value })}
            >
              <option value="">Select Best Defender</option>
              {playerOptions.map((player) => (
                <option key={`defender-${player.userId}`} value={player.userId}>
                  {player.playerName || `Player ${player.userId.substring(0, 4)}`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center">
              <Clipboard className="h-4 w-4 mr-2 text-muted-foreground" />
              Match Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about the game..."
              value={summary.matchNotes}
              onChange={(e) => setSummary({ ...summary, matchNotes: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Summary
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReservationSummary;
