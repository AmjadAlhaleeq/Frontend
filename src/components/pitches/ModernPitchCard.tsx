// ModernPitchCard.tsx
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Star,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Wifi,
  Car,
  Coffee,
  Shirt,
  Droplets,
  Heart,
  Share2,
  Play,
} from "lucide-react";

interface PitchData {
  _id: string;
  name: string;
  location: string;
  city: string;
  type: "indoor" | "outdoor";
  description: string;
  image: string;
  additionalImages?: string[];
  facilities: string[];
  openingHours: string;
  playersPerSide: number;
  price: number;
  rating?: number;
  totalReviews?: number;
  availability?: "available" | "busy" | "closed";
  nextAvailableSlot?: string;
}

interface ModernPitchCardProps {
  pitch: PitchData;
  onBookNow?: (pitchId: string) => void;
  onViewDetails?: (pitch: PitchData) => void;
  onShare?: (pitch: PitchData) => void;
  showFavorite?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (pitchId: string) => void;
  apiEndpoint?: string;
}

const facilityIcons: Partial<
  Record<
    PitchData["facilities"][number],
    React.ComponentType<{ className?: string }>
  >
> = {
  wifi: Wifi,
  parking: Car,
  cafe: Coffee,
  changing_rooms: Shirt,
  showers: Droplets,
};

const ModernPitchCard: React.FC<ModernPitchCardProps> = ({
  pitch,
  onBookNow,
  onViewDetails,
  onShare,
  showFavorite = true,
  isFavorited = false,
  onToggleFavorite,
  apiEndpoint,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const allImages = [pitch.image, ...(pitch.additionalImages || [])].filter(
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

  const handleBookNow = async () => {
    setIsLoading(true);
    try {
      if (onBookNow) {
        await onBookNow(pitch._id);
      } else if (apiEndpoint) {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing token");

        await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pitchId: pitch._id }),
        });
      }
    } catch (err) {
      console.error("Booking failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailabilityStatus = () => {
    const statusConfig = {
      available: {
        color: "bg-emerald-500",
        text: "Available Now",
        textColor: "text-emerald-700",
        bgColor: "bg-emerald-50",
      },
      busy: {
        color: "bg-amber-500",
        text: "Busy",
        textColor: "text-amber-700",
        bgColor: "bg-amber-50",
      },
      closed: {
        color: "bg-red-500",
        text: "Closed",
        textColor: "text-red-700",
        bgColor: "bg-red-50",
      },
    };
    return statusConfig[pitch.availability || "available"];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const status = getAvailabilityStatus();

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white dark:bg-gray-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={allImages[currentImageIndex]}
          alt={pitch.name}
          onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className={`absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition-all duration-300 ${
                isHovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition-all duration-300 ${
                isHovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-2"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Badge
            className={`${
              pitch.type === "indoor"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            } text-white font-medium`}
          >
            {pitch.type === "indoor" ? "🏢 Indoor" : "🌞 Outdoor"}
          </Badge>
          <div
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${status.textColor} ${status.bgColor} backdrop-blur-sm`}
          >
            <div
              className={`w-2 h-2 rounded-full ${status.color} mr-2 animate-pulse`}
            />
            {status.text}
          </div>
        </div>

        {showFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(pitch._id);
            }}
            className="absolute top-4 left-4 bg-white/90 hover:bg-white rounded-full p-2.5 transition-all duration-300 group/heart"
          >
            <Heart
              className={`h-4 w-4 transition-all duration-300 ${
                isFavorited
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-gray-600 group-hover/heart:text-red-500"
              }`}
            />
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="font-bold text-xl mb-2 line-clamp-1">{pitch.name}</h3>
          <div className="flex items-center text-sm opacity-90 mb-3">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{pitch.city}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {pitch.playersPerSide}v{pitch.playersPerSide}
              </div>
              {pitch.rating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
                  {pitch.rating.toFixed(1)}
                </div>
              )}
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">
                {formatPrice(pitch.price)}
              </span>
              <span className="text-sm opacity-75">/hour</span>
            </div>
          </div>
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Play className="h-8 w-8 text-white fill-white" />
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-5">
        {pitch.openingHours && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            <span>{pitch.openingHours}</span>
          </div>
        )}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Available Facilities
          </h4>
          <div className="flex flex-wrap gap-2">
            {pitch.facilities.slice(0, 3).map((facility, index) => {
              const Icon = facilityIcons[facility] || Coffee;
              return (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs flex items-center gap-1.5 px-2.5 py-1"
                >
                  <Icon className="h-3 w-3 text-blue-500" />
                  {facility.replace("_", " ")}
                </Badge>
              );
            })}
            {pitch.facilities.length > 3 && (
              <Badge variant="outline" className="text-xs px-2.5 py-1">
                +{pitch.facilities.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {pitch.nextAvailableSlot && (
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg p-3">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 text-emerald-600 mr-2" />
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                Next slot: {pitch.nextAvailableSlot}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleBookNow}
            disabled={isLoading || pitch.availability === "closed"}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 transition-all duration-300"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Calendar className="h-4 w-4 mr-2" />
            )}
            {pitch.availability === "closed" ? "Closed" : "Book Now"}
          </Button>

          <Button
            onClick={() => onViewDetails?.(pitch)}
            variant="outline"
            size="icon"
            className="flex-shrink-0 border-2 hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => onShare?.(pitch)}
            variant="outline"
            size="icon"
            className="flex-shrink-0 border-2 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernPitchCard;
