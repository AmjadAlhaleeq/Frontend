
import { useCallback } from 'react';
import { Reservation } from '@/types/reservation';

export const useWaitingListOperations = (
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>
) => {
  const joinWaitList = useCallback((reservationId: number, userId: string) => {
    console.log('Local state: Adding user to waitlist', { reservationId, userId });
    setReservations(prevReservations =>
      prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          const updatedWaitList = [...(reservation.waitList || [])];
          if (!updatedWaitList.includes(userId)) {
            updatedWaitList.push(userId);
          }
          console.log('Updated waitList for reservation:', reservationId, updatedWaitList);
          return {
            ...reservation,
            waitList: updatedWaitList,
          };
        }
        return reservation;
      })
    );
  }, [setReservations]);

  const leaveWaitList = useCallback((reservationId: number, userId: string) => {
    console.log('Local state: Removing user from waitlist', { reservationId, userId });
    setReservations(prevReservations =>
      prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          const updatedWaitList = reservation.waitList?.filter(id => id !== userId) || [];
          console.log('Updated waitList for reservation after removal:', reservationId, updatedWaitList);
          return {
            ...reservation,
            waitList: updatedWaitList,
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
