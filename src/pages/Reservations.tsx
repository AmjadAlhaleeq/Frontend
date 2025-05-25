import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  CalendarIcon,
  ArrowRight,
  ListFilter,
  XCircle,
  Loader,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation, Reservation } from "@/context/ReservationContext";
import EnhancedDatePicker from "@/components/reservations/EnhancedDatePicker";
import ReservationCard from "@/components/reservations/ReservationCard";
import GameDetailsDialog from "@/components/reservations/GameDetailsDialog";
import AddSummaryDialog from "@/components/reservations/AddSummaryDialog";
import PlayerSuspensionDialog from "@/components/reservations/PlayerSuspensionDialog";
import BackendReservationForm from "@/components/reservations/BackendReservationForm";
import { format, parseISO } from 'date-fns';
import { 
  getAllReservations, 
  joinReservation as joinReservationApi,
  cancelReservation as cancelReservationApi,
  removeFromWaitlist,
  deleteReservationApi,
  kickPlayer as kickPlayerApi,
  addGameSummary
} from "@/lib/reservationApi";
import { fetchPitches } from "@/lib/api";

// Empty state component
const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
  actionIcon?: React.ReactNode;
}> = ({ icon, title, description, actionText, onActionClick, actionIcon }) => (
  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
    <div className="p-3 bg-teal-500/10 dark:bg-teal-400/10 rounded-full mb-4 mx-auto w-fit">
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
    <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6 max-w-xs sm:max-w-md mx-auto">
      {description}
    </p>
    {actionText && onActionClick && (
      <Button 
        onClick={onActionClick} 
        className="bg-teal-600 hover:bg-teal-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 text-sm"
      >
        {actionText}
        {actionIcon}
      </Button>
    )}
  </div>
);

/**
 * Enhanced Reservations Page Component
 * Now integrated with backend API
 */
