import React from "react";
import { Reservation } from "@/types/reservation";
import { DialogStates } from "@/hooks/useReservationDialogs";
import { GameSummaryData } from "@/services/reservationApiService";

import JoinGameDialog from "./JoinGameDialog";
import JoinWaitlistDialog from "./JoinWaitlistDialog";
import LeaveGameDialog from "./LeaveGameDialog";
import LeaveWaitlistDialog from "./LeaveWaitlistDialog";
import ActionConfirmationDialog from "./ActionConfirmationDialog";
import GameDetailsDialog from "./GameDetailsDialog";
import GameSummaryDialog from "./GameSummaryDialog";
import PlayerSuspensionDialog from "./PlayerSuspensionDialog";

interface ReservationsEnhancedDialogsProps {
  selectedReservation: Reservation | null;
  dialogStates: DialogStates;
  suspensionData: { playerName: string; playerId: string; reason: string; suspensionDays: number };
  userRole: "admin" | "player" | null;
  currentUserId: string;
  pitchImages: Record<string, string>;
  onCloseDialog: (dialogName: keyof DialogStates) => void;
  onJoinGame: () => Promise<void>;
  onJoinWaitlist: () => Promise<void>;
  onLeaveGame: () => Promise<void>;
  onLeaveWaitlist: () => Promise<void>;
  onDeleteReservation: () => Promise<void>;
  onCompleteGame: () => Promise<void>;
  onAddSummary: (summaryData: GameSummaryData) => Promise<void>;
  onSuspendPlayer: (playerId: string, suspensionDays: number, reason: string) => Promise<void>;
  onPlayerClick: (playerId: string, playerName?: string) => void;
  loadingStates?: Record<string, boolean>;
}

const ReservationsEnhancedDialogs: React.FC<ReservationsEnhancedDialogsProps> = ({
  selectedReservation,
  dialogStates,
  suspensionData,
  userRole,
  currentUserId,
  pitchImages,
  onCloseDialog,
  onJoinGame,
  onJoinWaitlist,
  onLeaveGame,
  onLeaveWaitlist,
  onDeleteReservation,
  onCompleteGame,
  onAddSummary,
  onSuspendPlayer,
  onPlayerClick,
  loadingStates = {},
}) => {
  if (!selectedReservation) return null;

  return (
    <>
      <JoinGameDialog
        isOpen={dialogStates.joinGame}
        onClose={() => onCloseDialog("joinGame")}
        onConfirm={onJoinGame}
        reservation={selectedReservation}
      />

      <JoinWaitlistDialog
        isOpen={dialogStates.joinWaitlist}
        onClose={() => onCloseDialog("joinWaitlist")}
        onConfirm={onJoinWaitlist}
        reservation={selectedReservation}
      />

      <LeaveGameDialog
        isOpen={dialogStates.leaveGame}
        onClose={() => onCloseDialog("leaveGame")}
        onConfirm={onLeaveGame}
        gameName={selectedReservation.pitchName || selectedReservation.title}
        gameDate={selectedReservation.date}
        gameTime={selectedReservation.time}
        isPenalty={false}
        timeToGame="Unknown"
      />

      <LeaveWaitlistDialog
        isOpen={dialogStates.leaveWaitlist}
        onClose={() => onCloseDialog("leaveWaitlist")}
        onConfirm={onLeaveWaitlist}
        reservation={selectedReservation}
      />

      <ActionConfirmationDialog
        open={dialogStates.deleteReservation}
        onOpenChange={(open) => !open && onCloseDialog("deleteReservation")}
        onConfirm={onDeleteReservation}
        title="Delete Reservation"
        description="Are you sure you want to delete this reservation? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonVariant="destructive"
      />

      <GameDetailsDialog
        reservation={selectedReservation}
        isOpen={dialogStates.gameDetails}
        onClose={() => onCloseDialog("gameDetails")}
        isAdmin={userRole === "admin"}
        currentUserId={currentUserId || ""}
        actualMaxPlayers={selectedReservation.maxPlayers}
        pitchImage={pitchImages[selectedReservation.pitchId]}
        onPlayerClick={onPlayerClick}
        onStatusChange={(status) => {
          // Handle status change if needed
        }}
        onSuspendPlayer={onSuspendPlayer}
      />

      <GameSummaryDialog
        isOpen={dialogStates.gameSummary}
        onClose={() => onCloseDialog("gameSummary")}
        reservation={selectedReservation}
        onSaveSummary={onAddSummary}
      />

      <PlayerSuspensionDialog
        isOpen={dialogStates.playerSuspension}
        onClose={() => onCloseDialog("playerSuspension")}
        playerName={suspensionData.playerName}
        playerId={suspensionData.playerId}
        onConfirm={onSuspendPlayer}
        actionType="kick"
      />
    </>
  );
};

export default ReservationsEnhancedDialogs;
