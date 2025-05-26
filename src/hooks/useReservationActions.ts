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

    // Check if user is in waiting list
    const isUserInWaitingList = reservation.waitingList?.includes(currentUserId);
    if (isUserInWaitingList) {
      toast({ 
        title: "On Waiting List", 
        description: "You are already on the waiting list for this game.", 
        variant: "destructive"
      });
      return;
    }

    const currentPlayers = reservation.lineup?.length || 0;
    const maxPlayers = calculateActualMaxPlayers(reservation.maxPlayers);

    // If game is full, automatically add to waiting list
    if (currentPlayers >= maxPlayers) {
      console.log('Game is full, attempting to join waiting list');
      await handleJoinWaitingList(reservationId);
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
        title: "Already in Game",
        description: "You are already part of this game.",
        variant: "destructive"
      });
      return;
    }

    // Check if user is already in waiting list
    const isUserInWaitingList = reservation.waitingList?.includes(currentUserId);
    if (isUserInWaitingList) {
      toast({
        title: "Already on Waiting List",
        description: "You are already on the waiting list for this game.",
        variant: "destructive"
      });
      return;
    }
    
    if (reservation.waitingList && reservation.waitingList.length >= 3) {
      toast({
        title: "Waiting List Full",
        description: "The waiting list is limited to 3 players",
        variant: "destructive"
      });
      return;
    }
    
    // --- FIX: Only allow waitlist if all slots are full ---
    const currentPlayers = reservation.lineup?.length || 0;
    const maxPlayers = calculateActualMaxPlayers(reservation.maxPlayers);
    if (currentPlayers < maxPlayers) {
      toast({
        title: "Game Not Full",
        description: `You can only join the waiting list after all ${maxPlayers} slots are full.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Adding to waiting list for reservation:', reservation.backendId);
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
      if (!reservation.backendId) throw new Error('Reservation backendId missing');

      await kickPlayerApi(reservation.backendId, playerId);
      // **Do not update count locally.** Just reload from DB, will reflect correct player count
      await loadReservations();

      toast({
        title: "Player Kicked",
        description: "The player has been removed from the game.",
      });

    } catch (error) {
      toast({
        title: "Failed to Kick Player",
        description: error instanceof Error ? error.message : "Failed to kick the player",
        variant: "destructive",
      });
    }
  }, [userRole, reservations, toast, loadReservations]);

  const handleSaveSummary = useCallback(async (reservationId: number, summary: string, playerStats: any[], absentees: any[]) => {
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) throw new Error('Reservation not found');
      
      // Get MVP from the playerStats (this should be passed separately in the updated function)
      const mvpPlayer = playerStats.find(p => p.userId === summary); // This will be fixed in the component
      
      const requestBody = {
        mvp: mvpPlayer?.userId,
        players: playerStats.map(player => ({
          userId: player.userId,
          played: player.attended,
          won: player.won,
          goals: player.goals || 0,
          assists: player.assists || 0,
          interceptions: player.interceptions || 0,
          cleanSheet: player.cleanSheet || false
        })),
        absentees: absentees.map(absentee => ({
          userId: absentee.userId,
          reason: absentee.reason,
          suspensionDays: absentee.suspensionDays
        }))
      };
      
      await addGameSummary(reservation.backendId, requestBody);
      
      toast({
        title: "Summary Saved",
        description: "Game summary saved, stats updated, and reservation completed.",
      });
      
      await loadReservations();
    } catch (error) {
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
