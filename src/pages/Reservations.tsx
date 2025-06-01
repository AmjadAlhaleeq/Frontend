
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { CheckCircle, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation } from "@/context/ReservationContext";
import { Reservation } from "@/types/reservation";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import EnhancedDatePicker from "@/components/reservations/EnhancedDatePicker";
import GameDetailsDialog from "@/components/reservations/GameDetailsDialog";
import GameSummaryDialog from "@/components/reservations/GameSummaryDialog";
import PlayerSuspensionDialog from "@/components/reservations/PlayerSuspensionDialog";
import ReservationsHeader from "@/components/reservations/ReservationsHeader";
import ReservationsEmptyState from "@/components/reservations/ReservationsEmptyState";
import ReservationsList from "@/components/reservations/ReservationsList";
import PlayerProfileDialog from "@/components/ui/PlayerProfileDialog";

import { useReservationsData } from "@/hooks/useReservationsData";
import { useReservationActions } from "@/hooks/useReservationActions";

const Reservations = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<"admin" | "player" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [addDialogKey, setAddDialogKey] = useState(0);

  const [selectedGameForDetails, setSelectedGameForDetails] =
    useState<Reservation | null>(null);
  const [isGameDetailsDialogOpen, setIsGameDetailsDialogOpen] = useState(false);

  const [selectedGameForSummary, setSelectedGameForSummary] =
    useState<Reservation | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  const [playerProfile, setPlayerProfile] = useState<{
    isOpen: boolean;
    playerId: string;
    playerName?: string;
  }>({
    isOpen: false,
    playerId: "",
    playerName: "",
  });

  const [suspensionDialog, setSuspensionDialog] = useState<{
    isOpen: boolean;
    playerName: string;
    playerId: string;
  }>({
    isOpen: false,
    playerName: "",
    playerId: "",
  });

  const { reservations, isUserJoined, updateReservationStatus, getUserStats } =
    useReservation();

  const { isLoading, pitchImages, loadReservations } = useReservationsData();

  const {
    handleJoinGame,
    handleCancelReservation,
    handleJoinWaitingList,
    handleLeaveWaitingList,
    handleDeleteReservation,
    handleKickPlayer,
    handleSuspendPlayer,
    handleSaveSummary,
    calculateActualMaxPlayers,
  } = useReservationActions(
    currentUserId,
    userRole,
    reservations,
    loadReservations
  );

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

  // NOTE: Handle player click to navigate to profile page
  const handlePlayerClick = useCallback(
    (playerId: string, playerName?: string) => {
      navigate(`/player/${playerId}`);
    },
    [navigate]
  );

  // --- Upcoming/Completed section admin filter ---
  const upcomingReservations = useMemo(() => {
    let gamesToShow: Reservation[];
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    if (currentDate) {
      const dateString = format(currentDate, "yyyy-MM-dd");
      gamesToShow = reservations.filter(
        (res) => res.date === dateString && res.status === "upcoming"
      );
    } else {
      gamesToShow = reservations.filter(
        (res) => res.status === "upcoming" && new Date(res.date) >= today
      );
    }
    return gamesToShow.sort((a, b) => {
      const dateCompare =
        new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      const aTime = a.startTime || a.time?.split(" - ")[0] || "00:00";
      const bTime = b.startTime || b.time?.split(" - ")[0] || "00:00";
      return aTime.localeCompare(bTime);
    });
  }, [reservations, currentDate]);

  // "Completed" section as separate for admin, with live update and removal after summary
  const completedReservations = useMemo(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    return reservations.filter(
      (r) =>
        (r.status === "completed" || new Date(r.date) < new Date(todayISO)) &&
        !(typeof r.summary === "object" && (r.summary as any)?.completed)
    );
  }, [reservations]);

  const checkHasReservationsOnDate = (date: Date): boolean => {
    const dateString = format(date, "yyyy-MM-dd");
    return reservations.some((res) => res.date === dateString);
  };

  const handleOpenSuspensionDialog = useCallback(
    (playerId: string, playerName: string) => {
      setSuspensionDialog({
        isOpen: true,
        playerName,
        playerId,
      });
    },
    []
  );

  const handleAddSummary = useCallback((reservation: Reservation) => {
    setSelectedGameForSummary(reservation);
    setIsSummaryDialogOpen(true);
  }, []);

  const handleSaveSummaryWrapper = useCallback(
    async (summaryData: {
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
    }) => {
      if (!selectedGameForSummary) return;

      await handleSaveSummary(selectedGameForSummary.id, summaryData);

      setIsSummaryDialogOpen(false);
      setSelectedGameForSummary(null);
    },
    [selectedGameForSummary, handleSaveSummary]
  );

  const handleAddReservationSuccess = useCallback(() => {
    setAddDialogKey((prev) => prev + 1);
  }, []);

  const isUserJoinedFunction = useCallback(
    (reservationId: number, userId: string): boolean => {
      return isUserJoined(reservationId, userId);
    },
    [isUserJoined]
  );

  const safeSelectedGameForDetails = useMemo(() => {
    if (!selectedGameForDetails) return null;

    const gameExists = reservations.find(
      (res) => res.id === selectedGameForDetails.id
    );
    if (!gameExists) {
      setSelectedGameForDetails(null);
      setIsGameDetailsDialogOpen(false);
      return null;
    }

    return gameExists;
  }, [selectedGameForDetails, reservations]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="h-8 w-8 text-teal-500 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <ReservationsHeader
        userRole={userRole}
        addDialogKey={addDialogKey}
        onAddReservationSuccess={handleAddReservationSuccess}
        onLoadReservations={loadReservations}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Calendar */}
        <div className="lg:sticky lg:top-20 h-fit">
          <EnhancedDatePicker
            date={currentDate}
            onDateChange={setCurrentDate}
            hasReservations={checkHasReservationsOnDate}
            userRole={userRole}
          />
        </div>

        {/* Right Column: Upcoming Games and (ADMIN) Completed Games */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-teal-600 dark:text-teal-400 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Upcoming Games
            </h2>
          </div>

          {upcomingReservations.length === 0 ? (
            <ReservationsEmptyState
              currentDate={currentDate}
              userRole={userRole}
              onClearDateFilter={() => setCurrentDate(undefined)}
            />
          ) : (
            <ReservationsList
              upcomingReservations={[
                ...upcomingReservations,
                ...(userRole === "admin" ? completedReservations : []),
              ]}
              currentDate={currentDate}
              userRole={userRole}
              currentUserId={currentUserId}
              pitchImages={pitchImages}
              calculateActualMaxPlayers={calculateActualMaxPlayers}
              isUserJoined={isUserJoinedFunction}
              onJoin={(id, playerName) => {
                if (!currentUserId) {
                  toast({
                    title: "Login Required",
                    description: "Please log in to join a game.",
                    variant: "destructive",
                  });
                  return;
                }
                handleJoinGame(id);
              }}
              onCancel={(id, userId) => handleCancelReservation(id)}
              onJoinWaitingList={(id, userId) => handleJoinWaitingList(id)}
              onLeaveWaitingList={(id, userId) => handleLeaveWaitingList(id)}
              onDeleteReservation={
                userRole === "admin" ? handleDeleteReservation : undefined
              }
              onViewDetails={(reservation) => {
                setSelectedGameForDetails(reservation);
                setIsGameDetailsDialogOpen(true);
              }}
              onAddSummary={userRole === "admin" ? handleAddSummary : undefined}
              onClearDateFilter={() => setCurrentDate(undefined)}
              onKickPlayer={userRole === "admin" ? handleKickPlayer : undefined}
            />
          )}
        </div>
      </div>

      {/* Game Details Dialog */}
      {safeSelectedGameForDetails && (
        <GameDetailsDialog
          reservation={safeSelectedGameForDetails}
          isOpen={isGameDetailsDialogOpen}
          onClose={() => {
            setIsGameDetailsDialogOpen(false);
            setSelectedGameForDetails(null);
          }}
          isAdmin={userRole === "admin"}
          onStatusChange={(status) => {
            if (userRole === "admin" && safeSelectedGameForDetails) {
              updateReservationStatus(safeSelectedGameForDetails.id, status);
            }
          }}
          currentUserId={currentUserId || ""}
          actualMaxPlayers={calculateActualMaxPlayers(
            safeSelectedGameForDetails.maxPlayers
          )}
          onKickPlayer={
            userRole === "admin"
              ? (reservationId, playerId) => {
                  // For kick from game details, we need reason and suspension days
                  handleOpenSuspensionDialog(playerId, "Player");
                }
              : undefined
          }
          onSuspendPlayer={
            userRole === "admin" ? handleSuspendPlayer : undefined
          }
          pitchImage={pitchImages[safeSelectedGameForDetails.pitchId]}
          onPlayerClick={handlePlayerClick}
        />
      )}

      {/* Game Summary Dialog */}
      {selectedGameForSummary && (
        <GameSummaryDialog
          isOpen={isSummaryDialogOpen}
          onClose={() => {
            setIsSummaryDialogOpen(false);
            setSelectedGameForSummary(null);
          }}
          reservation={selectedGameForSummary}
          onSaveSummary={handleSaveSummaryWrapper}
        />
      )}

      {/* Player Suspension Dialog */}
      <PlayerSuspensionDialog
        isOpen={suspensionDialog.isOpen}
        onClose={() =>
          setSuspensionDialog({ isOpen: false, playerName: "", playerId: "" })
        }
        playerName={suspensionDialog.playerName}
        playerId={suspensionDialog.playerId}
        onConfirm={handleSuspendPlayer}
      />
    </div>
  );
};

export default Reservations;
