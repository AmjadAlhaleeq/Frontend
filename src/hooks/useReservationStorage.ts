
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

  return { reservations, setReservations };
};
