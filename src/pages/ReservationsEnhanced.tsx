import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, Loader, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Reservation } from "@/types/reservation";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import EnhancedDatePicker from "@/components/reservations/EnhancedDatePicker";
import GameDetailsDialog from "@/components/reservations/GameDetailsDialog";
import GameSummaryDialog from "@/components/reservations/GameSummaryDialog";
import PlayerSuspensionDialog from "@/components/reservations/PlayerSuspensionDialog";
import PlayerProfileDialog from "@/components/ui/PlayerProfileDialog";
import ReservationCardEnhanced from "@/components/reservations/ReservationCardEnhanced";

// New confirmation dialogs
import JoinGameDialog from "@/components/reservations/JoinGameDialog";
import JoinWaitlistDialog from "@/components/reservations/JoinWaitlistDialog";
import LeaveGameDialog from "@/components/reservations/LeaveGameDialog";
import LeaveWaitlistDialog from "@/components/reservations/LeaveWaitlistDialog";
import ActionConfirmationDialog from "@/components/reservations/ActionConfirmationDialog";

import {
  fetchAllReservations,
  joinReservationApi,
  cancelReservationApi,
  joinWaitlistApi,
  leaveWaitlistApi,
  deleteReservationApi,
  completeGameApi,
  addGameSummaryApi,
  kickPlayerApi,
  suspendPlayerApi,
  getPlayerProfileApi,
  type GameSummaryData,
} from "@/services/reservationApiService";

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

  // Dialog states
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [dialogStates, setDialogStates] = useState({
    joinGame: false,
    joinWaitlist: false,
    leaveGame: false,
    leaveWaitlist: false,
    gameDetails: false,
    gameSummary: false,
    deleteReservation: false,
    completeGame: false,
    playerProfile: false,
    playerSuspension: false,
  });

  const [playerProfile, setPlayerProfile] = useState<{
    playerId: string;
    playerName?: string;
  }>({ playerId: "", playerName: "" });

  const [suspensionData, setSuspensionData] = useState<{
    playerName: string;
    playerId: string;
  }>({ playerName: "", playerId: "" });

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
        waitingList: res.waitingList || [],
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

  // Dialog management
  const openDialog = (
    dialogName: keyof typeof dialogStates,
    reservation?: Reservation
  ) => {
    if (reservation) setSelectedReservation(reservation);
    setDialogStates((prev) => ({ ...prev, [dialogName]: true }));
  };

  const closeDialog = (dialogName: keyof typeof dialogStates) => {
    setDialogStates((prev) => ({ ...prev, [dialogName]: false }));
    if (dialogName !== "playerProfile" && dialogName !== "playerSuspension") {
      setSelectedReservation(null);
    }
  };

  // Utility functions
  const isUserJoined = (reservation: Reservation): boolean => {
    return !!reservation.lineup?.some(
      (player) => player.userId === currentUserId
    );
  };

  const isUserInWaitlist = (reservation: Reservation): boolean => {
    return !!reservation.waitingList?.includes(currentUserId || "");
  };

  const isFull = (reservation: Reservation): boolean => {
    return (reservation.lineup?.length || 0) >= reservation.maxPlayers;
  };

  // Player action handlers
  const handleJoinGame = async () => {
    if (!selectedReservation || !currentUserId) return;

    try {
      await joinReservationApi(selectedReservation.backendId);
      await loadReservations();
      closeDialog("joinGame");
      toast({
        title: "Joined Game!",
        description: "You have successfully joined the game.",
      });
    } catch (error) {
      toast({
        title: "Failed to Join",
        description:
          error instanceof Error ? error.message : "Failed to join the game",
        variant: "destructive",
      });
    }
  };

  const handleLeaveGame = async () => {
    if (!selectedReservation || !currentUserId) return;

    try {
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
    }
  };

  const handleJoinWaitlist = async () => {
    if (!selectedReservation || !currentUserId) return;

    try {
      await joinWaitlistApi(selectedReservation.backendId);
      await loadReservations();
      closeDialog("joinWaitlist");
      toast({
        title: "Added to Waiting List",
        description: "You've been added to the waiting list.",
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
    }
  };

  const handleLeaveWaitlist = async () => {
    if (!selectedReservation || !currentUserId) return;

    try {
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
    }
  };

  // Admin action handlers
  const handleDeleteReservation = async () => {
    if (!selectedReservation || userRole !== "admin") return;

    try {
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
    }
  };

  const handleCompleteGame = async () => {
    if (!selectedReservation || userRole !== "admin") return;

    try {
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
    }
  };

  const handleAddSummary = async (summaryData: GameSummaryData) => {
    if (!selectedReservation || userRole !== "admin") return;

    try {
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
    }
  };

  const handlePlayerClick = (playerId: string, playerName?: string) => {
    // Validate player ID before navigation
    if (!playerId || playerId.length < 10) {
      console.warn("Invalid player ID, cannot navigate:", playerId);
      toast({
        title: "Error",
        description: "Invalid player information",
        variant: "destructive",
      });
      return;
    }

    // Close any open dialogs first to prevent conflicts
    setDialogStates({
      joinGame: false,
      joinWaitlist: false,
      leaveGame: false,
      leaveWaitlist: false,
      gameDetails: false,
      gameSummary: false,
      deleteReservation: false,
      completeGame: false,
      playerProfile: false,
      playerSuspension: false,
    });

    // Use setTimeout to ensure dialog is closed before navigation
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
      await suspendPlayerApi(playerId, reason, suspensionDays);
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

  // Filter reservations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredReservations = currentDate
    ? reservations.filter(
        (res) => res.date === format(currentDate, "yyyy-MM-dd")
      )
    : reservations.filter((res) => new Date(res.date) >= today);

  const upcomingReservations = filteredReservations.filter(
    (res) => res.status === "upcoming"
  );
  const completedReservations = filteredReservations.filter(
    (res) => res.status === "completed"
  );

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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-400">
          Football Reservations
        </h1>
        {userRole === "admin" && (
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Reservation
          </button>
        )}
      </div>

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
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Games */}
          <div>
            <div className="flex items-center mb-4">
              <CheckCircle className="h-5 w-5 mr-2 text-teal-600" />
              <h2 className="text-xl font-semibold text-teal-600">
                Upcoming Games
              </h2>
            </div>

            {upcomingReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No upcoming games found.
              </div>
            ) : (
              <div className="grid gap-4">
                {upcomingReservations.map((reservation) => (
                  <ReservationCardEnhanced
                    key={reservation.id}
                    reservation={reservation}
                    userRole={userRole}
                    currentUserId={currentUserId || ""}
                    isUserJoined={isUserJoined(reservation)}
                    isUserInWaitlist={isUserInWaitlist(reservation)}
                    isFull={isFull(reservation)}
                    onJoinGame={() => openDialog("joinGame", reservation)}
                    onLeaveGame={() => openDialog("leaveGame", reservation)}
                    onJoinWaitlist={() =>
                      openDialog("joinWaitlist", reservation)
                    }
                    onLeaveWaitlist={() =>
                      openDialog("leaveWaitlist", reservation)
                    }
                    onViewDetails={() => openDialog("gameDetails", reservation)}
                    onDeleteReservation={() =>
                      openDialog("deleteReservation", reservation)
                    }
                    onCompleteGame={() =>
                      openDialog("completeGame", reservation)
                    }
                    pitchImage={pitchImages[reservation.pitchId]}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Completed Games (Admin Only) */}
          {userRole === "admin" && (
            <div>
              <div className="flex items-center mb-4">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                <h2 className="text-xl font-semibold text-blue-600">
                  Completed Games
                </h2>
              </div>

              {completedReservations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No completed games found.
                </div>
              ) : (
                <div className="grid gap-4">
                  {completedReservations.map((reservation) => {
                    const hasGameSummary =
                      reservation.summary &&
                      typeof reservation.summary === "object" &&
                      (reservation.summary as any)?.completed;

                    if (hasGameSummary) return null; // Don't show games with completed summaries

                    return (
                      <ReservationCardEnhanced
                        key={reservation.id}
                        reservation={reservation}
                        userRole={userRole}
                        currentUserId={currentUserId || ""}
                        isUserJoined={isUserJoined(reservation)}
                        isUserInWaitlist={isUserInWaitlist(reservation)}
                        isFull={isFull(reservation)}
                        onJoinGame={() => {}}
                        onLeaveGame={() => {}}
                        onJoinWaitlist={() => {}}
                        onLeaveWaitlist={() => {}}
                        onViewDetails={() =>
                          openDialog("gameDetails", reservation)
                        }
                        onAddSummary={() =>
                          openDialog("gameSummary", reservation)
                        }
                        pitchImage={pitchImages[reservation.pitchId]}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {selectedReservation && (
        <>
          <JoinGameDialog
            isOpen={dialogStates.joinGame}
            onClose={() => closeDialog("joinGame")}
            onConfirm={handleJoinGame}
            reservation={selectedReservation}
          />

          <JoinWaitlistDialog
            isOpen={dialogStates.joinWaitlist}
            onClose={() => closeDialog("joinWaitlist")}
            onConfirm={handleJoinWaitlist}
            reservation={selectedReservation}
          />

          <LeaveGameDialog
            isOpen={dialogStates.leaveGame}
            onClose={() => closeDialog("leaveGame")}
            onConfirm={handleLeaveGame}
            gameName={
              selectedReservation.pitchName || selectedReservation.title
            }
            gameDate={selectedReservation.date}
            gameTime={selectedReservation.time}
            isPenalty={false} // You can implement penalty logic here
            timeToGame="Unknown" // You can implement time calculation here
          />

          <LeaveWaitlistDialog
            isOpen={dialogStates.leaveWaitlist}
            onClose={() => closeDialog("leaveWaitlist")}
            onConfirm={handleLeaveWaitlist}
            reservation={selectedReservation}
          />

          <ActionConfirmationDialog
            open={dialogStates.deleteReservation}
            onOpenChange={(open) => !open && closeDialog("deleteReservation")}
            onConfirm={handleDeleteReservation}
            title="Delete Reservation"
            description="Are you sure you want to delete this reservation? This action cannot be undone."
            confirmButtonText="Delete"
            confirmButtonVariant="destructive"
          />

          <ActionConfirmationDialog
            open={dialogStates.completeGame}
            onOpenChange={(open) => !open && closeDialog("completeGame")}
            onConfirm={handleCompleteGame}
            title="Complete Game"
            description="Are you sure you want to mark this game as completed?"
            confirmButtonText="Complete"
          />

          <GameDetailsDialog
            reservation={selectedReservation}
            isOpen={dialogStates.gameDetails}
            onClose={() => closeDialog("gameDetails")}
            isAdmin={userRole === "admin"}
            currentUserId={currentUserId || ""}
            actualMaxPlayers={selectedReservation.maxPlayers}
            pitchImage={pitchImages[selectedReservation.pitchId]}
            onPlayerClick={handlePlayerClick}
            onStatusChange={(status) => {
              // Handle status change
            }}
          />

          <GameSummaryDialog
            isOpen={dialogStates.gameSummary}
            onClose={() => closeDialog("gameSummary")}
            reservation={selectedReservation}
            onSaveSummary={handleAddSummary}
          />
        </>
      )}

      <PlayerSuspensionDialog
        isOpen={dialogStates.playerSuspension}
        onClose={() => closeDialog("playerSuspension")}
        playerName={suspensionData.playerName}
        playerId={suspensionData.playerId}
        onConfirm={handleSuspendPlayer}
      />
    </div>
  );
};

export default ReservationsEnhanced;
