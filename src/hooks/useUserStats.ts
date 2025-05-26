
import { useCallback } from 'react';
import { Reservation, UserStats } from '@/types/reservation';

export const useUserStats = (reservations: Reservation[]) => {
  const getUserStats = useCallback((userId: string): UserStats => {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let goals = 0;
    let assists = 0;
    let matchesPlayed = 0;
    let gamesPlayed = 0;
    let goalsScored = 0;
    let cleansheets = 0;
    let mvps = 0;

    reservations.forEach(reservation => {
      if (reservation.status === 'completed' && reservation.lineup?.some(player => player.userId === userId)) {
        matchesPlayed++;
        gamesPlayed++;
      }
    });

    const winPercentage = matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0;

    return {
      wins,
      losses,
      draws,
      goals,
      assists,
      matchesPlayed,
      winPercentage,
      gamesPlayed,
      goalsScored,
      cleansheets,
      mvps
    };
  }, [reservations]);

  return { getUserStats };
};
