
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Star, 
  Users, 
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Wifi,
  Car,
  Coffee,
  Shield,
  Heart,
  Share2,
  ExternalLink
} from "lucide-react";

interface PitchData {
  _id: string;
  name: string;
  location: string;
  city: string;
  type: 'indoor' | 'outdoor';
  description: string;
  image: string;
  additionalImages?: string[];
  facilities: string[];
  openingHours: string;
  playersPerSide: number;
  price: number;
  rating?: number;
  totalReviews?: number;
  availability?: 'available' | 'busy' | 'closed';
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

const facilityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  cafe: Coffee,
  security: Shield,
  changing_rooms: Users,
  showers: Users,
  cctv: Eye,
  outdoor_area: Users,
  floodlights: Star,
  air_conditioning: Users,
};

const ModernPitchCard: React.FC<ModernPitchCardProps> = ({
  pitch,
  onBookNow,
  onViewDetails,
  onShare,
  showFavorite = true,
  isFavorited = false,
  onToggleFavorite,
  apiEndpoint
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const allImages = [pitch.image, ...(pitch.additionalImages || [])].filter(Boolean);
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleBookNow = async () => {
    if (!onBookNow) return;
    setIsLoading(true);
    try {
      await onBookNow(pitch._id);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailabilityStatus = () => {
    const statusConfig = {
      available: { color: 'bg-green-500', text: 'Available', textColor: 'text-green-700' },
      busy: { color: 'bg-yellow-500', text: 'Busy', textColor: 'text-yellow-700' },
      closed: { color: 'bg-red-500', text: 'Closed', textColor: 'text-red-700' }
    };
    
    return statusConfig[pitch.availability || 'available'];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const status = getAvailabilityStatus();

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-white dark:bg-gray-900">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={allImages[currentImageIndex]}
          alt={pitch.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Image Navigation */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
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

        {/* Top-right badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Badge className={`${pitch.type === 'indoor' ? 'bg-purple-600' : 'bg-green-600'} text-white`}>
            {pitch.type}
          </Badge>
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.textColor} bg-white/90`}>
            <div className={`w-2 h-2 rounded-full ${status.color} mr-1.5`} />
            {status.text}
          </div>
        </div>

        {/* Favorite Button */}
        {showFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(pitch._id);
            }}
            className="absolute top-3 left-3 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
        )}

        {/* Bottom overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{pitch.name}</h3>
          <div className="flex items-center text-sm opacity-90">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{pitch.city}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Rating and Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {pitch.rating && (
              <>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{pitch.rating.toFixed(1)}</span>
                {pitch.totalReviews && (
                  <span className="text-sm text-gray-500">({pitch.totalReviews})</span>
                )}
              </>
            )}
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-teal-600">{formatPrice(pitch.price)}</span>
            <span className="text-sm text-gray-500">/hour</span>
          </div>
        </div>

        {/* Pitch Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {pitch.playersPerSide}v{pitch.playersPerSide}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span className="truncate">{pitch.openingHours || 'Hours vary'}</span>
          </div>
        </div>

        {/* Facilities */}
        <div>
          <h4 className="text-sm font-medium mb-2">Facilities</h4>
          <div className="flex flex-wrap gap-1">
            {pitch.facilities.slice(0, 4).map((facility, index) => {
              const Icon = facilityIcons[facility] || Shield;
              return (
                <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {facility.replace('_', ' ')}
                </Badge>
              );
            })}
            {pitch.facilities.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{pitch.facilities.length - 4}
              </Badge>
            )}
          </div>
        </div>

        {/* Next Available Slot */}
        {pitch.nextAvailableSlot && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-700 dark:text-green-400">
                Next available: {pitch.nextAvailableSlot}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleBookNow}
            disabled={isLoading || pitch.availability === 'closed'}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Calendar className="h-4 w-4 mr-2" />
            )}
            {pitch.availability === 'closed' ? 'Closed' : 'Book Now'}
          </Button>
          
          <Button
            onClick={() => onViewDetails?.(pitch)}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => onShare?.(pitch)}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernPitchCard;
