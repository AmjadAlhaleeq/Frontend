
import { useCallback } from 'react';
import { Reservation, Player } from '@/types/reservation';

export const useReservationOperations = (
  reservations: Reservation[],
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>
) => {
  const addReservation = useCallback((reservation: Omit<Reservation, "id">) => {
    const newReservation: Reservation = {
      ...reservation,
      id: Date.now(),
      playersJoined: 0,
    };
    setReservations(prev => [...prev, newReservation]);
  }, [setReservations]);

  const updateReservation = useCallback((id: number, updates: Partial<Reservation>) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation =>
        reservation.id === id ? { ...reservation, ...updates } : reservation
      )
    );
  }, [setReservations]);

  const deleteReservation = useCallback((id: number) => {
    setReservations(prevReservations =>
      prevReservations.filter(reservation => reservation.id !== id)
    );
  }, [setReservations]);

  const updateReservationStatus = useCallback((id: number, status: "upcoming" | "completed" | "cancelled") => {
    updateReservation(id, { status });
  }, [updateReservation]);

  return {
    addReservation,
    updateReservation,
    deleteReservation,
    updateReservationStatus
  };
};
