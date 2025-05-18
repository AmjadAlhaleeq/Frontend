// This is the Pitches.tsx page. It handles UI and logic for Pitches.

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Star,
  Plus,
  Users,
  Droplets,
  ShieldCheck,
  CalendarIcon,
  Clock,
  User,
  CheckCircle,
  StarHalf,
  ShowerHead,
  ParkingCircle,
  Wifi,
  Dumbbell,
  Coffee,
  Wrench,
  Utensils,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useReservation, Pitch as PitchType } from "@/context/ReservationContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const Pitches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [isAdmin] = useState(true);
  const [selectedPitch, setSelectedPitch] = useState<PitchType | null>(null);
  const {
    pitches,
    navigateToReservation,
  } = useReservation();
  const navigate = useNavigate();

  const filteredPitches = pitches.filter(
    (pitch) =>
      pitch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pitch.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPitch = () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can add new pitches.",
        variant: "destructive",
      });
      return;
    }
    navigate("/admin/add-pitch");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Available Pitches</h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search pitches..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isAdmin && (
            <Button
              onClick={handleAddPitch}
              className="bg-[#0F766E] hover:bg-[#0d6d66]"
            >
              <Plus size={18} className="mr-2" />
              Add Pitch
            </Button>
          )}
        </div>
      </div>

      {filteredPitches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No pitches found. Try adjusting your search or add a new one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPitches.map((pitch) => (
            <PitchCard
              key={pitch.id}
              pitch={pitch}
              onViewDetails={() => setSelectedPitch(pitch)}
              onBookPitch={() => navigateToReservation(pitch.name)}
            />
          ))}
        </div>
      )}

      {selectedPitch && (
        <PitchDetailsDialog
          pitch={selectedPitch}
          onBookPitch={() => navigateToReservation(selectedPitch.name)}
          onClose={() => setSelectedPitch(null)}
        />
      )}
    </div>
  );
};

interface PitchProps {
  pitch: PitchType;
  onViewDetails: () => void;
  onBookPitch: () => void;
}

