
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload } from "lucide-react";

interface ProfileEditorProps {
  currentUserDetails: {
    id: string;
    firstName: string;
    lastName: string;
    gender?: string;
    age?: string;
    city?: string;
    favoritePosition?: string;
    phoneNumber?: string;
    email: string;
    avatarUrl?: string;
  };
  onSave: (updatedProfile: any) => void;
  onCancel: () => void;
}

/**
 * ProfileEditor component
 * Allows users to edit their profile information
 */
const ProfileEditor: React.FC<ProfileEditorProps> = ({ currentUserDetails, onSave, onCancel }) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    firstName: currentUserDetails.firstName || "",
    lastName: currentUserDetails.lastName || "",
    email: currentUserDetails.email || "",
    gender: currentUserDetails.gender || "",
    age: currentUserDetails.age || "",
    city: currentUserDetails.city || "",
    favoritePosition: currentUserDetails.favoritePosition || "",
    phoneNumber: currentUserDetails.phoneNumber || "",
    avatarUrl: currentUserDetails.avatarUrl || ""
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file input change for photo upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type (only images)
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Create a data URL for preview
    const reader = new FileReader();
    reader.onload = () => {
      setProfile(prev => ({
        ...prev,
        avatarUrl: reader.result as string
      }));
      
      toast({
        title: "Photo Selected",
        description: "Your profile picture will be updated when you save changes",
      });
    };
    reader.readAsDataURL(file);
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
  };
  
  // Available positions for football
  const positions = [
    "Goalkeeper",
    "Defender",
    "Right Back",
    "Left Back",
    "Center Back",
    "Defensive Midfielder",
    "Central Midfielder",
    "Attacking Midfielder",
    "Winger",
    "Forward",
    "Striker"
  ];

  // Real profile photos urls (realistic looking player photos from professional stock)
  const defaultAvatarUrl = `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=faces`;

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-4 border-2 border-gray-200">
              <AvatarImage 
                src={profile.avatarUrl || defaultAvatarUrl} 
                alt={`${profile.firstName} ${profile.lastName}`}
              />
              <AvatarFallback>
                {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "U"}
                {profile.lastName ? profile.lastName.charAt(0).toUpperCase() : ""}
              </AvatarFallback>
            </Avatar>
            
            <input 
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={triggerFileInput}
              className="text-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input 
                id="phoneNumber"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input 
                id="age"
                name="age"
                value={profile.age}
                onChange={handleChange}
                placeholder="25"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={profile.gender} 
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city"
                name="city"
                value={profile.city}
                onChange={handleChange}
                placeholder="New York"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="favoritePosition">Favorite Position</Label>
              <Select 
                value={profile.favoritePosition} 
                onValueChange={(value) => handleSelectChange("favoritePosition", value)}
              >
                <SelectTrigger id="favoritePosition">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(position => (
                    <SelectItem key={position} value={position.toLowerCase()}>{position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;
