
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserMinus, Crown } from "lucide-react";

interface Player {
  userId: string;
  playerName: string;
  email?: string;
}

interface PlayersListWithKickProps {
  players: Player[];
  userRole: "admin" | "player";
  onKickPlayer: (playerId: string, playerName: string) => void;
  reservationStatus?: string;
}

const PlayersListWithKick: React.FC<PlayersListWithKickProps> = ({
  players,
  userRole,
  onKickPlayer,
  reservationStatus = "upcoming"
}) => {
  if (!players || players.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No players joined yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm text-muted-foreground mb-3">
        Players ({players.length})
      </h4>
      
      {players.map((player, index) => (
        <Card key={player.userId} className="border-l-2 border-l-teal-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {player.playerName?.charAt(0)?.toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {player.playerName || `Player ${index + 1}`}
                  </span>
                  
                  {index === 0 && (
                    <Crown className="h-3 w-3 text-yellow-500" title="Team Captain" />
                  )}
                </div>
              </div>

              {userRole === "admin" && reservationStatus === "upcoming" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onKickPlayer(player.userId, player.playerName)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <UserMinus className="h-3 w-3 mr-1" />
                  Kick
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PlayersListWithKick;
