
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, BadgePlus, Edit, Trophy, User, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation } from "@/context/ReservationContext";
import { useNavigate } from "react-router-dom";
import PlayerStats from "@/components/profile/PlayerStats";
import ProfileEditor from "@/components/profile/ProfileEditor";

/**
 * Player Profile Page Component
 * Displays user information, statistics, and achievements
 * 
 * Includes:
 * - Basic user information
 * - Player statistics
 * - Badges and achievements
 * - Profile editing functionality
 */
const Profile = () => {
  const navigate = useNavigate();
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

  // Navigate to My Bookings page
  const handleViewBookings = () => {
    navigate("/my-bookings");
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
        <Loader className="animate-spin h-8 w-8 text-teal-500 mr-3" />
        <span className="text-lg text-muted-foreground">Loading profile...</span>
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
    <div className="max-w-5xl mx-auto px-4 py-8">
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
                  currentUserDetails={currentUser} 
                  onSave={handleProfileUpdate} 
                  onCancel={() => setIsEditing(false)} 
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-24 h-24 bg-teal-100 dark:bg-teal-900/30 rounded-full overflow-hidden flex items-center justify-center">
                        {currentUser.avatarUrl ? (
                          <img 
                            src={currentUser.avatarUrl} 
                            alt={`${currentUser.firstName} ${currentUser.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-teal-700 dark:text-teal-300">
                            {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                          </span>
                        )}
                      </div>
                    </div>
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
                      <span className="text-muted-foreground">Age:</span>
                      <span className="font-medium">{currentUser.age || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{currentUser.phoneNumber || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">City:</span>
                      <span className="font-medium">{currentUser.city || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preferred position:</span>
                      <span className="font-medium">{currentUser.position || "Not specified"}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleViewBookings} 
                      variant="outline" 
                      className="w-full"
                    >
                      My Bookings
                    </Button>
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
        
        {/* Right Column: Achievements */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-1 mb-6">
              <TabsTrigger value="info">
                <Trophy className="h-4 w-4 mr-2" />
                <span>Achievements</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <h3 className="text-xl font-semibold mb-4">Badges & Achievements</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  achievement.earned && (
                    <Card 
                      key={achievement.title}
                      className="border border-amber-300 bg-amber-50 dark:bg-amber-950/20"
                    >
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="mx-auto rounded-full p-3 w-14 h-14 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 mb-3">
                            {achievement.icon}
                          </div>
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                          <div className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
                            EARNED!
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
              
              {!achievements.some(a => a.earned) && (
                <div className="text-center py-10 bg-muted/40 rounded-lg">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Achievements Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Play more games to unlock achievements and collect badges!
                  </p>
                </div>
              )}
              
              <div className="mt-8">
                <h4 className="text-lg font-medium mb-3">Upcoming Achievements</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {achievements.map((achievement) => (
                    !achievement.earned && (
                      <Card 
                        key={achievement.title}
                        className="border opacity-60"
                      >
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="mx-auto rounded-full p-3 w-14 h-14 flex items-center justify-center bg-gray-100 dark:bg-gray-800 mb-3">
                              {achievement.icon}
                            </div>
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                            <div className="mt-3 text-xs font-medium text-gray-500">
                              Not yet earned
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
