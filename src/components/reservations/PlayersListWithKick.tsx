
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserX } from "lucide-react";

interface Player {
  userId: string;
  name: string;
  avatarUrl?: string;
  joinedAt: string;
}

interface PlayersListWithKickProps {
  players: Player[];
  isAdmin: boolean;
  canKickPlayers: boolean;
  onPlayerClick: (playerId: string, playerName?: string) => void;
  onKickPlayer: (playerId: string, playerName: string) => void;
}

const PlayersListWithKick: React.FC<PlayersListWithKickProps> = ({
  players,
  isAdmin,
  canKickPlayers,
  onPlayerClick,
  onKickPlayer,
}) => {
  if (!players || players.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No players have joined this game yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {players.map((player, index) => (
        <div
          key={player.userId}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div
            className="flex items-center space-x-3 flex-1 cursor-pointer"
            onClick={() => onPlayerClick(player.userId, player.name)}
          >
            <span className="text-sm font-medium text-gray-500 w-6">
              {index + 1}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={player.avatarUrl} alt={player.name} />
              <AvatarFallback>
                {player.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{player.name}</p>
              <p className="text-xs text-muted-foreground">
                Joined {new Date(player.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {isAdmin && canKickPlayers && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onKickPlayer(player.userId, player.name);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
            >
              <UserX className="h-3 w-3 mr-1" />
              Kick
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlayersListWithKick;
