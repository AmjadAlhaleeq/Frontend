import React, { useState, useMemo, useEffect } from "react";
import PlayerLineup from "./PlayerLineup";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Users, Calendar as CalendarIcon, ArrowRight, ListFilter, Search, MapPinIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PitchLineup from "@/components/PitchLineup";
import { format, parseISO } from "date-fns";
import AddReservationDialog from "@/components/reservations/AddReservationDialog";
import EnhancedDatePicker from "@/components/reservations/EnhancedDatePicker";
import { cn } from "@/lib/utils";
import ReservationCard from "@/components/reservations/ReservationCard";
import HighlightsList from "../components/reservations/HighlightsList";

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
 * Admins have additional capabilities like adding new reservations.
 */
const Reservations = () => {
  const [currentDate, setCurrentDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'admin' | 'player' | null>(null); // 'admin', 'player', or null
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Current logged-in user's ID

  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' or 'past'
  
  // State for "View Game Details" dialog (for past games, typically non-admin view)
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<Reservation | null>(null);
  const [isGameDetailsDialogOpen, setIsGameDetailsDialogOpen] = useState(false);
  
  // Effect to load user role and ID from localStorage on component mount
  useEffect(() => {
    // TODO: Replace localStorage with a proper auth context/service for user role and ID
    const role = localStorage.getItem('userRole') as 'admin' | 'player' | null;
    setUserRole(role);
    const storedUser = localStorage.getItem('currentUser'); // Assuming 'currentUser' stores { id: '...' }
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUserId(userData.id);
      } catch (e) {
        console.error("Failed to parse currentUser from localStorage", e);
        setCurrentUserId(null);
      }
    }
  }, []);

  // Destructure methods from ReservationContext
  const {
    reservations, // All reservations (source of truth, ideally fetched from API)
    joinGame,
    cancelReservation,
    joinWaitingList,
    leaveWaitingList,
    isUserJoined, // Checks if a specific user has joined a specific reservation
    hasUserJoinedOnDate, // Checks if user has any game on a date
    getReservationsForDate, // Filters reservations for a specific date
  } = useReservation();

  // Memoized list of upcoming reservations
  const upcomingReservations = useMemo(() => 
    // TODO: API Call: Fetch upcoming reservations from backend, already filtered and sorted
    reservations.filter(
      (res) => (res.status === "open" || res.status === "full") && new Date(res.date) >= new Date(new Date().setHours(0,0,0,0))
    ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)),
    [reservations]
  );

  // Memoized list of past reservations
  const pastReservations = useMemo(() =>
    // TODO: API Call: Fetch past reservations from backend, already filtered and sorted
    reservations.filter(
      (res) => res.status === "completed" || (res.status !== 'cancelled' && new Date(res.date) < new Date(new Date().setHours(0,0,0,0)))
    ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.time.localeCompare(a.time)), 
    [reservations]
  );
  
  // Memoized list of reservations for the currently selected date in the calendar
  const reservationsForSelectedDate = useMemo(() => 
    currentDate ? getReservationsForDate(currentDate) : [],
    [currentDate, getReservationsForDate]
  );
  const hasReservationsForDate = reservationsForSelectedDate.length > 0;

  // Opens the "Game Details" dialog for a selected past reservation
  const handleViewGameDetails = (reservation: Reservation) => {
    setSelectedGameForDetails(reservation);
    setIsGameDetailsDialogOpen(true);
  };
  
  // Checks if there are any reservations on a given date (for calendar highlights)
  const checkHasReservationsOnDate = (date: Date): boolean => {
    // This relies on getReservationsForDate which uses local data.
    // For API, this might involve a separate lightweight API call or pre-fetched summary data.
    return getReservationsForDate(date).length > 0;
  };

  // Action handlers for user interactions, ensuring userId is present
  const handleJoinGame = (reservationId: number) => {
    if (!currentUserId) {
      toast({ title: "Login Required", description: "Please log in to join a game.", variant: "destructive"});
      return;
    }
    // TODO: API Call: Send request to backend for user (currentUserId) to join game (reservationId)
    joinGame(reservationId, undefined, currentUserId);
  };
  
  const handleCancelReservation = (reservationId: number) => {
    if (!currentUserId) {
      toast({ title: "Login Required", description: "Please log in to cancel a reservation.", variant: "destructive"});
      return;
    }
    // TODO: API Call: Send request to backend for user (currentUserId) to leave game (reservationId)
    cancelReservation(reservationId, currentUserId);
  };

  const handleJoinWaitingList = (reservationId: number) => {
    if (!currentUserId) {
      toast({ title: "Login Required", description: "Please log in to join the waiting list.", variant: "destructive"});
      return;
    }
    // TODO: API Call: Send request to backend for user (currentUserId) to join waitlist for game (reservationId)
    joinWaitingList(reservationId, currentUserId);
  };
  
  const handleLeaveWaitingList = (reservationId: number) => {
    if (!currentUserId) {
      toast({ title: "Login Required", description: "Please log in to leave the waiting list.", variant: "destructive"});
      return;
    }
    // TODO: API Call: Send request to backend for user (currentUserId) to leave waitlist for game (reservationId)
    leaveWaitingList(reservationId, currentUserId);
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
        {/* Admin-only button to add new reservations */}
        {userRole === 'admin' && <AddReservationDialog />}
      </div>

      {/* Main layout: Calendar and Date-specific games on left, Tabs for Upcoming/Past games on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Calendar and Games for Selected Date */}
        <div className="lg:sticky lg:top-20 h-fit">
          <EnhancedDatePicker
            date={currentDate}
            onDateChange={setCurrentDate}
            hasReservations={checkHasReservationsOnDate} // Function to check if a date has reservations (for highlighting)
          />

          {/* Display games for the selected date if any */}
          {hasReservationsForDate && currentDate && (
            <Card className="mt-4 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 shadow-sm">
              {/* ... keep existing code (CardHeader for games on selected date) */}
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm sm:text-base font-semibold text-teal-700 dark:text-teal-400">
                  Games on {format(currentDate, "MMMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3 px-4">
                {reservationsForSelectedDate.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {reservationsForSelectedDate.map((res) => (
                      // ... keep existing code (rendering individual game summary for selected date)
                      <div
                        key={res.id}
                        className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 text-xs sm:text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-200">{res.pitchName}</p>
                          <p className="text-xs text-muted-foreground dark:text-gray-500">
                            {res.time}
                          </p>
                        </div>
                        <Badge
                          variant={
                            res.status === "open" ? "default" : 
                            res.status === "full" ? "destructive" :
                            "secondary"
                          }
                          className={cn(
                            "text-xs",
                            res.status === "open" && "bg-green-500 hover:bg-green-600 text-white",
                            res.status === "full" && "bg-orange-500 hover:bg-orange-600 text-white",
                            res.status === "completed" && "bg-blue-500 hover:bg-blue-600 text-white",
                            res.status === "cancelled" && "bg-gray-400 hover:bg-gray-500 text-white"
                          )}
                        >
                          {res.playersJoined}/{res.maxPlayers}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground dark:text-gray-500 py-2">No games scheduled for this date.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Tabs for Upcoming and Past Games */}
        <div className="lg:col-span-2">
          <Tabs
            defaultValue="upcoming"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* ... keep existing code (TabsList for Upcoming/Past) */}
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
                // ... keep existing code (EmptyState for no upcoming games)
                <EmptyState
                  title="No upcoming games"
                  description="No games scheduled yet. Why not book one?"
                  actionText={userRole === 'admin' ? "Add New Reservation" : "Check Back Soon"}
                  onActionClick={userRole === 'admin' ? () => { /* This should ideally open the AddReservationDialog. Consider a ref or state for dialog control. */ } : undefined}
                />
              ) : (
                <>
                  {/* ... keep existing code (Upcoming games count) */}
                  <div className="flex justify-between items-center mb-3 px-1">
                    <div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">
                      Showing {upcomingReservations.length} upcoming game{upcomingReservations.length === 1 ? '' : 's'}
                    </div>
                  </div>

                  {/* Render list of upcoming ReservationCards */}
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
                      hasUserJoinedOnDate={(date) => currentUserId ? hasUserJoinedOnDate(date, currentUserId) : false}
                      currentUserId={currentUserId || ""} 
                      isAdmin={userRole === 'admin'} // Pass admin status to the card
                    />
                  ))}
                </>
              )}
            </TabsContent>

            {/* Past Games Tab Content */}
            <TabsContent value="past" className="space-y-4">
              {pastReservations.length === 0 ? (
                // ... keep existing code (EmptyState for no past games)
                <EmptyState
                  title="No past games yet"
                  description="Your game history will appear here once you've played."
                  actionText="View Upcoming Games"
                  onActionClick={() => setActiveTab("upcoming")}
                />
              ) : (
                <>
                  {/* ... keep existing code (Past games summary card and table) */}
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
                                {reservation.pitchName}
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300">{reservation.time}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground dark:text-gray-500" />
                                <span>
                                    {reservation.playersJoined}/{reservation.maxPlayers}
                                </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                { userRole === 'admin' ? (
                                     <ReservationCard // For admins, a mini-card or just relevant buttons for past games
                                        key={`${reservation.id}-admin-past`}
                                        reservation={reservation}
                                        type="past"
                                        isAdmin={true}
                                        currentUserId={currentUserId || ""}
                                    />
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewGameDetails(reservation)} // Opens the details dialog
                                        className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                                    >
                                        View Details
                                    </Button>
                                )}
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

      {/* Dialog for Viewing Past Game Details (non-admin focused) */}
      <Dialog open={isGameDetailsDialogOpen} onOpenChange={setIsGameDetailsDialogOpen}>
        {/* ... keep existing code (DialogContent for game details) */}
        <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[80vh] flex flex-col bg-white dark:bg-gray-800 border dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl text-teal-700 dark:text-teal-400">
                {selectedGameForDetails?.pitchName || "Game"} Details
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Summary of {selectedGameForDetails ? `${formatDate(selectedGameForDetails.date, "eeee, MMMM do, yyyy")} at ${selectedGameForDetails.time}` : "the game"}.
            </DialogDescription>
          </DialogHeader>

          {selectedGameForDetails && (
            <div className="space-y-4 overflow-y-auto flex-grow pr-2">
              <Card className="bg-gray-50 dark:bg-gray-700/50 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{formatDate(selectedGameForDetails.date, "MMMM d, yyyy")}</span>
                  </div>
                   <div className="flex items-center">
                    <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{selectedGameForDetails.time}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{selectedGameForDetails.playersJoined} / {selectedGameForDetails.maxPlayers} players</span>
                  </div>
                   <div className="flex items-center">
                     <MapPinIcon className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{selectedGameForDetails.location}</span>
                  </div>
                </div>
              </Card>
              
                {selectedGameForDetails.lineup && selectedGameForDetails.lineup.length > 0 && (
                    <div>
                        <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Team Lineup</h4>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                        <PitchLineup
                            maxPlayers={selectedGameForDetails.maxPlayers}
                            players={selectedGameForDetails.lineup.map(p => p.status === 'joined' ? (p.userId === currentUserId ? "You" : p.playerName || `Player ${p.userId}`) : null)}
                        />
                        </div>
                    </div>
                )}

              <div>
                <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Game Highlights</h4>
                {selectedGameForDetails.highlights && selectedGameForDetails.highlights.length > 0 ? (
                    <HighlightsList 
                    reservationId={selectedGameForDetails.id}
                    // Highlights list might need its own admin check if editing/deleting highlights is possible from here
                    isAdmin={userRole === 'admin'} 
                    />
                ) : (
                    <p className="text-sm text-muted-foreground dark:text-gray-400 italic">No highlights were recorded for this game.</p>
                )}
              </div>
            </div>
          )}
           <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <Button variant="outline" onClick={() => setIsGameDetailsDialogOpen(false)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">Close</Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * EmptyState component to display when there's no data (e.g., no upcoming games).
 */
const EmptyState = ({
  title,
  description,
  actionText,
  onActionClick,
}: {
  title: string;
  description: string;
  actionText?: string; 
  onActionClick?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center bg-gray-50 dark:bg-gray-800/30 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
    <div className="p-3 bg-teal-500/10 dark:bg-teal-400/10 rounded-full mb-4">
      <CalendarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600 dark:text-teal-400" />
    </div>
    <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
    <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6 max-w-xs sm:max-w-md">{description}</p>
    {actionText && onActionClick && (
      <Button onClick={onActionClick} className="bg-teal-600 hover:bg-teal-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 text-sm">
        {actionText}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    )}
  </div>
);

export default Reservations;
