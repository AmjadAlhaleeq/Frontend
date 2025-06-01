import React, { createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Reservation, Pitch, UserStats, Player } from "@/types/reservation";
import { useReservationStorage } from "@/hooks/useReservationStorage";
import { useReservationOperations } from "@/hooks/useReservationOperations";
import { usePlayerOperations } from "@/hooks/usePlayerOperations";
import { useWaitingListOperations } from "@/hooks/useWaitingListOperations";
import { usePitchOperations } from "@/hooks/usePitchOperations";
import { useUserStats } from "@/hooks/useUserStats";
import { useHighlightOperations } from "@/hooks/useHighlightOperations";

interface ReservationContextProps {
  reservations: Reservation[];
  pitches: Pitch[];
  addReservation: (reservation: Omit<Reservation, "id">) => void;
  updateReservation: (id: number, updates: Partial<Reservation>) => void;
  editReservation: (id: number, updates: Partial<Reservation>) => void;
  deleteReservation: (id: number) => void;
  joinReservation: (reservationId: number, userId: string, playerName: string) => void;
  cancelReservation: (reservationId: number, userId: string) => void;
  joinWaitingList: (reservationId: number, userId: string) => void;
  leaveWaitingList: (reservationId: number, userId: string) => void;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  addPitch: (pitch: Pitch) => void;
  updatePitch: (id: string, updates: Partial<Pitch>) => void;
  deletePitch: (id: number) => void;
  navigateToReservation: (pitchName: string) => void;
  setPitches: (pitches: Pitch[]) => void;
  setReservations: (reservations: Reservation[]) => void;
  joinGame: (reservationId: number, playerName?: string, userId?: string) => void;
  updateReservationStatus: (id: number, status: "upcoming" | "completed" | "cancelled") => void;
  getUserStats: (userId: string) => UserStats;
  deleteHighlight: (reservationId: number, highlightId: string) => void;
  removePlayerFromReservation: (reservationId: number, playerId: string) => void;
}

const ReservationContext = createContext<ReservationContextProps>({
  reservations: [],
  pitches: [],
  addReservation: () => {},
  updateReservation: () => {},
  editReservation: () => {},
  deleteReservation: () => {},
  joinReservation: () => {},
  cancelReservation: () => {},
  joinWaitingList: () => {},
  leaveWaitingList: () => {},
  isUserJoined: () => false,
  addPitch: () => {},
  updatePitch: () => {},
  deletePitch: () => {},
  navigateToReservation: () => {},
  setPitches: () => {},
  setReservations: () => {},
  joinGame: () => {},
  updateReservationStatus: () => {},
  getUserStats: () => ({ 
    wins: 0, 
    losses: 0, 
    draws: 0, 
    goals: 0, 
    assists: 0, 
    matches: 0,
    matchesPlayed: 0, 
    winPercentage: 0,
    gamesPlayed: 0,
    goalsScored: 0,
    cleansheets: 0,
    cleanSheets: 0,
    mvps: 0,
    mvp: 0,
    interceptions: 0
  }),
  deleteHighlight: () => {},
  removePlayerFromReservation: () => {},
});

interface ReservationProviderProps {
  children: ReactNode;
}

export const ReservationProvider: React.FC<ReservationProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  
  // Custom hooks for different functionalities
  const { reservations, setReservations } = useReservationStorage();
  const { addReservation, updateReservation, deleteReservation, updateReservationStatus } = useReservationOperations(reservations, setReservations);
  const { joinReservation, cancelReservation, removePlayerFromReservation, joinGame, isUserJoined } = usePlayerOperations(reservations, setReservations);
  const { joinWaitList, leaveWaitList } = useWaitingListOperations(setReservations);
  const { pitches, setPitches, addPitch, updatePitch, deletePitch } = usePitchOperations();
  const { getUserStats } = useUserStats(reservations);
  const { deleteHighlight } = useHighlightOperations(setReservations);

  const editReservation = (id: number, updates: Partial<Reservation>) => {
    updateReservation(id, updates);
  };

  const navigateToReservation = (pitchName: string) => {
    navigate(`/reservations?pitch=${pitchName}`);
  };

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        pitches,
        addReservation,
        updateReservation,
        editReservation,
        deleteReservation,
        joinReservation,
        cancelReservation,
        joinWaitingList: joinWaitList,
        leaveWaitingList: leaveWaitList,
        isUserJoined,
        addPitch,
        updatePitch,
        deletePitch,
        navigateToReservation,
        setPitches,
        setReservations,
        joinGame,
        updateReservationStatus,
        getUserStats,
        deleteHighlight,
        removePlayerFromReservation,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => useContext(ReservationContext);

export default ReservationContext;
export type { Player };
