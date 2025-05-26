
import { useState, useEffect } from 'react';
import { useReservation } from '@/context/ReservationContext';
import { getAllReservations, transformReservation, BackendReservation } from '@/services/reservationApi';

/**
 * Custom hook for managing reservations data
 * Handles loading, transforming, and caching reservation data from backend
 */
export const useReservationsData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [pitchImages, setPitchImages] = useState<Record<string, string>>({});
  const { setReservations } = useReservation();

  /**
   * Loads all reservations from backend and transforms them for frontend use
   * Ensures proper data isolation between different reservations
   */
  const loadReservations = async () => {
    try {
      setIsLoading(true);
      
      // Fetch fresh data from backend
      const backendReservations = await getAllReservations();
      console.log('Loaded reservations from backend:', backendReservations.length);
      
      // Transform backend reservations to frontend format with unique IDs
      const frontendReservations = backendReservations.map((res, index) => {
        const transformed = transformReservation(res);
        // Ensure unique frontend ID to prevent data mixing
        transformed.id = Date.now() + index;
        return transformed;
      });
      
      // Extract pitch images mapping
      const images: Record<string, string> = {};
      backendReservations.forEach(res => {
        if (res.pitch?._id && res.pitch?.backgroundImage) {
          images[res.pitch._id] = res.pitch.backgroundImage;
        }
      });
      
      // Update state with fresh data
      setReservations(frontendReservations);
      setPitchImages(images);
      
      console.log('Successfully loaded and transformed reservations:', frontendReservations.length);
    } catch (error) {
      console.error('Error loading reservations:', error);
      // Don't throw error, just log it to prevent page crashes
    } finally {
      setIsLoading(false);
    }
  };

  // Load reservations on mount
  useEffect(() => {
    loadReservations();
  }, []);

  return {
    isLoading,
    pitchImages,
    loadReservations
  };
};
