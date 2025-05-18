
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Re-add if used, or remove
import { Textarea } from "@/components/ui/textarea"; // For bio
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useReservation, Reservation } from "@/context/ReservationContext";
import { Edit3, Save, ShieldCheck, UserCog, LogOut, CalendarDays, Trophy, UserCircle, Mail, Phone, MapPinIcon, Star } from "lucide-react"; // Added more icons
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'; // For logout redirect

// Define UserProfileData interface (should match one in LoginDialog/Navbar or be imported)
interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: string;
  city: string;
  favoritePosition: string;
  phoneNumber: string;
  email: string;
  avatarUrl?: string;
  bio?: string; // Added bio from previous structure
  // skillLevel was also there, can be added if needed.
}

const Profile = () => {
  const { toast } = useToast();
  const { reservations, getUserReservations } = useReservation();
  const navigate = useNavigate(); // For redirecting after logout

  const [isEditing, setIsEditing] = useState(false);
  // Initialize currentUser state from localStorage or with defaults
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(null);
  // formData will be initialized after currentUser is loaded
  const [formData, setFormData] = useState<UserProfileData | null>(null);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);

  // Effect to load user data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser) as UserProfileData;
      setCurrentUser(userData);
      setFormData(userData); // Initialize form data for editing
    } else {
      // Handle case where user is not found (e.g., redirect to login)
      toast({ title: "Not Logged In", description: "Please log in to view your profile.", variant: "destructive" });
      // Potentially redirect: navigate('/login'); // Or show login dialog
    }
  }, [toast]); // Removed navigate from deps as it's stable

  // Effect to fetch user-specific reservations when currentUser or main reservations list changes
  useEffect(() => {
    if (currentUser?.id) {
      setUserReservations(getUserReservations(currentUser.id));
    }
  }, [currentUser, reservations, getUserReservations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSave = () => {
    if (formData) {
      setCurrentUser(formData); // Update the main user state
      localStorage.setItem('currentUser', JSON.stringify(formData)); // Persist changes to localStorage
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
      // In a real app, send formData to a backend API here
    }
  };

  // Placeholder for logout, actual logout is handled by Navbar, but profile might have its own button
  const handleProfileLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    toast({ title: "Logged Out", description: "You have been logged out." });
    navigate('/'); // Redirect to home page
    // Potentially call a global logout function if available from context
  };


  const totalGamesPlayed = userReservations.filter(r => r.status === 'completed' || new Date(r.date) < new Date()).length;
  const totalGoals = userReservations.reduce((acc, res) => {
    // Ensure highlights and playerName exist
    return acc + (res.highlights?.filter(h => h.type === 'goal' && h.playerName === `${currentUser?.firstName} ${currentUser?.lastName}`).length || 0);
  }, 0);

  // If currentUser is not loaded yet, show a loading state or return null
  if (!currentUser || !formData) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading profile...</div>;
  }
  
  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number | undefined }) => (
    <div className="flex items-start space-x-3 py-2">
      <span className="text-teal-600 dark:text-teal-400 mt-1">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-gray-800 dark:text-gray-100">{value || "Not set"}</p>
      </div>
    </div>
  );


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-xl overflow-hidden bg-white dark:bg-gray-800">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-500 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white shadow-lg">
              <AvatarImage src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.firstName}+${currentUser.lastName}&background=random`} alt={`${currentUser.firstName} ${currentUser.lastName}`} />
              <AvatarFallback className="text-3xl bg-gray-300 text-gray-700">{currentUser.firstName?.charAt(0).toUpperCase()}{currentUser.lastName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-3xl sm:text-4xl font-bold">{currentUser.firstName} {currentUser.lastName}</CardTitle>
              <CardDescription className="text-cyan-100 text-lg mt-1">{currentUser.email}</CardDescription>
            </div>
            <Button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
              variant="outline" 
              className="mt-4 sm:mt-0 sm:ml-auto bg-white/20 hover:bg-white/30 text-white border-white dark:bg-gray-700/30 dark:hover:bg-gray-600/40 dark:border-gray-500"
            >
              {isEditing ? <Save className="mr-2 h-5 w-5" /> : <Edit3 className="mr-2 h-5 w-5" />}
              {isEditing ? "Save Profile" : "Edit Profile"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-900 rounded-lg p-1 mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md text-gray-700 dark:text-gray-300">Overview</TabsTrigger>
              <TabsTrigger value="edit-profile" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md text-gray-700 dark:text-gray-300">Account Settings</TabsTrigger>
              <TabsTrigger value="my-reservations" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md text-gray-700 dark:text-gray-300">My Games</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="dark:bg-gray-850 border dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-teal-700 dark:text-teal-400">About Me</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <p className="text-gray-600 dark:text-gray-300 pb-2">{currentUser.bio || "No bio yet. Tell us about yourself in the edit section!"}</p>
                    <DetailItem icon={<UserCircle size={18}/>} label="Full Name" value={`${currentUser.firstName} ${currentUser.lastName}`} />
                    <DetailItem icon={<Mail size={18}/>} label="Email" value={currentUser.email} />
                    <DetailItem icon={<Phone size={18}/>} label="Phone Number" value={currentUser.phoneNumber} />
                    <DetailItem icon={<MapPinIcon size={18}/>} label="City" value={currentUser.city} />
                    <DetailItem icon={<Star size={18}/>} label="Favorite Position" value={currentUser.favoritePosition} />
                    <DetailItem icon={<Users size={18}/>} label="Gender" value={currentUser.gender} />
                    <DetailItem icon={<CalendarDays size={18}/>} label="Age" value={currentUser.age} />
                  </CardContent>
                </Card>
                <Card className="dark:bg-gray-850 border dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-teal-700 dark:text-teal-400">Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <CalendarDays className="h-5 w-5 mr-3 text-teal-500 dark:text-teal-400"/> Games Played
                      </div>
                      <span className="font-semibold text-lg text-teal-600 dark:text-teal-300">{totalGamesPlayed}</span>
                    </div>
                     <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <Trophy className="h-5 w-5 mr-3 text-amber-500 dark:text-amber-400"/> Goals Scored
                      </div>
                      <span className="font-semibold text-lg text-amber-600 dark:text-amber-300">{totalGoals}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="edit-profile">
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="font-medium dark:text-gray-300">First Name</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={!isEditing} className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="font-medium dark:text-gray-300">Last Name</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={!isEditing} className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="font-medium dark:text-gray-300">Email Address</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                </div>
                <div>
                  <Label htmlFor="bio" className="font-medium dark:text-gray-300">Bio / About Me</Label>
                  <Textarea 
                    id="bio" 
                    name="bio" 
                    rows={3}
                    value={formData.bio || ""} 
                    onChange={handleInputChange} 
                    disabled={!isEditing} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400" 
                    placeholder="Tell us a bit about yourself as a player..."
                  />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div>
                    <Label htmlFor="phoneNumber" className="font-medium dark:text-gray-300">Phone Number</Label>
                    <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} disabled={!isEditing} className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                  </div>
                  <div>
                    <Label htmlFor="city" className="font-medium dark:text-gray-300">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} disabled={!isEditing} className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                  </div>
                  <div>
                    <Label htmlFor="age" className="font-medium dark:text-gray-300">Age</Label>
                    <Input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} disabled={!isEditing} className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                  </div>
                  <div>
                    <Label htmlFor="gender" className="font-medium dark:text-gray-300">Gender</Label>
                    <Input id="gender" name="gender" value={formData.gender} onChange={handleInputChange} disabled={!isEditing} className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                  </div>
                  <div>
                    <Label htmlFor="favoritePosition" className="font-medium dark:text-gray-300">Favorite Position</Label>
                    <Input id="favoritePosition" name="favoritePosition" value={formData.favoritePosition} onChange={handleInputChange} disabled={!isEditing} className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                  </div>
                  {/* Avatar URL input - simple version */}
                  <div>
                    <Label htmlFor="avatarUrl" className="font-medium dark:text-gray-300">Avatar URL</Label>
                    <Input id="avatarUrl" name="avatarUrl" value={formData.avatarUrl || ""} onChange={handleInputChange} disabled={!isEditing} className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://example.com/image.png"/>
                  </div>
                </div>
                {isEditing && (
                  <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                    <Button type="button" onClick={() => setIsEditing(false)} variant="outline" className="mr-2 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">Cancel</Button>
                    <Button type="button" onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                      <Save className="mr-2 h-5 w-5"/> Save Changes
                    </Button>
                  </div>
                )}
              </form>
              <Card className="mt-8 dark:bg-gray-850 border dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center text-gray-700 dark:text-gray-200"><UserCog className="mr-2 h-5 w-5 text-red-500 dark:text-red-400"/> Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" onClick={handleProfileLogout} className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30">
                        <LogOut className="mr-2 h-4 w-4"/> Log Out
                    </Button>
                     <Button variant="outline" className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        <ShieldCheck className="mr-2 h-4 w-4"/> Change Password (Coming Soon)
                    </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-reservations">
              {userReservations.length > 0 ? (
                <div className="space-y-4">
                  {userReservations.map(res => (
                    <Card key={res.id} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow dark:bg-gray-850 border dark:border-gray-700">
                      <div>
                        <p className="font-semibold text-teal-700 dark:text-teal-400">{res.pitchName} - Game #{res.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{format(new Date(res.date), "PPP")} at {res.time}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Status: <span className={`font-medium ${res.status === 'completed' ? 'text-green-600 dark:text-green-400' : res.status === 'cancelled' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>{res.status}</span></p>
                      </div>
                      {/* This button would ideally link to the specific reservation details or game page */}
                      <Button variant="outline" size="sm" className="text-teal-600 border-teal-600/50 hover:bg-teal-50 dark:text-teal-400 dark:border-teal-500/50 dark:hover:bg-teal-900/30">View Details</Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">You have no reservations yet. Join some games!</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
