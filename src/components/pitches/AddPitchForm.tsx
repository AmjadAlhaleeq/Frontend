
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Users, FileText, Clock, DollarSign, Camera, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation } from "@/context/ReservationContext";
import { useNavigate } from "react-router-dom";
import ImageUpload from "@/components/ui/image-upload";

const facilityOptions = [
  { value: "wifi", label: "WiFi" },
  { value: "parking", label: "Parking" },
  { value: "cafe", label: "Café/Restaurant" },
  { value: "changing_rooms", label: "Changing Rooms" },
  { value: "showers", label: "Showers" },
];

interface FormData {
  name: string;
  location: string;
  city: string;
  playersPerSide: string;
  type: string;
  description: string;
  mainImage: File | null;
  additionalImages: File[];
  facilities: string[];
  openingHours: string;
  price: string;
}

const AddPitchForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    city: "",
    playersPerSide: "5",
    type: "",
    description: "",
    mainImage: null,
    additionalImages: [],
    facilities: [],
    openingHours: "",
    price: "",
  });
  
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const { addPitch } = useReservation();
  const navigate = useNavigate();

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFacilityToggle = useCallback((facility: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      facilities: checked
        ? [...prev.facilities, facility]
        : prev.facilities.filter(f => f !== facility)
    }));
  }, []);

  const handleMainImageSelect = useCallback((file: File) => {
    setFormData(prev => ({ ...prev, mainImage: file }));
    const reader = new FileReader();
    reader.onload = (e) => setMainImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleMainImageRemove = useCallback(() => {
    setFormData(prev => ({ ...prev, mainImage: null }));
    setMainImagePreview("");
  }, []);

  const handleAdditionalImageSelect = useCallback((file: File) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: [...prev.additionalImages, file]
    }));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setAdditionalPreviews(prev => [...prev, e.target?.result as string]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAdditionalImageRemove = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handlePlayersPerSideChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, playersPerSide: value }));
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.location || !formData.city || !formData.type || !formData.mainImage || !formData.price) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields including the main image and price.",
        variant: "destructive",
      });
      return;
    }

    const playersPerSide = Math.max(parseInt(formData.playersPerSide), 5);
    const price = parseFloat(formData.price);

    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price greater than 0.",
        variant: "destructive",
      });
      return;
    }

    // Convert files to URLs for demo (in real app, upload to server first)
    const mainImageUrl = mainImagePreview;
    const additionalImageUrls = additionalPreviews;

    const pitchData = {
      name: formData.name,
      location: formData.location,
      city: formData.city,
      type: formData.type as 'indoor' | 'outdoor',
      description: formData.description,
      image: mainImageUrl,
      additionalImages: additionalImageUrls,
      facilities: formData.facilities,
      openingHours: formData.openingHours,
      playersPerSide,
      price,
      id: Date.now(),
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
  }, [formData, mainImagePreview, additionalPreviews, toast, addPitch, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Pitch</h1>
          <p className="text-gray-600">Create a new pitch listing for players to discover and book</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Pitch Name*</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Champions League Arena"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">City*</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="e.g., New York"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Full Address*</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="123 Stadium Road, Sports District"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Players Per Side*</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Select value={formData.playersPerSide} onValueChange={handlePlayersPerSideChange}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 6, 7, 8, 9, 10, 11].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} vs {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Pitch Type*</label>
                  <Select value={formData.type} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">🏢 Indoor</SelectItem>
                      <SelectItem value="outdoor">🌞 Outdoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Price per hour*</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="50.00"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Opening Hours</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={formData.openingHours}
                    onChange={(e) => handleInputChange("openingHours", e.target.value)}
                    placeholder="Mon-Sun: 6:00 AM - 11:00 PM"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your pitch..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Main Image*</label>
                <ImageUpload
                  onImageSelect={handleMainImageSelect}
                  onImageRemove={handleMainImageRemove}
                  preview={mainImagePreview}
                  placeholder="Upload main pitch image"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Additional Images</label>
                <div className="space-y-4">
                  <ImageUpload
                    onImageSelect={handleAdditionalImageSelect}
                    placeholder="Add more images to showcase your pitch"
                  />
                  
                  {additionalPreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {additionalPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={preview} 
                            alt={`Additional ${index + 1}`} 
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAdditionalImageRemove(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Facilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {facilityOptions.map((facility) => (
                  <div 
                    key={facility.value} 
                    className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50"
                  >
                    <Checkbox
                      id={facility.value}
                      checked={formData.facilities.includes(facility.value)}
                      onCheckedChange={(checked) => handleFacilityToggle(facility.value, checked as boolean)}
                    />
                    <label htmlFor={facility.value} className="text-sm font-medium cursor-pointer flex-1">
                      {facility.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-center space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/pitches")}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create Pitch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPitchForm;
