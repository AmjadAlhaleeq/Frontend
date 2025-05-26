
import { API_BASE, requireAuth } from './reservationHelpers';

// Player routes
export const joinReservation = async (reservationId: string): Promise<void> => {
  const token = requireAuth();
  
  const response = await fetch(`${API_BASE}/reservations/${reservationId}/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to join reservation');
  }
};

export const cancelReservation = async (reservationId: string): Promise<void> => {
  const token = requireAuth();
  
  const response = await fetch(`${API_BASE}/reservations/${reservationId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to cancel reservation');
  }
};

export const removeFromWaitlist = async (reservationId: string): Promise<void> => {
  const token = requireAuth();
  
  const response = await fetch(`${API_BASE}/reservations/${reservationId}/waitlist/remove`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to remove from waitlist');
  }
};
