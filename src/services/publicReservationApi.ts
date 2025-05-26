
import { BackendReservation } from './reservationTypes';
import { API_BASE, getAuthHeaders } from './reservationHelpers';

// Public routes
export const getAllReservations = async (): Promise<BackendReservation[]> => {
  const response = await fetch(`${API_BASE}/reservations`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch reservations');
  }
  
  const data = await response.json();
  return data.data?.reservations || data.data || [];
};

export const getReservationById = async (id: string): Promise<BackendReservation> => {
  const response = await fetch(`${API_BASE}/reservations/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch reservation');
  }
  
  const data = await response.json();
  return data.data?.reservation || data.data;
};

export const fetchPitches = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE}/pitches`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch pitches');
  }
  
  const data = await response.json();
  return data.data?.pitches || data.data || [];
};
