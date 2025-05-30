
import { useState, useEffect } from 'react';

interface WaitingListState {
  [reservationId: string]: boolean;
}

export const useWaitingListPersistence = (userId: string | null) => {
  const [waitingListState, setWaitingListState] = useState<WaitingListState>({});

  // Load waiting list state from localStorage on mount
  useEffect(() => {
    if (!userId) return;

    const stored = localStorage.getItem(`waitingList_${userId}`);
    if (stored) {
      try {
        setWaitingListState(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing waiting list state:', error);
      }
    }
  }, [userId]);

  // Save waiting list state to localStorage whenever it changes
  useEffect(() => {
    if (!userId) return;

    localStorage.setItem(`waitingList_${userId}`, JSON.stringify(waitingListState));
  }, [waitingListState, userId]);

  const addToWaitingList = (reservationId: string) => {
    setWaitingListState(prev => ({ ...prev, [reservationId]: true }));
  };

  const removeFromWaitingList = (reservationId: string) => {
    setWaitingListState(prev => {
      const newState = { ...prev };
      delete newState[reservationId];
      return newState;
    });
  };

  const isInWaitingList = (reservationId: string): boolean => {
    return waitingListState[reservationId] || false;
  };

  return {
    addToWaitingList,
    removeFromWaitingList,
    isInWaitingList,
  };
};
