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

export interface PlayerStats {
  playerId: string;
  goals: number;
  assists: number;
  mvp: boolean;
  rating: number;
}

export interface GameSummary {
  summary: string;
  playerStats: PlayerStats[];
}

export interface KickPlayerRequest {
  userId: string;
  reason: string;
  suspensionDays: number;
}

export interface AddSummaryRequest {
  mvp?: string;
  players: {
    userId: string;
    played: boolean;
    won: boolean;
    goals?: number;
    assists?: number;
    interceptions?: number;
    cleanSheet?: boolean;
  }[];
  absentees: {
    userId: string;
    reason: string;
    suspensionDays: number;
  }[];
}

const API_BASE = API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

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

// Admin routes
export const createReservation = async (reservationData: CreateReservationRequest): Promise<BackendReservation> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
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
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
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
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
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
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
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

// Player routes
export const joinReservation = async (reservationId: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
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
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
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
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  
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

// Legacy aliases for backward compatibility
export const fetchAllReservations = getAllReservations;
export const fetchReservationById = getReservationById;
export const deleteReservationById = deleteReservationApi;
export const suspendPlayer = removeFromWaitlist; // This was incorrectly mapped

// Keep existing fetchPitches function
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
