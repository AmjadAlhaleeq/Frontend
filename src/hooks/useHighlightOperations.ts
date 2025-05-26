
import { useCallback } from 'react';
import { Reservation } from '@/types/reservation';

export const useHighlightOperations = (
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>
) => {
  const deleteHighlight = useCallback((reservationId: number, highlightId: string) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          return {
            ...reservation,
            highlights: reservation.highlights?.filter(h => h.id !== highlightId) || []
          };
        }
        return reservation;
      })
    );
  }, [setReservations]);

  return { deleteHighlight };
};
