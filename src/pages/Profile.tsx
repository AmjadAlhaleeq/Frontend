import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Edit, Trophy, User, Loader, AlertTriangle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import PlayerStats from "@/components/profile/PlayerStats";
import ProfileEditor from "@/components/profile/ProfileEditor";
import { getMyProfile, updateMyProfile, transformUserToFrontend, deleteMyAccount, type User as BackendUser } from "@/lib/userApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const authToken = localStorage.getItem("authToken");
      
      if (!authToken) {
        toast({
          title: "Not logged in",
          description: "Please login to view your profile",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        const response = await getMyProfile();
        
        if (response.status === "success" && response.data?.user) {
          const user = response.data.user;
          setBackendUser(user);
          
          // Transform for frontend components
          const frontendUser = transformUserToFrontend(user);
          setCurrentUser(frontendUser);
          
          // Update localStorage with fresh data
          localStorage.setItem("currentUser", JSON.stringify(frontendUser));
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Could not load user profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [toast, navigate]);
  
  // Handle profile update from editor
  const handleProfileUpdate = async (updatedData: any, profilePictureFile?: File) => {
    try {
      setIsLoading(true);
      
      // Prepare updates for backend
      const backendUpdates = {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        email: updatedData.email,
        phone: updatedData.phoneNumber,
        city: updatedData.city,
        age: Number(updatedData.age),
        preferredPosition: updatedData.position,
        bio: updatedData.bio
      };

      const response = await updateMyProfile(backendUpdates, profilePictureFile);
      
      if (response.status === "success" && response.data?.user) {
        const updatedBackendUser = response.data.user;
        setBackendUser(updatedBackendUser);
        
        // Transform and update frontend state
        const updatedFrontendUser = transformUserToFrontend(updatedBackendUser);
        setCurrentUser(updatedFrontendUser);
        
        // Update localStorage
        localStorage.setItem("currentUser", JSON.stringify(updatedFrontendUser));
        
        setIsEditing(false);
        toast({ 
          title: "Profile updated", 
          description: "Your profile has been updated successfully" 
        });
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ 
        title: "Update failed", 
        description: error instanceof Error ? error.message : "There was a problem updating your profile", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to My Bookings page
  const handleViewBookings = () => {
    navigate("/my-bookings");
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteMyAccount();
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Failed to Delete Account",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const userStats = currentUser?.stats || {
    gamesPlayed: 0,
    goalsScored: 0,
    assists: 0,
    cleansheets: 0,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    goals: 0,
    matchesPlayed: 0,
    winPercentage: 0
  };
  
  // Check if user is suspended
  const isSuspended = backendUser?.suspendedUntil && new Date(backendUser.suspendedUntil) > new Date();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-teal-500 mr-3" />
        <span className="text-lg text-muted-foreground">Loading profile...</span>
      </div>
    );
  }
  
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
      
      {/* Suspension Warning */}
      {isSuspended && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Account Suspended</span>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Your account is suspended until {new Date(backendUser!.suspendedUntil!).toLocaleDateString()}
          </p>
        </div>
      )}
      
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
                      Player
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
                      <span className="text-muted-foreground">Position:</span>
                      <span className="font-medium">{currentUser.position || "Not specified"}</span>
                    </div>
                    {currentUser.bio && (
                      <div className="pt-2">
                        <span className="text-muted-foreground text-xs">Bio:</span>
                        <p className="text-sm mt-1">{currentUser.bio}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <Button 
                      onClick={handleViewBookings} 
                      variant="outline" 
                      className="w-full"
                    >
                      My Bookings
                    </Button>
                    
                    {/* Delete Account Button - Only for players */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Account
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-600">Delete Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete your account? This action cannot be undone. 
                            All your data, including game history and statistics, will be permanently removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
        
        {/* Right Column: Badges Only */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-1 mb-6">
              <TabsTrigger value="info">
                <Award className="h-4 w-4 mr-2" />
                <span>Badges</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <h3 className="text-xl font-semibold mb-4">Player Badges</h3>
              
              {backendUser?.badges && backendUser.badges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {backendUser.badges.map((badge) => (
                    <Card key={badge._id} className="border border-blue-300 bg-blue-50 dark:bg-blue-950/20">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="mx-auto rounded-full p-3 w-14 h-14 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 mb-3">
                            <Award className="h-6 w-6 text-blue-500" />
                          </div>
                          <h4 className="font-semibold">{badge.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                          <div className="mt-3">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              Level {badge.level}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-muted/40 rounded-lg">
                  <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Badges Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Earn badges by achieving great performances in matches!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
