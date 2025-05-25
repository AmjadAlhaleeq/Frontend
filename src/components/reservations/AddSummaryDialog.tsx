
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Reservation, Player } from "@/context/ReservationContext";
import { Ban, Save, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addGameSummary, kickPlayer, AddSummaryRequest, KickPlayerRequest } from "@/services/reservationApi";

interface AddSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  onSave: (summary: string, playerStats: any[]) => void;
  onSuspendPlayer: (playerId: string, playerName: string) => void;
}

interface PlayerStat {
  userId: string;
  played: boolean;
  won: boolean;
  goals: number;
  assists: number;
  interceptions: number;
  cleanSheet: boolean;
}

const AddSummaryDialog: React.FC<AddSummaryDialogProps> = ({
  isOpen,
  onClose,
  reservation,
  onSave,
  onSuspendPlayer
}) => {
  const { toast } = useToast();
  const [summary, setSummary] = useState('');
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [mvpPlayerId, setMvpPlayerId] = useState('');
  const [absentees, setAbsentees] = useState<{ userId: string; reason: string; suspensionDays: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const players = reservation.lineup?.filter(p => p.status === 'joined' || !p.status) || [];

  React.useEffect(() => {
    if (isOpen && players.length > 0) {
      setPlayerStats(players.map(player => ({
        userId: player.userId,
        played: true,
        won: false,
        goals: 0,
        assists: 0,
        interceptions: 0,
        cleanSheet: false
      })));
    }
  }, [isOpen, players]);

  const updatePlayerStat = (playerId: string, field: keyof PlayerStat, value: number | boolean) => {
    setPlayerStats(prev => prev.map(stat => 
      stat.playerId === playerId ? { ...stat, [field]: value } : stat
    ));
  };

  const handleSave = async () => {
    if (!summary.trim()) {
      toast({
        title: "Summary Required",
        description: "Please add a game summary before saving.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Prepare summary data according to backend API
      const summaryData: AddSummaryRequest = {
        mvp: mvpPlayerId || undefined,
        players: playerStats,
        absentees: absentees
      };

      // Call API to save game summary
      await addGameSummary(reservation.id.toString(), summaryData);

      onSave(summary, playerStats);
      toast({
        title: "Summary Added",
        description: "Game summary and player stats have been saved successfully."
      });
      onClose();
    } catch (error) {
      console.error('Failed to save game summary:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save game summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKickPlayer = async (playerId: string, playerName: string) => {
    try {
      const kickData: KickPlayerRequest = {
        userId: playerId,
        reason: "Inappropriate behavior during game",
        suspensionDays: 7
      };

      await kickPlayer(reservation.id.toString(), kickData);
      onSuspendPlayer(playerId, playerName);
      toast({
        title: "Player Kicked and Suspended",
        description: `${playerName} has been kicked and suspended for 7 days.`
      });
    } catch (error) {
      console.error('Failed to kick player:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to kick player. Please try again.",
        variant: "destructive"
      });
    }
  };

  const markAsAbsentee = (playerId: string, playerName: string) => {
    const reason = "Did not show up for the game";
    const suspensionDays = 3;
    
    setAbsentees(prev => [...prev, { userId: playerId, reason, suspensionDays }]);
    
    // Remove from player stats
    setPlayerStats(prev => prev.filter(stat => stat.userId !== playerId));
    
    toast({
      title: "Player Marked as Absentee",
      description: `${playerName} will be suspended for ${suspensionDays} days.`
    });
  };

  const getPlayerName = (player: Player) => {
    return player.playerName || player.name || `Player ${player.userId?.substring(0, 4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Game Summary - {reservation.title || reservation.pitchName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="summary" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Game Summary</TabsTrigger>
            <TabsTrigger value="stats">Player Stats</TabsTrigger>
            <TabsTrigger value="actions">Player Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div>
              <Label htmlFor="summary">Game Summary</Label>
              <Textarea
                id="summary"
                placeholder="Describe the game highlights, final score, key moments..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                <div className="mb-4">
                  <Label htmlFor="mvp">MVP Player</Label>
                  <select
                    id="mvp"
                    value={mvpPlayerId}
                    onChange={(e) => setMvpPlayerId(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select MVP</option>
                    {players.map((player) => (
                      <option key={player.userId} value={player.userId}>
                        {getPlayerName(player)}
                      </option>
                    ))}
                  </select>
                </div>

                {playerStats.map((stats) => {
                  const player = players.find(p => p.userId === stats.userId);
                  if (!player) return null;

                  return (
                    <Card key={player.userId}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{getPlayerName(player)}</h4>
                            {stats.userId === mvpPlayerId && <Badge className="bg-yellow-500">MVP</Badge>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`played-${player.userId}`}
                              checked={stats.played}
                              onChange={(e) => updatePlayerStat(player.userId, 'played', e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor={`played-${player.userId}`}>Played</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`won-${player.userId}`}
                              checked={stats.won}
                              onChange={(e) => updatePlayerStat(player.userId, 'won', e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor={`won-${player.userId}`}>Won</Label>
                          </div>
                          <div>
                            <Label htmlFor={`goals-${player.userId}`}>Goals</Label>
                            <Input
                              id={`goals-${player.userId}`}
                              type="number"
                              min="0"
                              value={stats.goals}
                              onChange={(e) => updatePlayerStat(player.userId, 'goals', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`assists-${player.userId}`}>Assists</Label>
                            <Input
                              id={`assists-${player.userId}`}
                              type="number"
                              min="0"
                              value={stats.assists}
                              onChange={(e) => updatePlayerStat(player.userId, 'assists', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`interceptions-${player.userId}`}>Interceptions</Label>
                            <Input
                              id={`interceptions-${player.userId}`}
                              type="number"
                              min="0"
                              value={stats.interceptions}
                              onChange={(e) => updatePlayerStat(player.userId, 'interceptions', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <input
                              type="checkbox"
                              id={`cleansheet-${player.userId}`}
                              checked={stats.cleanSheet}
                              onChange={(e) => updatePlayerStat(player.userId, 'cleanSheet', e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor={`cleansheet-${player.userId}`}>Clean Sheet</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {players.map((player) => (
                  <Card key={player.userId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{getPlayerName(player)}</h4>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsAbsentee(player.userId, getPlayerName(player))}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            Mark Absent
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleKickPlayer(player.userId, getPlayerName(player))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Kick & Suspend
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Summary'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSummaryDialog;
