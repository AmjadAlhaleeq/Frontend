
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPin, Star, Users } from "lucide-react";
import { useReservation } from "@/context/ReservationContext";
import { useNavigate } from "react-router-dom";

interface PitchCardProps {
  id: number;
  name: string;
  location: string;
  imageUrl: string;
  rating: number;
  price: number;
  amenities: string[];
  availability?: string;
}

const PitchCard: React.FC<PitchCardProps> = ({
  id,
  name,
  location,
  imageUrl,
  rating,
  price,
  amenities,
  availability
}) => {
  const [showReservations, setShowReservations] = useState(false);
  const { reservations } = useReservation();
  const navigate = useNavigate();

  // Filter reservations for this pitch
  const pitchReservations = reservations.filter(res => res.pitchName === name);
  const upcomingReservations = pitchReservations.filter(res => res.status === "upcoming");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short", 
      day: "numeric"
    });
  };

  const handleViewReservations = () => {
    navigate('/reservations', { 
      state: { 
        pitchFilter: name 
      } 
    });
  };

  return (
    <Card className="overflow-hidden border border-gray-200 transition-all hover:shadow-md">
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-4 left-4 flex items-center rounded-full bg-black/60 px-2 py-1 text-white">
          <Star className="mr-1 h-3 w-3 text-yellow-400" />
          <span className="text-xs">{rating.toFixed(1)}</span>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold">{name}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="mr-1 h-3.5 w-3.5" />
            <span>{location}</span>
          </div>
        </div>

        <div className="my-3 flex flex-wrap gap-1">
          {amenities.slice(0, 3).map((amenity, i) => (
            <Badge key={i} variant="outline" className="text-xs bg-gray-50">
              {amenity}
            </Badge>
          ))}
          {amenities.length > 3 && (
            <Badge variant="outline" className="text-xs bg-gray-50">
              +{amenities.length - 3} more
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button 
            variant="default" 
            size="sm" 
            className="bg-[#0F766E] hover:bg-[#0F766E]/90"
            onClick={() => setShowReservations(!showReservations)}
          >
            {showReservations ? "Hide Games" : "Show Games"}
          </Button>
        </div>

        {/* Reservations section */}
        {showReservations && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                Upcoming Games
              </h4>
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs p-0 h-auto text-[#0F766E]"
                onClick={handleViewReservations}
              >
                View All
              </Button>
            </div>

            {upcomingReservations.length > 0 ? (
              <div className="space-y-2">
                {upcomingReservations.slice(0, 2).map((res) => (
                  <div 
                    key={res.id} 
                    className="flex justify-between items-center p-2 rounded bg-gray-50 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={handleViewReservations}
                  >
                    <div>
                      <div className="font-medium">{formatDate(res.date)}</div>
                      <div className="text-xs text-gray-500">
                        {res.startTime && res.endTime ? `${res.startTime} - ${res.endTime}` : res.time}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1 text-[#0F766E]" />
                      <span className="text-xs">{res.maxPlayers} max</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic p-2">No upcoming games at this pitch</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PitchCard;
