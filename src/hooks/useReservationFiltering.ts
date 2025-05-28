
import { useMemo } from "react";
import { format } from "date-fns";
import { Reservation } from "@/types/reservation";

export const useReservationFiltering = (
  reservations: Reservation[],
  currentDate: Date | undefined
) => {
  const filteredReservations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return currentDate
      ? reservations.filter(
          (res) => res.date === format(currentDate, "yyyy-MM-dd")
        )
      : reservations.filter((res) => new Date(res.date) >= today);
  }, [reservations, currentDate]);

  const upcomingReservations = useMemo(() => 
    filteredReservations.filter((res) => res.status === "upcoming"),
    [filteredReservations]
  );

  const completedReservations = useMemo(() => 
    filteredReservations.filter((res) => res.status === "completed"),
    [filteredReservations]
  );

  return {
    filteredReservations,
    upcomingReservations,
    completedReservations,
  };
};
