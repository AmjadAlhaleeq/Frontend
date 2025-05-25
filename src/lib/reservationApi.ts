
import { API_BASE_URL } from './api';

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

export interface CreateReservationData {
  title: string;
  pitch: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  maxPlayers: number;
}

export interface GameSummaryData {
  summary: string;
  playerStats?: any[];
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Public routes
export const getAllReservations = async (): Promise<BackendReservation[]> => {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
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
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch reservation');
  }
  
  const data = await response.json();
  return data.data?.reservation || data.data;
};

// Admin routes
export const createReservation = async (reservationData: CreateReservationData): Promise<BackendReservation> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
  const response = await fetch(`${API_BASE_URL}/reservations`, {
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
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
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

export const kickPlayer = async (reservationId: string, playerId: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/kick`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ playerId }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to kick player');
  }
};

export const addGameSummary = async (reservationId: string, summaryData: GameSummaryData): Promise<void> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/summary`, {
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

// Player routes
export const joinReservation = async (reservationId: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/join`, {
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
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/cancel`, {
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
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/waitlist/remove`, {
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
