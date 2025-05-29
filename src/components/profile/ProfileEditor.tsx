
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload } from "lucide-react";

interface ProfileEditorProps {
  currentUserDetails: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    age?: string;
    city?: string;
    position?: string;
    bio?: string;
  };
  onSave: (updatedProfile: any, profilePictureFile?: File) => void;
  onCancel: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ currentUserDetails, onSave, onCancel }) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    firstName: currentUserDetails.firstName || "",
    lastName: currentUserDetails.lastName || "",
    email: currentUserDetails.email || "",
    phoneNumber: currentUserDetails.phoneNumber || "",
    age: currentUserDetails.age || "",
    city: currentUserDetails.city || "",
    position: currentUserDetails.position || "",
    bio: currentUserDetails.bio || ""
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
    
    setSelectedFile(file);
    
    // Create a data URL for preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    onSave(profile, selectedFile || undefined);
  };
  
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

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            {/* Profile Picture Display */}
            <div className="relative mb-4">
              <div className="h-32 w-32 border-4 border-gray-200 shadow-lg rounded-full overflow-hidden">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 via-blue-500 to-teal-400 flex items-center justify-center text-white text-4xl font-bold">
                    {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "U"}
                    {profile.lastName ? profile.lastName.charAt(0).toUpperCase() : ""}
                  </div>
                )}
              </div>
            </div>
            
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
              className="text-sm bg-teal-50 border-teal-200 hover:bg-teal-100"
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
                maxLength={10}
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
                maxLength={15}
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
                placeholder="+962790123456"
                pattern="^\+9627[789]\d{7}$"
                title="Please enter a valid Jordanian phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input 
                id="age"
                name="age"
                type="number"
                value={profile.age}
                onChange={handleChange}
                min="15"
                max="45"
                placeholder="25"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city"
                name="city"
                value={profile.city}
                onChange={handleChange}
                placeholder="Amman"
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="position">Preferred Position</Label>
              <Select 
                value={profile.position} 
                onValueChange={(value) => handleSelectChange("position", value)}
              >
                <SelectTrigger id="position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(position => (
                    <SelectItem key={position} value={position}>{position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={3}
              />
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
