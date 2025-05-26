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
  summary?: string;
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

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

// Helper function to get headers with auth
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// GET all reservations
export const getAllReservations = async (): Promise<BackendReservation[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reservations: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all reservations:', error);
    throw error;
  }
};

// GET reservation by ID
export const getReservationById = async (reservationId: string): Promise<BackendReservation> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reservation: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching reservation by ID:', error);
    throw error;
  }
};

// POST create reservation (admin only)
export const createReservation = async (reservationData: CreateReservationRequest): Promise<BackendReservation> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reservationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create reservation: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

// DELETE reservation (admin only)
export const deleteReservationApi = async (reservationId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete reservation: ${response.status}`);
    }

    return;
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
};

// POST kick player (admin only)
export const kickPlayer = async (reservationId: string, playerId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/kick`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ playerId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to kick player: ${response.status}`);
    }

    return;
  } catch (error) {
    console.error('Error kicking player:', error);
    throw error;
  }
};

// POST add game summary (admin only)
export const addGameSummary = async (reservationId: string, summaryData: { summary: string; playerStats: any[] }): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/summary`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(summaryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add summary: ${response.status}`);
    }

    return;
  } catch (error) {
    console.error('Error adding game summary:', error);
    throw error;
  }
};

// POST join reservation (player)
export const joinReservation = async (reservationId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/join`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to join reservation: ${response.status}`);
    }

    return;
  } catch (error) {
    console.error('Error joining reservation:', error);
    throw error;
  }
};

// POST cancel reservation (player)
export const cancelReservation = async (reservationId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/cancel`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to cancel reservation: ${response.status}`);
    }

    return;
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
};

// POST remove from waitlist (player)
export const removeFromWaitlist = async (reservationId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/waitlist/remove`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to remove from waitlist: ${response.status}`);
    }

    return;
  } catch (error) {
    console.error('Error removing from waitlist:', error);
    throw error;
  }
};

// POST add to waitlist (player)
export const addToWaitlist = async (reservationId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/waitlist/add`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add to waitlist: ${response.status}`);
    }

    return;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    throw error;
  }
};

// Keep existing fetchPitches function for compatibility
export const fetchPitches = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/pitches`, {
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

// Legacy aliases for backward compatibility
export const fetchAllReservations = getAllReservations;
export const fetchReservationById = getReservationById;
export const deleteReservationById = deleteReservationApi;
