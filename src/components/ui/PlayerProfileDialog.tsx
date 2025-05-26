
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Users, Award } from "lucide-react";

interface PlayerProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName?: string;
  playerStats?: {
    gamesPlayed: number;
    goals: number;
    assists: number;
    wins: number;
  };
}

const PlayerProfileDialog: React.FC<PlayerProfileDialogProps> = ({
  isOpen,
  onClose,
  playerId,
  playerName,
  playerStats
}) => {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Player Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Player Avatar and Info */}
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src="" alt={playerName || 'Player'} />
              <AvatarFallback className="bg-teal-100 text-teal-700 text-lg font-semibold">
                {getInitials(playerName)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{playerName || `Player ${playerId.substring(0, 6)}`}</h3>
            <p className="text-sm text-muted-foreground">Player ID: {playerId.substring(0, 8)}</p>
          </div>

          {/* Player Stats */}
          {playerStats && (
            <div className="space-y-3">
              <h4 className="font-medium text-center">Statistics</h4>
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Trophy className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="text-lg font-semibold">{playerStats.gamesPlayed}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Games</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Target className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-lg font-semibold">{playerStats.goals}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Goals</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-purple-600 mr-1" />
                      <span className="text-lg font-semibold">{playerStats.assists}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Assists</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Award className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-lg font-semibold">{playerStats.wins}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Wins</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Active Player
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerProfileDialog;
