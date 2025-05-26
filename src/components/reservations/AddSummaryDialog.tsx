
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Reservation, Player } from "@/context/ReservationContext";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addGameSummary, kickPlayer } from "@/services/adminReservationApi";
import PlayerStatsForm from './PlayerStatsForm';
import PlayerActionsPanel from './PlayerActionsPanel';
import GameSummaryForm from './GameSummaryForm';

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

  const updatePlayerStat = (userId: string, field: keyof PlayerStat, value: number | boolean) => {
    setPlayerStats(prev => prev.map(stat => 
      stat.userId === userId ? { ...stat, [field]: value } : stat
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
      // Call the backend API with the correct format
      await addGameSummary(reservation.backendId || reservation.id.toString(), {
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
        description: error instanceof Error ? error.message : "Failed to save game summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKickPlayer = async (playerId: string, playerName: string) => {
    try {
      // Call the kick player API with just the player ID
      await kickPlayer(reservation.backendId || reservation.id.toString(), playerId);
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
    setPlayerStats(prev => prev.filter(stat => stat.userId !== playerId));
    
    toast({
      title: "Player Marked as Absentee",
      description: `${playerName} will be suspended for ${suspensionDays} days.`
    });
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
            <GameSummaryForm
              summary={summary}
              onSummaryChange={setSummary}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <PlayerStatsForm
                players={players}
                playerStats={playerStats}
                mvpPlayerId={mvpPlayerId}
                onUpdatePlayerStat={updatePlayerStat}
                onSetMvp={setMvpPlayerId}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <PlayerActionsPanel
                players={players}
                onKickPlayer={handleKickPlayer}
                onMarkAbsentee={markAsAbsentee}
              />
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
