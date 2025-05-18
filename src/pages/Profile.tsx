
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useReservation, Reservation } from "@/context/ReservationContext"; // Import Reservation
import { Edit3, Save, ShieldCheck, UserCog, LogOut, CalendarDays, Trophy } from "lucide-react";
import { format } from 'date-fns';

const Profile = () => {
  const { toast } = useToast();
  const { reservations, getUserReservations } = useReservation(); // Added getUserReservations
  const [isEditing, setIsEditing] = useState(false);
  
  // Placeholder for user data - in a real app, this would come from auth context or API
  const [currentUser, setCurrentUser] = useState({
    id: "user1", // Make sure this ID matches what's used in context (e.g., for isUserJoined)
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop",
    bio: "Football enthusiast, midfield maestro. Love a good 7-a-side game.",
    preferredPosition: "Midfielder",
    skillLevel: "Intermediate",
  });

  const [formData, setFormData] = useState(currentUser);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    // Fetch reservations specific to the current user
    // Assuming currentUserId is "user1" for this example as used in ReservationContext
    setUserReservations(getUserReservations(currentUser.id));
  }, [currentUser.id, reservations, getUserReservations]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setCurrentUser(formData); // Update the main user state
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
    // Here, you would typically also send this data to a backend API
  };

  const totalGamesPlayed = userReservations.filter(r => r.status === 'completed' || new Date(r.date) < new Date()).length;
  // This is a simplified calculation. Real stats would be more complex.
  const totalGoals = userReservations.reduce((acc, res) => {
    return acc + res.highlights.filter(h => h.type === 'goal' && h.playerName === currentUser.name).length; // Or match by playerId
  }, 0);


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-500 p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white shadow-lg">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback className="text-3xl bg-gray-300 text-gray-700">{currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-3xl sm:text-4xl font-bold">{currentUser.name}</CardTitle>
              <CardDescription className="text-cyan-100 text-lg mt-1">{currentUser.email}</CardDescription>
            </div>
            <Button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
              variant="outline" 
              className="mt-4 sm:mt-0 sm:ml-auto bg-white/20 hover:bg-white/30 text-white border-white"
            >
              {isEditing ? <Save className="mr-2 h-5 w-5" /> : <Edit3 className="mr-2 h-5 w-5" />}
              {isEditing ? "Save Profile" : "Edit Profile"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md">Overview</TabsTrigger>
              <TabsTrigger value="edit-profile" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md">Account Settings</TabsTrigger>
              <TabsTrigger value="my-reservations" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md">My Games</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-teal-700">About Me</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-600">{currentUser.bio || "No bio yet."}</p>
                    <div>
                      <Label className="text-xs font-semibold text-gray-500">Preferred Position</Label>
                      <p className="text-gray-800">{currentUser.preferredPosition || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-500">Skill Level</Label>
                      <p className="text-gray-800">{currentUser.skillLevel || "Not set"}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-teal-700">Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <CalendarDays className="h-5 w-5 mr-3 text-teal-500"/> Games Played
                      </div>
                      <span className="font-semibold text-lg text-teal-600">{totalGamesPlayed}</span>
                    </div>
                     <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <Trophy className="h-5 w-5 mr-3 text-amber-500"/> Goals Scored
                      </div>
                      <span className="font-semibold text-lg text-amber-600">{totalGoals}</span>
                    </div>
                    {/* Add more stats like Assists, MVPs etc. */}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="edit-profile">
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="font-medium">Full Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} className="mt-1"/>
                  </div>
                  <div>
                    <Label htmlFor="email" className="font-medium">Email Address</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} className="mt-1"/>
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio" className="font-medium">Bio / About Me</Label>
                  <textarea 
                    id="bio" 
                    name="bio" 
                    rows={3}
                    value={formData.bio} 
                    onChange={handleInputChange} 
                    disabled={!isEditing} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2" 
                    placeholder="Tell us a bit about yourself as a player..."
                  />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="preferredPosition" className="font-medium">Preferred Position</Label>
                    <Input id="preferredPosition" name="preferredPosition" value={formData.preferredPosition} onChange={handleInputChange} disabled={!isEditing} className="mt-1"/>
                  </div>
                  <div>
                    <Label htmlFor="skillLevel" className="font-medium">Skill Level</Label>
                    <Input id="skillLevel" name="skillLevel" value={formData.skillLevel} onChange={handleInputChange} disabled={!isEditing} className="mt-1"/>
                  </div>
                </div>
                {isEditing && (
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
                      <Save className="mr-2 h-5 w-5"/> Save Changes
                    </Button>
                  </div>
                )}
              </form>
              <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center"><UserCog className="mr-2 h-5 w-5 text-red-500"/> Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50">
                        <LogOut className="mr-2 h-4 w-4"/> Log Out
                    </Button>
                     <Button variant="outline" className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50">
                        <ShieldCheck className="mr-2 h-4 w-4"/> Change Password
                    </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-reservations">
              {userReservations.length > 0 ? (
                <div className="space-y-4">
                  {userReservations.map(res => (
                    <Card key={res.id} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                      <div>
                        <p className="font-semibold text-teal-700">{res.pitchName} - Game #{res.id}</p>
                        <p className="text-sm text-gray-600">{format(new Date(res.date), "PPP")} at {res.time}</p>
                        <p className="text-xs text-gray-500">Status: <span className={`font-medium ${res.status === 'completed' ? 'text-green-600' : res.status === 'cancelled' ? 'text-red-600' : 'text-blue-600'}`}>{res.status}</span></p>
                      </div>
                      <Button variant="outline" size="sm" className="text-teal-600 border-teal-600/50 hover:bg-teal-50">View Details</Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">You have no reservations yet. Join some games!</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

