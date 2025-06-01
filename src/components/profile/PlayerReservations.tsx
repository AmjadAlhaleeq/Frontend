
import React, { useState, useEffect } from 'react';
import { useReservation } from '@/context/ReservationContext';
import { Reservation } from '@/types/reservation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, differenceInHours, formatDistanceToNow } from 'date-fns';
import LeaveGameDialog from '../reservations/LeaveGameDialog';
import { useToast } from '@/hooks/use-toast';
import WaitlistConfirmationDialog from '../reservations/WaitlistConfirmationDialog';
import { sendGameJoinedConfirmation } from '@/utils/emailNotifications';
import { cancelReservation as cancelReservationApi, removeFromWaitlist } from '@/services/playerReservationApi';
import { getMyBookings } from '@/lib/userApi';

interface PlayerReservationsProps {
  userId: string;
}

/**
 * PlayerReservations component
 * Shows a player's upcoming game reservations with options to leave games or join waiting lists
 */
const PlayerReservations: React.FC<PlayerReservationsProps> = ({ userId }) => {
  const { reservations, cancelReservation, joinWaitingList, leaveWaitingList, setReservations } = useReservation();
  const { toast } = useToast();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showJoinWaitlistDialog, setShowJoinWaitlistDialog] = useState(false);
  const [showLeaveWaitlistDialog, setShowLeaveWaitlistDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [userBookings, setUserBookings] = useState<Reservation[]>([]);
  
  // Fetch user's bookings from API
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setLoading(true);
        const response = await getMyBookings();
        
        if (response.status === 'success' && response.data?.reservations) {
          // Transform backend data to frontend format
          const transformedReservations = response.data.reservations.map((res: any) => ({
            id: res._id,
            backendId: res._id,
            pitchName: res.pitch?.name || 'Unknown Pitch',
            title: res.pitch?.name || 'Unknown Pitch',
            date: res.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
            time: res.startTime || '00:00',
            startTime: res.startTime,
            endTime: res.endTime,
            location: res.pitch?.location || 'Unknown Location',
            city: res.pitch?.city || 'Unknown City',
            maxPlayers: res.maxPlayers || 10,
            playersJoined: res.currentPlayers?.length || 0,
            lineup: res.currentPlayers?.map((player: any) => ({
              userId: player._id,
              name: `${player.firstName} ${player.lastName}`,
              playerName: `${player.firstName} ${player.lastName}`,
              status: 'joined',
              joinedAt: new Date().toISOString()
            })) || [],
            waitList: res.waitList || [],
            status: res.status || 'upcoming',
            price: res.pricePerPlayer,
            imageUrl: res.pitch?.images?.[0] || null,
            // Check if user is in waitlist
            userInWaitlist: res.waitList?.includes(userId) || false
          }));
          
          setUserBookings(transformedReservations);
        }
      } catch (error) {
        console.error('Error fetching user bookings:', error);
        toast({
          title: "Failed to Load Bookings",
          description: "Could not load your bookings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserBookings();
    }
  }, [userId, toast]);

  // Get user's reservations from local state as fallback
  const localUserReservations = reservations.filter(res => {
    const isJoined = res.lineup && res.lineup.some(player => player.userId === userId && player.status === 'joined');
    const isInWaitlist = res.waitList && res.waitList.includes(userId);
    return isJoined || isInWaitlist;
  });

  // Use API bookings if available, otherwise use local reservations
  const userReservations = userBookings.length > 0 ? userBookings : localUserReservations;

  // Keep only upcoming
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingReservations = userReservations.filter(res => 
    res.status === "upcoming" && 
    new Date(res.date) >= today
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'EEE, MMM d, yyyy');
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  // Check if leaving game incurs a penalty (within 2 hours of start)
  const isPenalty = (reservation: Reservation) => {
    try {
      const gameDate = parseISO(reservation.date);
      const [hours, minutes] = reservation.time.split(':').map(Number);
      
      gameDate.setHours(hours || 0);
      gameDate.setMinutes(minutes || 0);
      
      const now = new Date();
      const hoursDifference = differenceInHours(gameDate, now);
      
      return hoursDifference < 2 && hoursDifference >= 0;
    } catch (error) {
      console.error("Error calculating penalty:", error);
      return false;
    }
  };
  
  // Calculate time remaining until game
  const getTimeToGame = (reservation: Reservation) => {
    try {
      const gameDate = parseISO(reservation.date);
      const [hours, minutes] = reservation.time.split(':').map(Number);
      
      gameDate.setHours(hours || 0);
      gameDate.setMinutes(minutes || 0);
      
      const now = new Date();
      return formatDistanceToNow(gameDate);
    } catch (error) {
      console.error("Error calculating time to game:", error);
      return "unknown time";
    }
  };

  // Check if user is in waitlist for a specific reservation
  const isUserInWaitlist = (reservation: Reservation) => {
    return reservation.userInWaitlist || (reservation.waitList && reservation.waitList.includes(userId));
  };

  // Check if user is joined to the game
  const isUserJoined = (reservation: Reservation) => {
    return reservation.lineup?.some(player => player.userId === userId);
  };

  // Handle leaving waiting list
  const handleLeaveWaitingList = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowLeaveWaitlistDialog(true);
  };

  // Confirm leaving waitlist
  const confirmLeaveWaitlist = async () => {
    if (!selectedReservation) return;
    
    try {
      await removeFromWaitlist(selectedReservation.backendId || selectedReservation.id.toString());
      await leaveWaitingList(selectedReservation.id, userId);
      setShowLeaveWaitlistDialog(false);
      
      // Refresh bookings
      const response = await getMyBookings();
      if (response.status === 'success' && response.data?.reservations) {
        const transformedReservations = response.data.reservations.map((res: any) => ({
          id: res._id,
          backendId: res._id,
          pitchName: res.pitch?.name || 'Unknown Pitch',
          title: res.pitch?.name || 'Unknown Pitch',
          date: res.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
          time: res.startTime || '00:00',
          startTime: res.startTime,
          endTime: res.endTime,
          location: res.pitch?.location || 'Unknown Location',
          city: res.pitch?.city || 'Unknown City',
          maxPlayers: res.maxPlayers || 10,
          playersJoined: res.currentPlayers?.length || 0,
          lineup: res.currentPlayers?.map((player: any) => ({
            userId: player._id,
            name: `${player.firstName} ${player.lastName}`,
            playerName: `${player.firstName} ${player.lastName}`,
            status: 'joined',
            joinedAt: new Date().toISOString()
          })) || [],
          waitList: res.waitList || [],
          status: res.status || 'upcoming',
          price: res.pricePerPlayer,
          imageUrl: res.pitch?.images?.[0] || null,
          userInWaitlist: res.waitList?.includes(userId) || false
        }));
        setUserBookings(transformedReservations);
      }
      
      toast({
        title: "Removed from waiting list",
        description: "You've been removed from the waiting list",
      });
    } catch (error) {
      console.error("Error leaving waiting list:", error);
      toast({
        title: "Failed to leave",
        description: "There was a problem leaving the waiting list",
        variant: "destructive",
      });
    }
  };

  // Open leave game dialog
  const handleCancelReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowLeaveDialog(true);
  };
  
  // Confirm leave game
  const confirmLeaveGame = async () => {
    if (!selectedReservation) return;
    
    try {
      // Call backend API first
      if (selectedReservation.backendId) {
        await cancelReservationApi(selectedReservation.backendId);
      }
      
      // Then update local state
      await cancelReservation(selectedReservation.id, userId);
      setShowLeaveDialog(false);
      
      // Refresh bookings
      const response = await getMyBookings();
      if (response.status === 'success' && response.data?.reservations) {
        const transformedReservations = response.data.reservations.map((res: any) => ({
          id: res._id,
          backendId: res._id,
          pitchName: res.pitch?.name || 'Unknown Pitch',
          title: res.pitch?.name || 'Unknown Pitch',
          date: res.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
          time: res.startTime || '00:00',
          startTime: res.startTime,
          endTime: res.endTime,
          location: res.pitch?.location || 'Unknown Location',
          city: res.pitch?.city || 'Unknown City',
          maxPlayers: res.maxPlayers || 10,
          playersJoined: res.currentPlayers?.length || 0,
          lineup: res.currentPlayers?.map((player: any) => ({
            userId: player._id,
            name: `${player.firstName} ${player.lastName}`,
            playerName: `${player.firstName} ${player.lastName}`,
            status: 'joined',
            joinedAt: new Date().toISOString()
          })) || [],
          waitList: res.waitList || [],
          status: res.status || 'upcoming',
          price: res.pricePerPlayer,
          imageUrl: res.pitch?.images?.[0] || null,
          userInWaitlist: res.waitList?.includes(userId) || false
        }));
        setUserBookings(transformedReservations);
      }
      
      toast({
        title: "Game cancelled",
        description: "You've left the game successfully",
      });
      
      // If there was a penalty, show additional warning
      if (isPenalty(selectedReservation)) {
        toast({
          title: "Penalty Warning",
          description: "Leaving a game less than 2 hours before start time may result in penalties.",
          variant: "destructive",
          duration: 6000,
        });
      }
    } catch (error) {
      console.error("Error leaving game:", error);
      toast({
        title: "Failed to leave",
        description: "There was a problem cancelling your reservation",
        variant: "destructive",
      });
    }
  };

  // Component for reservation card
  const ReservationCardItem = ({ reservation }: { reservation: Reservation }) => {
    const userJoined = isUserJoined(reservation);
    const userWaitlisted = isUserInWaitlist(reservation);
    
    return (
      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-teal-700 dark:text-teal-400">
            {reservation.pitchName}
          </h3>
          <div className="flex gap-2">
            <Badge 
              className={cn(
                "text-xs",
                reservation.status === 'upcoming' 
                  ? "bg-green-500" 
                  : reservation.status === 'completed' 
                  ? "bg-blue-500" 
                  : "bg-gray-500"
              )}
            >
              {reservation.status}
            </Badge>
            {userWaitlisted && (
              <Badge className="text-xs bg-amber-500">
                <Clock className="h-3 w-3 mr-1" />
                Waitlisted
              </Badge>
            )}
          </div>
        </div>
        
        {/* Pitch image */}
        {reservation.imageUrl && (
          <div className="h-24 w-full rounded-md overflow-hidden mb-3">
            <img 
              src={reservation.imageUrl} 
              alt={reservation.title || reservation.pitchName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(reservation.date)}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            {reservation.time}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-2" />
            {reservation.location || "Location not specified"}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4 mr-2" />
            {reservation.playersJoined}/{reservation.maxPlayers} players
          </div>
          
          {isPenalty(reservation) && userJoined && (
            <div className="flex items-center text-amber-600 text-xs mt-1">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              <span>Leaving now will incur a penalty</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          {userJoined ? (
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "text-red-500 hover:text-red-600 hover:bg-red-50",
                isPenalty(reservation) && "border-amber-300 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              )}
              onClick={() => handleCancelReservation(reservation)}
            >
              Leave Game
            </Button>
          ) : userWaitlisted ? (
            <Button 
              variant="outline" 
              size="sm"
              className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
              onClick={() => handleLeaveWaitingList(reservation)}
            >
              Leave Waitlist
            </Button>
          ) : null}
        </div>
      </div>
    );
  };

  const NoReservationsMessage = () => (
    <div className="p-8 text-center">
      <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 mb-4">
        <Calendar className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
        No upcoming games
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        You haven't joined any upcoming games or waitlists. Check out available games in the Reservations page.
      </p>
    </div>
  );

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl text-teal-700 dark:text-teal-400">My Upcoming Games</CardTitle>
          <CardDescription>Loading your bookings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-teal-700 dark:text-teal-400">My Upcoming Games</CardTitle>
        <CardDescription>
          Your upcoming game reservations and waitlist positions
        </CardDescription>
      </CardHeader>

      <CardContent>
        {upcomingReservations.length === 0 ? (
          <NoReservationsMessage />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {upcomingReservations.map(reservation => (
              <ReservationCardItem key={reservation.id} reservation={reservation} />
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Leave game confirmation dialog */}
      {selectedReservation && (
        <>
          <LeaveGameDialog
            isOpen={showLeaveDialog}
            onClose={() => setShowLeaveDialog(false)}
            onConfirm={confirmLeaveGame}
            gameName={selectedReservation.title || selectedReservation.pitchName}
            gameDate={formatDate(selectedReservation.date)}
            gameTime={selectedReservation.time}
            isPenalty={isPenalty(selectedReservation)}
            timeToGame={getTimeToGame(selectedReservation)}
          />
          
          <WaitlistConfirmationDialog
            isOpen={showLeaveWaitlistDialog}
            onClose={() => setShowLeaveWaitlistDialog(false)}
            onConfirm={confirmLeaveWaitlist}
            gameName={selectedReservation.title || selectedReservation.pitchName}
            gameDate={formatDate(selectedReservation.date)}
            gameTime={selectedReservation.time}
            isJoining={false}
          />
        </>
      )}
    </Card>
  );
};

export default PlayerReservations;
