
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Plus, Upload, Loader } from "lucide-react";
import { useReservation } from "@/context/ReservationContext";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define the standard services for pitches
const STANDARD_SERVICES = {
  water: false,
  cafeteria: false,
  lockers: false,
  bathrooms: false,
  parking: false,
  wifi: false,
};

const AddPitch = () => {
  const [pitchData, setPitchData] = useState({
    name: "",
    location: "", // Google Maps link
    city: "",
    image: "",
    images: ["", "", "", ""], // Array to store up to 4 images
    playersPerSide: "",
    description: "",
    type: "outdoor", // Default to outdoor
    services: { ...STANDARD_SERVICES },
  });
  
  // For image preview and slider functionality
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track which image is being uploaded

  const navigate = useNavigate();
  const { addPitch } = useReservation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pitchData.name || !pitchData.location || !pitchData.city || !pitchData.playersPerSide || !pitchData.type) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!pitchData.images[0]) {
      toast({
        title: "Missing Image",
        description: "Please upload at least one pitch image.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      addPitch({
          name: pitchData.name,
          location: pitchData.location,
          city: pitchData.city,
          image: pitchData.images[0], // Primary image
          additionalImages: pitchData.images.slice(1).filter(img => img), // Additional images
          playersPerSide: Number(pitchData.playersPerSide),
          description: pitchData.description,
          price: 0, // We're removing price as requested
          services: pitchData.services,
          type: pitchData.type,
      });
      
      toast({
        title: "Success!",
        description: "Pitch has been added successfully.",
      });
      
      navigate('/pitches');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPitchData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleServiceChange = (serviceName: keyof typeof STANDARD_SERVICES, checked: boolean) => {
    setPitchData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [serviceName]: checked
      }
    }));
  };

  const handleTypeChange = (value: string) => {
    setPitchData(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    
    if (!file) {
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size should be less than 5MB");
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      setImageError("Please upload an image file");
      return;
    }
    
    // Simulate upload with progress
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create a data URL for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Update the images array at the current index
          const newImages = [...pitchData.images];
          newImages[currentImageIndex] = result;
          
          setPitchData(prev => ({
            ...prev,
            images: newImages
          }));
          
          setIsUploading(false);
          toast({
            title: "Upload Complete",
            description: "Image has been uploaded successfully.",
          });
        }
      }, 200);
    };
    
    reader.readAsDataURL(file);
  };

  const selectImageSlot = (index: number) => {
    setCurrentImageIndex(index);
    // Trigger file input click
    document.getElementById('image-upload')?.click();
  };

  const removeImage = (index: number) => {
    const newImages = [...pitchData.images];
    newImages[index] = "";
    setPitchData(prev => ({
      ...prev,
      images: newImages
    }));
    
    if (currentImageIndex === index) {
      setImagePreview(null);
    }
  };

  // Preview section
  const previewPitch = {
    name: pitchData.name || "Pitch Name",
    location: pitchData.location || "https://maps.google.com",
    city: pitchData.city || "City Name",
    image: pitchData.images[0] || "https://source.unsplash.com/random/?football,pitch",
    additionalImages: pitchData.images.slice(1).filter(img => img),
    playersPerSide: Number(pitchData.playersPerSide) || 5,
    description: pitchData.description || "Pitch description...",
    services: pitchData.services,
    type: pitchData.type,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Pitch</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Multiple Image Upload Section */}
              <div className="space-y-2">
                <label htmlFor="image-upload" className="text-sm font-medium">Pitch Images (Up to 4)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {pitchData.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg aspect-square overflow-hidden relative flex items-center justify-center cursor-pointer hover:border-teal-300 dark:hover:border-teal-600 transition-colors"
                      onClick={() => selectImageSlot(index)}
                    >
                      {image ? (
                        <>
                          <img 
                            src={image} 
                            alt={`Pitch image ${index + 1}`} 
                            className="h-full w-full object-cover"
                          />
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                          >
                            &times;
                          </Button>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">
                            {index === 0 ? "Main Photo*" : `Photo ${index + 1}`}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Hidden file input */}
                <Input 
                  id="image-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                
                {isUploading && (
                  <div className="w-full space-y-2 mt-2">
                    <Slider 
                      value={[uploadProgress]} 
                      max={100}
                      step={1}
                      className="w-full"
                      disabled
                    />
                    <p className="text-xs text-center text-muted-foreground">{uploadProgress}% uploaded</p>
                  </div>
                )}
                
                {imageError && (
                  <p className="text-xs text-red-500 mt-1">{imageError}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Pitch Name*</label>
                  <Input
                    id="name"
                    name="name"
                    value={pitchData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Community Football Arena"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">City*</label>
                  <Input
                    id="city"
                    name="city"
                    value={pitchData.city}
                    onChange={handleChange}
                    required
                    placeholder="e.g., London"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="playersPerSide" className="text-sm font-medium">Players Per Side*</label>
                  <Input
                    id="playersPerSide"
                    name="playersPerSide"
                    type="number"
                    min="1"
                    max="11"
                    value={pitchData.playersPerSide}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 5"
                  />
                </div>
                
                {/* Indoor/Outdoor Selection (Required) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pitch Type*</label>
                  <RadioGroup 
                    value={pitchData.type} 
                    onValueChange={handleTypeChange} 
                    className="flex gap-4"
                    required
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="indoor" id="indoor" />
                      <Label htmlFor="indoor">Indoor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="outdoor" id="outdoor" />
                      <Label htmlFor="outdoor">Outdoor</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">Google Maps Location Link*</label>
                <Input
                  id="location"
                  name="location"
                  value={pitchData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., https://maps.google.com/?q=..."
                />
                <p className="text-xs text-gray-500">Paste a Google Maps link to the pitch location</p>
              </div>
              
              <div className="space-y-2">
                <div className="mb-2">
                  <label className="text-sm font-medium">Available Services</label>
                  <p className="text-xs text-gray-500">Select all that apply</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="water" 
                      checked={pitchData.services.water}
                      onCheckedChange={(checked) => {
                        handleServiceChange("water", checked === true);
                      }}
                    />
                    <Label htmlFor="water">Water</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="cafeteria" 
                      checked={pitchData.services.cafeteria}
                      onCheckedChange={(checked) => {
                        handleServiceChange("cafeteria", checked === true);
                      }}
                    />
                    <Label htmlFor="cafeteria">Cafeteria</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lockers" 
                      checked={pitchData.services.lockers}
                      onCheckedChange={(checked) => {
                        handleServiceChange("lockers", checked === true);
                      }}
                    />
                    <Label htmlFor="lockers">Lockers</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bathrooms" 
                      checked={pitchData.services.bathrooms}
                      onCheckedChange={(checked) => {
                        handleServiceChange("bathrooms", checked === true);
                      }}
                    />
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="parking" 
                      checked={pitchData.services.parking}
                      onCheckedChange={(checked) => {
                        handleServiceChange("parking", checked === true);
                      }}
                    />
                    <Label htmlFor="parking">Parking</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="wifi" 
                      checked={pitchData.services.wifi}
                      onCheckedChange={(checked) => {
                        handleServiceChange("wifi", checked === true);
                      }}
                    />
                    <Label htmlFor="wifi">WiFi</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  name="description"
                  value={pitchData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Brief description of the pitch and its key features."
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/pitches')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Pitch
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Live Preview Card */}
          <div>
            <h3 className="text-lg font-medium mb-3">Preview</h3>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 relative">
                <img 
                  src={previewPitch.image} 
                  alt={previewPitch.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-semibold text-white text-lg line-clamp-1">
                    {previewPitch.name || "Pitch Name"}
                  </h3>
                </div>
                
                {/* Type Badge */}
                {previewPitch.type && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-white/80 text-black text-xs py-1 px-2 rounded-md">
                      {previewPitch.type}
                    </span>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                {/* Location with city */}
                <div className="flex items-start text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div className="flex flex-col">
                    <span className="truncate">{previewPitch.city || "City Name"}</span>
                    {previewPitch.location && (
                      <span className="text-blue-500 text-xs">Google Maps Location</span>
                    )}
                  </div>
                </div>
                
                {/* Services */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-1.5">Services:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(previewPitch.services)
                      .filter(([_, enabled]) => enabled)
                      .map(([service]) => (
                        <span key={service} className="inline-block bg-gray-100 dark:bg-gray-800 text-xs px-2 py-1 rounded">
                          {service.charAt(0).toUpperCase() + service.slice(1)}
                        </span>
                    ))}
                    {Object.values(previewPitch.services).every(v => !v) && (
                      <span className="text-xs text-gray-500 italic">No services listed</span>
                    )}
                  </div>
                </div>
                
                {/* Player format info */}
                <div className="text-sm text-gray-600">
                  Format: {previewPitch.playersPerSide}v{previewPitch.playersPerSide}
                </div>
                
                {/* Description preview */}
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-3">
                  {previewPitch.description || "Pitch description will appear here..."}
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground mt-2">This is how your pitch will appear in the listing.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPitch;
