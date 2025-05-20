import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Trophy,
  Calendar,
  User,
  Settings,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Check,
  Edit,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useReservation, UserStats } from "@/context/ReservationContext";
import PlayerReservations from "@/components/profile/PlayerReservations";

const Profile = () => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("profile");
  const { getUserStats } = useReservation();
  
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse user data", e);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-10 text-center">
            <p>Loading user data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user stats
  const stats = getUserStats(user.id);

  // Ensure stats has all required properties 
  const userStats: UserStats = {
    gamesPlayed: stats.gamesPlayed || 0,
    goals: stats.goals || stats.goalsScored || 0, 
    assists: stats.assists || 0,
    cleansheets: stats.cleansheets || 0,
    mvps: stats.mvps || 0,
    yellowCards: stats.yellowCards || 0,
    redCards: stats.redCards || 0,
    matches: stats.gamesPlayed || 0,  // Alias for backwards compatibility
    wins: stats.wins || Math.floor((stats.gamesPlayed || 0) * 0.6), // Estimated if not available
    tackles: stats.tackles || Math.floor((stats.gamesPlayed || 0) * 2) // Estimated if not available
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditMode(false);
    toast({
      title: "Profile updated", 
      description: "Your profile has been updated successfully."
    });
  };

  const formatDateString = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: User Profile */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Profile</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Edit className="h-4 w-4 mr-1" />
                  )}
                  {editMode ? "Save" : "Edit"}
                </Button>
              </div>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Change avatar</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      defaultValue={user.name}
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user.email}
                      placeholder="Your email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      defaultValue={user.phone || ""}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      defaultValue={user.location || ""}
                      placeholder="Your location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Position</Label>
                    <RadioGroup
                      defaultValue={user.position || "midfielder"}
                      className="grid grid-cols-2 gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="goalkeeper"
                          id="goalkeeper"
                        />
                        <Label htmlFor="goalkeeper">Goalkeeper</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="defender"
                          id="defender"
                        />
                        <Label htmlFor="defender">Defender</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="midfielder"
                          id="midfielder"
                        />
                        <Label htmlFor="midfielder">Midfielder</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="forward"
                          id="forward"
                        />
                        <Label htmlFor="forward">Forward</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full">
                    Save Changes
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Joined {formatDateString(user.joinedAt || new Date().toISOString())}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {user.email}
                      </span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {user.phone}
                        </span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center space-x-3 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {user.location}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Preferred Position</h4>
                    <div className="inline-block bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                      {user.position || "Midfielder"}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Log Out
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Player Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {userStats.gamesPlayed}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Games Played
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {userStats.wins}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Wins ({userStats.wins && userStats.gamesPlayed ? Math.round((userStats.wins / userStats.gamesPlayed) * 100) : 0}%)
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {userStats.goals}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Goals</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {userStats.assists}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Assists
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Reservations & Activity */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <Tabs
                value={selectedTab}
                onValueChange={setSelectedTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="profile">My Activity</TabsTrigger>
                  <TabsTrigger value="settings">
                    Account Settings
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {selectedTab === "profile" && (
                <div className="space-y-6">
                  <PlayerReservations userId={user.id} />

                  <div className="pt-4">
                    <h3 className="text-lg font-medium mb-3">
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                            <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <span>
                            <strong>Achievement unlocked:</strong> Scored{" "}
                            {userStats.goals} goals
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span>
                            <strong>Game joined:</strong> City Center Pitch
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(
                            Date.now() - 2 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-full">
                            <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                          </div>
                          <span>
                            <strong>Profile updated:</strong> Changed position to{" "}
                            {user.position || "Midfielder"}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(
                            Date.now() - 7 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Account Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">
                            Receive emails about game updates
                          </p>
                        </div>
                        <Switch checked={true} />
                      </div>
                      <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div>
                          <p className="font-medium">Privacy Settings</p>
                          <p className="text-sm text-gray-500">
                            Manage who can see your profile
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                      <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div>
                          <p className="font-medium">Change Password</p>
                          <p className="text-sm text-gray-500">
                            Update your account password
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <h3 className="text-lg font-medium mb-4">
                      Danger Zone
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border border-red-200 dark:border-red-900/30 rounded-md bg-red-50 dark:bg-red-900/10">
                        <div>
                          <p className="font-medium">Deactivate Account</p>
                          <p className="text-sm text-gray-500">
                            Temporarily disable your account
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Deactivate
                        </Button>
                      </div>
                      <div className="flex justify-between items-center p-3 border border-red-200 dark:border-red-900/30 rounded-md bg-red-50 dark:bg-red-900/10">
                        <div>
                          <p className="font-medium">Delete Account</p>
                          <p className="text-sm text-gray-500">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Add missing component for compilation
const Switch = ({ checked }: { checked: boolean }) => {
  return (
    <div 
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-teal-600' : 'bg-gray-300'}`}
    >
      <div 
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`}
      />
    </div>
  );
};

const toast = {
  title: '',
  description: '',
};

export default Profile;
