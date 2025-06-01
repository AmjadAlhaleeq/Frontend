
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useReservation } from '@/context/ReservationContext';
import { Reservation } from '@/types/reservation';
import { fetchReservations, fetchPitches } from '@/lib/api';

export const useReservationsData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [pitchImages, setPitchImages] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { setReservations } = useReservation();

  const loadReservations = useCallback(async () => {
    try {
      console.log('Loading reservations...');
      const backendReservations = await fetchReservations();
      console.log('Raw backend response:', backendReservations);
      
      if (!Array.isArray(backendReservations)) {
        console.error('Backend reservations is not an array:', backendReservations);
        toast({
          title: "Error",
          description: "Invalid data format received from server",
          variant: "destructive",
        });
        return;
      }
      
      const transformedReservations = backendReservations.map((res, index) => {
        // Handle pitch object - it's populated with full pitch data
        const pitchId = res.pitch?._id || 'unknown';
        const pitchName = res.pitch?.name || `Pitch ${pitchId.substring(0, 8)}`;
        const pitchLocation = res.pitch?.location || 'Football Complex';
        
        const now = new Date();
        const endTime = new Date(res.endTime);
        let status: "upcoming" | "completed" | "cancelled" = res.status || 'upcoming';
        if (endTime < now && status === 'upcoming') status = "completed";
        
        return {
          id: index + 1,
          backendId: res._id,
          pitchId: pitchId,
          pitchName: pitchName,
          location: pitchLocation,
          city: res.pitch?.city || 'City',
          date: res.date.split('T')[0],
          startTime: new Date(res.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          endTime: new Date(res.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          duration: 60,
          title: res.title,
          maxPlayers: res.maxPlayers,
          lineup: res.currentPlayers.map((player: any) => ({
            userId: player._id,
            name: `${player.firstName} ${player.lastName}`,
            playerName: `${player.firstName} ${player.lastName}`,
            status: 'joined' as const,
            joinedAt: new Date().toISOString(),
            avatar: player.profilePicture || ''
          })),
          waitList: res.waitList || [],
          status,
          createdBy: 'admin',
          price: res.price,
          time: `${new Date(res.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(res.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          playersJoined: res.currentPlayers.length,
          summary: res.summary || null,
          backgroundImage: res.pitch?.backgroundImage,
          // Add pitch details for reservation details display
          pitch: {
            _id: res.pitch?._id,
            name: res.pitch?.name,
            location: res.pitch?.location,
            city: res.pitch?.city,
            playersPerSide: res.pitch?.playersPerSide,
            services: res.pitch?.services,
            description: res.pitch?.description,
            images: res.pitch?.images,
            backgroundImage: res.pitch?.backgroundImage
          }
        };
      });
      
      console.log('Transformed reservations:', transformedReservations);
      setReservations(transformedReservations);
    } catch (error) {
      console.error("Error loading reservations:", error);
      toast({
        title: "Error",
        description: "Failed to load reservations from server",
        variant: "destructive",
      });
    }
  }, [setReservations, toast]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadReservations();

        try {
          const pitches = await fetchPitches();
          const imageMap: Record<string, string> = {};
          pitches.forEach((pitch: any) => {
            if (pitch._id && pitch.backgroundImage) {
              imageMap[pitch._id] = pitch.backgroundImage;
            }
          });
          setPitchImages(imageMap);
        } catch (error) {
          console.error("Error fetching pitches:", error);
        }
        
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [loadReservations]);

  return {
    isLoading,
    pitchImages,
    loadReservations
  };
};
