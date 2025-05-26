
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useReservation } from '@/context/ReservationContext';
import {
  joinReservation as joinReservationApi,
  cancelReservation as cancelReservationApi,
  deleteReservation as deleteReservationApi
} from '@/services/reservationApi';

export const useReservationActions = (
  currentUserId: string | null,
  userRole: 'admin' | 'player' | null,
  reservations: any[],
  loadReservations: () => Promise<void>
) => {
  const { toast } = useToast();
  const {
    joinGame,
    cancelReservation,
    deleteReservation
  } = useReservation();

  const calculateActualMaxPlayers = (maxPlayers: number) => {
    return maxPlayers;
  };

  const handleJoinGame = useCallback(async (reservationId: number) => {
    if (!currentUserId) {
      toast({ 
        title: "Login Required", 
        description: "Please log in to join a game.", 
        variant: "destructive"
      });
      return;
    }
    
    if (userRole === 'admin') {
      toast({ 
        title: "Admin Restriction", 
        description: "Admins cannot join games.", 
        variant: "destructive"
      });
      return;
    }

    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) {
      toast({ 
        title: "Error", 
        description: "Reservation not found.", 
        variant: "destructive"
      });
      return;
    }

    // Check if user is already in the game
    const isUserJoined = reservation.lineup?.some((player: any) => player.userId === currentUserId);
    if (isUserJoined) {
      toast({ 
        title: "Already Joined", 
        description: "You have already joined this game.", 
        variant: "destructive"
      });
      return;
    }

    const currentPlayers = reservation.lineup?.length || 0;
    const maxPlayers = calculateActualMaxPlayers(reservation.maxPlayers);

    // If game is full, show message
    if (currentPlayers >= maxPlayers) {
      toast({
        title: "Game is Full",
        description: "This game has reached maximum capacity.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Attempting to join reservation with ID:', reservation.backendId);
      await joinReservationApi(reservation.backendId);
      joinGame(reservationId, undefined, currentUserId);
      
      toast({
        title: "Joined Game!",
        description: "You have successfully joined the game. See you on the pitch!",
      });
      
      await loadReservations();
    } catch (error) {
      console.error("Error joining game:", error);
      toast({
        title: "Failed to Join",
        description: error instanceof Error ? error.message : "Failed to join the game",
        variant: "destructive",
      });
    }
  }, [currentUserId, userRole, reservations, joinGame, toast, loadReservations]);

  const handleCancelReservation = useCallback(async (reservationId: number) => {
    if (!currentUserId) {
      toast({ 
        title: "Login Required", 
        description: "Please log in to cancel a reservation.", 
        variant: "destructive"
      });
      return;
    }

    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) throw new Error('Reservation not found');
      
      await cancelReservationApi(reservation.backendId);
      cancelReservation(reservationId, currentUserId);
      
      toast({
        title: "Left Game",
        description: "You have left the game. Your spot is now available for others.",
      });
      
      await loadReservations();
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast({
        title: "Failed to Cancel",
        description: error instanceof Error ? error.message : "Failed to cancel the reservation",
        variant: "destructive",
      });
    }
  }, [currentUserId, reservations, cancelReservation, toast, loadReservations]);

  const handleDeleteReservation = useCallback(async (reservationId: number) => {
    if (!currentUserId || userRole !== 'admin') {
      toast({ 
        title: "Permission Denied", 
        description: "Only admins can delete reservations.", 
        variant: "destructive"
      });
      return;
    }

    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) throw new Error('Reservation not found');
      
      await deleteReservationApi(reservation.backendId);
      deleteReservation(reservationId);
      
      toast({
        title: "Reservation Deleted",
        description: "The reservation has been successfully deleted."
      });
      
      await loadReservations();
    } catch (error) {
      console.error("Error deleting reservation:", error);
      toast({
        title: "Failed to Delete",
        description: error instanceof Error ? error.message : "Failed to delete the reservation",
        variant: "destructive",
      });
    }
  }, [currentUserId, userRole, reservations, deleteReservation, toast, loadReservations]);

  return {
    handleJoinGame,
    handleCancelReservation,
    handleDeleteReservation,
    calculateActualMaxPlayers
  };
};
