
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
import { useReservation, Pitch } from "@/context/ReservationContext";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const AddPitch = () => {
  const [pitchData, setPitchData] = useState({
    name: "",
    location: "",
    image: "",
    playersPerSide: "",
    description: "",
    openingHours: "",
    price: "",
    surfaceType: "",
    pitchSize: "",
  });
  
  // For image preview and slider functionality
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();
  const { addPitch } = useReservation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pitchData.name || !pitchData.location || !pitchData.playersPerSide || !pitchData.price) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!pitchData.image) {
      toast({
        title: "Missing Image",
        description: "Please upload a pitch image.",
        variant: "destructive"
      });
      return;
    }

    addPitch({
        name: pitchData.name,
        location: pitchData.location,
        image: pitchData.image,
        playersPerSide: Number(pitchData.playersPerSide),
        description: pitchData.description,
        openingHours: pitchData.openingHours,
        price: Number(pitchData.price),
        surfaceType: pitchData.surfaceType,
        pitchSize: pitchData.pitchSize,
    });
    
    toast({
      title: "Success!",
      description: "Pitch has been added successfully.",
    });
    
    navigate('/pitches');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPitchData(prev => ({
      ...prev,
      [name]: value
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
          setPitchData(prev => ({
            ...prev,
            image: result
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Pitch</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <label htmlFor="image-upload" className="text-sm font-medium">Pitch Image</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              {imagePreview ? (
                <div className="space-y-2">
                  <img 
                    src={imagePreview} 
                    alt="Pitch preview" 
                    className="max-h-60 mx-auto rounded-md object-cover"
                  />
                  {isUploading && (
                    <div className="w-full space-y-2">
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => {
                      setImagePreview(null);
                      setPitchData(prev => ({ ...prev, image: "" }));
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="py-4">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    SVG, PNG, JPG or GIF (Max 5MB)
                  </p>
                  {imageError && (
                    <p className="text-xs text-red-500 mt-2">{imageError}</p>
                  )}
                  <Input 
                    id="image-upload" 
                    type="file" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    Select Image
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Pitch Name</label>
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
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <Input
                id="location"
                name="location"
                value={pitchData.location}
                onChange={handleChange}
                required
                placeholder="e.g., City Park, North Entrance"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="playersPerSide" className="text-sm font-medium">Players Per Side</label>
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
              <label htmlFor="price" className="text-sm font-medium">Price per Hour</label>
              <Input
                id="price"
                name="price"
                value={pitchData.price}
                onChange={handleChange}
                required
                placeholder="e.g., $20 per hour or 20" 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="surfaceType" className="text-sm font-medium">Surface Type</label>
              <Input
                id="surfaceType"
                name="surfaceType"
                value={pitchData.surfaceType}
                onChange={handleChange}
                required
                placeholder="e.g., Artificial Turf, Natural Grass"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pitchSize" className="text-sm font-medium">Pitch Size</label>
              <Input
                id="pitchSize"
                name="pitchSize"
                value={pitchData.pitchSize}
                onChange={handleChange}
                required
                placeholder="e.g., 40m x 20m"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="openingHours" className="text-sm font-medium">Opening Hours</label>
            <Input
              id="openingHours"
              name="openingHours"
              value={pitchData.openingHours}
              onChange={handleChange}
              required
              placeholder="e.g., Mon-Fri: 9 AM - 10 PM"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              name="description"
              value={pitchData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Brief description of the pitch and its key features."
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/pitches')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-bokit-500 hover:bg-bokit-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Pitch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPitch;
