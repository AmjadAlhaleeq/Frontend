
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader, Save, Award, Star, ClipboardCheck, Scissors } from "lucide-react";
import { Reservation } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the player type for summary
interface Player {
  userId: string;
  playerName: string;
  status: string;
  goals?: number;
  assists?: number;
  interceptions?: number;
  cleansheet?: boolean;
  mvp?: boolean;
  attended?: boolean;
  winner?: boolean;
}

interface GameSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  onUpdateSummary: (reservationId: number, summary: any, playerStats: any[]) => void;
}

/**
 * GameSummaryDialog component
 * Allows admins to add game summary and player stats after completion
 */
const GameSummaryDialog: React.FC<GameSummaryDialogProps> = ({
  isOpen,
  onClose,
  reservation,
  onUpdateSummary
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [homeScore, setHomeScore] = useState("0");
  const [awayScore, setAwayScore] = useState("0");
  const [currentPlayerView, setCurrentPlayerView] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState<Player[]>(() => {
    // Initialize player stats from lineup with default values
    return reservation.lineup?.map(player => ({
      ...player,
      goals: 0,
      assists: 0,
      interceptions: 0,
      cleansheet: false,
      mvp: false,
      attended: true,
      winner: false
    })) || [];
  });

  const handlePlayerStatChange = (userId: string, field: string, value: any) => {
    setPlayerStats(prev => prev.map(player => {
      if (player.userId === userId) {
        return { ...player, [field]: value };
      }
      return player;
    }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    try {
      // Create summary object
      const summary = {
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        completed: true,
        completedAt: new Date().toISOString()
      };
      
      // Call the update function from props
      onUpdateSummary(reservation.id, summary, playerStats);
      
      toast({
        title: "Summary Saved",
        description: "Game summary and player stats have been saved successfully",
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving game summary:", error);
      toast({
        title: "Error",
        description: "Failed to save game summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to determine if home team won based on scores
  const didHomeTeamWin = () => {
    const homeScoreNum = parseInt(homeScore);
    const awayScoreNum = parseInt(awayScore);
    return homeScoreNum > awayScoreNum;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ClipboardCheck className="h-5 w-5 mr-2 text-teal-600" />
            Game Summary
          </DialogTitle>
          <DialogDescription>
            Add game summary and player statistics for {reservation.title} on {reservation.date}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Score Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
            <h3 className="font-medium mb-3">Final Score</h3>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center space-y-2">
                <Label htmlFor="homeScore">Home</Label>
                <Input
                  id="homeScore"
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-16 text-center mx-auto"
                />
              </div>
              <div className="text-2xl font-bold">-</div>
              <div className="text-center space-y-2">
                <Label htmlFor="awayScore">Away</Label>
                <Input
                  id="awayScore"
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-16 text-center mx-auto"
                />
              </div>
            </div>
          </div>
          
          {/* Player Selection Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
            <h3 className="font-medium mb-3">Select Player to Update Stats</h3>
            <Select
              value={currentPlayerView || ''}
              onValueChange={(value) => setCurrentPlayerView(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a player" />
              </SelectTrigger>
              <SelectContent>
                {playerStats.map((player) => (
                  <SelectItem key={player.userId} value={player.userId}>
                    {player.playerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Individual Player Stats Section */}
          {currentPlayerView && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
              {playerStats.map((player) => {
                if (player.userId === currentPlayerView) {
                  return (
                    <div key={player.userId}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-lg">{player.playerName}</h3>
                        <div className="flex items-center">
                          <Checkbox
                            id={`attended-${player.userId}`}
                            checked={player.attended}
                            onCheckedChange={(checked) => 
                              handlePlayerStatChange(player.userId, "attended", checked === true)
                            }
                          />
                          <Label htmlFor={`attended-${player.userId}`} className="ml-2 text-sm">
                            Attended
                          </Label>
                        </div>
                      </div>
                      
                      {player.attended && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`goals-${player.userId}`} className="text-xs">Goals</Label>
                              <Input
                                id={`goals-${player.userId}`}
                                type="number"
                                min="0"
                                value={player.goals}
                                onChange={(e) => handlePlayerStatChange(
                                  player.userId, 
                                  "goals", 
                                  parseInt(e.target.value) || 0
                                )}
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`assists-${player.userId}`} className="text-xs">Assists</Label>
                              <Input
                                id={`assists-${player.userId}`}
                                type="number"
                                min="0"
                                value={player.assists}
                                onChange={(e) => handlePlayerStatChange(
                                  player.userId, 
                                  "assists", 
                                  parseInt(e.target.value) || 0
                                )}
                                className="h-8"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`interceptions-${player.userId}`} className="text-xs flex items-center">
                                Interceptions <Scissors className="h-3 w-3 ml-1" />
                              </Label>
                              <Input
                                id={`interceptions-${player.userId}`}
                                type="number"
                                min="0"
                                value={player.interceptions}
                                onChange={(e) => handlePlayerStatChange(
                                  player.userId, 
                                  "interceptions", 
                                  parseInt(e.target.value) || 0
                                )}
                                className="h-8"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center">
                              <Checkbox
                                id={`cleansheet-${player.userId}`}
                                checked={player.cleansheet}
                                onCheckedChange={(checked) => 
                                  handlePlayerStatChange(player.userId, "cleansheet", checked === true)
                                }
                              />
                              <Label htmlFor={`cleansheet-${player.userId}`} className="ml-2 text-sm">
                                Clean Sheet
                              </Label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox
                                id={`winner-${player.userId}`}
                                checked={player.winner}
                                onCheckedChange={(checked) => 
                                  handlePlayerStatChange(player.userId, "winner", checked === true)
                                }
                              />
                              <Label htmlFor={`winner-${player.userId}`} className="ml-2 text-sm">
                                Winner
                              </Label>
                            </div>
                          </div>
                          
                          <div className="flex items-center pt-2">
                            <Checkbox
                              id={`mvp-${player.userId}`}
                              checked={player.mvp}
                              onCheckedChange={(checked) => {
                                // Only one player can be MVP
                                if (checked) {
                                  setPlayerStats(prev => prev.map(p => ({
                                    ...p,
                                    mvp: p.userId === player.userId
                                  })));
                                } else {
                                  handlePlayerStatChange(player.userId, "mvp", false);
                                }
                              }}
                            />
                            <Label htmlFor={`mvp-${player.userId}`} className="ml-2 text-sm flex items-center">
                              MVP <Star className="h-3 w-3 ml-1 text-yellow-400" />
                            </Label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
          
          {/* Players Summary List */}
          <div>
            <h3 className="font-medium mb-3">Players Statistics</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {playerStats.map((player) => (
                <div key={player.userId} className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="font-medium">{player.playerName}</div>
                    {player.mvp && <Badge className="ml-2 bg-yellow-500">MVP</Badge>}
                    {!player.attended && <Badge className="ml-2 bg-red-500">Absent</Badge>}
                  </div>
                  {player.attended && (
                    <div className="text-xs text-gray-600">
                      G: {player.goals} | A: {player.assists} | Int: {player.interceptions || 0}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-teal-600 hover:bg-teal-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
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
