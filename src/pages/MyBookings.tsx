
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, Loader, MapPin, Users, Clock, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation } from "@/context/ReservationContext";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import PlayerMessagesDialog from "@/components/reservations/PlayerMessagesDialog";
import GameActionConfirmationDialog from "@/components/reservations/GameActionConfirmationDialog";

/**
 * MyBookings page component
 * Shows user's joined reservations with messaging and leave functionality
 * Connected to the main reservations system
 */
const MyBookings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { reservations, cancelReservation } = useReservation();
  
  // Dialog states
  const [messagesDialog, setMessagesDialog] = useState<{
    isOpen: boolean;
    reservationId: number;
    gameName: string;
  }>({
    isOpen: false,
    reservationId: 0,
    gameName: ''
  });
  
  const [leaveDialog, setLeaveDialog] = useState<{
    isOpen: boolean;
    reservationId: number;
    gameName: string;
    gameDate: string;
    gameTime: string;
    gameLocation: string;
  }>({
    isOpen: false,
    reservationId: 0,
    gameName: '',
    gameDate: '',
    gameTime: '',
    gameLocation: ''
  });

  // Get current user info
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setCurrentUserId(userData.id);
        setCurrentUserName(`${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Player');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  // Filter reservations where current user is joined
  const userReservations = reservations.filter(res => 
    currentUserId && res.lineup && 
    res.lineup.some(player => player.userId === currentUserId && player.status === 'joined')
  );

  // Keep only upcoming reservations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = userReservations.filter(res => 
    res.status === "upcoming" && 
    new Date(res.date) >= today
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  /**
   * Opens the messages dialog for a specific game
   */
  const handleOpenMessages = (reservationId: number, gameName: string) => {
    setMessagesDialog({
      isOpen: true,
      reservationId,
      gameName
    });
  };

  /**
   * Opens the leave game confirmation dialog
   */
  const handleLeaveGame = (reservation: any) => {
    setLeaveDialog({
      isOpen: true,
      reservationId: reservation.id,
      gameName: reservation.title || reservation.pitchName,
      gameDate: reservation.date,
      gameTime: reservation.startTime || reservation.time?.split(' - ')[0] || '',
      gameLocation: reservation.city || reservation.location || ''
    });
  };

  /**
   * Confirms leaving the game and updates backend
   */
  const confirmLeaveGame = async () => {
    if (!currentUserId || !leaveDialog.reservationId) return;
    
    try {
      setIsLoading(true);
      
      // Update local state
      await cancelReservation(leaveDialog.reservationId, currentUserId);
      
      toast({
        title: "Left Game",
        description: "You have successfully left the game.",
      });
      
      setLeaveDialog({
        isOpen: false,
        reservationId: 0,
        gameName: '',
        gameDate: '',
        gameTime: '',
        gameLocation: ''
      });
    } catch (error) {
      console.error("Error leaving game:", error);
      toast({
        title: "Failed to Leave",
        description: "There was a problem leaving the game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUserId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view your bookings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">Manage your upcoming games and communicate with other players</p>
      </header>
      
      <div className="space-y-6">
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-12 bg-muted/40 rounded-lg">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Upcoming Bookings</h2>
            <p className="text-muted-foreground mb-6">You haven't joined any games yet</p>
            <Button onClick={() => window.location.href = '/reservations'}>
              Browse Available Games
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingBookings.map((reservation) => (
              <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{reservation.title || reservation.pitchName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {reservation.city || reservation.location || 'Location TBD'}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      {reservation.price && (
                        <div className="text-lg font-bold text-teal-600">
                          {reservation.price} JD
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {reservation.gameFormat || 'Football'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(reservation.date), 'PPP')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.startTime && reservation.endTime 
                            ? `${reservation.startTime} - ${reservation.endTime}`
                            : reservation.time || "Time TBD"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Players</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.lineup?.length || 0} / {reservation.maxPlayers}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenMessages(reservation.id, reservation.title || reservation.pitchName)}
                      className="flex-1"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat with Players
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveGame(reservation)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isLoading}
                    >
                      Leave Game
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Messages Dialog */}
      <PlayerMessagesDialog
        isOpen={messagesDialog.isOpen}
        onClose={() => setMessagesDialog({ isOpen: false, reservationId: 0, gameName: '' })}
        reservationId={messagesDialog.reservationId}
        gameName={messagesDialog.gameName}
        currentUserId={currentUserId || ''}
        currentUserName={currentUserName}
      />

      {/* Leave Game Confirmation Dialog */}
      <GameActionConfirmationDialog
        isOpen={leaveDialog.isOpen}
        onClose={() => setLeaveDialog({
          isOpen: false,
          reservationId: 0,
          gameName: '',
          gameDate: '',
          gameTime: '',
          gameLocation: ''
        })}
        onConfirm={confirmLeaveGame}
        action="leave"
        gameName={leaveDialog.gameName}
        gameDate={leaveDialog.gameDate}
        gameTime={leaveDialog.gameTime}
        gameLocation={leaveDialog.gameLocation}
      />
    </div>
  );
};

export default MyBookings;
