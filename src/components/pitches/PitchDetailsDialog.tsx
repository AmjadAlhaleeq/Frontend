import React, { useState } from "react";
import {
  MapPin,
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
  Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pitch } from "@/types/reservation";

interface PitchDetailsDialogProps {
  pitch: Pitch;
  onClose: () => void;
  onBookPitch: () => void;
  userRole: "admin" | "player" | null;
}

const PitchDetailsDialog: React.FC<PitchDetailsDialogProps> = ({
  pitch,
  onClose,
  userRole,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);

  // Use backgroundImage and images array from new structure
  const galleryPhotos = [pitch.backgroundImage, ...(pitch.images || [])].filter(
    Boolean
  );

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length
    );
  };

  const address = pitch.location;
  const description = pitch.description;
  const facilities = Object.entries(pitch.services || {})
    .filter(([key, value]) => key !== "type" && value === true)
    .map(([key]) => key);

  const googleMapsUrl = address;

  const getFacilityIcon = (facilityName: string): JSX.Element => {
    const lower = facilityName.toLowerCase();
    let Icon = CheckCircle;
    let color = "text-teal-600";

    if (lower.includes("wifi")) {
      Icon = Wifi;
      color = "text-blue-600";
    } else if (lower.includes("parking")) {
      Icon = Car;
      color = "text-gray-600";
    } else if (lower.includes("cafe") || lower.includes("coffee")) {
      Icon = Coffee;
      color = "text-orange-600";
    } else if (lower.includes("security")) {
      Icon = Shield;
      color = "text-red-600";
    } else if (lower.includes("locker") || lower.includes("changing")) {
      Icon = Shirt;
      color = "text-purple-600";
    } else if (
      lower.includes("bathroom") ||
      lower.includes("shower") ||
      lower.includes("water")
    ) {
      Icon = Droplets;
      color = "text-cyan-600";
    } else if (lower.includes("cctv") || lower.includes("camera")) {
      Icon = Camera;
      color = "text-indigo-600";
    } else if (lower.includes("outdoor") || lower.includes("green")) {
      Icon = TreePine;
      color = "text-green-600";
    } else if (lower.includes("light") || lower.includes("flood")) {
      Icon = Zap;
      color = "text-yellow-600";
    } else if (lower.includes("air") || lower.includes("condition")) {
      Icon = Wind;
      color = "text-sky-600";
    }

    return (
      <div className="rounded-full bg-gray-100 p-2 mr-3">
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
    );
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {pitch.name}
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center mt-2 mb-4">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />

                {pitch.city}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image preview */}
            <div className="relative">
              <img
                src={galleryPhotos[currentPhotoIndex]}
                alt={pitch.name}
                className="w-full h-72 object-cover rounded-lg mb-4 cursor-pointer shadow-lg"
                onClick={() => setShowFullGallery(true)}
              />

              {galleryPhotos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevPhoto();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 text-white bg-black/60 hover:bg-black/80 rounded-full"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 text-white bg-black/60 hover:bg-black/80 rounded-full"
                  >
                    <ChevronRight size={24} />
                  </Button>
                </>
              )}
            </div>

            {/* About */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <CheckCircle className="h-6 w-6 mr-3 text-teal-600" />
                About this Pitch
              </h3>
              <p className="text-gray-700">{description}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-teal-50 rounded-lg">
                  <Users className="h-6 w-6 text-teal-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-lg">Players Format</h4>
                    <p className="text-gray-600">
                      {pitch.playersPerSide} vs {pitch.playersPerSide} players
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-lg">Location</h4>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:underline hover:text-blue-600"
                    >
                      {"click here to see directions"}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <Badge
                    className={`text-lg px-3 py-1 ${
                      typeof pitch.services?.type === "string" &&
                      pitch.services.type.toLowerCase() === "indoor"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {typeof pitch.services?.type === "string"
                      ? pitch.services.type
                      : "Pitch Type"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Facilities */}
            {facilities.length > 0 && (
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-6 w-6 mr-3 text-teal-600" />
                  Available Facilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {facilities.map((facility, idx) => (
                    <div
                      key={idx}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {getFacilityIcon(facility)}
                      <span className="text-base font-medium capitalize">
                        {facility.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 py-2 text-base"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Gallery */}
      <Dialog open={showFullGallery} onOpenChange={setShowFullGallery}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black/95 border-0">
          <div className="relative h-full w-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFullGallery(false)}
              className="absolute top-4 right-4 h-10 w-10 text-white bg-black/50 hover:bg-black/70 z-10 rounded-full"
            >
              <X size={24} />
            </Button>
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={galleryPhotos[currentPhotoIndex]}
                alt={`${pitch.name} - Photo ${currentPhotoIndex + 1}`}
                className="max-h-[80vh] max-w-full object-contain rounded-lg"
              />
            </div>
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
