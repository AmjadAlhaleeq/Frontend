
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Ban } from "lucide-react";
import { Player } from "@/context/ReservationContext";

interface PlayerActionsPanelProps {
  players: Player[];
  onKickPlayer: (playerId: string, playerName: string) => void;
  onMarkAbsentee: (playerId: string, playerName: string) => void;
}

const PlayerActionsPanel: React.FC<PlayerActionsPanelProps> = ({
  players,
  onKickPlayer,
  onMarkAbsentee
}) => {
  const getPlayerName = (player: Player) => {
    return player.playerName || player.name || `Player ${player.userId?.substring(0, 4)}`;
  };

  return (
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
                  onClick={() => onMarkAbsentee(player.userId, getPlayerName(player))}
                  className="text-orange-600 hover:text-orange-700"
                >
                  Mark Absent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onKickPlayer(player.userId, getPlayerName(player))}
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
  );
};

export default PlayerActionsPanel;
