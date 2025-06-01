
import { useCallback } from 'react';
import { Reservation } from '@/types/reservation';

export const useWaitingListOperations = (
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>
) => {
  const joinWaitList = useCallback((reservationId: number, userId: string) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          return {
            ...reservation,
            waitList: [...(reservation.waitList || []), userId],
          };
        }
        return reservation;
      })
    );
  }, [setReservations]);

  const leaveWaitList = useCallback((reservationId: number, userId: string) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          return {
            ...reservation,
            waitList: reservation.waitList?.filter(id => id !== userId),
          };
        }
        return reservation;
      })
    );
  }, [setReservations]);

  return {
    joinWaitList,
    leaveWaitList
  };
};
