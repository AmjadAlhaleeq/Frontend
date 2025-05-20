import { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Upload, Trash2 } from "lucide-react";
import { useReservation, Pitch } from "@/context/ReservationContext";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Available facilities for selection
const AVAILABLE_FACILITIES = [
  { id: "parking", label: "Parking" },
  { id: "changing_rooms", label: "Changing Rooms" },
  { id: "showers", label: "Showers" },
  { id: "floodlights", label: "Floodlights" },
  { id: "cafe", label: "Cafe/Refreshments" },
  { id: "wifi", label: "WiFi" },
];

/**
 * EditPitch component
 * Allows admins to edit existing pitch details
 */
const EditPitch = () => {
  const { pitchId } = useParams();
  const [pitchData, setPitchData] = useState({
    name: "",
    location: "",
    city: "",
    image: "", // Add this field to fix the error
    images: ["", "", "", ""], // Array to store up to 4 images
    playersPerSide: "",
    description: "",
    price: "",
    facilities: [] as string[],
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // For image preview and slider functionality
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigate = useNavigate();
  const { pitches, updatePitch } = useReservation();
  const { toast } = useToast();

  // Load pitch data on component mount
  useEffect(() => {
    if (pitchId) {
      const id = parseInt(pitchId);
      const pitch = pitches.find(p => p.id === id);
      
      if (pitch) {
        // Initialize the images array with the main image and any additional images
        const images = ["", "", "", ""];
        images[0] = pitch.image || "";
        
        if (pitch.additionalImages && pitch.additionalImages.length > 0) {
          pitch.additionalImages.forEach((img, i) => {
            if (i < 3) { // Limit to 3 additional images (4 total)
              images[i + 1] = img;
            }
          });
        }
        
        setPitchData({
          name: pitch.name || "",
          location: pitch.location || "",
          city: pitch.city || "",
          image: pitch.image || "", // Add this field to fix the error
          images,
          playersPerSide: pitch.playersPerSide?.toString() || "",
          description: pitch.description || "",
          price: pitch.price?.toString() || "",
          facilities: pitch.facilities || [],
        });
      } else {
        setNotFound(true);
        toast({
          title: "Pitch Not Found",
          description: "The pitch you're trying to edit could not be found.",
          variant: "destructive"
        });
      }
    }
    
    setIsLoading(false);
  }, [pitchId, pitches, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pitchData.name || !pitchData.location || !pitchData.city || !pitchData.playersPerSide || !pitchData.price) {
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
    
    if (pitchId) {
      updatePitch(parseInt(pitchId), {
        name: pitchData.name,
        location: pitchData.location,
        city: pitchData.city,
        image: pitchData.images[0], // Primary image
        additionalImages: pitchData.images.slice(1).filter(img => img), // Additional images
        playersPerSide: Number(pitchData.playersPerSide),
        description: pitchData.description,
        price: Number(pitchData.price),
        facilities: pitchData.facilities,
      });
      
      toast({
        title: "Success!",
        description: "Pitch has been updated successfully.",
      });
      
      navigate('/pitches');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPitchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFacilityChange = (facilityId: string, checked: boolean) => {
    setPitchData(prev => ({
      ...prev,
      facilities: checked 
        ? [...prev.facilities, facilityId]
        : prev.facilities.filter(id => id !== facilityId)
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading pitch data...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Pitch Not Found</h2>
        <p className="mb-4">The pitch you're trying to edit could not be found.</p>
        <Button onClick={() => navigate('/pitches')}>
          Return to Pitches
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Pitch</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Multiple Image Upload Section */}
          <div className="space-y-2">
            <label htmlFor="image-upload" className="text-sm font-medium">Pitch Images (Up to 4)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pitchData.images.map((image, index) => (
                <div 
                  key={index} 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg aspect-square overflow-hidden relative flex items-center justify-center"
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
                value={pitchData.playersPerSide}
                onChange={handleChange}
                required
                placeholder="e.g., 5"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">Price per Hour*</label>
              <Input
                id="price"
                name="price"
                value={pitchData.price}
                onChange={handleChange}
                required
                placeholder="e.g., $20 per hour" 
              />
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
              <label className="text-sm font-medium">Facilities Available</label>
              <p className="text-xs text-gray-500">Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AVAILABLE_FACILITIES.map((facility) => (
                <div key={facility.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={facility.id} 
                    checked={pitchData.facilities.includes(facility.id)}
                    onCheckedChange={(checked) => {
                      handleFacilityChange(facility.id, checked === true);
                    }}
                  />
                  <Label htmlFor={facility.id}>{facility.label}</Label>
                </div>
              ))}
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
            <Button type="button" variant="outline" onClick={() => navigate('/pitches')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-bokit-500 hover:bg-bokit-600">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPitch;
