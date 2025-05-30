import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useReservation } from "@/context/ReservationContext";
import {
  joinReservation as joinReservationApi,
  cancelReservation as cancelReservationApi,
  removeFromWaitlist,
  addToWaitlist,
} from "@/services/playerReservationApi";
import {
  deleteReservationApi,
  kickPlayer as kickPlayerApi,
  addGameSummary,
  suspendUser,
} from "@/services/adminReservationApi";

export const useReservationActions = (
  currentUserId: string | null,
  userRole: "admin" | "player" | null,
  reservations: any[],
  loadReservations: () => Promise<void>
) => {
  const { toast } = useToast();
  const {
    joinGame,
    cancelReservation,
    joinWaitingList,
    leaveWaitingList,
    deleteReservation,
    removePlayerFromReservation,
  } = useReservation();

  const calculateActualMaxPlayers = (maxPlayers: number) => {
    return maxPlayers;
  };

  // Check if user can join waitlist (3 days before game to game end)
  const formatTo24HourTime = (timeStr: string): string => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const formatted = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    return formatted;
  };

  const canJoinWaitlist = (reservation: any) => {
    const rawDate = reservation.date;
    const rawTimeRaw = reservation.time?.split(" - ")[0] || "00:00";
    const rawTime =
      rawTimeRaw.includes("AM") || rawTimeRaw.includes("PM")
        ? formatTo24HourTime(rawTimeRaw)
        : rawTimeRaw;

    const dateTimeString = `${rawDate}T${rawTime}`;
    const gameDateTime = new Date(dateTimeString);
    const now = new Date();
    const threeDaysBeforeGame = new Date(
      gameDateTime.getTime() - 3 * 24 * 60 * 60 * 1000
    );

    console.log({
      rawDate,
      rawTime,
      dateTimeString,
      gameDateTime,
      now,
      threeDaysBeforeGame,
      canJoin: now >= threeDaysBeforeGame && now <= gameDateTime,
    });

    return now >= threeDaysBeforeGame && now <= gameDateTime;
  };

  const handleJoinGame = useCallback(
    async (reservationId: number) => {
      if (!currentUserId) {
        toast({
          title: "Login Required",
          description: "Please log in to join a game.",
          variant: "destructive",
        });
        return;
      }

      if (userRole === "admin") {
        toast({
          title: "Admin Restriction",
          description: "Admins cannot join games.",
          variant: "destructive",
        });
        return;
      }

      const reservation = reservations.find((r) => r.id === reservationId);
      if (!reservation) {
        toast({
          title: "Error",
          description: "Reservation not found.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already in the game
      const isUserJoined = reservation.lineup?.some(
        (player: any) => player.userId === currentUserId
      );
      if (isUserJoined) {
        toast({
          title: "Already Joined",
          description: "You have already joined this game.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is in waiting list
      const isUserInWaitingList =
        reservation.waitingList?.includes(currentUserId);
      if (isUserInWaitingList) {
        toast({
          title: "On Waiting List",
          description: "You are already on the waiting list for this game.",
          variant: "destructive",
        });
        return;
      }

      const currentPlayers = reservation.lineup?.length || 0;
      const maxPlayers = calculateActualMaxPlayers(reservation.maxPlayers);

      try {
        console.log(
          "Attempting to join reservation with ID:",
          reservation.backendId
        );
        const result = await joinReservationApi(reservation.backendId);

        // Check if user was added to waitlist or joined directly
        if (result.message.includes("waitlist")) {
          // User was added to waitlist
          joinWaitingList(reservationId, currentUserId);
          toast({
            title: "Added to Waiting List",
            description:
              "Game is full. You've been added to the waiting list and will be notified if a spot becomes available.",
          });
        } else {
          // User joined the game directly
          joinGame(reservationId, undefined, currentUserId);
          toast({
            title: "Joined Game!",
            description:
              "You have successfully joined the game. See you on the pitch!",
          });
        }

        await loadReservations();
      } catch (error) {
        console.error("Error joining game:", error);
        toast({
          title: "Failed to Join",
          description:
            error instanceof Error ? error.message : "Failed to join the game",
          variant: "destructive",
        });
      }
    },
    [
      currentUserId,
      userRole,
      reservations,
      joinGame,
      joinWaitingList,
      toast,
      loadReservations,
    ]
  );

  const handleCancelReservation = useCallback(
    async (reservationId: number) => {
      if (!currentUserId) {
        toast({
          title: "Login Required",
          description: "Please log in to cancel a reservation.",
          variant: "destructive",
        });
        return;
      }

      try {
        const reservation = reservations.find((r) => r.id === reservationId);
        if (!reservation) throw new Error("Reservation not found");

        await cancelReservationApi(reservation.backendId);
        cancelReservation(reservationId, currentUserId);

        toast({
          title: "Left Game",
          description:
            "You have left the game. Your spot is now available for others.",
        });

        await loadReservations();
      } catch (error) {
        console.error("Error cancelling reservation:", error);
        toast({
          title: "Failed to Cancel",
          description:
            error instanceof Error
              ? error.message
              : "Failed to cancel the reservation",
          variant: "destructive",
        });
      }
    },
    [currentUserId, reservations, cancelReservation, toast, loadReservations]
  );

  const handleJoinWaitingList = useCallback(
    async (reservationId: number) => {
      console.log("handleJoinWaitingList called with:", reservationId);

      if (!currentUserId) {
        toast({
          title: "Login Required",
          description: "Please log in to join the waiting list.",
          variant: "destructive",
        });
        return;
      }

      if (userRole === "admin") {
        toast({
          title: "Admin Restriction",
          description: "Admins cannot join waiting lists.",
          variant: "destructive",
        });
        return;
      }

      const reservation = reservations.find((r) => r.id === reservationId);
      if (!reservation) {
        toast({
          title: "Error",
          description: "Reservation not found.",
          variant: "destructive",
        });
        return;
      }

      // Check if within allowed time window
      if (!canJoinWaitlist(reservation)) {
        toast({
          title: "Cannot Join Waitlist",
          description:
            "You can only join the waitlist from 3 days before the game until the game ends.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already in the game
      const isUserJoined = reservation.lineup?.some(
        (player: any) => player.userId === currentUserId
      );
      if (isUserJoined) {
        toast({
          title: "Already in Game",
          description: "You are already part of this game.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already in waiting list
      const isUserInWaitingList =
        reservation.waitingList?.includes(currentUserId);
      if (isUserInWaitingList) {
        toast({
          title: "Already on Waiting List",
          description: "You are already on the waiting list for this game.",
          variant: "destructive",
        });
        return;
      }

      try {
        console.log(
          "Adding to waiting list for reservation:",
          reservation.backendId
        );
        await addToWaitlist(reservation.backendId);
        joinWaitingList(reservationId, currentUserId);

        const waitingPosition = (reservation.waitingList?.length || 0) + 1;
        toast({
          title: "Added to Waiting List",
          description: `You're #${waitingPosition} on the waiting list. You'll be notified if a spot becomes available.`,
        });

        await loadReservations();
      } catch (error) {
        console.error("Error joining waitlist:", error);
        toast({
          title: "Failed to Join Waitlist",
          description:
            error instanceof Error
              ? error.message
              : "Failed to join the waiting list",
          variant: "destructive",
        });
      }
    },
    [
      currentUserId,
      userRole,
      reservations,
      joinWaitingList,
      toast,
      loadReservations,
    ]
  );

  const handleLeaveWaitingList = useCallback(
    async (reservationId: number) => {
      if (!currentUserId) {
        toast({
          title: "Login Required",
          description: "Please log in to leave the waiting list.",
          variant: "destructive",
        });
        return;
      }

      try {
        const reservation = reservations.find((r) => r.id === reservationId);
        if (!reservation) throw new Error("Reservation not found");

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
          description:
            error instanceof Error
              ? error.message
              : "Failed to leave the waiting list",
          variant: "destructive",
        });
      }
    },
    [currentUserId, reservations, leaveWaitingList, toast, loadReservations]
  );

  const handleDeleteReservation = useCallback(
    async (reservationId: number) => {
      if (!currentUserId || userRole !== "admin") {
        toast({
          title: "Permission Denied",
          description: "Only admins can delete reservations.",
          variant: "destructive",
        });
        return;
      }

      try {
        const reservation = reservations.find((r) => r.id === reservationId);
        if (!reservation) throw new Error("Reservation not found");

        await deleteReservationApi(reservation.backendId);
        deleteReservation(reservationId);

        toast({
          title: "Reservation Deleted",
          description: "The reservation has been successfully deleted.",
        });

        await loadReservations();
      } catch (error) {
        console.error("Error deleting reservation:", error);
        toast({
          title: "Failed to Delete",
          description:
            error instanceof Error
              ? error.message
              : "Failed to delete the reservation",
          variant: "destructive",
        });
      }
    },
    [
      currentUserId,
      userRole,
      reservations,
      deleteReservation,
      toast,
      loadReservations,
    ]
  );

  const handleKickPlayer = useCallback(
    async (
      reservationId: number,
      playerId: string,
      suspensionDays: number,
      reason: string
    ) => {
      if (userRole !== "admin") return;

      try {
        const reservation = reservations.find((r) => r.id === reservationId);
        if (!reservation) throw new Error("Reservation not found");
        if (!reservation.backendId)
          throw new Error("Reservation backendId missing");

        await kickPlayerApi(
          reservation.backendId,
          playerId,
          reason,
          suspensionDays
        );

        // Remove player from local state immediately
        removePlayerFromReservation(reservationId, playerId);

        await loadReservations();

        toast({
          title: "Player Kicked",
          description: `The player has been removed and suspended for ${suspensionDays} day${
            suspensionDays > 1 ? "s" : ""
          }.`,
        });
      } catch (error) {
        toast({
          title: "Failed to Kick Player",
          description:
            error instanceof Error
              ? error.message
              : "Failed to kick the player",
          variant: "destructive",
        });
      }
    },
    [
      userRole,
      reservations,
      toast,
      loadReservations,
      removePlayerFromReservation,
    ]
  );

  const handleSuspendPlayer = useCallback(
    async (playerId: string, suspensionDays: number, reason: string) => {
      if (userRole !== "admin") return;

      try {
        await suspendUser(playerId, reason, suspensionDays);

        toast({
          title: "Player Suspended",
          description: `Player has been suspended for ${suspensionDays} day${
            suspensionDays > 1 ? "s" : ""
          }.`,
        });

        await loadReservations();
      } catch (error) {
        toast({
          title: "Failed to Suspend Player",
          description:
            error instanceof Error
              ? error.message
              : "Failed to suspend the player",
          variant: "destructive",
        });
      }
    },
    [userRole, toast, loadReservations]
  );

  const handleSaveSummary = useCallback(
    async (
      reservationId: number,
      summaryData: {
        mvp?: string;
        players: Array<{
          userId: string;
          played: boolean;
          won: boolean;
          goals?: number;
          assists?: number;
          interceptions?: number;
          cleanSheet?: boolean;
        }>;
        absentees?: Array<{
          userId: string;
          reason: string;
          suspensionDays: number;
        }>;
      }
    ) => {
      try {
        const reservation = reservations.find((r) => r.id === reservationId);
        if (!reservation) throw new Error("Reservation not found");

        await addGameSummary(reservation.backendId, summaryData);

        toast({
          title: "Summary Saved",
          description:
            "Game summary and player stats have been saved successfully.",
        });

        await loadReservations();
      } catch (error) {
        console.error("Error saving summary:", error);
        toast({
          title: "Failed to Save Summary",
          description:
            error instanceof Error
              ? error.message
              : "Failed to save the game summary",
          variant: "destructive",
        });
      }
    },
    [reservations, toast, loadReservations]
  );

  return {
    handleJoinGame,
    handleCancelReservation,
    handleJoinWaitingList,
    handleLeaveWaitingList,
    handleDeleteReservation,
    handleKickPlayer,
    handleSuspendPlayer,
    handleSaveSummary,
    calculateActualMaxPlayers,
  };
};
