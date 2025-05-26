
import { useState, useCallback } from 'react';
import { Pitch } from '@/types/reservation';

export const usePitchOperations = () => {
  const [pitches, setPitches] = useState<Pitch[]>([]);

  const addPitch = useCallback((pitch: Pitch) => {
    setPitches(prev => [...prev, pitch]);
  }, []);

  const updatePitch = useCallback((id: string, updates: Partial<Pitch>) => {
    setPitches(prevPitches =>
      prevPitches.map(pitch => 
        pitch._id === id ? { ...pitch, ...updates } : pitch
      )
    );
  }, []);

  const deletePitch = useCallback((id: number) => {
    setPitches(prevPitches =>
      prevPitches.filter(pitch => Number(pitch._id) !== id)
    );
  }, []);

  return {
    pitches,
    setPitches,
    addPitch,
    updatePitch,
    deletePitch
  };
};
