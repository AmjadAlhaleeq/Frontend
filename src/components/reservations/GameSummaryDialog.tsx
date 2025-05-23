
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Loader, 
  Save,
  User,
  Star,
  Award,
  ShieldCheck,
  Goal,
  Zap
} from "lucide-react";
import { useReservation, Reservation } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";

interface GameSummaryDialogProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

// Define Player interface since it's missing from ReservationContext
interface Player {
  userId: string;
  playerName?: string;
  status: 'joined' | 'waiting';
}

interface PlayerStatUpdate {
  userId: string;
  playerName: string;
  goalsScored: number;
  assists: number;
  cleanSheet: boolean;
  mvp: boolean;
  win: boolean;
}

/**
 * GameSummaryDialog Component
 * Used by admins to add game summary and update player stats after a game is completed
 */
const GameSummaryDialog: React.FC<GameSummaryDialogProps> = ({
  reservation,
  isOpen,
  onClose,
  onSaveSuccess
}) => {
  const [summary, setSummary] = useState("");
  const [team1Score, setTeam1Score] = useState<string>("0");
  const [team2Score, setTeam2Score] = useState<string>("0");
  const [mvpUserId, setMvpUserId] = useState<string>("");
  const [playerStats, setPlayerStats] = useState<PlayerStatUpdate[]>(() => {
    // Initialize stats for all players who joined the game
    return reservation.lineup 
      ? reservation.lineup
          .filter(player => player.status === "joined")
          .map(player => ({
            userId: player.userId,
            playerName: player.playerName || `Player ${player.userId.slice(0, 4)}`,
            goalsScored: 0,
            assists: 0,
            cleanSheet: false,
            mvp: false,
            win: false
          }))
      : [];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { reservations, setReservations } = useReservation();
  
  // This function simulates updating game summary since it doesn't exist in context
  const updateGameSummary = async (reservationId: number, summaryData: any) => {
    // In a real app, this would update the backend
    // For now, we'll just simulate success
    return Promise.resolve();
  };
  
  // This function simulates updating player stats since it doesn't exist in context
  const updatePlayerStats = async (userId: string, statsUpdate: any) => {
    // In a real app, this would update the backend
    // For now, we'll just simulate success
    return Promise.resolve();
  };
  
  const handleUpdatePlayerStat = (userId: string, field: keyof PlayerStatUpdate, value: any) => {
    setPlayerStats(prevStats => 
      prevStats.map(stat => 
        stat.userId === userId 
          ? { ...stat, [field]: value } 
          : stat
      )
    );
    
    // If this player is set as MVP, update the mvpUserId
    if (field === 'mvp' && value === true) {
      setMvpUserId(userId);
      // Set all other players' MVP to false
      setPlayerStats(prevStats => 
        prevStats.map(stat => 
          stat.userId !== userId 
            ? { ...stat, mvp: false } 
            : stat
        )
      );
    }
  };
  
  const handleSubmit = async () => {
    if (!summary) {
      toast({
        title: "Missing summary",
        description: "Please provide a game summary before saving",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare game summary data
    const finalScore = `${team1Score}-${team2Score}`;
    const winner = parseInt(team1Score) > parseInt(team2Score) 
      ? "Team 1" 
      : parseInt(team2Score) > parseInt(team1Score)
        ? "Team 2"
        : "Draw";
    
    // Update game summary
    try {
      // Update the game summary in the context
      await updateGameSummary(reservation.id, {
        summary,
        finalScore,
        winner,
        mvpUserId
      });
      
      // Update each player's stats
      await Promise.all(
        playerStats.map(async (playerStat) => {
          await updatePlayerStats(playerStat.userId, {
            gamesPlayed: 1,
            goalsScored: playerStat.goalsScored,
            assists: playerStat.assists,
            cleanSheets: playerStat.cleanSheet ? 1 : 0,
            mvp: playerStat.mvp ? 1 : 0,
            wins: playerStat.win ? 1 : 0
          });
        })
      );
      
      // Update reservations to mark this one as having stats recorded
      const updatedReservations = reservations.map(res => {
        if (res.id === reservation.id) {
          return {
            ...res,
            hasGameSummary: true,
            gameSummary: {
              summary,
              finalScore,
              winner,
              mvpUserId
            }
          };
        }
        return res;
      });
      
      setReservations(updatedReservations);
      
      toast({
        title: "Summary Saved",
        description: "Game summary and player stats have been updated successfully",
      });
      
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving game summary:", error);
      toast({
        title: "Error",
        description: "Failed to save game summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" /> 
            Add Game Summary
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Game Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Game Summary*</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe how the game went..."
              className="min-h-[100px]"
              required
            />
          </div>
          
          {/* Game Score */}
          <div>
            <Label className="mb-2 block">Final Score</Label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label htmlFor="team1Score" className="text-xs text-muted-foreground block mb-1">Team 1</Label>
                <Input
                  id="team1Score"
                  type="number"
                  min="0"
                  value={team1Score}
                  onChange={(e) => setTeam1Score(e.target.value)}
                  className="w-full text-center"
                />
              </div>
              
              <div className="text-xl font-bold">-</div>
              
              <div className="flex-1">
                <Label htmlFor="team2Score" className="text-xs text-muted-foreground block mb-1">Team 2</Label>
                <Input
                  id="team2Score"
                  type="number"
                  min="0"
                  value={team2Score}
                  onChange={(e) => setTeam2Score(e.target.value)}
                  className="w-full text-center"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Player Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Player Statistics</h3>
            
            {playerStats.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No players joined this game</p>
            ) : (
              <div className="space-y-6">
                {/* MVP Selection */}
                <div>
                  <Label htmlFor="mvp" className="mb-2 block">Game MVP</Label>
                  <Select value={mvpUserId} onValueChange={setMvpUserId}>
                    <SelectTrigger id="mvp" className="w-full">
                      <SelectValue placeholder="Select MVP player" />
                    </SelectTrigger>
                    <SelectContent>
                      {playerStats.map(player => (
                        <SelectItem key={player.userId} value={player.userId}>
                          {player.playerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              
                <div className="grid gap-6">
                  {playerStats.map(player => (
                    <div key={player.userId} className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <User className="h-5 w-5 mr-2 text-gray-500" />
                          <span className="font-medium">{player.playerName}</span>
                        </div>
                        
                        {player.userId === mvpUserId && (
                          <div className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4 mr-1" />
                            <span className="text-sm">MVP</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor={`goals-${player.userId}`} className="text-xs block mb-1">
                            <Goal className="h-3 w-3 inline mr-1" /> Goals
                          </Label>
                          <Input
                            id={`goals-${player.userId}`}
                            type="number"
                            min="0"
                            value={player.goalsScored}
                            onChange={(e) => handleUpdatePlayerStat(
                              player.userId,
                              'goalsScored',
                              parseInt(e.target.value) || 0
                            )}
                            className="h-8"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`assists-${player.userId}`} className="text-xs block mb-1">
                            <Zap className="h-3 w-3 inline mr-1" /> Assists
                          </Label>
                          <Input
                            id={`assists-${player.userId}`}
                            type="number"
                            min="0"
                            value={player.assists}
                            onChange={(e) => handleUpdatePlayerStat(
                              player.userId,
                              'assists',
                              parseInt(e.target.value) || 0
                            )}
                            className="h-8"
                          />
                        </div>
                        
                        <div className="flex items-center col-span-2 sm:col-span-1">
                          <div className="flex items-center mr-4">
                            <input
                              type="checkbox"
                              id={`cleansheet-${player.userId}`}
                              checked={player.cleanSheet}
                              onChange={(e) => handleUpdatePlayerStat(
                                player.userId,
                                'cleanSheet',
                                e.target.checked
                              )}
                              className="mr-1.5 h-4 w-4"
                            />
                            <Label htmlFor={`cleansheet-${player.userId}`} className="text-xs cursor-pointer">
                              <ShieldCheck className="h-3 w-3 inline mr-1" /> Clean Sheet
                            </Label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`win-${player.userId}`}
                              checked={player.win}
                              onChange={(e) => handleUpdatePlayerStat(
                                player.userId,
                                'win',
                                e.target.checked
                              )}
                              className="mr-1.5 h-4 w-4"
                            />
                            <Label htmlFor={`win-${player.userId}`} className="text-xs cursor-pointer">
                              <Award className="h-3 w-3 inline mr-1" /> Win
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700"
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
      </DialogContent>
    </Dialog>
  );
};

export default GameSummaryDialog;
