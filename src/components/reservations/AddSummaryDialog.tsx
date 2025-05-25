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
import { addGameSummary, suspendPlayer, PlayerStats } from "@/services/reservationApi";

interface AddSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  onSave: (summary: string, playerStats: PlayerStats[]) => void;
  onSuspendPlayer: (playerId: string, playerName: string) => void;
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
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const players = reservation.lineup?.filter(p => p.status === 'joined' || !p.status) || [];

  React.useEffect(() => {
    if (isOpen && players.length > 0) {
      setPlayerStats(players.map(player => ({
        playerId: player.userId,
        goals: 0,
        assists: 0,
        mvp: false,
        rating: 5
      })));
    }
  }, [isOpen, players]);

  const updatePlayerStat = (playerId: string, field: keyof PlayerStats, value: number | boolean) => {
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
      // Call API to save game summary
      await addGameSummary(reservation.id.toString(), {
        summary,
        playerStats
      });

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
        description: "Failed to save game summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendPlayer = async (playerId: string, playerName: string) => {
    try {
      // Call the suspendPlayer API with just the reservation ID
      await suspendPlayer(reservation.id.toString());
      onSuspendPlayer(playerId, playerName);
      toast({
        title: "Player Suspended",
        description: `${playerName} has been suspended.`
      });
    } catch (error) {
      console.error('Failed to suspend player:', error);
      toast({
        title: "Error",
        description: "Failed to suspend player. Please try again.",
        variant: "destructive"
      });
    }
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Game Summary</TabsTrigger>
            <TabsTrigger value="stats">Player Stats</TabsTrigger>
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
                {players.map((player) => {
                  const stats = playerStats.find(s => s.playerId === player.userId);
                  if (!stats) return null;

                  return (
                    <Card key={player.userId}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{getPlayerName(player)}</h4>
                            {stats.mvp && <Badge className="bg-yellow-500">MVP</Badge>}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendPlayer(player.userId, getPlayerName(player))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            <Label htmlFor={`rating-${player.userId}`}>Rating (1-10)</Label>
                            <Input
                              id={`rating-${player.userId}`}
                              type="number"
                              min="1"
                              max="10"
                              value={stats.rating}
                              onChange={(e) => updatePlayerStat(player.userId, 'rating', parseInt(e.target.value) || 5)}
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <input
                              type="checkbox"
                              id={`mvp-${player.userId}`}
                              checked={stats.mvp}
                              onChange={(e) => {
                                // Only one MVP allowed
                                if (e.target.checked) {
                                  setPlayerStats(prev => prev.map(s => ({
                                    ...s,
                                    mvp: s.playerId === player.userId
                                  })));
                                } else {
                                  updatePlayerStat(player.userId, 'mvp', false);
                                }
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`mvp-${player.userId}`}>MVP</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
