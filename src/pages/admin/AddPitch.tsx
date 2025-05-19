
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useReservation } from "@/context/ReservationContext";

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

  const navigate = useNavigate();
  const { addPitch } = useReservation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pitchData.name || !pitchData.location || !pitchData.playersPerSide || !pitchData.price) {
      console.error("Form validation failed: Please fill all required fields.");
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
    
    navigate('/pitches');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPitchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Pitch</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <label htmlFor="image" className="text-sm font-medium">Image URL</label>
              <Input
                id="image"
                name="image"
                value={pitchData.image}
                onChange={handleChange}
                required
                placeholder="https://example.com/pitch-image.jpg"
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
