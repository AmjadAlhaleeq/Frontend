import React, { useState } from 'react';
import { useReservation, Reservation } from '@/context/ReservationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

interface PlayerReservationsProps {
  userId: string;
}

const PlayerReservations: React.FC<PlayerReservationsProps> = ({ userId }) => {
  const { reservations, cancelReservation } = useReservation();
  
  // Get user's reservations
  const userReservations = reservations.filter(res => 
    res.lineup && res.lineup.some(player => player.userId === userId && player.status === 'joined')
  );

  // Keep only upcoming
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingReservations = userReservations.filter(res => 
    (res.status === 'open' || res.status === 'full') && 
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

  const handleCancelReservation = (reservationId: number) => {
    if (window.confirm("Are you sure you want to leave this game?")) {
      cancelReservation(reservationId, userId);
    }
  };

  // Component for reservation card
  const ReservationCardItem = ({ reservation }: { reservation: Reservation }) => (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-teal-700 dark:text-teal-400">
          {reservation.pitchName}
        </h3>
        <Badge 
          className={cn(
            "text-xs",
            reservation.status === 'open' 
              ? "bg-green-500" 
              : reservation.status === 'full' 
              ? "bg-orange-500" 
              : "bg-gray-500" // Simplified as past games are removed
          )}
        >
          {reservation.status}
        </Badge>
      </div>
      
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
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => handleCancelReservation(reservation.id)}
        >
          Leave Game
        </Button>
      </div>
    </div>
  );

  const NoReservationsMessage = () => (
    <div className="p-8 text-center">
      <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 mb-4">
        <Calendar className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
        No upcoming games
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        You haven't joined any upcoming games. Check out available games in the Reservations page.
      </p>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-teal-700 dark:text-teal-400">My Upcoming Games</CardTitle>
        <CardDescription>
          Your upcoming game reservations
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
    </Card>
  );
};

export default PlayerReservations;
