import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User, Shield, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UserStats, useReservation } from "@/context/ReservationContext";
import PlayerStats from "@/components/profile/PlayerStats";
import PlayerReservations from "@/components/profile/PlayerReservations";
import PlayerGameCards from "@/components/profile/PlayerGameCards";
import ProfileEditor from "@/components/profile/ProfileEditor";
import AuthForm from "@/components/auth/AuthForm";

/**
 * Profile page showing user information, statistics, reservations, and authentication.
 * Includes authentication flow and enhanced profile editing.
 */
const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getUserStats, reservations } = useReservation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    gender?: string;
    age?: string;
    city?: string;
    favoritePosition?: string;
    phoneNumber?: string;
    email: string;
    role: "player" | "admin";
    avatarUrl?: string;
  } | null>(null);

  // Check if the user is logged in on page load
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserProfile(userData);
        setIsLoggedIn(true);
        
        // Also set user role in localStorage for other components to use
        localStorage.setItem("userRole", userData.role);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userRole");
      }
    }
  }, []);

  // Mock login functionality (should connect to backend in real app)
  const handleLogin = (data: { email: string; password: string }) => {
    setIsLoading(true);
    console.info("Attempting login with:", JSON.stringify(data, null, 2));
    
    // Simulate API call
    setTimeout(() => {
      // Demo accounts (in real app, this would be authenticated against backend)
      if (data.email === "admin@example.com" && data.password === "admin123") {
        const userData = {
          id: "admin1",
          firstName: "Admin",
          lastName: "User",
          email: data.email,
          role: "admin" as const,
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        };
        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("isLoggedIn", "true");
        setUserProfile(userData);
        setIsLoggedIn(true);
        toast({
          title: "Welcome Admin!",
          description: "You have successfully logged in as an admin.",
        });
      } else if (data.email === "player@example.com" && data.password === "player123") {
        const userData = {
          id: "user1",
          firstName: "John",
          lastName: "Player",
          email: data.email,
          gender: "male",
          age: "28",
          city: "New York",
          favoritePosition: "midfielder",
          phoneNumber: "+1 (555) 123-4567",
          role: "player" as const,
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=player",
        };
        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("isLoggedIn", "true");
        setUserProfile(userData);
        setIsLoggedIn(true);
        toast({
          title: "Welcome Back!",
          description: "You have successfully logged in.",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  // Mock registration functionality (should connect to backend in real app)
  const handleRegister = (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Parse name into first and last name
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Create new user account (in real app, this would be stored in database)
      const userData = {
        id: `user${Date.now()}`,
        firstName,
        lastName,
        email: data.email,
        role: "player" as const,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.replace(/\s+/g, '')}`,
      };
      
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("userRole", userData.role);
      localStorage.setItem("isLoggedIn", "true");
      setUserProfile(userData);
      setIsLoggedIn(true);
      
      toast({
        title: "Account Created",
        description: "Your account has been successfully created.",
      });
      
      setIsLoading(false);
    }, 1500);
  };

  // Handle saving profile changes
  const handleSaveProfile = (updatedProfile: any) => {
    if (userProfile) {
      const newProfile = {
        ...userProfile,
        ...updatedProfile
      };
      setUserProfile(newProfile);
      localStorage.setItem("currentUser", JSON.stringify(newProfile));
      
      // Dispatch event to notify other components about profile update
      window.dispatchEvent(new Event('userProfileUpdated'));
      
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      });
    }
  };

  // Handle navigation to reservations page
  const handleNavigateToReservations = () => {
    navigate('/reservations');
  };

  // Get user stats if logged in - Fix type issues
  const userStats = userProfile 
    ? getUserStats(userProfile.id)
    : {
        matches: 0,
        wins: 0,
        goals: 0,
        assists: 0,
        cleansheets: 0,
        tackles: 0,
        yellowCards: 0,
        redCards: 0,
        mvps: 0,
        gamesPlayed: 0,
        goalsScored: 0
      };
      
  // Display username formatted nicely
  const displayName = userProfile?.firstName 
    ? `${userProfile.firstName} ${userProfile.lastName}`
    : (userProfile?.role ? (userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)) : "User");
    
  // Avatar fallback text
  const avatarFallback = userProfile?.firstName 
    ? userProfile.firstName.charAt(0).toUpperCase() + (userProfile.lastName ? userProfile.lastName.charAt(0).toUpperCase() : '')
    : (userProfile?.role ? userProfile.role.charAt(0).toUpperCase() : "U");

  return (
    <div className="container mx-auto px-4 py-8">
      {!isLoggedIn ? (
        // Authentication Form when not logged in
        <div className="max-w-md mx-auto py-10">
          <h1 className="text-3xl font-bold text-center mb-6 text-teal-700 dark:text-teal-400">
            Account Access
          </h1>
          <AuthForm
            onLogin={handleLogin}
            onRegister={handleRegister}
            isLoading={isLoading}
          />
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-500 mb-1">Demo Accounts</h3>
            <div className="text-xs space-y-1 text-yellow-700 dark:text-yellow-400">
              <p><strong>Admin:</strong> admin@example.com / admin123</p>
              <p><strong>Player:</strong> player@example.com / player123</p>
            </div>
          </div>
        </div>
      ) : (
        // Profile UI when logged in
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-400">My Profile</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User info card */}
            <Card className="lg:col-span-1 max-w-md mx-auto lg:mx-0 w-full">
              <CardHeader className="flex flex-col items-center text-center">
                {isEditingProfile ? (
                  <div className="w-full mb-4">
                    <ProfileEditor
                      currentUserDetails={userProfile}
                      onSave={handleSaveProfile}
                      onCancel={() => setIsEditingProfile(false)}
                    />
                  </div>
                ) : (
                  <>
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={userProfile?.avatarUrl || `https://ui-avatars.com/api/?name=${userProfile?.firstName}+${userProfile?.lastName}&background=random`} alt={displayName} />
                      <AvatarFallback className="text-lg">{avatarFallback}</AvatarFallback>
                    </Avatar>
                    
                    <CardTitle className="text-2xl text-teal-700 dark:text-teal-400">
                      {displayName}
                    </CardTitle>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {userProfile?.email || ''}
                    </div>
                    
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userProfile?.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}>
                        {userProfile?.role === "admin" ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            Player
                          </>
                        )}
                      </span>
                    </div>
                    
                    {userProfile?.role === "player" && (
                      <div className="grid grid-cols-2 gap-4 w-full mt-4 text-sm">
                        {userProfile.age && (
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400">Age</span>
                            <p className="font-medium">{userProfile.age}</p>
                          </div>
                        )}
                        {userProfile.city && (
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400">City</span>
                            <p className="font-medium">{userProfile.city}</p>
                          </div>
                        )}
                        {userProfile.favoritePosition && (
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400">Position</span>
                            <p className="font-medium capitalize">{userProfile.favoritePosition}</p>
                          </div>
                        )}
                        {userProfile.phoneNumber && (
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400">Phone</span>
                            <p className="font-medium">{userProfile.phoneNumber}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Edit profile button */}
                    <div className="w-full mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditingProfile(true)}
                        className="w-full mt-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </>
                )}
              </CardHeader>
              
              {userProfile?.role === "player" && !isEditingProfile && (
                <CardContent>
                  <Tabs 
                    defaultValue="overview" 
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Account Summary</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Member Since</span>
                            <span className="font-medium">May 2025</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Games Played</span>
                            <span className="font-medium">{userStats.matches}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Win Rate</span>
                            <span className="font-medium">
                              {userStats.matches > 0 
                                ? `${Math.round((userStats.wins / userStats.matches) * 100)}%` 
                                : '0%'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Goals</span>
                            <span className="font-medium">{userStats.goals}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">MVP Awards</span>
                            <span className="font-medium">{userStats.mvps}</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* Player badges section */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Badges</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {userStats.goals >= 5 && (
                            <div className="flex flex-col items-center p-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                              <span className="text-lg">⚽</span>
                              <span className="text-xs mt-1">Scorer</span>
                            </div>
                          )}
                          {userStats.assists >= 3 && (
                            <div className="flex flex-col items-center p-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                              <span className="text-lg">🅰️</span>
                              <span className="text-xs mt-1">Playmaker</span>
                            </div>
                          )}
                          {userStats.mvps >= 2 && (
                            <div className="flex flex-col items-center p-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                              <span className="text-lg">🏆</span>
                              <span className="text-xs mt-1">MVP</span>
                            </div>
                          )}
                          {userStats.cleansheets >= 2 && (
                            <div className="flex flex-col items-center p-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                              <span className="text-lg">🧤</span>
                              <span className="text-xs mt-1">Keeper</span>
                            </div>
                          )}
                          {userStats.tackles >= 10 && (
                            <div className="flex flex-col items-center p-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                              <span className="text-lg">🛡️</span>
                              <span className="text-xs mt-1">Defender</span>
                            </div>
                          )}
                          {userStats.matches >= 10 && (
                            <div className="flex flex-col items-center p-2 bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300 rounded-full">
                              <span className="text-lg">🏃</span>
                              <span className="text-xs mt-1">Regular</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="settings" className="space-y-4 mt-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Account Settings</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Manage your account preferences and settings.
                        </p>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Email Notifications</span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">
                              Coming Soon
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Change Password</span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">
                              Coming Soon
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Dark Mode</span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">
                              Coming Soon
                            </span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
            
            {/* Main content area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Player Overview Cards for quick navigation */}
              {userProfile && userProfile.role === "player" && (
                <PlayerGameCards 
                  reservations={reservations}
                  userId={userProfile.id}
                />
              )}
              
              {/* User Stats - only show for players */}
              {userProfile && userProfile.role === "player" && <PlayerStats stats={userStats} />}

              {/* My Reservations */}
              {userProfile && <PlayerReservations userId={userProfile.id} />}
              
              {/* Logout Button */}
              <div className="flex justify-end mt-8">
                <Button
                  onClick={() => {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('currentUser');
                    setIsLoggedIn(false);
                    setUserProfile(null);
                    toast({
                      title: "Logged Out",
                      description: "You have been successfully logged out."
                    });
                    navigate('/');
                  }}
                  variant="outline"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
