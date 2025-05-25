
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Player } from "@/context/ReservationContext";

interface PlayerStat {
  userId: string;
  played: boolean;
  won: boolean;
  goals: number;
  assists: number;
  interceptions: number;
  cleanSheet: boolean;
}

interface PlayerStatsFormProps {
  players: Player[];
  playerStats: PlayerStat[];
  mvpPlayerId: string;
  onUpdatePlayerStat: (playerId: string, field: keyof PlayerStat, value: number | boolean) => void;
  onSetMvp: (playerId: string) => void;
}

const PlayerStatsForm: React.FC<PlayerStatsFormProps> = ({
  players,
  playerStats,
  mvpPlayerId,
  onUpdatePlayerStat,
  onSetMvp
}) => {
  const getPlayerName = (player: Player) => {
    return player.playerName || player.name || `Player ${player.userId?.substring(0, 4)}`;
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Label htmlFor="mvp">MVP Player</Label>
        <select
          id="mvp"
          value={mvpPlayerId}
          onChange={(e) => onSetMvp(e.target.value)}
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
                    onChange={(e) => onUpdatePlayerStat(player.userId, 'played', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor={`played-${player.userId}`}>Played</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`won-${player.userId}`}
                    checked={stats.won}
                    onChange={(e) => onUpdatePlayerStat(player.userId, 'won', e.target.checked)}
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
                    onChange={(e) => onUpdatePlayerStat(player.userId, 'goals', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`assists-${player.userId}`}>Assists</Label>
                  <Input
                    id={`assists-${player.userId}`}
                    type="number"
                    min="0"
                    value={stats.assists}
                    onChange={(e) => onUpdatePlayerStat(player.userId, 'assists', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`interceptions-${player.userId}`}>Interceptions</Label>
                  <Input
                    id={`interceptions-${player.userId}`}
                    type="number"
                    min="0"
                    value={stats.interceptions}
                    onChange={(e) => onUpdatePlayerStat(player.userId, 'interceptions', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id={`cleansheet-${player.userId}`}
                    checked={stats.cleanSheet}
                    onChange={(e) => onUpdatePlayerStat(player.userId, 'cleanSheet', e.target.checked)}
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
  );
};

export default PlayerStatsForm;
