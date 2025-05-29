
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MapPin,
  Calendar,
  Trophy,
  Users,
  Award,
  Phone,
  Mail,
  AlertTriangle,
  Loader,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { usePlayerProfile, BackendUserProfile } from "@/hooks/usePlayerProfile";
import BadgeDisplay from "@/components/profile/BadgeDisplay";
import PlayerStats from "@/components/profile/PlayerStats";

const PlayerProfileById: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { profile, loading, error, fetchProfile } = usePlayerProfile();
  const [userRole, setUserRole] = useState<'admin' | 'player' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  console.log("PlayerProfileById rendered with playerId:", playerId);
  console.log("Profile data received:", profile);

  // Get user role and ID from localStorage
  useEffect(() => {
    const role = localStorage.getItem('userRole') as 'admin' | 'player' | null;
    setUserRole(role);
    
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setCurrentUserId(userData.id);
    }
  }, []);

  // Fetch profile when component mounts - ONLY ONCE
  useEffect(() => {
    if (playerId && !hasAttemptedFetch) {
      console.log("Attempting to fetch profile for player ID:", playerId);
      setHasAttemptedFetch(true);
      fetchProfile(playerId);
    }
  }, [playerId, hasAttemptedFetch, fetchProfile]);

  const isAdmin = userRole === 'admin';
  const isOwnProfile = currentUserId === playerId;

  // Determine if contact info should be shown
  const shouldShowContactInfo = isAdmin || isOwnProfile;
  
  // Determine if location should be shown (only for admin, own profile, or public info)
  const shouldShowLocation = isAdmin || isOwnProfile;

  // Check if user is suspended
  const isSuspended = profile?.suspendedUntil && new Date(profile.suspendedUntil) > new Date();

  if (loading && !hasAttemptedFetch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading player profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Profile
          </h3>
          <p className="text-gray-600 mb-4">{error || "Player not found"}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            {playerId && (
              <Button 
                onClick={() => {
                  setHasAttemptedFetch(false);
                  fetchProfile(playerId);
                }} 
                variant="outline"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          onClick={() => navigate(-1)} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Profile Picture - Only show database profile picture */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 overflow-hidden">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-2 border-2 border-white">
              <Trophy className="h-4 w-4 text-yellow-800" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold mb-1">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-blue-100 mb-3 text-lg">
              {profile.preferredPosition || "Football Player"}
            </p>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-sm">
              {/* Only show location if allowed */}
              {shouldShowLocation && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {profile.city || "Unknown"}
                </div>
              )}
              {profile.age && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {profile.age} years old
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {profile.stats?.matches || 0} matches
              </div>
            </div>
          </div>

          {/* Role Badge and Access Indicator */}
          <div className="text-right space-y-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {profile.role === 'admin' ? 'Admin' : 'Player'}
            </Badge>
            {!isOwnProfile && (
              <div className="flex items-center gap-1 text-xs text-blue-100">
                {shouldShowContactInfo ? (
                  <>
                    <Eye className="h-3 w-3" />
                    Full Access
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    Public View
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Suspension Warning */}
        {isSuspended && shouldShowContactInfo && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-300/30 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 text-red-100">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Account Suspended</span>
            </div>
            <p className="text-sm text-red-200 mt-1">
              Suspended until {new Date(profile.suspendedUntil!).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Stats */}
          {profile.stats && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                Performance Stats
              </h2>
              <PlayerStats 
                stats={profile.stats} 
                isLoading={false}
              />
            </div>
          )}

          {/* Badges */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-600" />
              Achievements
            </h2>
            <BadgeDisplay 
              badges={profile.badges || []} 
              isLoading={false}
            />
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-8">
          {/* Contact/Public Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                {shouldShowContactInfo ? 'Contact Information' : 'Public Information'}
              </h3>
              <Badge 
                variant={shouldShowContactInfo ? "default" : "secondary"}
                className="text-xs"
              >
                {shouldShowContactInfo ? "Full Access" : "Limited View"}
              </Badge>
            </div>
            
            <div className="space-y-4">
              {/* Show location only if allowed */}
              {shouldShowLocation && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">{profile.city || "Not specified"}</div>
                  </div>
                </div>
              )}

              {/* Contact information - Show real data for admins */}
              {shouldShowContactInfo ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm text-blue-600 font-medium">Email</div>
                      <div className="font-medium text-gray-900">
                        {profile.email || "Email not available"}
                      </div>
                    </div>
                    {isAdmin && !isOwnProfile && (
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                        Admin View
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Phone className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <div className="text-sm text-green-600 font-medium">Phone</div>
                      <div className="font-medium text-gray-900">
                        {profile.phone || "Phone not available"}
                      </div>
                    </div>
                    {isAdmin && !isOwnProfile && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                        Admin View
                      </Badge>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                  <EyeOff className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm text-amber-700 font-medium">Private Information</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Contact details are only visible to admins and the profile owner
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Access Level Info */}
          {!isOwnProfile && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-slate-600" />
                Viewing Permissions
              </h3>
              <div className="text-sm text-slate-600 space-y-2">
                <p>
                  <strong>Your Role:</strong> {userRole === 'admin' ? 'Administrator' : 'Player'}
                </p>
                <p>
                  <strong>Access Level:</strong> {shouldShowContactInfo ? 'Full Profile Access' : 'Public Profile Only'}
                </p>
                {!shouldShowContactInfo && (
                  <p className="text-amber-600 italic">
                    Private contact information is hidden for privacy protection.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerProfileById;
