import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isAfter } from "date-fns";
import { Reservation } from "@/types/reservation";

interface PlayerGameCardsProps {
  reservations: Reservation[];
  userId: string;
}

/**
 * PlayerGameCards component
 * Displays upcoming games for a player
 */
const PlayerGameCards: React.FC<PlayerGameCardsProps> = ({ reservations, userId }) => {
  const navigate = useNavigate();
  
  const today = new Date();
  
  const upcomingGames = reservations
    .filter(res => 
      res.lineup && res.lineup.some(player => player.userId === userId && player.status === 'joined') && 
      isAfter(parseISO(res.date), today) // Ensure it's strictly after today
    )
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    
  const formatGameDate = (dateStr: string) => {
    return format(parseISO(dateStr), 'EEE, MMM d');
  };

  // Function to show game details
  const showGameDetails = (gameId: number) => {
    // Dispatch an event to show game details
    const event = new CustomEvent('showGameDetails', { detail: { gameId } });
    window.dispatchEvent(event);
    // Navigate to reservations page
    navigate('/reservations');
  };
  
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
                <div 
                  key={game.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => showGameDetails(game.id)}
                >
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{game.title || game.pitchName}</h4>
                    <Badge className={
                      game.status === 'upcoming' ? "bg-green-500" : 
                      game.status === 'completed' ? "bg-blue-500" : "bg-gray-500"
                    }>
                      {game.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {formatGameDate(game.date)}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      {game.startTime || game.time?.split(' - ')[0]}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      {game.location || "Location not specified"}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-3.5 w-3.5 mr-1.5" />
                      {game.lineup?.length || 0}/{game.maxPlayers}
                    </div>
                  </div>
                </div>
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
