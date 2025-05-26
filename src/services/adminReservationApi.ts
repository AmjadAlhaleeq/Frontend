
import { BackendReservation, CreateReservationRequest, KickPlayerRequest, AddSummaryRequest } from './reservationTypes';
import { API_BASE, requireAuth } from './reservationHelpers';

// Admin routes
export const createReservation = async (reservationData: CreateReservationRequest): Promise<BackendReservation> => {
  const token = requireAuth();
  
  const response = await fetch(`${API_BASE}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(reservationData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create reservation');
  }
  
  const data = await response.json();
  return data.data?.reservation || data.data;
};

export const deleteReservationApi = async (id: string): Promise<void> => {
  const token = requireAuth();
  
  const response = await fetch(`${API_BASE}/reservations/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete reservation');
  }
};

export const kickPlayer = async (reservationId: string, kickData: KickPlayerRequest): Promise<void> => {
  const token = requireAuth();
  
  const response = await fetch(`${API_BASE}/reservations/${reservationId}/kick`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(kickData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to kick player');
  }
};

export const addGameSummary = async (reservationId: string, summaryData: AddSummaryRequest): Promise<void> => {
  const token = requireAuth();
  
  const response = await fetch(`${API_BASE}/reservations/${reservationId}/summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(summaryData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add summary');
  }
};
