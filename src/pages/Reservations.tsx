
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Users,
  Calendar as CalendarIcon,
  ArrowRight,
  ListFilter,
  XCircle,
  Loader,
  CheckSquare,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation, Reservation } from "@/context/ReservationContext";
import AddReservationDialog from "@/components/reservations/AddReservationDialog";
import EnhancedDatePicker from "@/components/reservations/EnhancedDatePicker";
import { cn } from "@/lib/utils";
import ReservationCard from "@/components/reservations/ReservationCard";
import GameDetailsDialog from "@/components/reservations/GameDetailsDialog";
import { format, parseISO, isAfter } from 'date-fns';
import AddReservationSummary from "@/components/reservations/AddReservationSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Formats a date string or Date object into a more readable format.
 */
const formatDate = (dateString: string | Date, dateFormat: string = "PP") => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, dateFormat);
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid Date";
  }
};

/**
 * Reservations Page Component
 * Displays and manages game reservations
 */
const Reservations = () => {
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'admin' | 'player' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<Reservation | null>(null);
  const [isGameDetailsDialogOpen, setIsGameDetailsDialogOpen] = useState(false);
  
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [selectedReservationForSummary, setSelectedReservationForSummary] = useState<Reservation | null>(null);
  
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
    addReservationSummary,
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
    
    // Simulate API loading
    setTimeout(() => setIsLoading(false), 800);
    
    return () => {
      window.removeEventListener('showGameDetails', handleShowGameDetails);
    };
  }, [reservations, setReservations]); 

  /**
   * Calculates the actual maximum players based on the game format.
   * For 5v5 format (10 players), we add 2 for substitutes.
   */
  const calculateActualMaxPlayers = (maxPlayers: number) => {
    if (maxPlayers === 10) return 12;
    return maxPlayers + 2;
  };

  const upcomingReservations = useMemo(() => {
    let gamesToShow: Reservation[];
    const today = new Date(); 
    
    const filterUpcoming = (res: Reservation) => {
      const gameDate = parseISO(res.date);
      // Compare only the date part
      return (res.status === "open" || res.status === "full") && 
             !isAfter(today, new Date(gameDate.setHours(23, 59, 59)));
    };

    if (currentDate) {
      // For current date
      const dateString = format(currentDate, 'yyyy-MM-dd');
      gamesToShow = reservations.filter(
        res => res.date === dateString && filterUpcoming(res)
      );
    } else {
      gamesToShow = reservations.filter(filterUpcoming);
    }
    
    return gamesToShow.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time));
  }, [reservations, currentDate]);

  const completedReservations = useMemo(() => {
    const today = new Date();
    
    const filterCompleted = (res: Reservation) => {
      const gameDate = parseISO(res.date);
      // Show only completed or automatically completed past games
      return res.status === "completed" || 
             (isAfter(today, new Date(gameDate.setHours(23, 59, 59))) && 
              (res.status === "open" || res.status === "full"));
    };
    
    if (currentDate) {
      // For current date
      const dateString = format(currentDate, 'yyyy-MM-dd');
      return reservations.filter(
        res => res.date === dateString && filterCompleted(res)
      );
    } else {
      return reservations.filter(filterCompleted);
    }
  }, [reservations, currentDate]);
  
  const checkHasReservationsOnDate = (date: Date): boolean => {
    const dateString = format(date, 'yyyy-MM-dd');
    return reservations.some(res => res.date === dateString);
  };

  // Handle joining a game
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
    
    // Join game through context
    joinGame(reservationId, undefined, currentUserId);
    
    toast({
      title: "Success!",
      description: "You've joined the game",
    });
  };
  
  // Handle leaving a game
  const handleCancelReservation = (reservationId: number) => {
    if (!currentUserId) {
      toast({ 
        title: "Login Required", 
        description: "Please log in to leave this game.", 
        variant: "destructive"
      });
      return;
    }
    
    // Cancel reservation through context
    cancelReservation(reservationId, currentUserId);
    
    toast({
      title: "Reservation cancelled",
      description: "You've left the game",
    });
  };

  // Handle joining waiting list
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
    
    // Join waiting list through context
    joinWaitingList(reservationId, currentUserId);
    
    toast({
      title: "Added to waiting list",
      description: "You've been added to the waiting list",
    });
  };
  
  // Handle leaving waiting list
  const handleLeaveWaitingList = (reservationId: number) => {
    if (!currentUserId) {
      toast({ 
        title: "Login Required", 
        description: "Please log in to leave the waiting list.", 
        variant: "destructive"
      });
      return;
    }
    
    // Leave waiting list through context
    leaveWaitingList(reservationId, currentUserId);
    
    toast({
      title: "Removed from waiting list",
      description: "You've been removed from the waiting list",
    });
  };

  // Handle deleting a reservation (admin only)
  const handleDeleteReservation = (reservationId: number) => {
    if (!currentUserId || userRole !== 'admin') {
      toast({ 
        title: "Permission Denied", 
        description: "Only admins can delete reservations.", 
        variant: "destructive"
      });
      return;
    }
    
    // Delete reservation through context
    deleteReservation(reservationId);
    
    toast({
      title: "Reservation Deleted",
      description: "The reservation has been successfully deleted."
    });
  };

  // Handle opening summary dialog for a complete reservation
  const handleOpenSummaryDialog = (reservation: Reservation) => {
    setSelectedReservationForSummary(reservation);
    setShowSummaryDialog(true);
  };

  // Handle submitting a reservation summary
  const handleSubmitSummary = (summaryData: any) => {
    if (!currentUserId || userRole !== 'admin') {
      toast({ 
        title: "Permission Denied", 
        description: "Only admins can add summaries.", 
        variant: "destructive"
      });
      return;
    }
    
    try {
      addReservationSummary(summaryData);
      
      toast({
        title: "Summary Added",
        description: "Game summary has been successfully added."
      });
      
      // Mark the reservation as completed if it wasn't already
      if (selectedReservationForSummary && selectedReservationForSummary.status !== "completed") {
        updateReservationStatus(selectedReservationForSummary.id, "completed");
      }
    } catch (error) {
      console.error("Error adding summary:", error);
      toast({
        title: "Error",
        description: "Failed to add game summary.",
        variant: "destructive"
      });
    }
  };

  // Format tab headers
  const upcomingTabHeader = `Upcoming (${upcomingReservations.length})`;
  const completedTabHeader = `Completed (${completedReservations.length})`;

  const hasUserJoinedOnDateFixed = (dateString: string, userId: string): boolean => {
    if (!userId) return false;
    try {
      const date = new Date(dateString);
      return hasUserJoinedOnDate(date, userId);
    } catch (error) {
      console.error("Error converting date:", error);
      return false;
    }
  };

  // Show loading state
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
          
          {currentDate && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentDate(undefined)} 
              className="mt-2 w-full"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Clear Date Filter
            </Button>
          )}
        </div>

        {/* Right Column: Reservations Tabs */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs 
            defaultValue="upcoming" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="upcoming" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {upcomingTabHeader}
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center">
                <CheckSquare className="mr-2 h-4 w-4" />
                {completedTabHeader}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-4 space-y-4">
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
                upcomingReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    type="upcoming"
                    onJoinGame={() => handleJoinGame(reservation.id)}
                    onCancelReservation={() => handleCancelReservation(reservation.id)}
                    onJoinWaitingList={() => handleJoinWaitingList(reservation.id)}
                    onLeaveWaitingList={() => handleLeaveWaitingList(reservation.id)}
                    isUserJoined={currentUserId ? isUserJoined(reservation.id, currentUserId) : false}
                    isUserOnWaitingList={currentUserId ? reservation.waitingList?.includes(currentUserId) || false : false}
                    hasUserJoinedOnDate={(dateString) => currentUserId ? hasUserJoinedOnDateFixed(dateString, currentUserId) : false}
                    currentUserId={currentUserId || ""} 
                    isAdmin={userRole === 'admin'}
                    onDeleteReservation={userRole === 'admin' ? handleDeleteReservation : undefined}
                    showWaitlist={userRole === 'admin'}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4 space-y-4">
              {completedReservations.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600 dark:text-teal-400" />}
                  title="No completed games"
                  description="No games have been completed yet."
                />
              ) : (
                completedReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    type="past"
                    onJoinGame={() => {}}
                    onCancelReservation={() => {}}
                    onJoinWaitingList={() => {}}
                    onLeaveWaitingList={() => {}}
                    isUserJoined={false}
                    isUserOnWaitingList={false}
                    hasUserJoinedOnDate={() => false}
                    currentUserId={currentUserId || ""}
                    isAdmin={userRole === 'admin'}
                    onDeleteReservation={userRole === 'admin' ? handleDeleteReservation : undefined}
                    onAddSummary={userRole === 'admin' ? handleOpenSummaryDialog : undefined}
                    hasSummary={Boolean(reservation.summary)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
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
      
      {/* Dialog for Adding Game Summary */}
      {selectedReservationForSummary && (
        <AddReservationSummary
          reservation={selectedReservationForSummary}
          open={showSummaryDialog}
          onOpenChange={setShowSummaryDialog}
          onSubmitSummary={handleSubmitSummary}
        />
      )}
    </div>
  );
};

/**
 * EmptyState component to display when there's no data.
 */
const EmptyState = ({
  title,
  description,
  actionText,
  onActionClick,
  icon,
  actionIcon
}: {
  title: string;
  description: string;
  actionText?: string; 
  onActionClick?: () => void;
  icon?: React.ReactNode;
  actionIcon?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center bg-gray-50 dark:bg-gray-800/30 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
    <div className="p-3 bg-teal-500/10 dark:bg-teal-400/10 rounded-full mb-4">
      {icon || <CalendarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600 dark:text-teal-400" />}
    </div>
    <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
    <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6 max-w-xs sm:max-w-md mx-auto">{description}</p>
    {actionText && onActionClick && (
      <Button 
        onClick={onActionClick} 
        className={cn(
            "bg-teal-600 hover:bg-teal-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 text-sm",
            actionText === "Clear Date Filter" && "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
        )}
      >
        {actionText}
        {actionIcon || <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    )}
  </div>
);

export default Reservations;
