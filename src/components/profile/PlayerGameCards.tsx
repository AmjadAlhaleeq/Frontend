
import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, Trophy, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isAfter } from "date-fns";
import { Reservation } from "@/context/ReservationContext";

interface PlayerGameCardsProps {
  reservations: Reservation[];
  userId: string;
}

/**
 * PlayerGameCards component
 * Displays upcoming games and game history for a player
 */
const PlayerGameCards: React.FC<PlayerGameCardsProps> = ({ reservations, userId }) => {
  const navigate = useNavigate();
  
  // Get current date for comparison
  const today = new Date();
  
  // Filter and sort reservations
  const upcomingGames = reservations
    .filter(res => 
      res.lineup && res.lineup.some(player => player.userId === userId && player.status === 'joined') && 
      isAfter(parseISO(res.date), today)
    )
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    
  const pastGames = reservations
    .filter(res => 
      res.lineup && res.lineup.some(player => player.userId === userId && player.status === 'joined') && 
      !isAfter(parseISO(res.date), today)
    )
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  
  // Calculate player stats
  const gamesPlayed = pastGames.length;
  const goals = pastGames.reduce(
    (count, game) => count + game.highlights.filter(
      h => h.playerId === userId || h.playerId === `player-${userId}` && h.type === 'goal'
    ).length, 
    0
  );
  
  // Format date for display
  const formatGameDate = (dateStr: string) => {
    return format(parseISO(dateStr), 'EEE, MMM d');
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  onClick={() => navigate('/reservations')}
                >
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{game.pitchName}</h4>
                    <Badge className={
                      game.status === 'open' ? "bg-green-500" : 
                      game.status === 'full' ? "bg-amber-500" : "bg-gray-500"
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
                      {game.time}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      {game.location || "Location not specified"}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-3.5 w-3.5 mr-1.5" />
                      {game.playersJoined}/{game.maxPlayers + 2}
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
      
      {/* Game History Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-teal-700 dark:text-teal-400">
            Game History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{gamesPlayed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Games Played</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{goals}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Goals Scored</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-500">0</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">MVP Awards</p>
            </div>
          </div>
          
          {pastGames.length > 0 ? (
            <div className="space-y-3">
              {pastGames.slice(0, 3).map(game => (
                <div 
                  key={game.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => {
                    // Open game details dialog
                    const event = new CustomEvent('showGameDetails', { detail: { gameId: game.id } });
                    window.dispatchEvent(event);
                  }}
                >
                  <div className="flex justify-between mb-1.5">
                    <h4 className="font-medium">{game.pitchName}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatGameDate(game.date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <Users className="h-3 w-3 mr-1" />
                      {game.playersJoined} players
                    </div>
                    
                    {game.highlights.some(h => (h.playerId === userId || h.playerId === `player-${userId}`) && h.type === 'goal') && (
                      <div className="flex items-center text-xs text-amber-500">
                        <Trophy className="h-3 w-3 mr-1" />
                        {game.highlights.filter(
                          h => (h.playerId === userId || h.playerId === `player-${userId}`) && h.type === 'goal'
                        ).length} goals
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>No game history yet</p>
              <p className="text-sm mt-1">Your completed games will appear here</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            className="w-full text-teal-600 dark:text-teal-400"
            onClick={() => navigate('/reservations')}
          >
            View Full Game History
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PlayerGameCards;
