
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MapPin, 
  Users, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  X,
  Wifi,
  Car,
  Coffee,
  Shield,
  Shirt,
  Droplets,
  Camera,
  TreePine,
  Zap,
  Wind,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation } from "@/context/ReservationContext";
import { useNavigate } from "react-router-dom";

const facilityOptions = [
  { value: "wifi", label: "WiFi", icon: Wifi, color: "text-blue-600" },
  { value: "parking", label: "Parking", icon: Car, color: "text-gray-600" },
  { value: "cafe", label: "Café/Restaurant", icon: Coffee, color: "text-orange-600" },
  { value: "security", label: "Security", icon: Shield, color: "text-red-600" },
  { value: "changing_rooms", label: "Changing Rooms", icon: Shirt, color: "text-purple-600" },
  { value: "showers", label: "Showers", icon: Droplets, color: "text-cyan-600" },
  { value: "cctv", label: "CCTV", icon: Camera, color: "text-indigo-600" },
  { value: "outdoor_area", label: "Outdoor Area", icon: TreePine, color: "text-green-600" },
  { value: "floodlights", label: "Floodlights", icon: Zap, color: "text-yellow-600" },
  { value: "air_conditioning", label: "Air Conditioning", icon: Wind, color: "text-sky-600" },
];

const AddPitchForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    city: "",
    playersPerSide: "5", // Default minimum 5
    type: "",
    description: "",
    image: "",
    additionalImages: [] as string[],
    facilities: [] as string[],
    openingHours: "",
  });
  
  const [newImageUrl, setNewImageUrl] = useState("");
  const { toast } = useToast();
  const { addPitch } = useReservation();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const addAdditionalImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        additionalImages: [...prev.additionalImages, newImageUrl.trim()]
      }));
      setNewImageUrl("");
    }
  };

  const removeAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.location || !formData.city || !formData.type || !formData.image) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Ensure minimum 5 players per side
    const playersPerSide = Math.max(parseInt(formData.playersPerSide), 5);

    const pitchData = {
      ...formData,
      playersPerSide,
      id: Date.now(), // Simple ID generation for demo
    };

    try {
      addPitch(pitchData);
      toast({
        title: "Success!",
        description: "Pitch has been added successfully.",
      });
      navigate("/pitches");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add pitch. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Add New Pitch</h1>
        <p className="text-gray-600 dark:text-gray-400">Create a new football pitch for players to book</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pitch Name*</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Central Park Football Pitch"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">City*</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="e.g., New York"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Address*</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g., 123 Main Street, Central Park, New York, NY 10001"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Players Per Side* (Minimum 5)</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select value={formData.playersPerSide} onValueChange={(value) => handleInputChange("playersPerSide", value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select players per side" />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 6, 7, 8, 9, 10, 11].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} vs {num} ({num * 2} players total)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pitch Type*</label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pitch type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Opening Hours</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.openingHours}
                  onChange={(e) => handleInputChange("openingHours", e.target.value)}
                  placeholder="e.g., Mon-Sun: 6:00 AM - 11:00 PM"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the pitch features, quality, and any special amenities..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Main Image URL*</label>
              <Input
                value={formData.image}
                onChange={(e) => handleInputChange("image", e.target.value)}
                placeholder="https://example.com/pitch-image.jpg"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Additional Images</label>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Additional image URL"
                  className="flex-1"
                />
                <Button type="button" onClick={addAdditionalImage} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.additionalImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.additionalImages.map((url, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      Image {index + 1}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAdditionalImage(index)}
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Facilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Facilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facilityOptions.map((facility) => {
                const Icon = facility.icon;
                return (
                  <div key={facility.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Checkbox
                      id={facility.value}
                      checked={formData.facilities.includes(facility.value)}
                      onCheckedChange={() => handleFacilityToggle(facility.value)}
                    />
                    <Icon className={`h-5 w-5 ${facility.color}`} />
                    <label htmlFor={facility.value} className="text-sm font-medium cursor-pointer">
                      {facility.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate("/pitches")}>
            Cancel
          </Button>
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
            Add Pitch
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPitchForm;
