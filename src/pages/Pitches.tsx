// This is the Pitches.tsx page. It handles UI and logic for Pitches.

import { useState } from "react";
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
  X,
  AlertCircle,
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
import { Separator } from "@/components/ui/separator";
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
      facilities: ["Public Restrooms", "Water Fountains", "Picnic Area"],
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
    getReservationsForPitch,
    isUserJoined,
    joinGame,
    cancelReservation,
    hasUserJoinedOnDate,
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

    // Navigate to add pitch page
    navigate("/admin/add-pitch");

    toast({
      title: "Add Pitch",
      description: "You can now create a new pitch",
      duration: 3000,
    });
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={pitch.image}
          alt={pitch.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {pitch.isAdmin && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-[#0F766E]">Admin</Badge>
          </div>
        )}
      </div>

      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{pitch.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium">{pitch.rating}</span>
          </div>
        </div>

        <div className="flex items-start mb-3">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-1 flex-shrink-0" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {pitch.location}
          </span>
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
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pitch.name}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center mt-1 mb-4">
              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {pitch.location}
              </span>

              <div className="ml-4 flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium">{pitch.rating}/5.0</span>
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
                <Clock className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium">Opening Hours</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {pitch.details?.openingHours}
                  </p>
                </div>
              </div>

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
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {pitch.details?.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start">
                <User className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium">Surface Type</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {pitch.details?.surfaceType}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CalendarIcon className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium">Pitch Size</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {pitch.details?.pitchSize}
                  </p>
                </div>
              </div>

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

          <div>
            <h3 className="text-md font-semibold mb-1">Available Facilities</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {pitch.details?.facilities.map((facility, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-gray-100 dark:bg-gray-700"
                >
                  {facility}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-1">Pitch Rules</h3>
            <ul className="list-disc pl-5 space-y-1">
              {pitch.details?.rules.map((rule, idx) => (
                <li
                  key={idx}
                  className="text-xs text-gray-600 dark:text-gray-300"
                >
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
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

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

export default Pitches;
