
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/ui/loading-button";
import { UserX, Ban, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PlayerSuspensionDialog from "./PlayerSuspensionDialog";

interface AdminActionButtonsProps {
  reservation: any;
  userRole: "admin" | "player" | null;
  onKickPlayer?: (playerId: string, suspensionDays: number, reason: string) => void;
  onSuspendPlayer?: (playerId: string, suspensionDays: number, reason: string) => void;
  className?: string;
  showLabels?: boolean;
}

const AdminActionButtons: React.FC<AdminActionButtonsProps> = ({
  reservation,
  userRole,
  onKickPlayer,
  onSuspendPlayer,
  className = "",
  showLabels = true
}) => {
  const [suspensionDialog, setSuspensionDialog] = useState<{
    open: boolean;
    playerId: string;
    playerName: string;
    actionType: 'kick' | 'suspend';
  } | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  if (userRole !== "admin") return null;

  const isCompleted = reservation.status === "completed";
  const hasPlayers = reservation.lineup && reservation.lineup.length > 0;

  // Check if we can kick players (until game is completed)
  const canKickPlayers = !isCompleted && hasPlayers;

  const handleAction = (playerId: string, playerName: string, actionType: 'kick' | 'suspend') => {
    setSuspensionDialog({ open: true, playerId, playerName, actionType });
  };

  const confirmAction = async (playerId: string, suspensionDays: number, reason: string) => {
    if (!suspensionDialog) return;

    try {
      setLoadingStates(prev => ({ ...prev, [playerId]: true }));
      
      if (suspensionDialog.actionType === 'kick' && onKickPlayer) {
        await onKickPlayer(playerId, suspensionDays, reason);
      } else if (suspensionDialog.actionType === 'suspend' && onSuspendPlayer) {
        await onSuspendPlayer(playerId, suspensionDays, reason);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [playerId]: false }));
      setSuspensionDialog(null);
    }
  };

  if (!canKickPlayers && !hasPlayers) {
    return null;
  }

  return (
    <>
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {canKickPlayers && (
          <div className="w-full">
            {showLabels && (
              <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Admin Actions - Manage Players
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                Kick Window Active
              </Badge>
              {reservation.lineup.slice(0, 2).map((player: any) => (
                <div key={player.userId} className="flex gap-1">
                  <LoadingButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(player.userId, player.name || player.playerName, 'kick')}
                    loading={loadingStates[player.userId]}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-7"
                  >
                    <UserX className="h-3 w-3 mr-1" />
                    Kick {(player.name || player.playerName)?.split(' ')[0]}
                  </LoadingButton>
                  <LoadingButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(player.userId, player.name || player.playerName, 'suspend')}
                    loading={loadingStates[player.userId]}
                    className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7"
                  >
                    <Ban className="h-3 w-3 mr-1" />
                    Suspend
                  </LoadingButton>
                </div>
              ))}
              {reservation.lineup.length > 2 && (
                <span className="text-xs text-gray-500 self-center">
                  +{reservation.lineup.length - 2} more players
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Suspension Dialog */}
      {suspensionDialog && (
        <PlayerSuspensionDialog
          isOpen={suspensionDialog.open}
          onClose={() => setSuspensionDialog(null)}
          playerName={suspensionDialog.playerName}
          playerId={suspensionDialog.playerId}
          onConfirm={confirmAction}
          actionType={suspensionDialog.actionType}
        />
      )}
    </>
  );
};

export default AdminActionButtons;
