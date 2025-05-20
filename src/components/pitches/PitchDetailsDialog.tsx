
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Check,
  Banknote,
  CheckCircle,
  Trash,
  Edit,
  ArrowRight,
  Image,
  Landmark
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Pitch } from '@/context/ReservationContext';
import { useToast } from '@/hooks/use-toast';

interface PitchDetailsDialogProps {
  pitch: Pitch;
  onBookPitch: () => void;
  onClose: () => void;
  userRole: 'admin' | 'player' | null;
}

/**
 * PitchDetailsDialog component
 * Displays detailed information about a pitch and allows users to book it
 * Admins can see additional options to edit or delete the pitch
 */
const PitchDetailsDialog: React.FC<PitchDetailsDialogProps> = ({
  pitch,
  onBookPitch,
  onClose,
  userRole,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get available pitch images (in a real app, these would come from the database)
  const images = [
    pitch.imageUrl || 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68',
    'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b',
    'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d'
  ].filter(Boolean);

  const handleEditPitch = () => {
    onClose();
    // In a real application, this would navigate to the edit page
    toast({
      title: 'Edit Pitch',
      description: 'Navigating to edit page for this pitch.',
    });
  };

  const handleDeletePitch = () => {
    // In a real application, this would show a confirmation dialog
    toast({
      title: 'Delete Pitch',
      description: 'This would delete the pitch after confirmation.',
      variant: 'destructive',
    });
  };

  // Navigate to the previous image
  const showPrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Navigate to the next image
  const showNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{pitch.name}</DialogTitle>
          <DialogDescription className="flex items-center mt-2">
            <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
            {pitch.location}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="details">
              <Landmark className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <Image className="h-4 w-4 mr-2" />
              Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {/* Main pitch image */}
            <div className="aspect-video rounded-md overflow-hidden">
              <img
                src={pitch.imageUrl || 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68'}
                alt={pitch.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Pitch details */}
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <div className="text-sm">
                  <span className="font-medium">Availability</span>
                  <p className="text-gray-600">{pitch.availability || '7 days a week'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <div className="text-sm">
                  <span className="font-medium">Hours</span>
                  <p className="text-gray-600">{pitch.hours || '08:00 - 22:00'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <div className="text-sm">
                  <span className="font-medium">Capacity</span>
                  <p className="text-gray-600">{pitch.capacity || '5v5, 7v7'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Banknote className="h-4 w-4 mr-2 text-gray-500" />
                <div className="text-sm">
                  <span className="font-medium">Price</span>
                  <p className="text-gray-600">{pitch.price ? `$${pitch.price}/hour` : '$60/hour'}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {(pitch.amenities || ['Changing Rooms', 'Showers', 'Free Parking', 'Floodlights', 'Equipment Rental']).map((amenity, i) => (
                  <Badge key={i} variant="outline" className="flex items-center">
                    <Check className="h-3 w-3 mr-1 text-green-500" />
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-gray-600">
                {pitch.description || 
                  'This state-of-the-art football pitch features high-quality synthetic turf ' +
                  'designed to provide excellent ball control and player comfort. ' +
                  'The pitch is fully equipped with modern facilities including changing rooms, ' +
                  'showers, and floodlights for evening games.'}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            {/* Image gallery with navigation */}
            <div className="relative aspect-video rounded-md overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={`${pitch.name} view ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation arrows */}
              <div className="absolute inset-y-0 left-0 flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50"
                  onClick={showPrevImage}
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  <span className="sr-only">Previous image</span>
                </Button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50"
                  onClick={showNextImage}
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">Next image</span>
                </Button>
              </div>
              
              {/* Image counter */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="px-2 py-1 bg-black/50 rounded-full text-white text-xs">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {images.map((image, index) => (
                <div 
                  key={index}
                  className={`aspect-video rounded-md overflow-hidden cursor-pointer ${
                    index === currentImageIndex ? 'ring-2 ring-teal-500' : ''
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${pitch.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {userRole === 'admin' ? (
            <div className="flex space-x-2 w-full">
              <Button
                variant="outline"
                onClick={handleDeletePitch}
                className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={handleEditPitch}
                className="flex-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            </div>
          ) : (
            <div className="w-full flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={onBookPitch} className="bg-teal-600 hover:bg-teal-700 mb-2 sm:mb-0">
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Book This Pitch
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PitchDetailsDialog;
