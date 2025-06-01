
import { useCallback } from 'react';
import { Reservation } from '@/types/reservation';

export const useWaitingListOperations = (
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>
) => {
  const joinWaitingList = useCallback((reservationId: number, userId: string) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          return {
            ...reservation,
            waitingList: [...(reservation.waitingList || []), userId],
          };
        }
        return reservation;
      })
    );
  }, [setReservations]);

  const leaveWaitingList = useCallback((reservationId: number, userId: string) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          return {
            ...reservation,
            waitingList: reservation.waitingList?.filter(id => id !== userId),
          };
        }
        return reservation;
      })
    );
  }, [setReservations]);

  return {
    joinWaitingList,
    leaveWaitingList
  };
};
