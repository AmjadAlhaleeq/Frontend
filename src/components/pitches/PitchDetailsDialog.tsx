
import React, { useState } from "react";
import { MapPin, Clock, Calendar, Users, Star, CheckCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Pitch } from "@/context/ReservationContext";

interface PitchDetailsDialogProps {
  pitch: Pitch;
  onClose: () => void;
  onBookPitch: () => void;
  userRole: 'admin' | 'player' | null;
}

/**
 * PitchDetailsDialog component to display detailed information about a pitch
 * Shows a modal with comprehensive pitch details, including facilities and location
 */
const PitchDetailsDialog: React.FC<PitchDetailsDialogProps> = ({
  pitch,
  onClose,
  onBookPitch,
  userRole
}) => {
  // State for the photo gallery
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);
  
  // Use pitch's additionalImages if available, otherwise just use the main image
  const galleryPhotos = pitch.additionalImages && pitch.additionalImages.length > 0
    ? [pitch.image, ...pitch.additionalImages]
    : [pitch.image];
  
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % galleryPhotos.length);
  };
  
  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };
  
  // Address all type issues by using optional chaining and fallbacks
  const address = pitch.location;
  const description = pitch.description;
  const priceDisplay = `$${pitch.price} per hour`;
  const facilities = pitch.facilities || [];
  
  const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;

  // Helper function to render facility icons
  const getFacilityIcon = (facilityName: string): JSX.Element => {
    const lowerFacilityName = facilityName.toLowerCase();
    
    // Return appropriate SVG icon based on facility name
    return (
      <span className="rounded-full bg-teal-100 dark:bg-teal-900 p-1 mr-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-600 dark:text-teal-400">
          <path d="M12 2L3 8V21H21V8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  };

  return (
    <>
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
                  aria-label={`View ${address} on Google Maps`}
                >
                  {pitch.location}
                </a>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Main image and gallery thumbnails */}
            <div className="relative">
              <img
                src={galleryPhotos[currentPhotoIndex]}
                alt={pitch.name}
                className="w-full h-60 object-cover rounded-md mb-2 cursor-pointer"
                onClick={() => setShowFullGallery(true)}
              />
              
              {galleryPhotos.length > 1 && (
                <>
                  {/* Navigation buttons */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevPhoto();
                    }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-white bg-black/50 hover:bg-black/70 rounded-full"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextPhoto();
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-white bg-black/50 hover:bg-black/70 rounded-full"
                  >
                    <ChevronRight size={20} />
                  </Button>
                  
                  {/* Gallery thumbnails */}
                  <div className="flex justify-center mt-2 space-x-2">
                    {galleryPhotos.map((photo, idx) => (
                      <div 
                        key={idx} 
                        className={`w-12 h-12 rounded-md overflow-hidden cursor-pointer transition-all ${idx === currentPhotoIndex ? 'ring-2 ring-teal-500 ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                        onClick={() => setCurrentPhotoIndex(idx)}
                      >
                        <img 
                          src={photo} 
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-1 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-[#0F766E]" />
                About this Pitch
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {description}
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
                      aria-label={`View ${address} on Google Maps`}
                    >
                      {address}
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
                      {priceDisplay}
                    </p>
                  </div>
                </div>
                
                {/* Opening hours section - only show if available */}
                {pitch.openingHours && (
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium">Opening Hours</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {pitch.openingHours}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {facilities && facilities.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-2">Facilities</h3>
                <div className="flex flex-wrap gap-3">
                  {facilities.map((facility, idx) => (
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
      
      {/* Full-screen gallery */}
      <Dialog open={showFullGallery} onOpenChange={setShowFullGallery}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black/90 border-0">
          <div className="relative h-full w-full flex items-center justify-center">
            {/* Close button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowFullGallery(false)}
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

export default PitchDetailsDialog;
