
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Award, Ban, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Player, Reservation } from "@/context/ReservationContext";

interface AddSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  onSaveSummary: (summary: any, playerStats: Player[]) => void;
  onSuspendPlayer: (userId: string, reason: string, duration: number) => void;
}

/**
 * AddSummaryDialog Component
 * Allows admins to add game summary, select MVP, update player stats, and suspend players
 */
const AddSummaryDialog: React.FC<AddSummaryDialogProps> = ({
  isOpen,
  onClose,
  reservation,
  onSaveSummary,
  onSuspendPlayer
}) => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [mvpPlayerId, setMvpPlayerId] = useState("");
  const [playerStats, setPlayerStats] = useState<Record<string, any>>({});
  const [suspendingPlayer, setSuspendingPlayer] = useState<string | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [suspensionDuration, setSuspensionDuration] = useState(1);
  
  const { toast } = useToast();

  // Initialize player stats when dialog opens
  React.useEffect(() => {
    if (isOpen && reservation.lineup) {
      const initialStats: Record<string, any> = {};
      reservation.lineup.forEach(player => {
        initialStats[player.userId] = {
          attended: true,
          goals: 0,
          assists: 0,
          cleansheet: false,
          mvp: false,
          status: 'played'
        };
      });
      setPlayerStats(initialStats);
    }
  }, [isOpen, reservation.lineup]);

  const handlePlayerStatChange = (userId: string, field: string, value: any) => {
    setPlayerStats(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  const handleMvpSelection = (userId: string) => {
    setMvpPlayerId(userId);
    // Update MVP status in player stats
    setPlayerStats(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(playerId => {
        updated[playerId] = { ...updated[playerId], mvp: playerId === userId };
      });
      return updated;
    });
  };

  const handleSuspendPlayer = (userId: string) => {
    if (!suspensionReason.trim()) {
      toast({
        title: "Missing Reason",
        description: "Please provide a reason for suspension.",
        variant: "destructive"
      });
      return;
    }

    onSuspendPlayer(userId, suspensionReason, suspensionDuration);
    setSuspendingPlayer(null);
    setSuspensionReason("");
    setSuspensionDuration(1);
    
    toast({
      title: "Player Suspended",
      description: `Player has been suspended for ${suspensionDuration} days.`,
    });
  };

  const handleSaveSummary = () => {
    // Prepare final player stats
    const finalPlayerStats = reservation.lineup?.map(player => ({
      ...player,
      ...playerStats[player.userId],
      mvp: mvpPlayerId === player.userId
    })) || [];

    const summary = {
      homeScore,
      awayScore,
      completed: true,
      completedAt: new Date().toISOString(),
      mvpPlayerId
    };

    onSaveSummary(summary, finalPlayerStats);
    onClose();
    
    toast({
      title: "Summary Saved",
      description: "Game summary has been saved successfully.",
    });
  };

  const getPlayerAvatar = (player: Player) => {
    const initials = player.playerName.split(" ").map(n => n[0]).join("").toUpperCase();
    return (
      <Avatar className="h-8 w-8">
        <AvatarImage src={player.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${player.playerName}`} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Add Game Summary - {reservation.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Game Score Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeScore">Home Team Score</Label>
              <Input
                id="homeScore"
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="awayScore">Away Team Score</Label>
              <Input
                id="awayScore"
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* MVP Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              Select MVP (Most Valuable Player)
            </Label>
            <Select value={mvpPlayerId} onValueChange={handleMvpSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Select MVP" />
              </SelectTrigger>
              <SelectContent>
                {reservation.lineup?.map((player) => (
                  <SelectItem key={player.userId} value={player.userId}>
                    <div className="flex items-center gap-2">
                      {getPlayerAvatar(player)}
                      <span>{player.playerName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Player Stats Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Player Status & Statistics</Label>
            <div className="space-y-3">
              {reservation.lineup?.map((player) => (
                <div key={player.userId} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlayerAvatar(player)}
                      <div>
                        <span className="font-medium">{player.playerName}</span>
                        {mvpPlayerId === player.userId && (
                          <Badge className="ml-2 bg-yellow-500 text-white">
                            <Trophy className="h-3 w-3 mr-1" />
                            MVP
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Suspend Player Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSuspendingPlayer(player.userId)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Suspend
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Attendance */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`attended-${player.userId}`}
                        checked={playerStats[player.userId]?.attended || false}
                        onCheckedChange={(checked) => 
                          handlePlayerStatChange(player.userId, 'attended', checked)
                        }
                      />
                      <Label htmlFor={`attended-${player.userId}`}>Attended</Label>
                    </div>

                    {/* Goals */}
                    <div className="space-y-1">
                      <Label>Goals</Label>
                      <Input
                        type="number"
                        min="0"
                        value={playerStats[player.userId]?.goals || 0}
                        onChange={(e) => 
                          handlePlayerStatChange(player.userId, 'goals', parseInt(e.target.value) || 0)
                        }
                      />
                    </div>

                    {/* Assists */}
                    <div className="space-y-1">
                      <Label>Assists</Label>
                      <Input
                        type="number"
                        min="0"
                        value={playerStats[player.userId]?.assists || 0}
                        onChange={(e) => 
                          handlePlayerStatChange(player.userId, 'assists', parseInt(e.target.value) || 0)
                        }
                      />
                    </div>

                    {/* Clean Sheet */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`cleansheet-${player.userId}`}
                        checked={playerStats[player.userId]?.cleansheet || false}
                        onCheckedChange={(checked) => 
                          handlePlayerStatChange(player.userId, 'cleansheet', checked)
                        }
                      />
                      <Label htmlFor={`cleansheet-${player.userId}`}>Clean Sheet</Label>
                    </div>
                  </div>

                  {/* Player Status */}
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Select
                      value={playerStats[player.userId]?.status || 'played'}
                      onValueChange={(value) => handlePlayerStatChange(player.userId, 'status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="played">Played</SelectItem>
                        <SelectItem value="substitute">Substitute</SelectItem>
                        <SelectItem value="injured">Injured</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveSummary} className="bg-teal-600 hover:bg-teal-700">
              <Save className="h-4 w-4 mr-2" />
              Save Summary
            </Button>
          </div>
        </div>

        {/* Suspension Dialog */}
        {suspendingPlayer && (
          <Dialog open={!!suspendingPlayer} onOpenChange={() => setSuspendingPlayer(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Suspend Player</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reason for Suspension</Label>
                  <Textarea
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="Enter reason for suspension..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Select value={suspensionDuration.toString()} onValueChange={(value) => setSuspensionDuration(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSuspendingPlayer(null)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleSuspendPlayer(suspendingPlayer)}
                  >
                    Confirm Suspension
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddSummaryDialog;
