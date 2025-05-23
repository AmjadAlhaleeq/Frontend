
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Edit3, Trash2, CalendarIcon, Users, ExternalLink } from "lucide-react";
import { Pitch } from "@/context/ReservationContext";

interface PitchCardProps {
  pitch: Pitch;
  isAdmin: boolean;
  onViewDetails: () => void;
  onBookPitch: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

/**
 * PitchCard component
 * Displays a card with pitch information and action buttons
 */
const PitchCard: React.FC<PitchCardProps> = ({
  pitch,
  isAdmin,
  onViewDetails,
  onBookPitch,
  onEditClick,
  onDeleteClick
}) => {
  // Default image if the pitch image is not available or invalid
  const fallbackImage = "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=800&q=60";
  
  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = fallbackImage;
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Card image */}
      <div 
        className="h-48 relative cursor-pointer" 
        onClick={onViewDetails}
      >
        <img 
          src={pitch.image || fallbackImage}
          alt={pitch.name} 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-semibold text-white text-lg line-clamp-1">
            {pitch.name}
          </h3>
        </div>
        
        {/* Indoor/Outdoor Badge */}
        {(pitch as any).type && (
          <Badge 
            className="absolute top-2 right-2 bg-white/80 text-black text-xs font-medium"
          >
            {(pitch as any).type}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        {/* Location with city */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="truncate">{pitch.city}</span>
            <a 
              href={pitch.location} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              View on Maps <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
        
        {/* Facilities */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1.5">Facilities:</h4>
          <div className="flex flex-wrap gap-1.5">
            {(pitch as any).services && Object.entries((pitch as any).services).filter(([_, enabled]) => enabled).map(([service]) => (
              <Badge key={service} variant="outline" className="text-xs">
                {service.charAt(0).toUpperCase() + service.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Players info */}
        <div className="flex justify-between items-center mb-3 text-sm">
          <div className="font-medium">
            Format: {pitch.playersPerSide}v{pitch.playersPerSide}
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            {pitch.playersPerSide * 2} + {Math.min(4, Math.ceil(pitch.playersPerSide / 2))} subs
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={onBookPitch} 
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <CalendarIcon className="h-4 w-4 mr-1.5" />
            Book Pitch
          </Button>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Button 
                onClick={onEditClick}
                variant="outline"
                size="icon"
                className="h-9 w-9"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button 
                onClick={onDeleteClick}
                variant="outline"
                size="icon"
                className="h-9 w-9 text-red-500 hover:text-red-600 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PitchCard;
