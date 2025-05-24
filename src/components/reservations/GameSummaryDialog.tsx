
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Reservation, Player } from "@/context/ReservationContext";
import { Trophy, Target, Users, Award } from "lucide-react";

interface GameSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  onUpdateSummary: (reservationId: number, summary: any, playerStats: Player[]) => void;
}

interface PlayerStats {
  userId: string;
  playerName: string;
  goals: number;
  assists: number;
  interceptions: number;
  winLoss: 'win' | 'loss' | 'draw';
  mvp: boolean;
  cleansheet: boolean;
  attended: boolean;
}

const GameSummaryDialog: React.FC<GameSummaryDialogProps> = ({
  isOpen,
  onClose,
  reservation,
  onUpdateSummary,
}) => {
  const { toast } = useToast();
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [mvpPlayerId, setMvpPlayerId] = useState<string>("");
  
  // Initialize player stats
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>(
    reservation.lineup?.map(player => ({
      userId: player.userId,
      playerName: player.playerName,
      goals: 0,
      assists: 0,
      interceptions: 0,
      winLoss: 'draw' as 'win' | 'loss' | 'draw',
      mvp: false,
      cleansheet: false,
      attended: true,
    })) || []
  );

  const updatePlayerStat = (userId: string, field: keyof PlayerStats, value: any) => {
    setPlayerStats(prev => prev.map(player => 
      player.userId === userId 
        ? { ...player, [field]: value }
        : field === 'mvp' && value === true 
          ? { ...player, mvp: false } // Only one MVP
          : player
    ));

    // Update MVP player ID when MVP is selected
    if (field === 'mvp' && value === true) {
      setMvpPlayerId(userId);
    }
  };

  const handleSubmit = () => {
    // Validate that MVP is selected
    const mvpPlayer = playerStats.find(p => p.mvp);
    if (!mvpPlayer) {
      toast({
        variant: "destructive",
        title: "MVP Required",
        description: "Please select an MVP for this game.",
      });
      return;
    }

    // Create summary object
    const summary = {
      homeScore,
      awayScore,
      completed: true,
      completedAt: new Date().toISOString(),
      mvpPlayerId: mvpPlayer.userId,
    };

    // Convert player stats to Player format
    const updatedPlayers: Player[] = playerStats.map(stat => ({
      userId: stat.userId,
      playerName: stat.playerName,
      status: 'joined',
      goals: stat.goals,
      assists: stat.assists,
      cleansheet: stat.cleansheet,
      mvp: stat.mvp,
      attended: stat.attended,
    }));

    onUpdateSummary(reservation.id, summary, updatedPlayers);
    
    toast({
      title: "Game Summary Added",
      description: "Player stats have been recorded successfully.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Game Summary - {reservation.title || reservation.pitchName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Game Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Final Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <Label htmlFor="homeScore">Home Team</Label>
                  <Input
                    id="homeScore"
                    type="number"
                    value={homeScore}
                    onChange={(e) => setHomeScore(Number(e.target.value))}
                    className="w-20 text-center text-2xl font-bold mt-1"
                    min="0"
                  />
                </div>
                <div className="text-4xl font-bold text-gray-400">-</div>
                <div className="text-center">
                  <Label htmlFor="awayScore">Away Team</Label>
                  <Input
                    id="awayScore"
                    type="number"
                    value={awayScore}
                    onChange={(e) => setAwayScore(Number(e.target.value))}
                    className="w-20 text-center text-2xl font-bold mt-1"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Player Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {playerStats.map((player, index) => (
                    <div key={player.userId}>
                      <Card className="p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.playerName}`} />
                            <AvatarFallback>{player.playerName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{player.playerName}</h4>
                            {player.mvp && <Badge className="mt-1">MVP</Badge>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`attended-${player.userId}`}
                              checked={player.attended}
                              onCheckedChange={(checked) => 
                                updatePlayerStat(player.userId, 'attended', checked)
                              }
                            />
                            <Label htmlFor={`attended-${player.userId}`} className="text-sm">
                              Attended
                            </Label>
                          </div>
                        </div>

                        {player.attended && (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {/* Goals */}
                            <div>
                              <Label htmlFor={`goals-${player.userId}`}>Goals</Label>
                              <Input
                                id={`goals-${player.userId}`}
                                type="number"
                                value={player.goals}
                                onChange={(e) => updatePlayerStat(player.userId, 'goals', Number(e.target.value))}
                                min="0"
                                className="mt-1"
                              />
                            </div>

                            {/* Assists */}
                            <div>
                              <Label htmlFor={`assists-${player.userId}`}>Assists</Label>
                              <Input
                                id={`assists-${player.userId}`}
                                type="number"
                                value={player.assists}
                                onChange={(e) => updatePlayerStat(player.userId, 'assists', Number(e.target.value))}
                                min="0"
                                className="mt-1"
                              />
                            </div>

                            {/* Interceptions */}
                            <div>
                              <Label htmlFor={`interceptions-${player.userId}`}>Interceptions</Label>
                              <Input
                                id={`interceptions-${player.userId}`}
                                type="number"
                                value={player.interceptions}
                                onChange={(e) => updatePlayerStat(player.userId, 'interceptions', Number(e.target.value))}
                                min="0"
                                className="mt-1"
                              />
                            </div>

                            {/* Win/Loss/Draw */}
                            <div>
                              <Label htmlFor={`result-${player.userId}`}>Result</Label>
                              <Select
                                value={player.winLoss}
                                onValueChange={(value: 'win' | 'loss' | 'draw') => 
                                  updatePlayerStat(player.userId, 'winLoss', value)
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="win">Win</SelectItem>
                                  <SelectItem value="loss">Loss</SelectItem>
                                  <SelectItem value="draw">Draw</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* MVP Checkbox */}
                            <div>
                              <Label htmlFor={`mvp-${player.userId}`}>MVP</Label>
                              <div className="flex items-center mt-2">
                                <Checkbox
                                  id={`mvp-${player.userId}`}
                                  checked={player.mvp}
                                  onCheckedChange={(checked) => 
                                    updatePlayerStat(player.userId, 'mvp', checked)
                                  }
                                />
                                <Award className="h-4 w-4 ml-2 text-yellow-500" />
                              </div>
                            </div>

                            {/* Clean Sheet */}
                            <div>
                              <Label htmlFor={`cleansheet-${player.userId}`}>Clean Sheet</Label>
                              <div className="flex items-center mt-2">
                                <Checkbox
                                  id={`cleansheet-${player.userId}`}
                                  checked={player.cleansheet}
                                  onCheckedChange={(checked) => 
                                    updatePlayerStat(player.userId, 'cleansheet', checked)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                      {index < playerStats.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Save Game Summary
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameSummaryDialog;
