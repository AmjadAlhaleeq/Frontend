
import React, { useState, useMemo, useEffect } from "react";
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
import AddReservationDialog from "@/components/reservations/AddReservationDialog";
import EnhancedDatePicker from "@/components/reservations/EnhancedDatePicker";
import ReservationCard from "@/components/reservations/ReservationCard";
import GameDetailsDialog from "@/components/reservations/GameDetailsDialog";
import { format, parseISO } from 'date-fns';

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
 * Reservations Page Component
 * Displays and manages game reservations with improved UX
 */
const Reservations = () => {
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'admin' | 'player' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<Reservation | null>(null);
  const [isGameDetailsDialogOpen, setIsGameDetailsDialogOpen] = useState(false);
  
  // Get access to reservations context
  const {
    reservations,
    joinGame,
    cancelReservation,
    joinWaitingList,
    leaveWaitingList,
    isUserJoined,
    hasUserJoinedOnDate,
    updateReservationStatus,
    deleteReservation,
    setReservations,
  } = useReservation();

  useEffect(() => {
    // Get user role and ID from localStorage
    const role = localStorage.getItem('userRole') as 'admin' | 'player' | null;
    setUserRole(role);
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUserId(userData.id);
      } catch (e) {
        console.error("Failed to parse currentUser from localStorage", e);
        setCurrentUserId(null);
      }
    }
    
    // Initialize reservations from localStorage
    try {
      const storedReservations = localStorage.getItem('reservations');
      if (storedReservations) {
        const parsedReservations = JSON.parse(storedReservations);
        if (Array.isArray(parsedReservations) && parsedReservations.length > 0) {
          console.log("Loading reservations from localStorage:", parsedReservations);
          setReservations(parsedReservations);
        }
      }
    } catch (error) {
      console.error("Error loading reservations from localStorage:", error);
    }
    
    const handleShowGameDetails = (event: any) => {
      const gameId = event.detail?.gameId;
      if (gameId) {
        const game = reservations.find(r => r.id === gameId);
        if (game) {
          setSelectedGameForDetails(game);
          setIsGameDetailsDialogOpen(true);
        }
      }
    };
    
    window.addEventListener('showGameDetails', handleShowGameDetails);
    
    setTimeout(() => setIsLoading(false), 800);
    
    return () => {
      window.removeEventListener('showGameDetails', handleShowGameDetails);
    };
  }, [reservations, setReservations]); 

  const calculateActualMaxPlayers = (maxPlayers: number) => {
    if (maxPlayers === 10) return 12;
    return maxPlayers + 2;
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
    return gamesToShow.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time));
  }, [reservations, currentDate]);
  
  const checkHasReservationsOnDate = (date: Date): boolean => {
    const dateString = format(date, 'yyyy-MM-dd');
    return reservations.some(res => res.date === dateString);
  };

  const handleJoinGame = (reservationId: number) => {
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
    
    joinGame(reservationId, undefined, currentUserId);
    
    // Update localStorage
    try {
      const storedReservations = localStorage.getItem('reservations');
      if (storedReservations) {
        const parsedReservations = JSON.parse(storedReservations);
        const updatedReservations = parsedReservations.map((res: Reservation) => {
          if (res.id === reservationId) {
            const updatedLineup = res.lineup ? [...res.lineup] : [];
            if (!updatedLineup.some(player => player.userId === currentUserId)) {
              updatedLineup.push({ 
                userId: currentUserId, 
                status: 'joined',
                joinedAt: new Date().toISOString(),
                playerName: `Player ${currentUserId.substring(0, 4)}` 
              });
            }
            return {...res, lineup: updatedLineup};
          }
          return res;
        });
        localStorage.setItem('reservations', JSON.stringify(updatedReservations));
      }
    } catch (error) {
      console.error("Error updating reservation in localStorage:", error);
    }
  };
  
  const handleCancelReservation = (reservationId: number) => {
    if (!currentUserId) {
      toast({ 
        title: "Login Required", 
        description: "Please log in to cancel a reservation.", 
        variant: "destructive"
      });
      return;
    }
    
    cancelReservation(reservationId, currentUserId);
    
    // Update localStorage
    try {
      const storedReservations = localStorage.getItem('reservations');
      if (storedReservations) {
        const parsedReservations = JSON.parse(storedReservations);
        const updatedReservations = parsedReservations.map((res: Reservation) => {
          if (res.id === reservationId && res.lineup) {
            return {
              ...res, 
              lineup: res.lineup.filter(player => player.userId !== currentUserId)
            };
          }
          return res;
        });
        localStorage.setItem('reservations', JSON.stringify(updatedReservations));
      }
    } catch (error) {
      console.error("Error updating reservation in localStorage:", error);
    }
  };

  const handleJoinWaitingList = (reservationId: number) => {
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
    
    // Update localStorage
    try {
      const storedReservations = localStorage.getItem('reservations');
      if (storedReservations) {
        const parsedReservations = JSON.parse(storedReservations);
        const updatedReservations = parsedReservations.map((res: Reservation) => {
          if (res.id === reservationId) {
            const updatedWaitingList = res.waitingList ? [...res.waitingList] : [];
            if (!updatedWaitingList.includes(currentUserId)) {
              updatedWaitingList.push(currentUserId);
            }
            return {...res, waitingList: updatedWaitingList};
          }
          return res;
        });
        localStorage.setItem('reservations', JSON.stringify(updatedReservations));
      }
    } catch (error) {
      console.error("Error updating waiting list in localStorage:", error);
    }
  };
  
  const handleLeaveWaitingList = (reservationId: number) => {
    if (!currentUserId) {
      toast({ 
        title: "Login Required", 
        description: "Please log in to leave the waiting list.", 
        variant: "destructive"
      });
      return;
    }
    
    leaveWaitingList(reservationId, currentUserId);
    
    // Update localStorage
    try {
      const storedReservations = localStorage.getItem('reservations');
      if (storedReservations) {
        const parsedReservations = JSON.parse(storedReservations);
        const updatedReservations = parsedReservations.map((res: Reservation) => {
          if (res.id === reservationId && res.waitingList) {
            return {
              ...res,
              waitingList: res.waitingList.filter(id => id !== currentUserId)
            };
          }
          return res;
        });
        localStorage.setItem('reservations', JSON.stringify(updatedReservations));
      }
    } catch (error) {
      console.error("Error updating waiting list in localStorage:", error);
    }
  };
  
  const handleDeleteReservation = (reservationId: number) => {
    if (!currentUserId || userRole !== 'admin') {
      toast({ 
        title: "Permission Denied", 
        description: "Only admins can delete reservations.", 
        variant: "destructive"
      });
      return;
    }
    
    deleteReservation(reservationId);
    
    // Update localStorage
    try {
      const storedReservations = localStorage.getItem('reservations');
      if (storedReservations) {
        const parsedReservations = JSON.parse(storedReservations);
        const updatedReservations = parsedReservations.filter((res: Reservation) => res.id !== reservationId);
        localStorage.setItem('reservations', JSON.stringify(updatedReservations));
      }
    } catch (error) {
      console.error("Error deleting reservation from localStorage:", error);
    }
    
    toast({
      title: "Reservation Deleted",
      description: "The reservation has been successfully deleted."
    });
  };

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

  const createIsUserJoinedFunction = () => {
    return (reservationId: number, userId: string): boolean => {
      return isUserJoined(reservationId, userId);
    };
  };
  
  const isUserJoinedFunction = createIsUserJoinedFunction();

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
            <AddReservationDialog />
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
                  key={reservation.id}
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
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Dialog for Viewing Game Details */}
      {selectedGameForDetails && (
        <GameDetailsDialog
          reservation={selectedGameForDetails}
          isOpen={isGameDetailsDialogOpen}
          onClose={() => setIsGameDetailsDialogOpen(false)}
          isAdmin={userRole === 'admin'}
          onStatusChange={(status) => {
            if (userRole === 'admin' && selectedGameForDetails) {
              updateReservationStatus(selectedGameForDetails.id, status);
            }
          }}
          currentUserId={currentUserId || ""}
          actualMaxPlayers={calculateActualMaxPlayers(selectedGameForDetails.maxPlayers)}
        />
      )}
    </div>
  );
};

export default Reservations;
