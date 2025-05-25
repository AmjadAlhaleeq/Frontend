
import React, { useState } from "react";
import { 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Wifi,
  Car,
  Coffee,
  Shield,
  Shirt,
  Droplets,
  Camera,
  TreePine,
  Zap,
  Wind
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
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
  const facilities = pitch.facilities || [];
  
  const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;

  // Helper function to render facility icons with real icons
  const getFacilityIcon = (facilityName: string): JSX.Element => {
    const lowerFacilityName = facilityName.toLowerCase();
    
    let IconComponent = CheckCircle; // default
    let colorClass = "text-teal-600 dark:text-teal-400";
    
    // Map facility names to appropriate icons
    if (lowerFacilityName.includes('wifi') || lowerFacilityName.includes('internet')) {
      IconComponent = Wifi;
      colorClass = "text-blue-600 dark:text-blue-400";
    } else if (lowerFacilityName.includes('parking') || lowerFacilityName.includes('car')) {
      IconComponent = Car;
      colorClass = "text-gray-600 dark:text-gray-400";
    } else if (lowerFacilityName.includes('cafe') || lowerFacilityName.includes('coffee') || lowerFacilityName.includes('restaurant')) {
      IconComponent = Coffee;
      colorClass = "text-orange-600 dark:text-orange-400";
    } else if (lowerFacilityName.includes('security') || lowerFacilityName.includes('guard')) {
      IconComponent = Shield;
      colorClass = "text-red-600 dark:text-red-400";
    } else if (lowerFacilityName.includes('changing') || lowerFacilityName.includes('locker') || lowerFacilityName.includes('room')) {
      IconComponent = Shirt;
      colorClass = "text-purple-600 dark:text-purple-400";
    } else if (lowerFacilityName.includes('shower') || lowerFacilityName.includes('water') || lowerFacilityName.includes('toilet')) {
      IconComponent = Droplets;
      colorClass = "text-cyan-600 dark:text-cyan-400";
    } else if (lowerFacilityName.includes('cctv') || lowerFacilityName.includes('camera')) {
      IconComponent = Camera;
      colorClass = "text-indigo-600 dark:text-indigo-400";
    } else if (lowerFacilityName.includes('garden') || lowerFacilityName.includes('green') || lowerFacilityName.includes('outdoor')) {
      IconComponent = TreePine;
      colorClass = "text-green-600 dark:text-green-400";
    } else if (lowerFacilityName.includes('light') || lowerFacilityName.includes('flood')) {
      IconComponent = Zap;
      colorClass = "text-yellow-600 dark:text-yellow-400";
    } else if (lowerFacilityName.includes('air') || lowerFacilityName.includes('conditioning') || lowerFacilityName.includes('climate')) {
      IconComponent = Wind;
      colorClass = "text-sky-600 dark:text-sky-400";
    }
    
    return (
      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-2 mr-3">
        <IconComponent className={`h-5 w-5 ${colorClass}`} />
      </div>
    );
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{pitch.name}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center mt-2 mb-4">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-base text-gray-600 dark:text-gray-300 hover:underline hover:text-teal-600"
                  aria-label={`View ${address} on Google Maps`}
                >
                  {pitch.location}
                </a>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Main image and gallery thumbnails */}
            <div className="relative">
              <img
                src={galleryPhotos[currentPhotoIndex]}
                alt={pitch.name}
                className="w-full h-72 object-cover rounded-lg mb-4 cursor-pointer shadow-lg"
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
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-10 w-10 text-white bg-black/60 hover:bg-black/80 rounded-full shadow-lg"
                  >
                    <ChevronLeft size={24} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextPhoto();
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 text-white bg-black/60 hover:bg-black/80 rounded-full shadow-lg"
                  >
                    <ChevronRight size={24} />
                  </Button>
                  
                  {/* Gallery thumbnails */}
                  <div className="flex justify-center mt-3 space-x-2">
                    {galleryPhotos.map((photo, idx) => (
                      <div 
                        key={idx} 
                        className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer transition-all shadow-md ${
                          idx === currentPhotoIndex 
                            ? 'ring-3 ring-teal-500 ring-offset-2 scale-105' 
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
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

            {/* About Section */}
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <CheckCircle className="h-6 w-6 mr-3 text-teal-600" />
                About this Pitch
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {description || "A premium football pitch perfect for competitive matches and training sessions."}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-teal-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-lg">Players Format</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {pitch.playersPerSide} vs {pitch.playersPerSide} players
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-lg">Location</h4>
                    <a 
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:underline hover:text-blue-600"
                      aria-label={`View ${address} on Google Maps`}
                    >
                      {address}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Badge 
                    className={`text-lg px-3 py-1 ${
                      pitch.type === 'indoor' 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {pitch.type === 'indoor' ? 'Indoor Pitch' : 'Outdoor Pitch'}
                  </Badge>
                </div>
                
                {/* Opening hours section */}
                {pitch.openingHours && (
                  <div className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-lg">Opening Hours</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {pitch.openingHours}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Facilities Section */}
            {facilities && facilities.length > 0 && (
              <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-6 w-6 mr-3 text-teal-600" />
                  Available Facilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {facilities.map((facility, idx) => (
                    <div
                      key={idx}
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {getFacilityIcon(facility)}
                      <span className="text-base font-medium capitalize">
                        {facility.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Button variant="outline" onClick={onClose} className="px-6 py-2 text-base">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Full-screen gallery */}
      <Dialog open={showFullGallery} onOpenChange={setShowFullGallery}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black/95 border-0">
          <div className="relative h-full w-full flex items-center justify-center">
            {/* Close button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowFullGallery(false)}
              className="absolute top-4 right-4 h-10 w-10 text-white bg-black/50 hover:bg-black/70 z-10 rounded-full"
            >
              <X size={24} />
            </Button>
            
            {/* Main image */}
            <div className="w-full h-full flex items-center justify-center p-4">
              <img 
                src={galleryPhotos[currentPhotoIndex]} 
                alt={`${pitch.name} - Photo ${currentPhotoIndex + 1}`}
                className="max-h-[80vh] max-w-full object-contain rounded-lg"
              />
            </div>
            
            {/* Navigation buttons */}
            {galleryPhotos.length > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={prevPhoto}
                  className="absolute left-4 h-12 w-12 text-white bg-black/50 hover:bg-black/70 rounded-full"
                >
                  <ChevronLeft size={28} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={nextPhoto}
                  className="absolute right-4 h-12 w-12 text-white bg-black/50 hover:bg-black/70 rounded-full"
                >
                  <ChevronRight size={28} />
                </Button>
                
                {/* Photo counter */}
                <div className="absolute bottom-6 left-0 right-0 text-center text-white text-lg bg-black/50 py-2 rounded-lg mx-4">
                  Photo {currentPhotoIndex + 1} of {galleryPhotos.length}
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
