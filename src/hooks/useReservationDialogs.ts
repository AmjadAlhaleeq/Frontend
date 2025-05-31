
import { useState } from "react";
import { Reservation } from "@/types/reservation";

export interface DialogStates {
  joinGame: boolean;
  joinWaitlist: boolean;
  leaveGame: boolean;
  leaveWaitlist: boolean;
  gameDetails: boolean;
  gameSummary: boolean;
  deleteReservation: boolean;
  completeGame: boolean;
  playerProfile: boolean;
  playerSuspension: boolean;
}

export const useReservationDialogs = () => {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [dialogStates, setDialogStates] = useState<DialogStates>({
    joinGame: false,
    joinWaitlist: false,
    leaveGame: false,
    leaveWaitlist: false,
    gameDetails: false,
    gameSummary: false,
    deleteReservation: false,
    completeGame: false,
    playerProfile: false,
    playerSuspension: false,
  });

  const [playerProfile, setPlayerProfile] = useState<{
    playerId: string;
    playerName?: string;
  }>({ playerId: "", playerName: "" });

  const [suspensionData, setSuspensionData] = useState<{
    playerName: string;
    playerId: string;
    reason: string;
    suspensionDays: number;
  }>({ playerName: "", playerId: "", reason: "", suspensionDays: 1 });

  const openDialog = (
    dialogName: keyof DialogStates,
    reservation?: Reservation
  ) => {
    if (reservation) setSelectedReservation(reservation);
    setDialogStates((prev) => ({ ...prev, [dialogName]: true }));
  };

  const closeDialog = (dialogName: keyof DialogStates) => {
    setDialogStates((prev) => ({ ...prev, [dialogName]: false }));
    if (dialogName !== "playerProfile" && dialogName !== "playerSuspension") {
      setSelectedReservation(null);
    }
  };

  return {
    selectedReservation,
    setSelectedReservation,
    dialogStates,
    setDialogStates,
    playerProfile,
    setPlayerProfile,
    suspensionData,
    setSuspensionData,
    openDialog,
    closeDialog,
  };
};
