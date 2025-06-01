
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { format } from "date-fns";
import { Reservation } from "@/types/reservation";
import ReservationCard from "./ReservationCard";
import ActionConfirmationDialog from "./ActionConfirmationDialog";
import PlayerSuspensionDialog from "./PlayerSuspensionDialog";
import WaitlistConfirmationDialog from "./WaitlistConfirmationDialog";
import { useWaitingListPersistence } from "@/hooks/useWaitingListPersistence";

interface ReservationsListProps {
  upcomingReservations: Reservation[];
  currentDate: Date | undefined;
  userRole: "admin" | "player" | null;
  currentUserId: string | null;
  pitchImages: Record<string, string>;
  calculateActualMaxPlayers: (maxPlayers: number) => number;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  onJoin: (id: number, playerName?: string) => void;
  onCancel: (id: number, userId: string) => void;
  onJoinWaitingList: (id: number, userId: string) => void;
  onLeaveWaitingList: (id: number, userId: string) => void;
  onDeleteReservation?: (id: number) => void;
  onViewDetails: (reservation: Reservation) => void;
  onAddSummary?: (reservation: Reservation) => void;
  onClearDateFilter: () => void;
  onKickPlayer?: (reservationId: number, playerId: string, suspensionDays: number, reason: string) => void;
}

