
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Trash2, Users, ChevronLeft, ChevronRight } from "lucide-react";
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
 * Now supports multiple images with navigation
 */
const PitchCard: React.FC<PitchCardProps> = ({
  pitch,
  isAdmin,
  onViewDetails,
  onDeleteClick
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get all images for this pitch
  const allImages = [
    pitch.image,
    ...(pitch.additionalImages || [])
  ].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Card image with navigation for multiple images */}
      <div 
        className="h-48 relative cursor-pointer group" 
        onClick={onViewDetails}
      >
        <img 
          src={allImages[currentImageIndex] || pitch.image}
          alt={pitch.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        
        {/* Image navigation - only show if more than 1 image */}
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
            
            {/* Image indicators */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
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
          {/* Display pitch type badge */}
          {pitch.type && (
            <Badge 
              variant="outline" 
              className={`mt-1 text-xs ${
                pitch.type === 'indoor' 
                  ? 'bg-purple-600/80 hover:bg-purple-600 text-white border-purple-400' 
                  : 'bg-green-600/80 hover:bg-green-600 text-white border-green-400'
              }`}
            >
              {pitch.type === 'indoor' ? 'Indoor' : 'Outdoor'}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        {/* Location with city */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{pitch.city}</span>
        </div>
        
        {/* Facilities */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1.5">Facilities:</h4>
          <div className="flex flex-wrap gap-1.5">
            {pitch.facilities && pitch.facilities.length > 0 ? (
              pitch.facilities.map((facility, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {facility.replace('_', ' ')}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-gray-500 italic">No facilities listed</span>
            )}
          </div>
        </div>
        
        {/* Players info */}
        <div className="flex justify-between items-center mb-3 text-sm">
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            {pitch.playersPerSide}v{pitch.playersPerSide}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={onViewDetails} 
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
          >
            View Details
          </Button>
          
          {isAdmin && (
            <Button 
              onClick={onDeleteClick}
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
