import React, { useState } from "react";
import { MapPin, Users, Trash2, Edit3, ChevronLeft, ChevronRight, X, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Pitch } from "@/context/ReservationContext";

interface PitchCardProps {
  pitch: Pitch;
  isAdmin: boolean;
  onViewDetails: () => void;
  onBookPitch: () => void; // This prop remains but button is removed
  onEditClick: () => void;
  onDeleteClick: () => void;
}

/**
 * PitchCard component to display individual pitch information
 * @param pitch - Pitch data object
 * @param isAdmin - Boolean indicating if current user is admin
 * @param onViewDetails - Function to handle view details click
 * @param onBookPitch - Function to handle book pitch click (button removed)
 * @param onEditClick - Function to handle edit click
 * @param onDeleteClick - Function to handle delete click
 */
const PitchCard: React.FC<PitchCardProps> = ({
  pitch,
  isAdmin,
  onViewDetails,
  onBookPitch, // Prop kept for potential future use or if other logic depends on it
  onEditClick,
  onDeleteClick,
}) => {
  const [showGallery, setShowGallery] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Sample gallery photos (would come from pitch.galleryImages in production)
  const galleryPhotos = [
    pitch.image,
    // These would be populated from actual gallery images in a real implementation
    "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=876&q=80"
  ];
  
  const getFeatureIcon = (feature: string) => {
    const lowerFeature = feature.toLowerCase();
    switch (lowerFeature) {
      case "indoor":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <span className="rounded-full bg-teal-100 dark:bg-teal-900 p-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 8V21H21V8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span>Indoor</span>
          </Badge>
        );
      case "outdoor":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <span className="rounded-full bg-blue-100 dark:bg-blue-900 p-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 17.5L12 13.5L16 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span>Outdoor</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
             <span className="rounded-full bg-gray-100 dark:bg-gray-700 p-1">
               <Tag size={12} className="text-gray-600 dark:text-gray-300" />
             </span>
            <span>{feature}</span>
          </Badge>
        );
    }
  };
  
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % galleryPhotos.length);
  };
  
  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };
  
  const address = pitch.details?.address || pitch.location;
  const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <div className="relative h-48 overflow-hidden group">
          <img
            src={pitch.image}
            alt={pitch.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
            onClick={() => setShowGallery(true)}
          />
          
          {/* Photo gallery indicator */}
          {galleryPhotos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {galleryPhotos.length} photos
            </div>
          )}
          
          {/* Thumbnail gallery */}
          {galleryPhotos.length > 1 && (
            <div className="absolute bottom-2 left-2 flex space-x-1">
              {galleryPhotos.slice(0, 3).map((photo, idx) => (
                <div 
                  key={idx} 
                  className={`w-8 h-8 rounded-md overflow-hidden border-2 ${idx === 0 ? 'border-white' : 'border-white/50'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex(idx);
                    setShowGallery(true);
                  }}
                >
                  <img 
                    src={photo} 
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {galleryPhotos.length > 3 && (
                <div 
                  className="w-8 h-8 rounded-md flex items-center justify-center bg-black/50 text-white text-xs border-2 border-white/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex(3);
                    setShowGallery(true);
                  }}
                >
                  +{galleryPhotos.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        <CardContent className="pt-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">{pitch.name}</h3>
          </div>

          <div className="flex items-start mb-3">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-1 flex-shrink-0" />
            <a 
              href={googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
              aria-label={`View ${address} on Google Maps`}
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
            {pitch.features && pitch.features.map((feature, index) => (
              <div key={index}>{getFeatureIcon(feature)}</div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-0 mt-auto">
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onViewDetails} className="w-full">
              View Details
            </Button>
            {/* "Book Now" button removed */}
          </div>
          {isAdmin && (
            <div className="flex gap-2 w-full mt-2">
              <Button 
                variant="outline" 
                onClick={onEditClick} 
                className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/20"
              >
                <Edit3 size={16} className="mr-2" /> Edit
              </Button>
              <Button 
                variant="outline" 
                onClick={onDeleteClick} 
                className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
              >
                <Trash2 size={16} className="mr-2" /> Delete
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
      
      {/* Photo Gallery Dialog */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black/90 border-0">
          <div className="relative h-full w-full flex items-center justify-center">
            {/* Close button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 h-8 w-8 text-white bg-black/50 hover:bg-black/70 z-10"
            >
              <X size={20} />
            </Button>
            
            {/* Main image */}
            <div className="w-full h-full flex items-center justify-center p-4">
              <img 
                src={galleryPhotos[currentPhotoIndex]} 
                alt={`${pitch.name} - Photo ${currentPhotoIndex + 1}`}
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>
            
            {/* Navigation buttons */}
            {galleryPhotos.length > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={prevPhoto}
                  className="absolute left-4 h-10 w-10 text-white bg-black/50 hover:bg-black/70 rounded-full"
                >
                  <ChevronLeft size={24} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={nextPhoto}
                  className="absolute right-4 h-10 w-10 text-white bg-black/50 hover:bg-black/70 rounded-full"
                >
                  <ChevronRight size={24} />
                </Button>
                
                {/* Photo counter */}
                <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                  {currentPhotoIndex + 1} / {galleryPhotos.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PitchCard;
