
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReservation } from '@/context/ReservationContext';
import PlayerGameCards from '@/components/profile/PlayerGameCards';
import PlayerStats from '@/components/profile/PlayerStats';
import PlayerBadges from '@/components/profile/PlayerBadges';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, MapPin, ArrowLeft } from "lucide-react";
import PlayerReservations from '@/components/profile/PlayerReservations';

const PlayerProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { getUserStats, getUserDetails } = useReservation();
  const navigate = useNavigate();
  
  // Get current user if userId is not provided
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const profileId = userId || currentUser.id;
  
  // State to track whether we're viewing another player's profile
  const [isOtherPlayer, setIsOtherPlayer] = useState<boolean>(false);
  
  useEffect(() => {
    // Determine if we're viewing another player's profile
    setIsOtherPlayer(userId !== undefined && userId !== currentUser.id);
  }, [userId, currentUser.id]);
  
  if (!profileId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-bold">User Not Found</h2>
            <p className="text-gray-500 mt-2">Please log in to view your profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Get player stats and details
  const stats = getUserStats(profileId);
  const playerDetails = getUserDetails ? getUserDetails(profileId) : null;
  
  // Fixed user stats to include goals 
  const userStats = {
    gamesPlayed: stats.gamesPlayed || 0,
    goals: stats.goals || stats.goalsScored || 0,
    goalsScored: stats.goalsScored || 0,
    assists: stats.assists || 0,
    cleansheets: stats.cleansheets || 0,
    mvps: stats.mvps || 0,
    yellowCards: stats.yellowCards || 0,
    redCards: stats.redCards || 0,
    matches: stats.gamesPlayed || 0,
    wins: stats.wins || 0,
    tackles: stats.tackles || 0
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isOtherPlayer && (
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar with player info */}
        <div>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage
                    src={playerDetails?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerDetails?.name || profileId}`}
                    alt={playerDetails?.name || "Player"}
                  />
                  <AvatarFallback>
                    {(playerDetails?.name || "P").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-medium">{playerDetails?.name || `Player ${profileId}`}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {playerDetails?.position || "Position not set"}
                </p>

                {!isOtherPlayer && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/profile")}
                    className="mb-4"
                  >
                    Edit Profile
                  </Button>
                )}

                {/* Player contact details */}
                {(playerDetails?.email || playerDetails?.location) && (
                  <div className="w-full space-y-2 mt-2">
                    {playerDetails?.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{playerDetails.email}</span>
                      </div>
                    )}
                    {playerDetails?.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{playerDetails.location}</span>
                      </div>
                    )}
                    {playerDetails?.joinedAt && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Joined {new Date(playerDetails.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Player stats summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {userStats.gamesPlayed}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Games</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {userStats.goals}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Goals</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {userStats.assists}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assists</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">
                    {userStats.mvps}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">MVPs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-6">Player Profile</h1>
          
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="games">My Games</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="games">
              <PlayerReservations userId={profileId} />
            </TabsContent>
            
            <TabsContent value="stats">
              <PlayerStats stats={userStats} />
            </TabsContent>
            
            <TabsContent value="achievements">
              <PlayerBadges userId={profileId} userStats={userStats} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
