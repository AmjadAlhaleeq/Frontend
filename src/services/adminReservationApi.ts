
import { CreateReservationRequest, KickPlayerRequest, GameSummary } from './reservationTypes';
import { API_BASE, requireAuth } from './reservationHelpers';

// Admin routes
export const createReservation = async (reservationData: CreateReservationRequest): Promise<any> => {
  const token = requireAuth();
  
  const response = await fetch(`${API_BASE}/reservations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reservationData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create reservation');
  }
  
  const data = await response.json();
  return data.data || data;
};

export const deleteReservationApi = async (reservationId: string): Promise<void> => {
  const token = requireAuth();
  
  const response = await fetch(`${API_BASE}/reservations/${reservationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete reservation');
  }
};

export const kickPlayer = async (reservationId: string, playerId: string): Promise<void> => {
  const token = requireAuth();
  
  const response = await fetch(`${API_BASE}/reservations/${reservationId}/kick`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerId }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to kick player');
  }
};

export const addGameSummary = async (reservationId: string, summaryData: { summary: string; playerStats: any[] }): Promise<void> => {
  const token = requireAuth();
  
  const response = await fetch(`${API_BASE}/reservations/${reservationId}/summary`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(summaryData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add game summary');
  }
};
