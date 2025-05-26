
import { useState, useEffect } from 'react';
import { useReservation } from '@/context/ReservationContext';
import { getAllReservations, transformReservation, BackendReservation } from '@/services/reservationApi';

export const useReservationsData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [pitchImages, setPitchImages] = useState<Record<string, string>>({});
  const { setReservations } = useReservation();

  const loadReservations = async () => {
    try {
      setIsLoading(true);
      const backendReservations = await getAllReservations();
      
      // Transform backend reservations to frontend format
      const frontendReservations = backendReservations.map(transformReservation);
      
      // Extract pitch images
      const images: Record<string, string> = {};
      backendReservations.forEach(res => {
        images[res.pitch._id] = res.pitch.backgroundImage;
      });
      
      setReservations(frontendReservations);
      setPitchImages(images);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  return {
    isLoading,
    pitchImages,
    loadReservations
  };
};