const ReservationsList: React.FC<ReservationsListProps> = ({
  upcomingReservations,
  currentDate,
  userRole,
  currentUserId,
  pitchImages,
  calculateActualMaxPlayers,
  isUserJoined,
  onJoin,
  onCancel,
  onJoinWaitingList,
  onLeaveWaitingList,
  onDeleteReservation,
  onViewDetails,
  onAddSummary,
  onClearDateFilter,
  onKickPlayer,
}) => {
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    type: 'join' | 'leave' | 'delete';
    reservation?: Reservation;
    title: string;
    description: string;
    confirmText: string;
    action: () => void;
  }>({ open: false, type: 'join', title: '', description: '', confirmText: '', action: () => {} });

  const [waitlistDialog, setWaitlistDialog] = useState<{
    open: boolean;
    reservation?: Reservation;
    isJoining: boolean;
  }>({ open: false, isJoining: false });

  const [suspensionDialog, setSuspensionDialog] = useState<{
    open: boolean;
    playerName: string;
    playerId: string;
    reservationId: number;
  }>({ open: false, playerName: '', playerId: '', reservationId: 0 });

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const { addToWaitingList, removeFromWaitingList, isInWaitingList, syncWithServerData } = useWaitingListPersistence(currentUserId);

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  // Filter reservations by status and date
  const todayISO = new Date().toISOString().slice(0, 10);
  const completedReservations = upcomingReservations.filter(
    (r) => r.status === "completed" || new Date(r.date) < new Date(todayISO)
  );
  const filteredUpcoming = upcomingReservations.filter(
    (r) => r.status === "upcoming" && new Date(r.date) >= new Date(todayISO)
  );

  // Only admins see completed games section
  const sections =
    userRole === "admin"
      ? [
          {
            title: "Upcoming Games",
            data: filteredUpcoming,
          },
          {
            title: "Completed Games",
            data: completedReservations,
          },
        ]
      : [
          {
            title: "My Upcoming Games",
            data: filteredUpcoming,
          },
        ];

  // When admin adds a summary, remove from completed section (exclude those with summary.completed)
  const getSectionData = (section: string, data: Reservation[]) => {
    if (
      section === "Completed Games" &&
      userRole === "admin" &&
      !!onAddSummary
    ) {
      return data.filter(
        (res) =>
          !(typeof res.summary === "object" && (res.summary as any)?.completed)
      );
    }
    return data;
  };

  const handleJoinClick = (reservation: Reservation) => {
    setConfirmationDialog({
      open: true,
      type: 'join',
      reservation,
      title: 'Join Game?',
      description: `Are you sure you want to join the game at ${reservation.pitchName || reservation.title} on ${reservation.date} at ${reservation.time}?`,
      confirmText: 'Join Game',
      action: async () => {
        setLoading(`join-${reservation.id}`, true);
        await onJoin(reservation.id);
        setLoading(`join-${reservation.id}`, false);
        setConfirmationDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleLeaveClick = (reservation: Reservation) => {
    setConfirmationDialog({
      open: true,
      type: 'leave',
      reservation,
      title: 'Leave Game?',
      description: `Are you sure you want to leave the game at ${reservation.pitchName || reservation.title} on ${reservation.date} at ${reservation.time}?`,
      confirmText: 'Leave Game',
      action: async () => {
        if (currentUserId) {
          setLoading(`leave-${reservation.id}`, true);
          await onCancel(reservation.id, currentUserId);
          setLoading(`leave-${reservation.id}`, false);
          setConfirmationDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleJoinWaitlistClick = (reservation: Reservation) => {
    setWaitlistDialog({
      open: true,
      reservation,
      isJoining: true
    });
  };

  const handleLeaveWaitlistClick = (reservation: Reservation) => {
    setWaitlistDialog({
      open: true,
      reservation,
      isJoining: false
    });
  };

  const handleWaitlistConfirm = async () => {
    if (!waitlistDialog.reservation || !currentUserId) return;

    const reservation = waitlistDialog.reservation;
    setLoading(`waitlist-${reservation.id}`, true);

    if (waitlistDialog.isJoining) {
      await onJoinWaitingList(reservation.id, currentUserId);
      addToWaitingList(reservation.id.toString());
    } else {
      await onLeaveWaitingList(reservation.id, currentUserId);
      removeFromWaitingList(reservation.id.toString());
    }

    setLoading(`waitlist-${reservation.id}`, false);
    setWaitlistDialog({ open: false, isJoining: false });
  };

  const handleDeleteClick = (reservation: Reservation) => {
    setConfirmationDialog({
      open: true,
      type: 'delete',
      reservation,
      title: 'Delete Reservation?',
      description: `Are you sure you want to delete the reservation "${reservation.title}" scheduled for ${reservation.date} at ${reservation.time}? This action cannot be undone.`,
      confirmText: 'Delete Reservation',
      action: async () => {
        if (onDeleteReservation) {
          setLoading(`delete-${reservation.id}`, true);
          await onDeleteReservation(reservation.id);
          setLoading(`delete-${reservation.id}`, false);
          setConfirmationDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleKickPlayerClick = (reservation: Reservation, playerId: string, playerName: string) => {
    setSuspensionDialog({
      open: true,
      playerName,
      playerId,
      reservationId: reservation.id
    });
  };

  const handleKickPlayerConfirm = async (playerId: string, suspensionDays: number, reason: string) => {
    if (onKickPlayer) {
      setLoading(`kick-${playerId}`, true);
      await onKickPlayer(suspensionDialog.reservationId, playerId, suspensionDays, reason);
      setLoading(`kick-${playerId}`, false);
      setSuspensionDialog({ open: false, playerName: '', playerId: '', reservationId: 0 });
    }
  };

  // Check if user is in waiting list - combining server data with local persistence
  const isUserInWaitingListCheck = (reservation: Reservation): boolean => {
    // Check both server data and local persistence
    const serverWaitlist = reservation.waitList?.includes(currentUserId || "");
    const localWaitlist = isInWaitingList(reservation.id.toString());
    return serverWaitlist || localWaitlist;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-1 px-1">
        <div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">
          {currentDate
            ? `Showing games on ${format(currentDate, "MMM d, yyyy")}`
            : `Showing all games`}
        </div>
        {currentDate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearDateFilter}
            className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
          >
            <XCircle className="h-3.5 w-3.5 mr-1" /> Clear Filter
          </Button>
        )}
      </div>

      {sections.map((s) => (
        <div key={s.title}>
          <div className="text-sm text-teal-700 mt-4 mb-2 font-semibold">
            {s.title}
          </div>
          {getSectionData(s.title, s.data).length === 0 ? (
            <div className="text-xs text-muted-foreground px-2 pb-4">
              No games found.
            </div>
          ) : (
            getSectionData(s.title, s.data).map((reservation) => (
              <div
                key={`reservation-${reservation.id}`}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => onViewDetails(reservation)}
              >
                <ReservationCard
                  reservation={reservation}
                  userId={currentUserId || ""}
                  userRole={userRole || "player"}
                  onJoin={() => handleJoinClick(reservation)}
                  onCancel={() => handleLeaveClick(reservation)}
                  onJoinWaitingList={() => handleJoinWaitlistClick(reservation)}
                  onLeaveWaitingList={() => handleLeaveWaitlistClick(reservation)}
                  isUserJoined={isUserJoined}
                  isFull={
                    reservation.lineup
                      ? reservation.lineup.length >=
                        calculateActualMaxPlayers(reservation.maxPlayers)
                      : false
                  }
                  onDeleteReservation={() => handleDeleteClick(reservation)}
                  onViewDetails={onViewDetails}
                  onAddSummary={onAddSummary}
                  onKickPlayer={(playerId, playerName) => handleKickPlayerClick(reservation, playerId, playerName)}
                  isUserLoggedIn={!!currentUserId}
                  pitchImage={pitchImages[reservation.pitchId]}
                  isUserInWaitingList={isUserInWaitingListCheck}
                  loadingStates={loadingStates}
                />
              </div>
            ))
          )}
        </div>
      ))}

      {/* Confirmation Dialog */}
      <ActionConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, open }))}
        onConfirm={confirmationDialog.action}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        confirmButtonText={confirmationDialog.confirmText}
        confirmButtonVariant={confirmationDialog.type === 'delete' ? 'destructive' : 'default'}
      />

      {/* Waitlist Confirmation Dialog */}
      <WaitlistConfirmationDialog
        isOpen={waitlistDialog.open}
        onClose={() => setWaitlistDialog({ open: false, isJoining: false })}
        onConfirm={handleWaitlistConfirm}
        gameName={waitlistDialog.reservation?.pitchName || waitlistDialog.reservation?.title || ''}
        gameDate={waitlistDialog.reservation?.date || ''}
        gameTime={waitlistDialog.reservation?.time || ''}
        isJoining={waitlistDialog.isJoining}
      />

      {/* Player Suspension Dialog */}
      <PlayerSuspensionDialog
        isOpen={suspensionDialog.open}
        onClose={() => setSuspensionDialog({ open: false, playerName: '', playerId: '', reservationId: 0 })}
        playerName={suspensionDialog.playerName}
        playerId={suspensionDialog.playerId}
        onConfirm={handleKickPlayerConfirm}
        actionType="kick"
      />
    </>
  );
};

export default ReservationsList;
