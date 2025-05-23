
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { Reservation } from "@/context/ReservationContext";
import ReservationCard from "@/components/reservations/ReservationCard";

interface PlayerGameCardsProps {
  reservations: Reservation[];
  userId: string;
  onJoinGame?: (reservationId: number) => void;
  onCancelReservation?: (reservationId: number) => void;
}

/**
 * PlayerGameCards component
 * Displays upcoming games for a player
 */
const PlayerGameCards: React.FC<PlayerGameCardsProps> = ({ 
  reservations, 
  userId,
  onJoinGame,
  onCancelReservation
}) => {
  const navigate = useNavigate();
  
  const today = new Date();
  
  const upcomingGames = reservations
    .filter(res => 
      res.lineup && res.lineup.some(player => player.userId === userId && player.status === 'joined') && 
      isAfter(parseISO(res.date), today) // Ensure it's strictly after today
    )
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
      {/* Upcoming Games Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-teal-700 dark:text-teal-400">
            Upcoming Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingGames.length > 0 ? (
            <div className="space-y-4">
              {upcomingGames.slice(0, 3).map(game => (
                <ReservationCard
                  key={game.id}
                  reservation={game}
                  type="upcoming"
                  onJoinGame={onJoinGame ? () => onJoinGame(game.id) : undefined}
                  onCancelReservation={onCancelReservation ? () => onCancelReservation(game.id) : undefined}
                  isUserJoined={true} // We know the user is joined because of the filter above
                  isUserOnWaitingList={false} // We know the user is not on the waitlist because they're joined
                  hasUserJoinedOnDate={() => false} // This is not relevant in this context
                  currentUserId={userId}
                  isAdmin={false} // User view
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>You have no upcoming games</p>
              <p className="text-sm mt-1">Join a reservation to see it here</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            className="w-full text-teal-600 dark:text-teal-400"
            onClick={() => navigate('/reservations')}
          >
            View All Reservations
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PlayerGameCards;
