
import { useMemo } from 'react';
import { Reservation } from '@/types/reservation';

export const useReservationFiltering = (
  reservations: Reservation[],
  selectedDate: string | null,
  userRole: "admin" | "player" | null
) => {
  const filteredReservations = useMemo(() => {
    let filtered = reservations;

    // For players, show all reservations (including past ones)
    // For admins, show all reservations as well
    if (selectedDate) {
      filtered = filtered.filter(reservation => 
        reservation.date === selectedDate
      );
    }

    // Sort by date and time, with most recent first
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }, [reservations, selectedDate, userRole]);

  // Separate current, upcoming, and past reservations
  const categorizedReservations = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const current: Reservation[] = [];
    const upcoming: Reservation[] = [];
    const past: Reservation[] = [];

    filteredReservations.forEach(reservation => {
      const reservationDate = reservation.date;
      const gameDateTime = new Date(`${reservation.date}T${reservation.time || '00:00'}`);

      if (reservation.status === 'completed' || gameDateTime < now) {
        past.push(reservation);
      } else if (reservationDate === today) {
        current.push(reservation);
      } else {
        upcoming.push(reservation);
      }
    });

    return {
      current: current.sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.time || '00:00'}`);
        const timeB = new Date(`${b.date}T${b.time || '00:00'}`);
        return timeA.getTime() - timeB.getTime();
      }),
      upcoming: upcoming.sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.time || '00:00'}`);
        const timeB = new Date(`${b.date}T${b.time || '00:00'}`);
        return timeA.getTime() - timeB.getTime();
      }),
      past: past.sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.time || '00:00'}`);
        const timeB = new Date(`${b.date}T${b.time || '00:00'}`);
        return timeB.getTime() - timeA.getTime(); // Most recent past games first
      })
    };
  }, [filteredReservations]);

  return {
    filteredReservations,
    categorizedReservations
  };
};
