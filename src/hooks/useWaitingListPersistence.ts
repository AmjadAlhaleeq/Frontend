
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
    console.log('Adding to waiting list:', reservationId);
    setWaitingListState(prev => ({ ...prev, [reservationId]: true }));
  };

  const removeFromWaitingList = (reservationId: string) => {
    console.log('Removing from waiting list:', reservationId);
    setWaitingListState(prev => {
      const newState = { ...prev };
      delete newState[reservationId];
      return newState;
    });
  };

  const isInWaitingList = (reservationId: string): boolean => {
    const result = waitingListState[reservationId] || false;
    console.log(`Checking waiting list for ${reservationId}:`, result);
    return result;
  };

  // Clear waiting list state for a specific reservation - useful when user joins main game
  const clearWaitingListState = (reservationId: string) => {
    console.log('Clearing waiting list state for:', reservationId);
    setWaitingListState(prev => {
      const newState = { ...prev };
      delete newState[reservationId];
      return newState;
    });
  };

  // Sync with server data - add this function to sync local state with server
  const syncWithServerData = (reservations: any[]) => {
    if (!userId) return;

    const updatedState = { ...waitingListState };
    let hasChanges = false;

    reservations.forEach(reservation => {
      const reservationKey = reservation.id?.toString() || reservation.backendId;
      const isInServerWaitlist = reservation.waitingList?.includes(userId) || reservation.waitList?.includes(userId);
      const isInLocalWaitlist = updatedState[reservationKey];

      if (isInServerWaitlist && !isInLocalWaitlist) {
        updatedState[reservationKey] = true;
        hasChanges = true;
        console.log(`Syncing: Added ${reservationKey} to local waitlist`);
      } else if (!isInServerWaitlist && isInLocalWaitlist) {
        delete updatedState[reservationKey];
        hasChanges = true;
        console.log(`Syncing: Removed ${reservationKey} from local waitlist`);
      }
    });

    if (hasChanges) {
      setWaitingListState(updatedState);
    }
  };

  return {
    addToWaitingList,
    removeFromWaitingList,
    isInWaitingList,
    syncWithServerData,
    clearWaitingListState,
  };
};
