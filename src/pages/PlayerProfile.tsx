
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  User, Mail, Phone, MapPin, Calendar, Clock, LogOut,
  Settings, Edit, Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import PlayerStats from "@/components/profile/PlayerStats";
import PlayerBadges from "@/components/profile/PlayerBadges";
import PlayerReservations from "@/components/profile/PlayerReservations";
import { useReservation, UserStats } from "@/context/ReservationContext";

/**
 * PlayerProfile component
 * Unified player profile page that integrates personal information, game history, and stats
 */
const PlayerProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    position: '',
    bio: ''
  });
  
  // Get current user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          position: userData.position || '',
          bio: userData.bio || ''
        });
      } catch (e) {
        console.error("Failed to parse currentUser from localStorage", e);
        setCurrentUser(null);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Mock stats - in a real app these would come from an API
  const stats: UserStats = {
    gamesPlayed: 12,
    goalsScored: 8,
    assists: 5,
    cleansheets: 2,
    mvps: 1,
    yellowCards: 1,
    redCards: 0,
  };
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    navigate('/login');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentUser) {
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    }
  };
  
  if (!currentUser) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Profile info and edit form */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="relative pb-0">
              <div className="absolute right-4 top-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback className="text-2xl bg-teal-500 text-white">
                      {currentUser.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-white border-gray-200"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-xl">{currentUser.name}</CardTitle>
                <CardDescription>{currentUser.position || "Football Player"}</CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                  </div>
                  
                  {currentUser.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-gray-500">{currentUser.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {currentUser.location && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-gray-500">{currentUser.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {currentUser.bio && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">About</p>
                      <p className="text-sm text-gray-600">{currentUser.bio}</p>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone (optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location (optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full pl-10 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Position (optional)</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full py-2 px-3 border rounded-md"
                    >
                      <option value="">Select Position</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Defender">Defender</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Forward">Forward</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio (optional)</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full py-2 px-3 border rounded-md resize-none"
                      rows={3}
                    ></textarea>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-1/2"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="w-1/2"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
          
          <PlayerStats stats={stats} />
        </div>
        
        {/* Right column: Games and Badges */}
        <div className="md:col-span-2 space-y-6">
          <PlayerReservations userId={currentUser.id} />
          
          <PlayerBadges userId={currentUser.id} />
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