const RenderStars = ({ rating }: { rating: number }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.3 && rating % 1 < 0.8; // Threshold for half star
  const filledByHalfOrFull = rating % 1 >= 0.8 ? Math.ceil(rating) : fullStars + (hasHalfStar ? 1: 0) ;

  const starsArray = [];
  for (let i = 1; i <= totalStars; i++) {
    if (i <= fullStars) {
      starsArray.push(<Star key={`full-${i}`} className="h-4 w-4 text-yellow-500 fill-yellow-500" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      starsArray.push(<StarHalf key="half" className="h-4 w-4 text-yellow-500 fill-yellow-500" />);
    } else {
      starsArray.push(<Star key={`empty-${i}`} className="h-4 w-4 text-yellow-500" />);
    }
  }
  return <div className="flex items-center">{starsArray}</div>;
};

const PitchCard: React.FC<PitchProps> = ({
  pitch,
  onViewDetails,
  onBookPitch,
}) => {
  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case "indoor":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <ShieldCheck size={14} /> Indoor
          </Badge>
        );
      case "outdoor":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Droplets size={14} /> Outdoor
          </Badge>
        );
      default:
        return <Badge variant="outline">{feature}</Badge>;
    }
  };
  
  const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(pitch.details?.address || pitch.location)}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={pitch.image}
          alt={pitch.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Admin badge removed as per request */}
      </div>

      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{pitch.name}</h3>
          <div className="flex items-center">
            <RenderStars rating={pitch.rating} />
            <span className="text-sm font-medium ml-1">{pitch.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-start mb-3">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-1 flex-shrink-0" />
          <a 
            href={googleMapsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
            title={`View ${pitch.details?.address || pitch.location} on Google Maps`}
          >
            {pitch.location}
          </a>
        </div>

        <div className="flex items-center mb-3">
          <Users className="h-4 w-4 text-gray-500 mr-1" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {pitch.playersPerSide} vs {pitch.playersPerSide}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {pitch.features.map((feature, index) => (
            <div key={index}>{getFeatureIcon(feature)}</div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Button variant="outline" onClick={onViewDetails} className="flex-1">
          View Details
        </Button>
        <Button
          onClick={onBookPitch}
          className="flex-1 bg-[#0F766E] hover:bg-[#0d6d66]"
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};

const getFacilityIcon = (facilityName: string): JSX.Element => {
  const lowerFacilityName = facilityName.toLowerCase();
  switch (lowerFacilityName) {
    case "showers":
      return <ShowerHead size={18} className="text-[#0F766E]" aria-label={facilityName} />;
    case "parking":
    case "free parking":
      return <ParkingCircle size={18} className="text-[#0F766E]" aria-label={facilityName} />;
    case "wifi":
      return <Wifi size={18} className="text-[#0F766E]" aria-label={facilityName} />;
    case "gym":
      return <Dumbbell size={18} className="text-[#0F766E]" aria-label={facilityName} />;
    case "changing rooms":
    case "public restrooms":
    case "professional locker rooms":
      return <Users size={18} className="text-[#0F766E]" aria-label={facilityName} />;
    case "water fountains":
      return <Droplets size={18} className="text-[#0F766E]" aria-label={facilityName} />;
    case "cafe":
       return <Coffee size={18} className="text-[#0F766E]" aria-label={facilityName} />;
    case "equipment rental":
       return <Wrench size={18} className="text-[#0F766E]" aria-label={facilityName} />;
    case "picnic area":
       return <Utensils size={18} className="text-[#0F766E]" aria-label={facilityName} />;
    // Add more specific cases as needed from allowed icons or common ones
    default:
      return <CheckCircle size={18} className="text-[#0F766E]" aria-label={facilityName} />;
  }
};

interface PitchDetailsDialogProps {
  pitch: PitchType;
  onClose: () => void;
  onBookPitch: () => void;
}

const PitchDetailsDialog: React.FC<PitchDetailsDialogProps> = ({
  pitch,
  onClose,
  onBookPitch,
}) => {
  const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(pitch.details?.address || pitch.location)}`;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pitch.name}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center mt-1 mb-4">
              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
              <a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                title={`View ${pitch.details?.address || pitch.location} on Google Maps`}
              >
                {pitch.location}
              </a>

              <div className="ml-4 flex items-center">
                <RenderStars rating={pitch.rating} />
                <span className="text-sm font-medium ml-1">{pitch.rating.toFixed(1)}/5.0</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <img
            src={pitch.image}
            alt={pitch.name}
            className="w-full h-60 object-cover rounded-md mb-4"
          />

          <div>
            <h3 className="text-lg font-semibold mb-1 flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-[#0F766E]" />
              About this Pitch
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {pitch.details?.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start">
                <Users className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium">Players Format</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {pitch.playersPerSide} vs {pitch.playersPerSide}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium">Address</h4>
                  <a 
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 dark:text-gray-300 hover:underline"
                    title={`View ${pitch.details?.address || pitch.location} on Google Maps`}
                  >
                    {pitch.details?.address}
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start">
                <Star className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium">Price</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {pitch.details?.price}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {pitch.details?.facilities && pitch.details.facilities.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-2">Facilities</h3>
              <div className="flex flex-wrap gap-3">
                {pitch.details.facilities.map((facility, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-gray-100 dark:bg-gray-700 p-2 flex items-center gap-2"
                  >
                    {getFacilityIcon(facility)}
                    <span className="text-xs">{facility}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Pitch Rules removed */}
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="bg-[#0F766E] hover:bg-[#0d6d66]"
            onClick={onBookPitch}
          >
            Book Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Format date for display (This function seems unused in Pitches.tsx, might be from a copy-paste or for other parts of the app)
// const formatDate = (dateString: string) => {
//   const options: Intl.DateTimeFormatOptions = {
//     weekday: "short",
//     month: "short",
//     day: "numeric",
//   };
//   return new Date(dateString).toLocaleDateString("en-US", options);
// };

export default Pitches;
