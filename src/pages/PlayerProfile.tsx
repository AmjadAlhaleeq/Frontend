
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReservation } from '@/context/ReservationContext';
import PlayerGameCards from '@/components/profile/PlayerGameCards';
import PlayerStats from '@/components/profile/PlayerStats';
import PlayerBadges from '@/components/profile/PlayerBadges';

const PlayerProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { getUserStats } = useReservation();
  
  // Get current user if userId is not provided
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const profileId = userId || currentUser.id;
  
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
  
  // Get player stats
  const stats = getUserStats(profileId);
  
  // Fixed user stats to include goals 
  const userStats = {
    gamesPlayed: stats.gamesPlayed,
    goals: stats.goals || stats.goalsScored || 0,
    goalsScored: stats.goalsScored || 0,
    assists: stats.assists,
    cleansheets: stats.cleansheets,
    mvps: stats.mvps,
    yellowCards: stats.yellowCards || 0,
    redCards: stats.redCards || 0,
    matches: stats.matches || stats.gamesPlayed,
    wins: stats.wins || 0,
    tackles: stats.tackles || 0
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Player Profile</h1>
      
      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="games">My Games</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="games">
          <PlayerGameCards userId={profileId} />
        </TabsContent>
        
        <TabsContent value="stats">
          <PlayerStats stats={userStats} />
        </TabsContent>
        
        <TabsContent value="badges">
          <PlayerBadges stats={userStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerProfile;
