
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
import { Loader, Save, Award, Trophy, ClipboardCheck } from "lucide-react";
import { Reservation } from "@/types/reservation";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Define the player type for summary
interface PlayerStat {
  userId: string;
  playerName: string;
  played: boolean;
  won: boolean;
  goals: number;
  assists: number;
  interceptions: number;
  cleanSheet: boolean;
}

interface AbsenteeStat {
  userId: string;
  playerName: string;
  reason: string;
  suspensionDays: number;
}

interface GameSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  onSaveSummary: (summaryData: {
    mvp?: string;
    players: Array<{
      userId: string;
      played: boolean;
      won: boolean;
      goals?: number;
      assists?: number;
      interceptions?: number;
      cleanSheet?: boolean;
    }>;
    absentees?: Array<{
      userId: string;
      reason: string;
      suspensionDays: number;
    }>;
  }) => void;
}

const GameSummaryDialog: React.FC<GameSummaryDialogProps> = ({
  isOpen,
  onClose,
  reservation,
  onSaveSummary
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mvpPlayerId, setMvpPlayerId] = useState("");
  
  // Initialize player stats from lineup
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>(() => {
    return reservation.lineup?.map(player => ({
      userId: player.userId,
      playerName: player.playerName || player.name || `Player ${player.userId?.substring(0, 4)}`,
      goals: 0,
      assists: 0,
      interceptions: 0,
      cleanSheet: false,
      won: false,
      played: true
    })) || [];
  });

  // Initialize absentees state
  const [absentees, setAbsentees] = useState<AbsenteeStat[]>([]);

  const handlePlayerStatChange = (userId: string, field: keyof PlayerStat, value: any) => {
    setPlayerStats(prev => prev.map(player => {
      if (player.userId === userId) {
        return { ...player, [field]: value };
      }
      return player;
    }));
  };

  const handleMarkAsAbsent = (userId: string, playerName: string) => {
    // Remove from players and add to absentees
    setPlayerStats(prev => prev.filter(p => p.userId !== userId));
    setAbsentees(prev => [...prev, {
      userId,
      playerName,
      reason: "No show without notice",
      suspensionDays: 1
    }]);
  };

  const handleMarkAsPresent = (userId: string, playerName: string) => {
    // Remove from absentees and add back to players
    setAbsentees(prev => prev.filter(a => a.userId !== userId));
    setPlayerStats(prev => [...prev, {
      userId,
      playerName,
      played: true,
      won: false,
      goals: 0,
      assists: 0,
      interceptions: 0,
      cleanSheet: false
    }]);
  };

  const handleAbsenteeChange = (userId: string, field: 'reason' | 'suspensionDays', value: string | number) => {
    setAbsentees(prev => prev.map(absentee => {
      if (absentee.userId === userId) {
        return { ...absentee, [field]: value };
      }
      return absentee;
    }));
  };

  const handleSubmit = async () => {
    if (!mvpPlayerId) {
      toast({
        title: "MVP Required",
        description: "Please select an MVP before saving the summary.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const summaryData = {
        mvp: mvpPlayerId,
        players: playerStats.map(player => ({
          userId: player.userId,
          played: player.played,
          won: player.won,
          goals: player.goals,
          assists: player.assists,
          interceptions: player.interceptions,
          cleanSheet: player.cleanSheet
        })),
        absentees: absentees.map(absentee => ({
          userId: absentee.userId,
          reason: absentee.reason,
          suspensionDays: absentee.suspensionDays
        }))
      };

      await onSaveSummary(summaryData);
      
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

  const allPlayers = [...playerStats, ...absentees];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ClipboardCheck className="h-5 w-5 mr-2 text-teal-600" />
            Game Summary - {reservation.title || reservation.pitchName}
          </DialogTitle>
          <DialogDescription>
            Add game summary and player statistics for {reservation.date}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="mvp" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mvp">1. MVP</TabsTrigger>
            <TabsTrigger value="attendance">2. Attendance</TabsTrigger>
            <TabsTrigger value="stats">3. Stats</TabsTrigger>
            <TabsTrigger value="absentees">4. Absentees</TabsTrigger>
          </TabsList>

          <TabsContent value="mvp" className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200">
              <h3 className="font-medium mb-3 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                Select Most Valuable Player (MVP)
              </h3>
              <Select value={mvpPlayerId} onValueChange={setMvpPlayerId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose the MVP for this game" />
                </SelectTrigger>
                <SelectContent>
                  {playerStats.filter(p => p.played).map((player) => (
                    <SelectItem key={player.userId} value={player.userId}>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-yellow-500" />
                        {player.playerName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mvpPlayerId && (
                <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-800/30 rounded border">
                  <p className="text-sm font-medium">
                    MVP: {playerStats.find(p => p.userId === mvpPlayerId)?.playerName}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium">Mark Player Attendance</h3>
              {allPlayers.map((player) => {
                const isAbsent = absentees.some(a => a.userId === player.userId);
                return (
                  <div key={player.userId} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">{player.playerName}</span>
                    <div className="flex items-center gap-2">
                      <Label className={isAbsent ? "text-red-600" : "text-green-600"}>
                        {isAbsent ? "Absent" : "Present"}
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (isAbsent) {
                            handleMarkAsPresent(player.userId, player.playerName);
                          } else {
                            handleMarkAsAbsent(player.userId, player.playerName);
                          }
                        }}
                      >
                        {isAbsent ? "Mark Present" : "Mark Absent"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="space-y-4">
              {playerStats.filter(p => p.played).map((player) => (
                <div key={player.userId} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md border">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{player.playerName}</h3>
                      {player.userId === mvpPlayerId && (
                        <Badge className="bg-yellow-500 text-white">
                          <Trophy className="h-3 w-3 mr-1" />
                          MVP
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                      <div className="space-y-1">
                        <Label htmlFor={`interceptions-${player.userId}`} className="text-xs">Interceptions</Label>
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
                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id={`cleansheet-${player.userId}`}
                          checked={player.cleanSheet}
                          onCheckedChange={(checked) => 
                            handlePlayerStatChange(player.userId, "cleanSheet", checked === true)
                          }
                        />
                        <Label htmlFor={`cleansheet-${player.userId}`} className="text-xs">
                          Clean Sheet
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`won-${player.userId}`}
                        checked={player.won}
                        onCheckedChange={(checked) => 
                          handlePlayerStatChange(player.userId, "won", checked === true)
                        }
                      />
                      <Label htmlFor={`won-${player.userId}`} className="text-sm font-medium">
                        Won the game
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="absentees" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium text-red-600">Absent Players & Suspensions</h3>
              {absentees.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No absent players</p>
              ) : (
                absentees.map((absentee) => (
                  <div key={absentee.userId} className="bg-red-50 p-4 rounded-md border border-red-200">
                    <h4 className="font-medium text-red-800 mb-3">{absentee.playerName}</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`reason-${absentee.userId}`}>Reason for Absence</Label>
                        <Textarea
                          id={`reason-${absentee.userId}`}
                          value={absentee.reason}
                          onChange={(e) => handleAbsenteeChange(absentee.userId, 'reason', e.target.value)}
                          placeholder="Describe the reason for absence..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`suspension-${absentee.userId}`}>Suspension Days</Label>
                        <Input
                          id={`suspension-${absentee.userId}`}
                          type="number"
                          min="0"
                          max="30"
                          value={absentee.suspensionDays}
                          onChange={(e) => handleAbsenteeChange(absentee.userId, 'suspensionDays', parseInt(e.target.value) || 0)}
                          className="w-32"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !mvpPlayerId}>
            {isSubmitting && <Loader className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Summary & Complete Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameSummaryDialog;
