
import { useState, useEffect } from 'react';
import { Reservation } from '@/types/reservation';

export const useReservationStorage = () => {
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const storedReservations = localStorage.getItem("reservations");
      return storedReservations ? JSON.parse(storedReservations) : [];
    } catch (error) {
      console.error("Error parsing reservations from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  // Enhanced function to sync waiting list state with reservations
  const syncWaitingListState = (userId: string) => {
    const waitingListState = localStorage.getItem(`waitingList_${userId}`);
    if (!waitingListState) return;

    try {
      const waitingList = JSON.parse(waitingListState);
      setReservations(prev => prev.map(reservation => {
        const isInWaitingList = waitingList[reservation.id.toString()];
        if (isInWaitingList && !reservation.waitList?.includes(userId)) {
          return {
            ...reservation,
            waitList: [...(reservation.waitList || []), userId]
          };
        }
        if (!isInWaitingList && reservation.waitList?.includes(userId)) {
          return {
            ...reservation,
            waitList: reservation.waitList.filter(id => id !== userId)
          };
        }
        return reservation;
      }));
    } catch (error) {
      console.error('Error syncing waiting list state:', error);
    }
  };

  return { reservations, setReservations, syncWaitingListState };
};
