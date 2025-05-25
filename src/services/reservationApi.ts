
import { API_BASE_URL } from '@/lib/api';

export interface BackendReservation {
  _id: string;
  title: string;
  pitch: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  maxPlayers: number;
  currentPlayers: string[];
  waitList: string[];
  status?: 'upcoming' | 'completed' | 'cancelled';
}

export interface CreateReservationRequest {
  title: string;
  pitch: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  maxPlayers: number;
}

// Get all reservations
export const fetchAllReservations = async (): Promise<BackendReservation[]> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch reservations');
  }
  
  const data = await response.json();
  return data.data?.reservations || data.data || [];
};

// Get reservation by ID
export const fetchReservationById = async (id: string): Promise<BackendReservation> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch reservation');
  }
  
  const data = await response.json();
  return data.data?.reservation || data.data;
};

// Create reservation
export const createReservation = async (reservation: CreateReservationRequest): Promise<BackendReservation> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reservation),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create reservation');
  }
  
  const data = await response.json();
  return data.data?.reservation || data.data;
};

// Delete reservation (admin only)
export const deleteReservationById = async (id: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete reservation');
  }
};
