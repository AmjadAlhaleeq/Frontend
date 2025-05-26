import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ban } from "lucide-react";
import { Reservation } from "@/types/reservation";

interface AddSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  onSave: (summary: string, playerStats: any[]) => void;
  onSuspendPlayer: (playerId: string, playerName: string) => void;
}

const AddSummaryDialog: React.FC<AddSummaryDialogProps> = ({
  isOpen,
  onClose,
  reservation,
  onSave,
  onSuspendPlayer
}) => {
  const [summary, setSummary] = useState('');
  const [playerStats, setPlayerStats] = useState<any[]>([]);

  const joinedPlayers = reservation.lineup?.filter(p => (p.status === 'joined' || !p.status)) || [];

  const handleSave = () => {
    onSave(summary, playerStats);
    setSummary('');
    setPlayerStats([]);
  };

  const getPlayerName = (player: any) => {
    return player.playerName || player.name || `Player ${player.userId?.substring(0, 4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Game Summary - {reservation.title || reservation.pitchName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Game Summary</TabsTrigger>
            <TabsTrigger value="stats">Player Stats</TabsTrigger>
            <TabsTrigger value="actions">Player Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Game Summary</label>
              <Textarea
                placeholder="Enter game summary, highlights, and key moments..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="min-h-[200px] mt-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Add individual player statistics for this game.
            </div>
            {joinedPlayers.map((player) => (
              <Card key={player.userId}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">{getPlayerName(player)}</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Goals</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-1 border rounded text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Assists</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-1 border rounded text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Yellow Cards</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-1 border rounded text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Red Cards</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-1 border rounded text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Manage player actions and suspensions.
            </div>
            {joinedPlayers.map((player) => (
              <Card key={player.userId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{getPlayerName(player)}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSuspendPlayer(player.userId, getPlayerName(player))}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Suspend Player
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Summary
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSummaryDialog;
