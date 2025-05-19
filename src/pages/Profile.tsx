
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserStats, useReservation } from "@/context/ReservationContext";
import { useToast } from "@/components/ui/use-toast";
import PlayerStats from "@/components/profile/PlayerStats";
import PlayerReservations from "@/components/profile/PlayerReservations";
import AuthForm from "@/components/auth/AuthForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, User, Shield, Edit, Save, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

/**
 * Profile page showing user information, statistics, reservations, and authentication.
 * Includes authentication flow and access restrictions.
 */
const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getUserStats } = useReservation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showLogoutButton, setShowLogoutButton] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    name: string;
    email: string;
    role: "player" | "admin";
    avatarUrl?: string;
  } | null>(null);
  const [editableProfile, setEditableProfile] = useState({
    name: "",
    email: "",
  });

  // Check if the user is logged in on page load
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserProfile(userData);
        setEditableProfile({
          name: userData.name,
          email: userData.email,
        });
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
    
    // Simulate API call
    setTimeout(() => {
      // Demo accounts (in real app, this would be authenticated against backend)
      if (data.email === "admin@example.com" && data.password === "admin123") {
        const userData = {
          id: "admin1",
          name: "Admin User",
          email: data.email,
          role: "admin" as const,
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        };
        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("userRole", userData.role);
        setUserProfile(userData);
        setEditableProfile({
          name: userData.name,
          email: userData.email,
        });
        setIsLoggedIn(true);
        toast({
          title: "Welcome Admin!",
          description: "You have successfully logged in as an admin.",
        });
      } else if (data.email === "player@example.com" && data.password === "player123") {
        const userData = {
          id: "user1",
          name: "John Player",
          email: data.email,
          role: "player" as const,
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=player",
        };
        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("userRole", userData.role);
        setUserProfile(userData);
        setEditableProfile({
          name: userData.name,
          email: userData.email,
        });
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
      // Create new user account (in real app, this would be stored in database)
      const userData = {
        id: `user${Date.now()}`,
        name: data.name,
        email: data.email,
        role: "player" as const,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.replace(/\s+/g, '')}`,
      };
      
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("userRole", userData.role);
      setUserProfile(userData);
      setEditableProfile({
        name: userData.name,
        email: userData.email,
      });
      setIsLoggedIn(true);
      
      toast({
        title: "Account Created",
        description: "Your account has been successfully created.",
      });
      
      setIsLoading(false);
    }, 1500);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    setUserProfile(null);
    setIsLoggedIn(false);
    setShowLogoutButton(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditingProfile) {
      // Save changes
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          name: editableProfile.name,
          email: editableProfile.email
        };
        setUserProfile(updatedProfile);
        localStorage.setItem("currentUser", JSON.stringify(updatedProfile));
        toast({
          title: "Profile Updated",
          description: "Your profile information has been updated successfully."
        });
      }
    } else {
      // Enter edit mode
      if (userProfile) {
        setEditableProfile({
          name: userProfile.name,
          email: userProfile.email
        });
      }
    }
    setIsEditingProfile(!isEditingProfile);
  };

  // Handle input changes for profile editing
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get user stats if logged in
  const userStats: UserStats = userProfile 
    ? getUserStats(userProfile.id)
    : { matches: 0, wins: 0, goals: 0, assists: 0, cleansheets: 0, tackles: 0, yellowCards: 0, redCards: 0, mvps: 0 };

  // Handle navigation
  const handleNavigate = (path: string) => {
    navigate(path);
  };

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
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-800/40 dark:text-red-400 text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2 inline" />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User info card */}
            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-col items-center text-center relative">
                {/* Avatar with logout popup for admin */}
                <div className="relative">
                  <Avatar 
                    className="h-24 w-24 mb-4 cursor-pointer" 
                    onClick={() => setShowLogoutButton(!showLogoutButton)}
                  >
                    <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.name || 'User'} />
                    <AvatarFallback className="text-2xl">
                      {userProfile?.name ? userProfile.name.slice(0, 2).toUpperCase() : 'US'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Logout popup */}
                  {showLogoutButton && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 shadow-md rounded-md p-2 z-50 border border-gray-200 dark:border-gray-700">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleLogout}
                        className="flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
                
                {isEditingProfile ? (
                  <div className="w-full space-y-3">
                    <Input 
                      name="name"
                      value={editableProfile.name}
                      onChange={handleProfileChange}
                      className="text-center"
                      placeholder="Your Name"
                    />
                    <Input 
                      name="email"
                      value={editableProfile.email}
                      onChange={handleProfileChange}
                      className="text-center"
                      placeholder="Your Email"
                    />
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-2xl text-teal-700 dark:text-teal-400">
                      {userProfile?.name || 'User'}
                    </CardTitle>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {userProfile?.email || ''}
                    </div>
                  </>
                )}
                
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
                
                {/* Edit profile button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleEditMode}
                  className="mt-3 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                >
                  {isEditingProfile ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </CardHeader>
              
              {userProfile?.role === "player" && (
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
                          {/* Placeholder for account settings */}
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
              
              {userProfile?.role === "admin" && (
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium mb-2">Admin Controls</h3>
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="outline" 
                        className="justify-start text-left"
                        onClick={() => handleNavigate('/admin/add-pitch')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Pitch
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start text-left"
                        onClick={() => handleNavigate('/reservations')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Manage Reservations
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
            
            {/* Main content area */}
            <div className="lg:col-span-2 space-y-6">
              {/* User Stats - only show for players */}
              {userProfile && userProfile.role === "player" && <PlayerStats stats={userStats} />}

              {/* My Reservations */}
              {userProfile && <PlayerReservations userId={userProfile.id} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
