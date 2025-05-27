
import { apiRequest } from './apiConfig';

export interface PlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  skillLevel?: string;
  gamesPlayed?: number;
  goals?: number;
  assists?: number;
  rating?: number;
  avatar?: string;
  joinedDate?: string;
  status?: 'active' | 'suspended';
  suspensionEndDate?: string;
}

export interface GameSummaryData {
  mvp?: string;
  players: Array<{
    userId: string;
    played: boolean;
    won: boolean;
    goals?: number;
    assists?: number;
    interceptions?: number;
    cleanSheet?: boolean;
  }>;
  absentees?: Array<{
    userId: string;
    reason: string;
    suspensionDays: number;
  }>;
}

// Get all reservations
export const fetchAllReservations = async () => {
  const response = await apiRequest('/reservations');
  const result = await response.json();
  
  if (result.status === 'success' && result.data?.reservations) {
    return result.data.reservations;
  }
  
  throw new Error(result.message || 'Failed to fetch reservations');
};

// Join a reservation
export const joinReservationApi = async (reservationId: string) => {
  const response = await apiRequest(`/reservations/${reservationId}/join`, {
    method: 'POST',
  });

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to join reservation');
  }
  
  return result;
};

// Cancel a reservation
export const cancelReservationApi = async (reservationId: string) => {
  const response = await apiRequest(`/reservations/${reservationId}/cancel`, {
    method: 'POST',
  });

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to cancel reservation');
  }
  
  return result;
};

// Join waiting list
export const joinWaitlistApi = async (reservationId: string) => {
  const response = await apiRequest(`/reservations/${reservationId}/waitlist/add`, {
    method: 'POST',
  });

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to join waiting list');
  }
  
  return result;
};

// Leave waiting list
export const leaveWaitlistApi = async (reservationId: string) => {
  const response = await apiRequest(`/reservations/${reservationId}/waitlist/remove`, {
    method: 'POST',
  });

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to leave waiting list');
  }
  
  return result;
};

// Create reservation (Admin only)
export const createReservationApi = async (reservationData: any) => {
  const response = await apiRequest('/reservations', {
    method: 'POST',
    body: JSON.stringify(reservationData),
  });

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to create reservation');
  }
  
  return result;
};

// Delete reservation (Admin only)
export const deleteReservationApi = async (reservationId: string) => {
  const response = await apiRequest(`/reservations/${reservationId}`, {
    method: 'DELETE',
  });

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to delete reservation');
  }
  
  return result;
};

// Complete game (Admin only)
export const completeGameApi = async (reservationId: string) => {
  const response = await apiRequest(`/reservations/${reservationId}/complete`, {
    method: 'POST',
  });

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to complete game');
  }
  
  return result;
};

// Add game summary (Admin only)
export const addGameSummaryApi = async (reservationId: string, summaryData: GameSummaryData) => {
  const response = await apiRequest(`/reservations/${reservationId}/summary`, {
    method: 'POST',
    body: JSON.stringify(summaryData),
  });

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to add game summary');
  }
  
  return result;
};

// Kick player (Admin only)
export const kickPlayerApi = async (reservationId: string, playerId: string, reason: string, suspensionDays: number) => {
  const response = await apiRequest(`/reservations/${reservationId}/kick`, {
    method: 'POST',
    body: JSON.stringify({ 
      userId: playerId,
      reason,
      suspensionDays
    }),
  });

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to kick player');
  }
  
  return result;
};

// Suspend player (Admin only)
export const suspendPlayerApi = async (playerId: string, reason: string, suspensionDays: number) => {
  const response = await apiRequest(`/users/${playerId}/suspend`, {
    method: 'POST',
    body: JSON.stringify({
      reason,
      suspensionDays
    }),
  });

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to suspend player');
  }
  
  return result;
};

// Get player profile
export const getPlayerProfileApi = async (playerId: string): Promise<PlayerProfile> => {
  const response = await apiRequest(`/users/${playerId}/profile`);
  const result = await response.json();
  
  if (result.status === 'success' && result.data?.user) {
    return result.data.user;
  }
  
  throw new Error(result.message || 'Failed to fetch player profile');
};
