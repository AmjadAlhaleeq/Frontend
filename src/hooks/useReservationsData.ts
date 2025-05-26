
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllReservations } from '@/services/reservationApi';
import { fetchPitches } from '@/services/publicReservationApi';
import { useReservation, Reservation } from '@/context/ReservationContext';

export const useReservationsData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [pitchImages, setPitchImages] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { setReservations } = useReservation();

  const loadReservations = useCallback(async () => {
    try {
      console.log('Loading reservations...');
      const response = await getAllReservations();
      console.log('Raw backend response:', response);
      
      // Handle different response formats
      let backendReservations: any[] = [];
      
      if (Array.isArray(response)) {
        backendReservations = response;
      } else if (response && typeof response === 'object') {
        const responseObj = response as any;
        if (responseObj.data?.reservations && Array.isArray(responseObj.data.reservations)) {
          backendReservations = responseObj.data.reservations;
        } else if (responseObj.data && Array.isArray(responseObj.data)) {
          backendReservations = responseObj.data;
        } else if (responseObj.reservations && Array.isArray(responseObj.reservations)) {
          backendReservations = responseObj.reservations;
        }
      }

      console.log('Processed reservations:', backendReservations);
      
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
        // Handle pitch object - it's now an object, not a string
        const pitchId = typeof res.pitch === 'string' ? res.pitch : res.pitch?._id || res.pitch?.id || 'unknown';
        const pitchName = typeof res.pitch === 'string' ? `Pitch ${res.pitch.substring(0, 8)}` : res.pitch?.name || `Pitch ${pitchId.substring(0, 8)}`;
        
        return {
          id: index + 1,
          backendId: res._id,
          pitchId: pitchId,
          pitchName: pitchName,
          location: 'Football Complex',
          city: 'City',
          date: res.date.split('T')[0],
          startTime: new Date(res.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          endTime: new Date(res.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          duration: 60,
          title: res.title,
          maxPlayers: res.maxPlayers,
          lineup: res.currentPlayers.map((playerId: string) => ({
            userId: playerId,
            name: `Player ${playerId.substring(0, 4)}`,
            playerName: `Player ${playerId.substring(0, 4)}`,
            status: 'joined' as const,
            joinedAt: new Date().toISOString()
          })),
          waitingList: res.waitList || [],
          status: (res.status || 'upcoming') as 'upcoming' | 'completed' | 'cancelled',
          createdBy: 'admin',
          price: res.price,
          time: `${new Date(res.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(res.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          playersJoined: res.currentPlayers.length,
          summary: res.summary || null
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
