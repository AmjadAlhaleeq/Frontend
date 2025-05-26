import React, { useState, useMemo, useEffect, useCallback } from "react";
import { CheckCircle, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation, Reservation } from "@/context/ReservationContext";
import { format } from 'date-fns';

import EnhancedDatePicker from "@/components/reservations/EnhancedDatePicker";
import GameDetailsDialog from "@/components/reservations/GameDetailsDialog";
import AddSummaryDialog from "@/components/reservations/AddSummaryDialog";
import PlayerSuspensionDialog from "@/components/reservations/PlayerSuspensionDialog";
import ReservationsHeader from "@/components/reservations/ReservationsHeader";
import ReservationsEmptyState from "@/components/reservations/ReservationsEmptyState";
import ReservationsList from "@/components/reservations/ReservationsList";
import PlayerProfileDialog from "@/components/ui/PlayerProfileDialog";
import GameActionConfirmationDialog from "@/components/reservations/GameActionConfirmationDialog";
import PlayerMessagesDialog from "@/components/reservations/PlayerMessagesDialog";

import { useReservationsData } from "@/hooks/useReservationsData";
import { useReservationActions } from "@/hooks/useReservationActions";

/**
 * Main Reservations page component
 * Handles game browsing, joining, leaving, and player interactions
 * Includes proper UX confirmations and messaging system
 */
