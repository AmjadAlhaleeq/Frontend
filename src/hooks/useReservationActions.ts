
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useReservation } from '@/context/ReservationContext';
import {
  joinReservation as joinReservationApi,
  cancelReservation as cancelReservationApi,
  removeFromWaitlist,
  addToWaitlist
} from '@/services/playerReservationApi';
import {
  deleteReservationApi,
  kickPlayer as kickPlayerApi,
  addGameSummary
} from '@/services/adminReservationApi';

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
    joinWaitingList,
    leaveWaitingList,
    deleteReservation
  } = useReservation();

  const calculateActualMaxPlayers = (maxPlayers: number) => {
    return maxPlayers + 2;
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

    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) throw new Error('Reservation not found');
      
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

  const handleJoinWaitingList = useCallback(async (reservationId: number) => {
    if (!currentUserId) {
      toast({ 
        title: "Login Required", 
        description: "Please log in to join the waiting list.", 
        variant: "destructive"
      });
      return;
    }
    
    if (userRole === 'admin') {
      toast({ 
        title: "Admin Restriction", 
        description: "Admins cannot join waiting lists.", 
        variant: "destructive"
      });
      return;
    }
    
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation && reservation.lineup && reservation.lineup.length < calculateActualMaxPlayers(reservation.maxPlayers)) {
      toast({
        title: "Game not full",
        description: "You can only join the waiting list when the game is full.",
        variant: "destructive"
      });
      return;
    }
    
    if (reservation && reservation.waitingList && reservation.waitingList.length >= 3) {
      toast({
        title: "Waiting List Full",
        description: "The waiting list is limited to 3 players",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addToWaitlist(reservation.backendId);
      joinWaitingList(reservationId, currentUserId);
      
      toast({
        title: "Added to Waiting List",
        description: "You'll be notified if a spot becomes available.",
      });
      
      await loadReservations();
    } catch (error) {
      console.error("Error joining waitlist:", error);
      toast({
        title: "Failed to Join Waitlist",
        description: error instanceof Error ? error.message : "Failed to join the waiting list",
        variant: "destructive",
      });
    }
  }, [currentUserId, userRole, reservations, joinWaitingList, toast, loadReservations]);

  const handleLeaveWaitingList = useCallback(async (reservationId: number) => {
    if (!currentUserId) {
      toast({ 
        title: "Login Required", 
        description: "Please log in to leave the waiting list.", 
        variant: "destructive"
      });
      return;
    }

    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) throw new Error('Reservation not found');
      
      await removeFromWaitlist(reservation.backendId);
      leaveWaitingList(reservationId, currentUserId);
      
      toast({
        title: "Left Waiting List",
        description: "You have been removed from the waiting list.",
      });
      
      await loadReservations();
    } catch (error) {
      console.error("Error leaving waitlist:", error);
      toast({
        title: "Failed to Leave Waitlist",
        description: error instanceof Error ? error.message : "Failed to leave the waiting list",
        variant: "destructive",
      });
    }
  }, [currentUserId, reservations, leaveWaitingList, toast, loadReservations]);

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

  const handleKickPlayer = useCallback(async (reservationId: number, playerId: string) => {
    if (userRole !== 'admin') return;
    
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) throw new Error('Reservation not found');
      
      await kickPlayerApi(reservation.backendId, playerId);
      cancelReservation(reservationId, playerId);
      
      toast({
        title: "Player Kicked",
        description: "The player has been removed from the game.",
      });
      
      await loadReservations();
    } catch (error) {
      console.error("Error kicking player:", error);
      toast({
        title: "Failed to Kick Player",
        description: error instanceof Error ? error.message : "Failed to kick the player",
        variant: "destructive",
      });
    }
  }, [userRole, reservations, cancelReservation, toast, loadReservations]);

  const handleSaveSummary = useCallback(async (reservationId: number, summary: string, playerStats: any[]) => {
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) throw new Error('Reservation not found');
      
      await addGameSummary(reservation.backendId, { summary, playerStats });
      
      toast({
        title: "Summary Saved",
        description: "Game summary and player stats have been saved successfully.",
      });
      
      await loadReservations();
    } catch (error) {
      console.error("Error saving summary:", error);
      toast({
        title: "Failed to Save Summary",
        description: error instanceof Error ? error.message : "Failed to save the game summary",
        variant: "destructive",
      });
    }
  }, [reservations, toast, loadReservations]);

  return {
    handleJoinGame,
    handleCancelReservation,
    handleJoinWaitingList,
    handleLeaveWaitingList,
    handleDeleteReservation,
    handleKickPlayer,
    handleSaveSummary,
    calculateActualMaxPlayers
  };
};
