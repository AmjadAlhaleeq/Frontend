
import React, { useState, useEffect, useCallback } from "react";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Reservation } from "@/types/reservation";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import EnhancedDatePicker from "@/components/reservations/EnhancedDatePicker";
import ReservationsEnhancedHeader from "@/components/reservations/ReservationsEnhancedHeader";
import ReservationsEnhancedList from "@/components/reservations/ReservationsEnhancedList";
import ReservationsEnhancedDialogs from "@/components/reservations/ReservationsEnhancedDialogs";

import { useReservationDialogs } from "@/hooks/useReservationDialogs";
import { useReservationFiltering } from "@/hooks/useReservationFiltering";

import {
  fetchAllReservations,
  joinReservationApi,
  cancelReservationApi,
  joinWaitlistApi,
  leaveWaitlistApi,
  deleteReservationApi,
  completeGameApi,
  addGameSummaryApi,
  type GameSummaryData,
} from "@/services/reservationApiService";

import { kickPlayer, suspendUser } from "@/services/adminReservationApi";

const ReservationsEnhanced = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<"admin" | "player" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Data states
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pitchImages, setPitchImages] = useState<Record<string, string>>({});

  // Custom hooks
  const {
    selectedReservation,
    dialogStates,
    suspensionData,
    setSuspensionData,
    openDialog,
    closeDialog,
  } = useReservationDialogs();

  const { upcomingReservations, completedReservations } =
    useReservationFiltering(reservations, currentDate);

  // Add loading states for better UX
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Initialize user data
  useEffect(() => {
    const role = localStorage.getItem("userRole") as "admin" | "player" | null;
    setUserRole(role);

    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setCurrentUserId(userData.id);
    }
  }, []);

  // Load reservations from API
  const loadReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllReservations();

      // Transform backend data to frontend format
      const transformedReservations = data.map((res: any) => ({
        id: res._id,
        backendId: res._id,
        pitchName: res.pitch?.name || "Unknown Pitch",
        title: res.pitch?.name || "Unknown Pitch",
        date:
          res.startDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        time: res.startTime || "00:00",
        startTime: res.startTime,
        endTime: res.endTime,
        location: res.pitch?.location || "Unknown Location",
        city: res.pitch?.city || "Unknown City",
        maxPlayers: res.maxPlayers || 10,
        playersJoined: res.currentPlayers?.length || 0,
        lineup:
          res.currentPlayers?.map((player: any) => ({
            userId: player._id || player.userId,
            name: `${player.firstName} ${player.lastName}`,
            playerName: `${player.firstName} ${player.lastName}`,
            status: "joined",
            joinedAt: new Date().toISOString(),
          })) || [],
        waitList: res.waitList || [],
        status: res.status || "upcoming",
        price: res.pricePerPlayer,
        imageUrl: res.pitch?.images?.[0] || null,
        summary: res.summary || null,
        pitchId: res.pitch?._id || res.pitchId,
      }));

      setReservations(transformedReservations);

      // Set pitch images
      const images: Record<string, string> = {};
      transformedReservations.forEach((res: any) => {
        if (res.imageUrl && res.pitchId) {
          images[res.pitchId] = res.imageUrl;
        }
      });
      setPitchImages(images);
    } catch (error) {
      console.error("Error loading reservations:", error);
      toast({
        title: "Failed to Load Reservations",
        description:
          error instanceof Error
            ? error.message
            : "Could not load reservations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  // Utility functions
  const isUserJoined = (reservation: Reservation): boolean => {
    return !!reservation.lineup?.some(
      (player) => player.userId === currentUserId
    );
  };

  const isUserInWaitlist = (reservation: Reservation): boolean => {
    return !!reservation.waitList?.includes(currentUserId || "");
  };

  const isFull = (reservation: Reservation): boolean => {
    return (reservation.lineup?.length || 0) >= reservation.maxPlayers;
  };

  // Player action handlers with loading states
  const handleJoinGame = async () => {
    if (!selectedReservation || !currentUserId) return;

    try {
      setLoading(`join-${selectedReservation.id}`, true);
      const result = await joinReservationApi(selectedReservation.backendId);
      await loadReservations();
      closeDialog("joinGame");

      if (result.message.includes("waitlist")) {
        toast({
          title: "Added to Waiting List",
          description:
            "Game is full. You've been added to the waiting list and will be notified if a spot becomes available.",
        });
      } else {
        toast({
          title: "Joined Game!",
          description: "You have successfully joined the game.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Join",
        description:
          error instanceof Error ? error.message : "Failed to join the game",
        variant: "destructive",
      });
    } finally {
      setLoading(`join-${selectedReservation.id}`, false);
    }
  };

  const handleLeaveGame = async () => {
    if (!selectedReservation || !currentUserId) return;

    try {
      setLoading(`leave-${selectedReservation.id}`, true);
      await cancelReservationApi(selectedReservation.backendId);
      await loadReservations();
      closeDialog("leaveGame");
      toast({
        title: "Left Game",
        description: "You have left the game successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to Leave",
        description:
          error instanceof Error ? error.message : "Failed to leave the game",
        variant: "destructive",
      });
    } finally {
      setLoading(`leave-${selectedReservation.id}`, false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!selectedReservation || !currentUserId) return;

    try {
      setLoading(`waitlist-${selectedReservation.id}`, true);
      const result = await joinWaitlistApi(selectedReservation.backendId);
      await loadReservations();
      closeDialog("joinWaitlist");
      toast({
        title: "Added to Waiting List",
        description:
          "You've been added to the waiting list and will be notified if a spot becomes available.",
      });
    } catch (error) {
      toast({
        title: "Failed to Join Waitlist",
        description:
          error instanceof Error
            ? error.message
            : "Failed to join the waiting list",
        variant: "destructive",
      });
    } finally {
      setLoading(`waitlist-${selectedReservation.id}`, false);
    }
  };

  const handleLeaveWaitlist = async () => {
    if (!selectedReservation || !currentUserId) return;

    try {
      setLoading(`waitlist-${selectedReservation.id}`, true);
      await leaveWaitlistApi(selectedReservation.backendId);
      await loadReservations();
      closeDialog("leaveWaitlist");
      toast({
        title: "Left Waiting List",
        description: "You've been removed from the waiting list.",
      });
    } catch (error) {
      toast({
        title: "Failed to Leave Waitlist",
        description:
          error instanceof Error
            ? error.message
            : "Failed to leave the waiting list",
        variant: "destructive",
      });
    } finally {
      setLoading(`waitlist-${selectedReservation.id}`, false);
    }
  };

  // Admin action handlers
  const handleDeleteReservation = async () => {
    if (!selectedReservation || userRole !== "admin") return;

    try {
      setLoading(`delete-${selectedReservation.id}`, true);
      await deleteReservationApi(selectedReservation.backendId);
      await loadReservations();
      closeDialog("deleteReservation");
      toast({
        title: "Reservation Deleted",
        description: "The reservation has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Failed to Delete",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete the reservation",
        variant: "destructive",
      });
    } finally {
      setLoading(`delete-${selectedReservation.id}`, false);
    }
  };

  const handleCompleteGame = async () => {
    if (!selectedReservation || userRole !== "admin") return;

    try {
      setLoading(`complete-${selectedReservation.id}`, true);
      await completeGameApi(selectedReservation.backendId);
      await loadReservations();
      closeDialog("completeGame");
      toast({
        title: "Game Completed",
        description: "The game has been marked as completed.",
      });
    } catch (error) {
      toast({
        title: "Failed to Complete Game",
        description:
          error instanceof Error
            ? error.message
            : "Failed to complete the game",
        variant: "destructive",
      });
    } finally {
      setLoading(`complete-${selectedReservation.id}`, false);
    }
  };

  const handleAddSummary = async (summaryData: GameSummaryData) => {
    if (!selectedReservation || userRole !== "admin") return;

    try {
      setLoading(`summary-${selectedReservation.id}`, true);
      await addGameSummaryApi(selectedReservation.backendId, summaryData);
      await loadReservations();
      closeDialog("gameSummary");
      toast({
        title: "Summary Added",
        description: "Game summary has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to Add Summary",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save the game summary",
        variant: "destructive",
      });
    } finally {
      setLoading(`summary-${selectedReservation.id}`, false);
    }
  };

  // Fixed kick player handler - now opens suspension dialog
  const handleKickPlayer = async (playerId: string, playerName: string) => {
    // Set suspension data and open dialog
    setSuspensionData({
      playerId,
      playerName,
      reason: "",
      suspensionDays: 1,
    });
    openDialog("playerSuspension");
  };

  // This will be called from the suspension dialog
  const handleConfirmKickWithSuspension = async (
    playerId: string,
    suspensionDays: number,
    reason: string
  ) => {
    if (!selectedReservation || userRole !== "admin") return;

    try {
      setLoading(`kick-${playerId}`, true);
      await kickPlayer(
        selectedReservation.backendId,
        playerId,
        reason,
        suspensionDays
      );
      await loadReservations();
      closeDialog("playerSuspension");
      toast({
        title: "Player Kicked",
        description: `Player has been removed and suspended for ${suspensionDays} day${
          suspensionDays > 1 ? "s" : ""
        }.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Kick Player",
        description:
          error instanceof Error ? error.message : "Failed to kick the player",
        variant: "destructive",
      });
    } finally {
      setLoading(`kick-${playerId}`, false);
    }
  };

  const handlePlayerClick = (playerId: string, playerName?: string) => {
    if (!playerId || playerId.length < 10) {
      console.warn("Invalid player ID, cannot navigate:", playerId);
      toast({
        title: "Error",
        description: "Invalid player information",
        variant: "destructive",
      });
      return;
    }

    setTimeout(() => {
      navigate(`/player/${playerId}`);
    }, 100);
  };

  const handleSuspendPlayer = async (
    playerId: string,
    suspensionDays: number,
    reason: string
  ) => {
    try {
      await suspendUser(playerId, reason, suspensionDays);
      await loadReservations();
      closeDialog("playerSuspension");
      toast({
        title: "Player Suspended",
        description: `Player has been suspended for ${suspensionDays} day${
          suspensionDays > 1 ? "s" : ""
        }.`,
      });
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
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="h-8 w-8 text-teal-500 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ReservationsEnhancedHeader userRole={userRole} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:sticky lg:top-20 h-fit">
          <EnhancedDatePicker
            date={currentDate}
            onDateChange={setCurrentDate}
            hasReservations={(date) =>
              reservations.some(
                (res) => res.date === format(date, "yyyy-MM-dd")
              )
            }
          />
        </div>

        {/* Reservations List */}
        <ReservationsEnhancedList
          upcomingReservations={upcomingReservations}
          completedReservations={completedReservations}
          userRole={userRole}
          currentUserId={currentUserId || ""}
          pitchImages={pitchImages}
          isUserJoined={isUserJoined}
          isUserInWaitlist={isUserInWaitlist}
          isFull={isFull}
          onJoinGame={(reservation) => openDialog("joinGame", reservation)}
          onLeaveGame={(reservation) => openDialog("leaveGame", reservation)}
          onJoinWaitlist={(reservation) =>
            openDialog("joinWaitlist", reservation)
          }
          onLeaveWaitlist={(reservation) =>
            openDialog("leaveWaitlist", reservation)
          }
          onViewDetails={(reservation) =>
            openDialog("gameDetails", reservation)
          }
          onDeleteReservation={(reservation) =>
            openDialog("deleteReservation", reservation)
          }
          onKickPlayer={handleKickPlayer}
          onAddSummary={(reservation) => openDialog("gameSummary", reservation)}
          loadingStates={loadingStates}
        />
      </div>

      {/* Dialogs */}
      <ReservationsEnhancedDialogs
        selectedReservation={selectedReservation}
        dialogStates={dialogStates}
        suspensionData={suspensionData}
        userRole={userRole}
        currentUserId={currentUserId || ""}
        pitchImages={pitchImages}
        onCloseDialog={closeDialog}
        onJoinGame={handleJoinGame}
        onJoinWaitlist={handleJoinWaitlist}
        onLeaveGame={handleLeaveGame}
        onLeaveWaitlist={handleLeaveWaitlist}
        onDeleteReservation={handleDeleteReservation}
        onCompleteGame={handleCompleteGame}
        onAddSummary={handleAddSummary}
        onSuspendPlayer={handleConfirmKickWithSuspension}
        onPlayerClick={handlePlayerClick}
        loadingStates={loadingStates}
      />
    </div>
  );
};

export default ReservationsEnhanced;
