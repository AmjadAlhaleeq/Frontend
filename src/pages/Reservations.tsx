import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  Users,
  Calendar as CalendarIcon,
  ArrowRight,
  ListFilter,
  Search,
  MapPin,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReservation, Reservation } from "@/context/ReservationContext";
import AddReservationDialog from "@/components/reservations/AddReservationDialog";
import EnhancedDatePicker from "@/components/reservations/EnhancedDatePicker";
import { cn } from "@/lib/utils";
import ReservationCard from "@/components/reservations/ReservationCard";
import GameDetailsDialog from "@/components/reservations/GameDetailsDialog";
import { format, parseISO } from 'date-fns';

/**
 * Formats a date string or Date object into a more readable format.
 * @param dateString - The date string (ISO format) or Date object.
 * @param dateFormat - The desired date format string (default: "PP").
 * @returns Formatted date string or "Invalid Date" on error.
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
 * Reservations page component.
 * Allows users to view, book, and manage football pitch reservations.
 * Admins can manage reservations but cannot join games.
 * Players can join games and waiting lists.
 */
const Reservations = () => {
  // Initialize currentDate to undefined to show all upcoming games initially
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'admin' | 'player' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("upcoming");
  
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<Reservation | null>(null);
  const [isGameDetailsDialogOpen, setIsGameDetailsDialogOpen] = useState(false);
  
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
    
    // Listen for events to show game details from other components
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
    
    return () => {
      window.removeEventListener('showGameDetails', handleShowGameDetails);
    };
  }, []);

  const {
    reservations,
    joinGame,
    cancelReservation,
    joinWaitingList,
    leaveWaitingList,
    isUserJoined,
    hasUserJoinedOnDate,
    getReservationsForDate,
    updateReservationStatus,
  } = useReservation();

  // Calculate the actual maximum players based on the game format
  const calculateActualMaxPlayers = (maxPlayers: number) => {
    // For 5v5 format (10 players), we add 2 for substitutes
    if (maxPlayers === 10) {
      return 12;
    }
    // For all other formats, add 2 as requested
    return maxPlayers + 2;
  };

  // Memoized list of upcoming reservations, filtered by currentDate if set
  const upcomingReservations = useMemo(() => {
    let gamesToShow: Reservation[];
    const today = new Date(new Date().setHours(0, 0, 0, 0)); // Start of today

    if (currentDate) {
      gamesToShow = getReservationsForDate(currentDate)
        .filter(res => res.status === "open" || res.status === "full");
    } else {
      // No specific date selected, show all upcoming games (today or future)
      gamesToShow = reservations.filter(
        (res) => (res.status === "open" || res.status === "full") && 
                 new Date(res.date) >= today
      );
    }

    return gamesToShow.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time));
  }, [reservations, currentDate, getReservationsForDate]);

  // Memoized list of past reservations
  const pastReservations = useMemo(() =>
    reservations.filter(
      (res) => res.status === "completed" || (res.status !== 'cancelled' && new Date(res.date) < new Date(new Date().setHours(0,0,0,0)))
    ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.time.localeCompare(a.time)), 
    [reservations]
  );
  
  const handleViewGameDetails = (reservation: Reservation) => {
    setSelectedGameForDetails(reservation);
    setIsGameDetailsDialogOpen(true);
  };
  
  const checkHasReservationsOnDate = (date: Date): boolean => {
    return getReservationsForDate(date).length > 0;
  };

  // Action handlers for user interactions
  const handleJoinGame = (reservationId: number) => {
    // Admins cannot join games
    if (userRole === 'admin') {
      toast({ title: "Admin Restriction", description: "Admins cannot join games.", variant: "destructive"});
      return;
    }
    
    if (!currentUserId) {
      toast({ title: "Login Required", description: "Please log in to join a game.", variant: "destructive"});
      return;
    }
    
    joinGame(reservationId, undefined, currentUserId);
  };
  
  const handleCancelReservation = (reservationId: number) => {
    if (!currentUserId) {
      toast({ title: "Login Required", description: "Please log in to cancel a reservation.", variant: "destructive"});
      return;
    }
    
    cancelReservation(reservationId, currentUserId);
  };

  const handleJoinWaitingList = (reservationId: number) => {
    // Admins cannot join waiting lists
    if (userRole === 'admin') {
      toast({ title: "Admin Restriction", description: "Admins cannot join waiting lists.", variant: "destructive"});
      return;
    }
    
    if (!currentUserId) {
      toast({ title: "Login Required", description: "Please log in to join the waiting list.", variant: "destructive"});
      return;
    }
    
    joinWaitingList(reservationId, currentUserId);
  };
  
  const handleLeaveWaitingList = (reservationId: number) => {
    if (!currentUserId) {
      toast({ title: "Login Required", description: "Please log in to leave the waiting list.", variant: "destructive"});
      return;
    }
    
    leaveWaitingList(reservationId, currentUserId);
  };

  // Dynamic header message for the upcoming games list
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

  const hasUserJoinedOnDateFixed = (dateString: string, userId: string): boolean => {
    if (!userId) return false;
    
    try {
      // Convert string to Date object
      const date = new Date(dateString);
      return hasUserJoinedOnDate(date, userId);
    } catch (error) {
      console.error("Error converting date:", error);
      return false;
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      {/* Page Header and Admin's Add Reservation Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Reservations</h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
            Book and manage your football pitch reservations.
          </p>
        </div>
        {userRole === 'admin' && <AddReservationDialog />}
      </div>

      {/* Main layout: Calendar on left, Tabs for Upcoming/Past games on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Calendar */}
        <div className="lg:sticky lg:top-20 h-fit">
          <EnhancedDatePicker
            date={currentDate}
            onDateChange={setCurrentDate}
            hasReservations={checkHasReservationsOnDate}
          />
        </div>

        {/* Right Column: Tabs for Upcoming and Past Games */}
        <div className="lg:col-span-2">
          <Tabs
            defaultValue="upcoming"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 mr-2" />
                Upcoming Games
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 text-gray-600 dark:text-gray-300">
                <Clock className="h-4 w-4 mr-2" />
                Past Games
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Games Tab Content */}
            <TabsContent value="upcoming" className="space-y-4">
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
                    : "No games scheduled yet. Why not book one if you're an admin?"
                  }
                  actionText={
                    currentDate 
                    ? "Clear Date Filter" 
                    : (userRole === 'admin' ? "Add New Reservation" : undefined)
                  }
                  onActionClick={
                    currentDate 
                    ? () => setCurrentDate(undefined) 
                    : undefined
                  }
                  actionIcon={currentDate ? <XCircle className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                />
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3 px-1">
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
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      type="upcoming"
                      onJoinGame={() => handleJoinGame(reservation.id)}
                      onCancelReservation={() => handleCancelReservation(reservation.id)}
                      onJoinWaitingList={() => handleJoinWaitingList(reservation.id)}
                      onLeaveWaitingList={() => handleLeaveWaitingList(reservation.id)}
                      isUserJoined={currentUserId ? isUserJoined(reservation.id, currentUserId) : false}
                      isUserOnWaitingList={currentUserId ? reservation.waitingList.includes(currentUserId) : false}
                      hasUserJoinedOnDate={(dateString) => currentUserId ? hasUserJoinedOnDateFixed(dateString, currentUserId) : false}
                      currentUserId={currentUserId || ""} 
                      isAdmin={userRole === 'admin'}
                    />
                  ))}
                </>
              )}
            </TabsContent>

            {/* Past Games Tab Content */}
            <TabsContent value="past" className="space-y-4">
              {pastReservations.length === 0 ? (
                <EmptyState
                  title="No past games yet"
                  description="Your game history will appear here once you've played."
                  actionText="View Upcoming Games"
                  onActionClick={() => setActiveTab("upcoming")}
                />
              ) : (
                <>
                  <Card className="bg-white dark:bg-gray-850 shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg text-teal-700 dark:text-teal-400">Game Stats Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                            {pastReservations.length}
                            </p>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">
                            Games Played
                            </p>
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">{
                                pastReservations.reduce((sum, res) => sum + res.highlights.filter(h => h.type === 'goal').length, 0)
                            }</p>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">
                            Goals Scored
                            </p>
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-xl sm:text-2xl font-bold text-amber-500 dark:text-amber-400">0</p>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">
                            MVP Awards
                            </p>
                        </div>
                        </div>
                    </CardContent>
                  </Card>

                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                        <TableRow className="dark:border-gray-700">
                            <TableHead className="w-[150px] sm:w-[200px] text-gray-700 dark:text-gray-300">Date & Venue</TableHead>
                            <TableHead className="w-[100px] text-gray-700 dark:text-gray-300">Time</TableHead>
                            <TableHead className="hidden md:table-cell w-[100px] text-gray-700 dark:text-gray-300">Players</TableHead>
                            <TableHead className="text-right w-[120px] text-gray-700 dark:text-gray-300">Action</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {pastReservations.map((reservation) => (
                            <TableRow key={reservation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-700">
                            <TableCell>
                                <div className="font-medium text-gray-800 dark:text-gray-100">{formatDate(reservation.date, "MMM d, yyyy")}</div>
                                <div className="text-xs text-muted-foreground dark:text-gray-500">
                                {reservation.title || reservation.pitchName}
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300">{reservation.time}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground dark:text-gray-500" />
                                <span>
                                    {reservation.playersJoined}/{calculateActualMaxPlayers(reservation.maxPlayers)}
                                </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewGameDetails(reservation)}
                                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                                >
                                    View Details
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog for Viewing Game Details */}
      {selectedGameForDetails && (
        <GameDetailsDialog
          reservation={selectedGameForDetails}
          open={isGameDetailsDialogOpen}
          onOpenChange={setIsGameDetailsDialogOpen}
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
    <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6 max-w-xs sm:max-w-md">{description}</p>
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