const Reservations = () => {
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'admin' | 'player' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [addDialogKey, setAddDialogKey] = useState(0);
  
  // Dialog states
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<Reservation | null>(null);
  const [isGameDetailsDialogOpen, setIsGameDetailsDialogOpen] = useState(false);
  
  const [selectedGameForSummary, setSelectedGameForSummary] = useState<Reservation | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  
  const [playerProfile, setPlayerProfile] = useState<{
    isOpen: boolean;
    playerId: string;
    playerName?: string;
  }>({
    isOpen: false,
    playerId: "",
    playerName: ""
  });
  
  const [suspensionDialog, setSuspensionDialog] = useState<{
    isOpen: boolean;
    playerName: string;
    playerId: string;
  }>({
    isOpen: false,
    playerName: "",
    playerId: ""
  });

  // Game action confirmation dialog
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    action: 'join' | 'leave';
    reservationId: number;
    gameName: string;
    gameDate: string;
    gameTime: string;
    gameLocation: string;
    price?: number;
  }>({
    isOpen: false,
    action: 'join',
    reservationId: 0,
    gameName: '',
    gameDate: '',
    gameTime: '',
    gameLocation: ''
  });

  // Messages dialog
  const [messagesDialog, setMessagesDialog] = useState<{
    isOpen: boolean;
    reservationId: number;
    gameName: string;
  }>({
    isOpen: false,
    reservationId: 0,
    gameName: ''
  });
  
  const {
    reservations,
    isUserJoined,
    updateReservationStatus,
  } = useReservation();

  const { isLoading, pitchImages, loadReservations } = useReservationsData();

  const {
    handleJoinGame,
    handleCancelReservation,
    handleDeleteReservation,
    handleJoinWaitingList,
    handleLeaveWaitingList,
    handleKickPlayer,
    handleSaveSummary,
    calculateActualMaxPlayers
  } = useReservationActions(currentUserId, userRole, reservations, loadReservations);

  // Initialize user data
  useEffect(() => {
    try {
      const role = localStorage.getItem('userRole') as 'admin' | 'player' | null;
      setUserRole(role);
      
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setCurrentUserId(userData.id);
        setCurrentUserName(`${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Player');
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  }, []);

  const upcomingReservations = useMemo(() => {
    try {
      let gamesToShow: Reservation[];
      const today = new Date(new Date().setHours(0, 0, 0, 0)); 

      if (currentDate) {
        const dateString = format(currentDate, 'yyyy-MM-dd');
        const filtered = reservations.filter(
          res => res.date === dateString && res.status === "upcoming"
        );
        gamesToShow = filtered;
      } else {
        gamesToShow = reservations.filter(
          (res) => res.status === "upcoming" && 
                   new Date(res.date) >= today
        );
      }
      return gamesToShow.sort((a,b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        
        const aTime = a.startTime || a.time?.split(' - ')[0] || '00:00';
        const bTime = b.startTime || b.time?.split(' - ')[0] || '00:00';
        return aTime.localeCompare(bTime);
      });
    } catch (error) {
      console.error('Error filtering reservations:', error);
      return [];
    }
  }, [reservations, currentDate]);
  
  const checkHasReservationsOnDate = (date: Date): boolean => {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      return reservations.some(res => res.date === dateString);
    } catch (error) {
      console.error('Error checking reservations on date:', error);
      return false;
    }
  };

  const handleJoinGameWithConfirmation = useCallback((reservationId: number) => {
    if (!currentUserId) {
      toast({ 
        title: "Login Required", 
        description: "Please log in to join a game.", 
        variant: "destructive"
      });
      return;
    }

    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    setActionDialog({
      isOpen: true,
      action: 'join',
      reservationId,
      gameName: reservation.title || reservation.pitchName,
      gameDate: reservation.date,
      gameTime: reservation.startTime || reservation.time?.split(' - ')[0] || '',
      gameLocation: reservation.city || reservation.location || '',
      price: reservation.price
    });
  }, [currentUserId, reservations, toast]);

  /**
   * Opens confirmation dialog for leaving a game
   */
  const handleLeaveGameWithConfirmation = useCallback((reservationId: number) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    setActionDialog({
      isOpen: true,
      action: 'leave',
      reservationId,
      gameName: reservation.title || reservation.pitchName,
      gameDate: reservation.date,
      gameTime: reservation.startTime || reservation.time?.split(' - ')[0] || '',
      gameLocation: reservation.city || reservation.location || ''
    });
  }, [reservations]);

  /**
   * Confirms the game action (join/leave)
   */
  const confirmGameAction = useCallback(async () => {
    const { action, reservationId } = actionDialog;
    
    try {
      if (action === 'join') {
        await handleJoinGame(reservationId);
      } else {
        await handleCancelReservation(reservationId);
      }
      
      setActionDialog({
        isOpen: false,
        action: 'join',
        reservationId: 0,
        gameName: '',
        gameDate: '',
        gameTime: '',
        gameLocation: ''
      });
    } catch (error) {
      console.error(`Error ${action}ing game:`, error);
    }
  }, [actionDialog, handleJoinGame, handleCancelReservation]);

  /**
   * Opens messages dialog for a game
   */
  const handleOpenMessages = useCallback((reservationId: number) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    setMessagesDialog({
      isOpen: true,
      reservationId,
      gameName: reservation.title || reservation.pitchName
    });
  }, [reservations]);

  const handleSuspendPlayer = useCallback((playerId: string, days: number, reason: string) => {
    if (userRole !== 'admin') return;
    
    toast({
      title: "Player Suspended",
      description: `Player has been suspended for ${days} day${days > 1 ? 's' : ''}.`,
    });
  }, [userRole, toast]);

  const handleOpenSuspensionDialog = useCallback((playerId: string, playerName: string) => {
    setSuspensionDialog({
      isOpen: true,
      playerName,
      playerId
    });
  }, []);

  const handlePlayerClick = useCallback((playerId: string, playerName?: string) => {
    setPlayerProfile({
      isOpen: true,
      playerId,
      playerName
    });
  }, []);

  const handleAddSummary = useCallback((reservation: Reservation) => {
    setSelectedGameForSummary(reservation);
    setIsSummaryDialogOpen(true);
  }, []);

  const handleSaveSummaryWrapper = useCallback(async (summary: string, playerStats: any[]) => {
    if (!selectedGameForSummary) return;
    
    await handleSaveSummary(selectedGameForSummary.id, summary, playerStats);
    
    setIsSummaryDialogOpen(false);
    setSelectedGameForSummary(null);
  }, [selectedGameForSummary, handleSaveSummary]);

  const handleAddReservationSuccess = useCallback(() => {
    setAddDialogKey(prev => prev + 1);
  }, []);

  const isUserJoinedFunction = useCallback((reservationId: number, userId: string): boolean => {
    return isUserJoined(reservationId, userId);
  }, [isUserJoined]);

  const safeSelectedGameForDetails = useMemo(() => {
    if (!selectedGameForDetails) return null;
    
    const gameExists = reservations.find(res => res.id === selectedGameForDetails.id);
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
          />
        </div>

        {/* Right Column: Upcoming Games */}
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
              upcomingReservations={upcomingReservations}
              currentDate={currentDate}
              userRole={userRole}
              currentUserId={currentUserId}
              pitchImages={pitchImages}
              calculateActualMaxPlayers={calculateActualMaxPlayers}
              isUserJoined={isUserJoinedFunction}
              onJoin={handleJoinGameWithConfirmation}
              onCancel={handleLeaveGameWithConfirmation}
              onJoinWaitingList={(id, userId) => handleJoinWaitingList(id, userId)}
              onLeaveWaitingList={(id, userId) => handleLeaveWaitingList(id, userId)}
              onDeleteReservation={userRole === 'admin' ? handleDeleteReservation : undefined}
              onViewDetails={(reservation) => {
                setSelectedGameForDetails(reservation);
                setIsGameDetailsDialogOpen(true);
              }}
              onAddSummary={userRole === 'admin' ? handleAddSummary : undefined}
              onClearDateFilter={() => setCurrentDate(undefined)}
              onOpenMessages={userRole === 'player' ? handleOpenMessages : undefined}
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
          isAdmin={userRole === 'admin'}
          onStatusChange={(status) => {
            if (userRole === 'admin' && safeSelectedGameForDetails) {
              updateReservationStatus(safeSelectedGameForDetails.id, status);
            }
          }}
          currentUserId={currentUserId || ""}
          actualMaxPlayers={calculateActualMaxPlayers(safeSelectedGameForDetails.maxPlayers)}
          onKickPlayer={userRole === 'admin' ? (reservationId: number, playerId: string) => handleKickPlayer(playerId, reservationId) : undefined}
          onSuspendPlayer={userRole === 'admin' ? handleSuspendPlayer : undefined}
          pitchImage={pitchImages[safeSelectedGameForDetails.pitchId]}
          onPlayerClick={handlePlayerClick}
        />
      )}

      {/* Add Summary Dialog */}
      {selectedGameForSummary && (
        <AddSummaryDialog
          isOpen={isSummaryDialogOpen}
          onClose={() => {
            setIsSummaryDialogOpen(false);
            setSelectedGameForSummary(null);
          }}
          reservation={selectedGameForSummary}
          onSave={handleSaveSummaryWrapper}
          onSuspendPlayer={handleOpenSuspensionDialog}
        />
      )}

      {/* Game Action Confirmation Dialog */}
      <GameActionConfirmationDialog
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({
          isOpen: false,
          action: 'join',
          reservationId: 0,
          gameName: '',
          gameDate: '',
          gameTime: '',
          gameLocation: ''
        })}
        onConfirm={confirmGameAction}
        action={actionDialog.action}
        gameName={actionDialog.gameName}
        gameDate={actionDialog.gameDate}
        gameTime={actionDialog.gameTime}
        gameLocation={actionDialog.gameLocation}
        price={actionDialog.price}
      />

      {/* Messages Dialog */}
      <PlayerMessagesDialog
        isOpen={messagesDialog.isOpen}
        onClose={() => setMessagesDialog({ isOpen: false, reservationId: 0, gameName: '' })}
        reservationId={messagesDialog.reservationId}
        gameName={messagesDialog.gameName}
        currentUserId={currentUserId || ''}
        currentUserName={currentUserName}
      />

      {/* Player Profile Dialog */}
      <PlayerProfileDialog
        isOpen={playerProfile.isOpen}
        onClose={() => setPlayerProfile({ isOpen: false, playerId: "", playerName: "" })}
        playerId={playerProfile.playerId}
        playerName={playerProfile.playerName}
        playerStats={{
          gamesPlayed: 12,
          goals: 8,
          assists: 5,
          wins: 9
        }}
      />

      {/* Player Suspension Dialog */}
      <PlayerSuspensionDialog
        isOpen={suspensionDialog.isOpen}
        onClose={() => setSuspensionDialog({ isOpen: false, playerName: "", playerId: "" })}
        playerName={suspensionDialog.playerName}
        playerId={suspensionDialog.playerId}
        onConfirm={handleSuspendPlayer}
      />
    </div>
  );
};

export default Reservations;
