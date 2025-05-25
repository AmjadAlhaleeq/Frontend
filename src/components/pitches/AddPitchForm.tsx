
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
  Upload,
  Wifi,
  Car,
  Coffee,
  Shirt,
  Droplets,
  Clock,
  DollarSign,
  Camera,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation } from "@/context/ReservationContext";
import { useNavigate } from "react-router-dom";

const facilityOptions = [
  { value: "wifi", label: "WiFi", icon: Wifi, color: "text-blue-600" },
  { value: "parking", label: "Parking", icon: Car, color: "text-gray-600" },
  { value: "cafe", label: "Café/Restaurant", icon: Coffee, color: "text-orange-600" },
  { value: "changing_rooms", label: "Changing Rooms", icon: Shirt, color: "text-purple-600" },
  { value: "showers", label: "Showers", icon: Droplets, color: "text-cyan-600" },
];

const AddPitchForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    city: "",
    playersPerSide: "5",
    type: "",
    description: "",
    image: "", // Main image
    additionalImages: [] as string[], // Array of additional images
    facilities: [] as string[],
    openingHours: "",
    price: "",
  });
  
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const { toast } = useToast();
  const { addPitch } = useReservation();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Preview main image
    if (field === 'image') {
      setImagePreview(value);
    }
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
    if (newImageUrl.trim() && !formData.additionalImages.includes(newImageUrl.trim())) {
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isMain = false) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (isMain) {
          setFormData(prev => ({ ...prev, image: result }));
          setImagePreview(result);
        } else {
          setFormData(prev => ({
            ...prev,
            additionalImages: [...prev.additionalImages, result]
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.location || !formData.city || !formData.type || !formData.image || !formData.price) {
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

    const pitchData = {
      ...formData,
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Add New Pitch
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Create a stunning pitch listing for players to discover and book
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <FileText className="h-6 w-6 mr-3" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Pitch Name*</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Champions League Arena"
                    className="border-2 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">City*</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="e.g., New York"
                    className="border-2 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Address*</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., 123 Stadium Road, Sports District, New York, NY 10001"
                    className="pl-12 border-2 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Players Per Side*</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Select value={formData.playersPerSide} onValueChange={(value) => handleInputChange("playersPerSide", value)}>
                      <SelectTrigger className="pl-12 border-2 focus:border-blue-500">
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

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Pitch Type*</label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger className="border-2 focus:border-blue-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">🏢 Indoor</SelectItem>
                      <SelectItem value="outdoor">🌞 Outdoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Price per hour*</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="50.00"
                      className="pl-12 border-2 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Opening Hours</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    value={formData.openingHours}
                    onChange={(e) => handleInputChange("openingHours", e.target.value)}
                    placeholder="e.g., Mon-Sun: 6:00 AM - 11:00 PM"
                    className="pl-12 border-2 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your pitch - highlight what makes it special, surface quality, atmosphere..."
                  rows={4}
                  className="border-2 focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload Section */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Camera className="h-6 w-6 mr-3" />
                Image Gallery
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Main Image */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700">Main Image* (Cover Photo)</label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={formData.image}
                        onChange={(e) => handleInputChange("image", e.target.value)}
                        placeholder="Enter image URL or upload below"
                        className="flex-1 border-2 focus:border-purple-500"
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </label>
                    </div>
                  </div>
                  
                  {/* Main Image Preview */}
                  <div className="flex justify-center">
                    {imagePreview && (
                      <div className="relative group">
                        <img 
                          src={imagePreview} 
                          alt="Main pitch preview" 
                          className="w-full h-40 object-cover rounded-lg border-4 border-purple-200 shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium">Main Cover Image</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Images */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700">Additional Images (Gallery)</label>
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Add more images to showcase your pitch"
                    className="flex-1 border-2 focus:border-purple-500"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </label>
                  <Button type="button" onClick={addAdditionalImage} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                {/* Additional Images Preview */}
                {formData.additionalImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {formData.additionalImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`Additional pitch image ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 shadow"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Coffee className="h-6 w-6 mr-3" />
                Available Facilities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilityOptions.map((facility) => {
                  const Icon = facility.icon;
                  const isSelected = formData.facilities.includes(facility.value);
                  return (
                    <div 
                      key={facility.value} 
                      className={`
                        flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'border-green-500 bg-green-50 shadow-md' 
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => handleFacilityToggle(facility.value)}
                    >
                      <Checkbox
                        id={facility.value}
                        checked={isSelected}
                        onCheckedChange={() => handleFacilityToggle(facility.value)}
                        className="border-2"
                      />
                      <Icon className={`h-6 w-6 ${facility.color}`} />
                      <label htmlFor={facility.value} className="text-sm font-medium cursor-pointer flex-1">
                        {facility.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-center space-x-6 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/pitches")}
              className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
            >
              Create Pitch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPitchForm;
