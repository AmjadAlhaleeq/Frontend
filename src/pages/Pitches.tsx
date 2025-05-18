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
import { useReservation } from "@/context/ReservationContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const pitchesData = [
  {
    id: 1,
    name: "Green Valley Pitch",
    image:
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=500&auto=format&fit=crop",
    location: "Downtown, Football City",
    rating: 4.8,
    features: ["Indoor", "Floodlights", "Changing Rooms"],
    playersPerSide: 5,
    isAdmin: true,
    details: {
      description:
        "Premier indoor football facility with high-quality artificial turf and state-of-the-art lighting system.",
      openingHours: "Mon-Fri: 8:00 - 22:00, Sat-Sun: 9:00 - 20:00",
      address: "123 Main St, Downtown, Football City",
      price: "$25 per hour",
      facilities: [
        "Changing Rooms",
        "Showers",
        "Parking",
        "Cafe",
        "Equipment Rental",
        "Wifi",
      ],
      surfaceType: "Premium Artificial Turf (FIFA Quality Pro)",
      pitchSize: "40m x 20m",
      rules: [
        "No smoking",
        "Clean football boots only",
        "No food on the pitch",
      ],
    },
  },
  {
    id: 2,
    name: "Central Park Field",
    image:
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=500&auto=format&fit=crop",
    location: "Eastside, Football City",
    rating: 4.5,
    features: ["Outdoor", "Floodlights", "Parking"],
    playersPerSide: 7,
    isAdmin: false,
    details: {
      description:
        "Natural grass pitch located in the heart of Central Park. Perfect for casual games and amateur leagues.",
      openingHours: "Open daily: 7:00 - 22:00",
      address: "Central Park, Eastside, Football City",
      price: "$30 per hour",
      facilities: ["Public Restrooms", "Water Fountains", "Picnic Area", "Gym"],
      surfaceType: "Natural Grass",
      pitchSize: "60m x 40m",
      rules: [
        "No cleats on wet ground",
        "Public use priority on weekends",
        "No private coaching without permit",
      ],
    },
  },
  {
    id: 3,
    name: "Stadium Pro",
    image:
      "https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=500&auto=format&fit=crop",
    location: "Northside, Football City",
    rating: 4.9,
    features: ["Indoor", "Changing Rooms", "Cafeteria"],
    playersPerSide: 11,
    isAdmin: true,
    details: {
      description:
        "Professional-grade stadium with full-size pitch. Used by local professional teams for training and matches.",
      openingHours: "By reservation only",
      address: "55 Stadium Road, Northside, Football City",
      price: "$40 per hour",
      facilities: [
        "Professional Locker Rooms",
        "Media Room",
        "VIP Boxes",
        "Medical Staff",
        "Performance Analysis",
        "Showers",
        "Wifi"
      ],
      surfaceType: "Hybrid Grass (Natural + Artificial)",
      pitchSize: "105m x 68m (Full Size)",
      rules: [
        "Professional conduct required",
        "Referee mandatory for matches",
        "No unauthorized media",
      ],
    },
  },
  {
    id: 4,
    name: "Riverside Turf",
    image:
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=500&auto=format&fit=crop",
    location: "Westside, Football City",
    rating: 4.2,
    features: ["Outdoor", "Artificial Grass", "Parking"],
    playersPerSide: 5,
    isAdmin: false,
    details: {
      description:
        "Convenient 5-a-side pitches with beautiful riverside views. Popular for after-work leagues.",
      openingHours: "Mon-Fri: 16:00 - 22:00, Sat-Sun: 10:00 - 22:00",
      address: "78 River Road, Westside, Football City",
      price: "$20 per hour",
      facilities: ["Changing Rooms", "Bar", "Spectator Area", "Free Parking"],
      surfaceType: "3G Artificial Turf",
      pitchSize: "30m x 20m",
      rules: [
        "No alcohol on pitches",
        "Maximum 7 players per team",
        "Flat-soled or turf shoes only",
      ],
    },
  },
];

const Pitches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [isAdmin] = useState(true);
  const [selectedPitch, setSelectedPitch] = useState<
    PitchProps["pitch"] | null
  >(null);
  const {
    navigateToReservation,
    // getReservationsForPitch, // These seem unused in this component
    // isUserJoined,
    // joinGame,
    // cancelReservation,
    // hasUserJoinedOnDate,
  } = useReservation();
  const navigate = useNavigate();

  const filteredPitches = pitchesData.filter(
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
    // The toast below might be redundant if AddPitch page shows its own confirmation
    // toast({
    //   title: "Add Pitch",
    //   description: "You can now create a new pitch",
    //   duration: 3000,
    // });
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
            No pitches found. Try adjusting your search.
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
  pitch: {
    id: number;
    name: string;
    image: string;
    location: string;
    rating: number;
    features: string[];
    playersPerSide: number;
    isAdmin: boolean;
    details?: {
      description: string;
      openingHours: string;
      address: string;
      price: string;
      facilities: string[];
      surfaceType: string;
      pitchSize: string;
      rules: string[];
    };
  };
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
      // Render a full star but with no fill for an "empty" look, or use a specific empty star icon if available
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
             {/* Old rating display:
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium">{pitch.rating}</span> 
            */}
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
      return <ShowerHead size={18} className="text-[#0F766E]" title={facilityName} />;
    case "parking":
    case "free parking":
      return <ParkingCircle size={18} className="text-[#0F766E]" title={facilityName} />;
    case "wifi":
      return <Wifi size={18} className="text-[#0F766E]" title={facilityName} />;
    case "gym":
      return <Dumbbell size={18} className="text-[#0F766E]" title={facilityName} />;
    case "changing rooms":
    case "public restrooms":
    case "professional locker rooms":
      return <Users size={18} className="text-[#0F766E]" title={facilityName} />;
    case "water fountains":
      return <Droplets size={18} className="text-[#0F766E]" title={facilityName} />;
    case "cafe":
       return <Coffee size={18} className="text-[#0F766E]" title={facilityName} />;
    case "equipment rental":
       return <Wrench size={18} className="text-[#0F766E]" title={facilityName} />;
    case "picnic area":
       return <Utensils size={18} className="text-[#0F766E]" title={facilityName} />;
    // Add more specific cases as needed from allowed icons or common ones
    default:
      return <CheckCircle size={18} className="text-[#0F766E]" title={facilityName} />;
  }
};

interface PitchDetailsDialogProps {
  pitch: PitchProps["pitch"];
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
              {/* Opening Hours removed */}
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
              {/* Surface Type removed */}
              {/* Pitch Size removed */}
              <div className="flex items-start">
                <Star className="h-4 w-4 text-gray-500 mt-0.5 mr-2" /> {/* Using Star as a generic icon for Price */}
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
