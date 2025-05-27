import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  Edit,
  Trophy,
  User,
  Loader,
  AlertTriangle,
  Trash2,
  Loader2,
  Target,
  TrendingUp,
  Medal,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Users,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ProfileEditor from "@/components/profile/ProfileEditor";
import {
  getMyProfile,
  updateMyProfile,
  transformUserToFrontend,
  deleteMyAccount,
  type User as BackendUser,
} from "@/lib/userApi";
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
 * Modern Player Profile Page Component
 * Unified design displaying user information, statistics, and achievements
 */
const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
        navigate("/");
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
          throw new Error("Invalid response format");
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
  const handleProfileUpdate = async (
    updatedData: any,
    profilePictureFile?: File
  ) => {
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
        bio: updatedData.bio,
      };

      const response = await updateMyProfile(
        backendUpdates,
        profilePictureFile
      );

      if (response.status === "success" && response.data?.user) {
        const updatedBackendUser = response.data.user;
        setBackendUser(updatedBackendUser);

        // Transform and update frontend state
        const updatedFrontendUser = transformUserToFrontend(updatedBackendUser);
        setCurrentUser(updatedFrontendUser);

        // Update localStorage
        localStorage.setItem(
          "currentUser",
          JSON.stringify(updatedFrontendUser)
        );

        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description:
          error instanceof Error
            ? error.message
            : "There was a problem updating your profile",
        variant: "destructive",
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
      navigate("/");
    } catch (error) {
      toast({
        title: "Failed to Delete Account",
        description:
          error instanceof Error ? error.message : "Failed to delete account",
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
    winPercentage: 0,
  };

  // Check if user is suspended
  const isSuspended =
    backendUser?.suspendedUntil &&
    new Date(backendUser.suspendedUntil) > new Date();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Profile Found</h2>
          <p className="text-gray-600 mb-6">
            Please log in to view your profile
          </p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your information and preferences</p>
        </div>
        <ProfileEditor
          currentUserDetails={currentUser}
          onSave={handleProfileUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-8 mb-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Circular Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={`${currentUser.firstName} ${currentUser.lastName}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 via-blue-500 to-teal-400 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {currentUser.firstName?.[0]}
                        {currentUser.lastName?.[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-3 border-4 border-white">
                  <Trophy className="h-6 w-6 text-yellow-800" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">
                  {currentUser.firstName} {currentUser.lastName}
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  {currentUser.position || "Football Player"}
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {currentUser.city || "Unknown"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {currentUser.age ? `${currentUser.age} years old` : "Age not set"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {userStats.matchesPlayed || 0} matches played
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm"
                size="lg"
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Suspension Warning */}
          {isSuspended && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-300/30 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 text-red-100">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Account Suspended</span>
              </div>
              <p className="text-sm text-red-200 mt-1">
                Your account is suspended until{" "}
                {new Date(backendUser!.suspendedUntil!).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Performance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Stats */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  Performance Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-green-700 mb-1">
                      {userStats.goals || 0}
                    </div>
                    <div className="text-sm text-green-600 font-medium">Goals</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-blue-700 mb-1">
                      {userStats.assists || 0}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">Assists</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Medal className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-purple-700 mb-1">
                      {userStats.mvp || 0}
                    </div>
                    <div className="text-sm text-purple-600 font-medium">MVP</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200 hover:shadow-lg transition-all duration-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-yellow-700 mb-1">
                      {userStats.winPercentage || 0}%
                    </div>
                    <div className="text-sm text-yellow-600 font-medium">Win Rate</div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-gray-700 mb-1">
                      {userStats.wins || 0}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Wins</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-gray-700 mb-1">
                      {userStats.cleanSheets || 0}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Clean Sheets</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-gray-700 mb-1">
                      {userStats.interceptions || 0}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Interceptions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges & Achievements */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  Achievements & Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {backendUser?.badges && backendUser.badges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {backendUser.badges.map((badge) => (
                      <div
                        key={badge._id}
                        className="group p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:border-amber-300 hover:scale-105 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                            <Award className="h-6 w-6 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {badge.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {badge.description}
                            </p>
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Level {badge.level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                        <Award className="h-10 w-10 text-amber-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Badges Yet
                    </h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      Earn badges by achieving great performances in matches!
                      Your first badge is waiting.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{currentUser.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">
                      {currentUser.phoneNumber || "Not provided"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">
                      {currentUser.city || "Not specified"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio Section */}
            {currentUser.bio && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{currentUser.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 space-y-3">
                <Button
                  onClick={handleViewBookings}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  My Bookings
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      size="lg"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-5 w-5 mr-2" />
                          Delete Account
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-600">
                        Delete Account
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete your account? This
                        action cannot be undone.
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
