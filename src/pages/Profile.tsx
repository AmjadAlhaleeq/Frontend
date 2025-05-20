
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, BadgePlus, CalendarIcon, Edit, Trophy, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation } from "@/context/ReservationContext";
import PlayerStats from "@/components/profile/PlayerStats";
import ProfileEditor from "@/components/profile/ProfileEditor";
import PlayerGameCards from "@/components/profile/PlayerGameCards";
import PlayerReservations from "@/components/profile/PlayerReservations";

/**
 * Player Profile Page Component
 * Displays user information, statistics, and game history
 * 
 * Includes:
 * - Basic user information
 * - Player statistics
 * - Game history
 * - Badges and achievements
 * - Profile editing functionality
 */
const Profile = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getUserStats } = useReservation();

  // Fetch user data on component mount
  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem("currentUser");
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (e) {
        console.error("Error parsing user data:", e);
        toast({
          title: "Error",
          description: "Could not load user profile data",
          variant: "destructive",
        });
      }
    } else {
      // If no user data found, redirect to login
      toast({
        title: "Not logged in",
        description: "Please login to view your profile",
        variant: "destructive",
      });
    }
    
    // Simulate API loading time for better UX
    setTimeout(() => setIsLoading(false), 800);
  }, [toast]);
  
  // Handle profile update from editor
  const handleProfileUpdate = (updatedData: any) => {
    try {
      // Update local state
      setCurrentUser({ ...currentUser, ...updatedData });
      
      // Update in localStorage (in a real app, this would be an API call)
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...currentUser, ...updatedData })
      );
      
      // Exit edit mode and show success message
      setIsEditing(false);
      toast({ title: "Profile updated", description: "Your profile has been updated successfully" });
    } catch (e) {
      console.error("Error updating profile:", e);
      toast({ 
        title: "Update failed", 
        description: "There was a problem updating your profile", 
        variant: "destructive" 
      });
    }
  };

  // Get user stats from ReservationContext
  const userStats = getUserStats(currentUser?.id || "");
  
  // Generate achievements based on stats
  const achievements = [
    { 
      title: "Goal Scorer",
      icon: <BadgePlus className="h-6 w-6 text-amber-500" />,
      earned: userStats.goalsScored >= 5,
      description: "Score 5 or more goals"
    },
    { 
      title: "MVP Star",
      icon: <Trophy className="h-6 w-6 text-amber-500" />,
      earned: userStats.mvps >= 3,
      description: "Receive 3 or more MVP awards"
    },
    { 
      title: "Team Player",
      icon: <Award className="h-6 w-6 text-amber-500" />,
      earned: userStats.gamesPlayed >= 10,
      description: "Play in 10 or more games"
    },
  ];
  
  // If still loading data, show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-teal-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  // If no user data found, show message
  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Profile Found</h2>
        <p className="text-muted-foreground mb-6">Please log in to view your profile</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Player Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Profile Information</CardTitle>
                {!isEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit profile</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {isEditing ? (
                <ProfileEditor 
                  user={currentUser} 
                  onSave={handleProfileUpdate} 
                  onCancel={() => setIsEditing(false)} 
                />
              ) : (
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-teal-700 dark:text-teal-300">
                      {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                    </span>
                  </div>
                  
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {currentUser.firstName} {currentUser.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentUser.email}
                    </p>
                    <div className="mt-2 inline-block bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {currentUser.role || "Player"}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-medium">{currentUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Player since:</span>
                      <span className="font-medium">May 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preferred position:</span>
                      <span className="font-medium">{currentUser.position || "Forward"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Skill level:</span>
                      <span className="font-medium">{currentUser.skillLevel || "Intermediate"}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Player Statistics Card */}
          <div className="mt-6">
            <PlayerStats stats={userStats} />
          </div>
        </div>
        
        {/* Right Column: Tabs for Games, Reservations, Achievements */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="info">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Game History</span>
                <span className="sm:hidden">Games</span>
              </TabsTrigger>
              <TabsTrigger value="reservations">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Reservations</span>
                <span className="sm:hidden">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="achievements">
                <Trophy className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Achievements</span>
                <span className="sm:hidden">Awards</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Recent Games</h3>
              <PlayerGameCards userId={currentUser.id} />
            </TabsContent>
            
            <TabsContent value="reservations">
              <h3 className="text-xl font-semibold mb-4">My Reservations</h3>
              <PlayerReservations userId={currentUser.id} />
            </TabsContent>
            
            <TabsContent value="achievements">
              <h3 className="text-xl font-semibold mb-4">Badges & Achievements</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card 
                    key={achievement.title}
                    className={`border ${achievement.earned ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : 'opacity-60'}`}
                  >
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="mx-auto rounded-full p-3 w-14 h-14 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 mb-3">
                          {achievement.icon}
                        </div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                        <div className={`mt-3 text-xs font-medium ${achievement.earned ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`}>
                          {achievement.earned ? 'EARNED!' : 'Not yet earned'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8">
                <h4 className="text-lg font-medium mb-3">Upcoming Achievements</h4>
                <p className="text-sm text-muted-foreground">
                  Keep playing to unlock more achievements and badges. Track your progress and earn special rewards!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
