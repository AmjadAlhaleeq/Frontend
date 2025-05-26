
import { useCallback } from 'react';
import { Reservation, Player } from '@/types/reservation';

export const usePlayerOperations = (
  reservations: Reservation[],
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>
) => {
  const joinReservation = useCallback((reservationId: number, userId: string, playerName: string) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          const newPlayer: Player = { 
            userId: userId, 
            name: playerName,
            playerName: playerName,
            status: "joined",
            joinedAt: new Date().toISOString()
          };
          if (!reservation.lineup) {
            reservation.lineup = [];
          }
          return {
            ...reservation,
            lineup: [...reservation.lineup, newPlayer],
            playersJoined: (reservation.lineup.length + 1)
          };
        }
        return reservation;
      })
    );
  }, [setReservations]);

  const cancelReservation = useCallback((reservationId: number, userId: string) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          const updatedLineup = reservation.lineup?.filter(player => player.userId !== userId) || [];
          return {
            ...reservation,
            lineup: updatedLineup,
            playersJoined: updatedLineup.length
          };
        }
        return reservation;
      })
    );
  }, [setReservations]);

  const removePlayerFromReservation = useCallback((reservationId: number, playerId: string) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          const updatedLineup = reservation.lineup?.filter(player => player.userId !== playerId) || [];
          return {
            ...reservation,
            lineup: updatedLineup,
            playersJoined: updatedLineup.length
          };
        }
        return reservation;
      })
    );
  }, [setReservations]);

  const joinGame = useCallback((reservationId: number, playerName?: string, userId?: string) => {
    if (!userId) return;
    joinReservation(reservationId, userId, playerName || `Player ${userId.substring(0, 4)}`);
  }, [joinReservation]);

  const isUserJoined = useCallback((reservationId: number, userId: string) => {
    const reservation = reservations.find(res => res.id === reservationId);
    return !!reservation?.lineup?.some(player => player.userId === userId);
  }, [reservations]);

  return {
    joinReservation,
    cancelReservation,
    removePlayerFromReservation,
    joinGame,
    isUserJoined
  };
};
