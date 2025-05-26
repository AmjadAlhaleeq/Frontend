// PitchCard.tsx
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
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
} from "lucide-react";
import { Pitch } from "@/types/reservation";

interface PitchCardProps {
  pitch: Pitch;
  isAdmin: boolean;
  onViewDetails: () => void;
  onDeleteClick: (pitchId: string) => void;
}

const facilityIcons: Record<string, React.ElementType> = {
  wifi: Wifi,
  parking: Car,
  cafeteria: Coffee,
  security: Shield,
  lockers: Shirt,
  bathrooms: Droplets,
  cctv: Camera,
  outdoor_area: TreePine,
  floodlights: Zap,
  air_conditioning: Wind,
};

const facilityColors: Record<string, string> = {
  wifi: "text-blue-600",
  parking: "text-gray-600",
  cafeteria: "text-orange-600",
  security: "text-red-600",
  lockers: "text-purple-600",
  bathrooms: "text-cyan-600",
  cctv: "text-indigo-600",
  outdoor_area: "text-green-600",
  floodlights: "text-yellow-600",
  air_conditioning: "text-sky-600",
};

const PitchCard: React.FC<PitchCardProps> = ({
  pitch,
  isAdmin,
  onViewDetails,
  onDeleteClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = [pitch.backgroundImage, ...(pitch.images || [])].filter(
    Boolean
  );

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length
    );
  };

  const playersPerSide = Math.max(pitch.playersPerSide, 5);

  const availableFacilities = Object.entries(pitch.services || {})
    .filter(([key, value]) => key !== "type" && value === true)
    .map(([key]) => key);

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div
        className="h-48 relative cursor-pointer group"
        onClick={onViewDetails}
      >
        <img
          src={allImages[currentImageIndex]}
          alt={pitch.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-semibold text-white text-lg line-clamp-1">
            {pitch.name}
          </h3>
          {pitch.services?.type && typeof pitch.services.type === 'string' && (
            <Badge
              variant="outline"
              className={`mt-1 text-xs ${
                pitch.services.type.toLowerCase() === "indoor"
                  ? "bg-purple-600/80 hover:bg-purple-600 text-white border-purple-400"
                  : "bg-green-600/80 hover:bg-green-600 text-white border-green-400"
              }`}
            >
              {pitch.services.type}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{pitch.city}</span>
        </div>

        <div className="flex justify-between items-center mb-3 text-sm">
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            {playersPerSide}v{playersPerSide}
          </div>
        </div>

        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1.5">Facilities:</h4>
          <div className="flex flex-wrap gap-1.5">
            {availableFacilities.length > 0 ? (
              availableFacilities.slice(0, 3).map((facility, index) => {
                const IconComponent = facilityIcons[facility];
                const iconColor = facilityColors[facility] || "text-gray-500";
                return (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs flex items-center gap-1"
                  >
                    {IconComponent && (
                      <IconComponent className={`h-3 w-3 ${iconColor}`} />
                    )}
                    {facility.replace("_", " ")}
                  </Badge>
                );
              })
            ) : (
              <span className="text-xs text-gray-500 italic">
                No facilities listed
              </span>
            )}
            {availableFacilities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{availableFacilities.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onViewDetails}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
          >
            View Details
          </Button>

          {isAdmin && (
            <Button
              onClick={() => onDeleteClick(pitch._id)}
              variant="outline"
              size="icon"
              className="h-9 w-9 text-red-500 hover:text-red-600 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PitchCard;
