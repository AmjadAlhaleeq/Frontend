
import React, { useState } from 'react';
import { useReservation, Reservation } from '@/context/ReservationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PlayerGameCardsProps {
  userId: string;
}

const PlayerGameCards: React.FC<PlayerGameCardsProps> = ({ userId }) => {
  const { reservations } = useReservation();
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Get user's reservations
  const userReservations = reservations.filter(res => 
    res.lineup && res.lineup.some(player => player.userId === userId && (!player.status || player.status === 'joined'))
  );

  // Split into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingReservations = userReservations.filter(res => 
    (res.status === 'open' || res.status === 'full') && 
    new Date(res.date) >= today
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastReservations = userReservations.filter(res => 
    res.status === 'completed' || 
    (new Date(res.date) < today && res.status !== 'cancelled')
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'EEE, MMM d, yyyy');
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">My Games ({userReservations.length})</h3>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {upcomingReservations.map(reservation => (
          <Card key={reservation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{reservation.pitchName}</h4>
                <Badge 
                  className={cn(
                    "text-xs",
                    reservation.status === 'open' 
                      ? "bg-green-500" 
                      : reservation.status === 'full' 
                      ? "bg-orange-500" 
                      : "bg-blue-500"
                  )}
                >
                  {reservation.status}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(reservation.date)}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {reservation.time}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {reservation.location}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {reservation.playersJoined}/{reservation.maxPlayers} players
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {upcomingReservations.length === 0 && (
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-md">
          <p className="text-gray-500">No upcoming games. Join a game from the Reservations page.</p>
        </div>
      )}
    </div>
  );
};

export default PlayerGameCards;