const Reservations = () => {
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'admin' | 'player' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogKey, setAddDialogKey] = useState(0);
  const [pitchImages, setPitchImages] = useState<Record<string, string>>({});
  
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<Reservation | null>(null);
  const [isGameDetailsDialogOpen, setIsGameDetailsDialogOpen] = useState(false);
  
  const [selectedGameForSummary, setSelectedGameForSummary] = useState<Reservation | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  
  const [suspensionDialog, setSuspensionDialog] = useState<{
    isOpen: boolean;
    playerName: string;
    playerId: string;
  }>({
    isOpen: false,
    playerName: "",
    playerId: ""
  });
  
  // Get access to reservations context
  const {
    reservations,
    joinGame,
    cancelReservation,
    joinWaitingList,
    leaveWaitingList,
    isUserJoined,
    updateReservationStatus,
    deleteReservation,
    setReservations,
  } = useReservation();

  // Load reservations from backend
  const loadReservations = useCallback(async () => {
    try {
      const backendReservations = await getAllReservations();
      
      // Transform backend data to frontend format
      const transformedReservations = backendReservations.map((res, index) => ({
        id: index + 1,
        pitchId: res.pitch,
        pitchName: `Pitch ${res.pitch.substring(0, 8)}`,
        location: 'Football Complex',
        city: 'City',
        date: res.date.split('T')[0],
        startTime: new Date(res.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(res.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        duration: 60,
        title: res.title,
        maxPlayers: res.maxPlayers,
        lineup: res.currentPlayers.map(playerId => ({
          userId: playerId,
          name: `Player ${playerId.substring(0, 4)}`,
          playerName: `Player ${playerId.substring(0, 4)}`,
          status: 'joined' as const,
          joinedAt: new Date().toISOString()
        })),
        waitingList: res.waitList,
        status: (res.status || 'upcoming') as 'upcoming' | 'completed' | 'cancelled',
        createdBy: 'admin',
        price: res.price,
        time: `${new Date(res.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(res.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        playersJoined: res.currentPlayers.length
      }));
      
      setReservations(transformedReservations);
    } catch (error) {
      console.error("Error loading reservations:", error);
      toast({
        title: "Error",
        description: "Failed to load reservations from server",
        variant: "destructive",
      });
    }
  }, [setReservations, toast]);

  // Initialize user data and fetch reservations
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get user role and ID
        const role = localStorage.getItem('userRole') as 'admin' | 'player' | null;
        setUserRole(role);
        
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setCurrentUserId(userData.id);
        }
        
        // Load reservations from backend
        await loadReservations();

        // Fetch pitches for images
        try {
          const pitches = await fetchPitches();
          const imageMap: Record<string, string> = {};
          pitches.forEach((pitch: any) => {
            if (pitch._id && pitch.backgroundImage) {
              imageMap[pitch._id] = pitch.backgroundImage;
            }
          });
          setPitchImages(imageMap);
        } catch (error) {
          console.error("Error fetching pitches:", error);
        }
        
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [loadReservations]);

  const calculateActualMaxPlayers = (maxPlayers: number) => {
    return maxPlayers + 2; // Allow 2 extra players
  };

  const upcomingReservations = useMemo(() => {
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
  }, [reservations, currentDate]);
  
  const checkHasReservationsOnDate = (date: Date): boolean => {
    const dateString = format(date, 'yyyy-MM-dd');
    return reservations.some(res => res.date === dateString);
  };

  // Backend-integrated event handlers
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
      
      // Call backend API
      await joinReservationApi(reservation.pitchId);
      
      // Update local state
      joinGame(reservationId, undefined, currentUserId);
      
      toast({
        title: "Joined Game!",
        description: "You have successfully joined the game. See you on the pitch!",
      });
      
      // Refresh reservations
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
      
      // Call backend API
      await cancelReservationApi(reservation.pitchId);
      
      // Update local state
      cancelReservation(reservationId, currentUserId);
      
      toast({
        title: "Left Game",
        description: "You have left the game. Your spot is now available for others.",
      });
      
      // Refresh reservations
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
    
    joinWaitingList(reservationId, currentUserId);
    toast({
      title: "Added to Waiting List",
      description: "You'll be notified if a spot becomes available.",
    });
  }, [currentUserId, userRole, reservations, joinWaitingList, toast]);
  
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
      
      // Call backend API
      await removeFromWaitlist(reservation.pitchId);
      
      // Update local state
      leaveWaitingList(reservationId, currentUserId);
      
      toast({
        title: "Left Waiting List",
        description: "You have been removed from the waiting list.",
      });
    } catch (error) {
      console.error("Error leaving waitlist:", error);
      toast({
        title: "Failed to Leave Waitlist",
        description: error instanceof Error ? error.message : "Failed to leave the waiting list",
        variant: "destructive",
      });
    }
  }, [currentUserId, reservations, leaveWaitingList, toast]);
  
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
      
      // Call backend API
      await deleteReservationApi(reservation.pitchId);
      
      // Close dialogs if they're open for this reservation
      if (selectedGameForDetails && selectedGameForDetails.id === reservationId) {
        setSelectedGameForDetails(null);
        setIsGameDetailsDialogOpen(false);
      }
      
      if (selectedGameForSummary && selectedGameForSummary.id === reservationId) {
        setSelectedGameForSummary(null);
        setIsSummaryDialogOpen(false);
      }
      
      // Update local state
      deleteReservation(reservationId);
      
      toast({
        title: "Reservation Deleted",
        description: "The reservation has been successfully deleted."
      });
      
      // Refresh reservations
      await loadReservations();
    } catch (error) {
      console.error("Error deleting reservation:", error);
      toast({
        title: "Failed to Delete",
        description: error instanceof Error ? error.message : "Failed to delete the reservation",
        variant: "destructive",
      });
    }
  }, [currentUserId, userRole, reservations, deleteReservation, selectedGameForDetails, selectedGameForSummary, toast, loadReservations]);

  const handleKickPlayer = useCallback(async (reservationId: number, playerId: string) => {
    if (userRole !== 'admin') return;
    
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) throw new Error('Reservation not found');
      
      // Call backend API
      await kickPlayerApi(reservation.pitchId, playerId);
      
      // Update local state
      cancelReservation(reservationId, playerId);
      
      toast({
        title: "Player Kicked",
        description: "The player has been removed from the game.",
      });
      
      // Refresh reservations
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

  const handleSuspendPlayer = useCallback((playerId: string, days: number, reason: string) => {
    if (userRole !== 'admin') return;
    
    // Here you would typically call an API to suspend the player
    // For now, we'll just show a success message
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

  const handleAddSummary = useCallback((reservation: Reservation) => {
    setSelectedGameForSummary(reservation);
    setIsSummaryDialogOpen(true);
  }, []);

  const handleSaveSummary = useCallback(async (summary: string, playerStats: any[]) => {
    if (!selectedGameForSummary) return;
    
    try {
      // Call backend API
      await addGameSummary(selectedGameForSummary.pitchId, { summary, playerStats });
      
      toast({
        title: "Summary Saved",
        description: "Game summary and player stats have been saved successfully.",
      });
      
      setIsSummaryDialogOpen(false);
      setSelectedGameForSummary(null);
      
      // Refresh reservations
      await loadReservations();
    } catch (error) {
      console.error("Error saving summary:", error);
      toast({
        title: "Failed to Save Summary",
        description: error instanceof Error ? error.message : "Failed to save the game summary",
        variant: "destructive",
      });
    }
  }, [selectedGameForSummary, toast, loadReservations]);

  const upcomingGamesHeader = useMemo(() => {
    if (currentDate) {
      const formattedDate = format(currentDate, "MMM d, yyyy");
      if (upcomingReservations.length > 0) {
        return `Showing ${upcomingReservations.length} game${upcomingReservations.length === 1 ? '' : 's'} on ${formattedDate}`;
      }
      return `No upcoming games found for ${formattedDate}`;
    }
    return `Showing ${upcomingReservations.length} upcoming game${upcomingReservations.length === 1 ? '' : 's'}`;
  }, [currentDate, upcomingReservations.length]);

  const isUserJoinedFunction = useCallback((reservationId: number, userId: string): boolean => {
    return isUserJoined(reservationId, userId);
  }, [isUserJoined]);

  const handleAddReservationSuccess = useCallback(() => {
    setAddDialogKey(prev => prev + 1);
  }, []);

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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Reservations</h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
            Book and manage your football pitch reservations.
          </p>
        </div>
        {userRole === 'admin' && (
          <div id="add-reservation-dialog-trigger">
            <BackendReservationForm 
              key={addDialogKey} 
              onSuccess={() => {
                setAddDialogKey(prev => prev + 1);
                loadReservations();
              }}
            />
          </div>
        )}
      </div>

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
            <EmptyState
              icon={currentDate ? <ListFilter className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600 dark:text-teal-400" /> : <CalendarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600 dark:text-teal-400" />}
              title={
                currentDate 
                ? `No upcoming games on ${format(currentDate, "MMMM d, yyyy")}` 
                : "No upcoming games"
              }
              description={
                currentDate 
                ? "Try selecting a different date or clear the filter to see all upcoming games."
                : "No games scheduled yet. Check back later or, if you're an admin, add a new one!"
              }
              actionText={
                currentDate 
                ? "Clear Date Filter" 
                : (userRole === 'admin' ? "Add New Reservation" : undefined)
              }
              onActionClick={
                currentDate 
                ? () => setCurrentDate(undefined) 
                : userRole === 'admin' ? () => { 
                    const addDialogButton = document.getElementById('add-reservation-dialog-trigger')?.querySelector('button');
                    if (addDialogButton) addDialogButton.click();
                  }
                : undefined
              }
              actionIcon={currentDate ? <XCircle className="ml-2 h-4 w-4" /> : (userRole === 'admin' ? <ArrowRight className="ml-2 h-4 w-4" /> : undefined)}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-1 px-1">
                <div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">
                  {upcomingGamesHeader}
                </div>
                {currentDate && (
                   <Button variant="ghost" size="sm" onClick={() => setCurrentDate(undefined)} className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                     <XCircle className="h-3.5 w-3.5 mr-1" /> Clear Filter
                   </Button>
                )}
              </div>

              {upcomingReservations.map((reservation) => (
                <div 
                  key={`reservation-${reservation.id}`}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => {
                    setSelectedGameForDetails(reservation);
                    setIsGameDetailsDialogOpen(true);
                  }}
                >
                  <ReservationCard
                    reservation={reservation}
                    userId={currentUserId || ""}
                    userRole={userRole || "player"}
                    onJoin={(id, playerName) => {
                      if (!currentUserId) {
                        toast({ 
                          title: "Login Required", 
                          description: "Please log in to join a game.", 
                          variant: "destructive"
                        });
                        return;
                      }
                      handleJoinGame(id);
                    }}
                    onCancel={(id, userId) => handleCancelReservation(id)}
                    onJoinWaitingList={(id, userId) => handleJoinWaitingList(id)}
                    onLeaveWaitingList={(id, userId) => handleLeaveWaitingList(id)}
                    isUserJoined={isUserJoinedFunction}
                    isFull={reservation.lineup ? reservation.lineup.length >= calculateActualMaxPlayers(reservation.maxPlayers) : false}
                    onDeleteReservation={userRole === 'admin' ? handleDeleteReservation : undefined}
                    onViewDetails={(reservation) => {
                      setSelectedGameForDetails(reservation);
                      setIsGameDetailsDialogOpen(true);
                    }}
                    onAddSummary={userRole === 'admin' ? handleAddSummary : undefined}
                    isUserLoggedIn={!!currentUserId}
                    pitchImage={pitchImages[reservation.pitchId]}
                  />
                </div>
              ))}
            </>
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
          onKickPlayer={userRole === 'admin' ? handleKickPlayer : undefined}
          onSuspendPlayer={userRole === 'admin' ? handleSuspendPlayer : undefined}
          pitchImage={pitchImages[safeSelectedGameForDetails.pitchId]}
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
          onSave={handleSaveSummary}
          onSuspendPlayer={handleOpenSuspensionDialog}
        />
      )}

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
