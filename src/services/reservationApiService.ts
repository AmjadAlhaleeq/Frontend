
import { apiRequest } from './apiConfig';
import { joinReservation, cancelReservation, removeFromWaitlist } from './playerReservationApi';

// Get all reservations
export const fetchAllReservations = async () => {
  const response = await apiRequest('/reservations');
  const data = await response.json();
  return data.data.reservations;
};

// Get reservation by ID
export const getReservationById = async (id: string) => {
  const response = await apiRequest(`/reservations/${id}`);
  const data = await response.json();
  return data.data.reservation;
};

// Join reservation (handles both game and waitlist)
export const joinReservationApi = async (reservationId: string) => {
  return await joinReservation(reservationId);
};

// Leave game
export const cancelReservationApi = async (reservationId: string) => {
  return await cancelReservation(reservationId);
};

// Join waitlist (uses same join endpoint)
export const joinWaitlistApi = async (reservationId: string) => {
  return await joinReservation(reservationId);
};

// Leave waitlist
export const leaveWaitlistApi = async (reservationId: string) => {
  return await removeFromWaitlist(reservationId);
};

// Delete reservation (admin)
export const deleteReservationApi = async (reservationId: string) => {
  const response = await apiRequest(`/reservations/${reservationId}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  return data;
};

// Kick player (admin)
export const kickPlayerApi = async (reservationId: string, playerId: string, reason: string, suspensionDays: number) => {
  const response = await apiRequest(`/reservations/${reservationId}/kick`, {
    method: 'POST',
    body: JSON.stringify({
      userId: playerId,
      reason,
      suspensionDays
    }),
  });
  const data = await response.json();
  return data;
};

// Complete game (admin)
export const completeGameApi = async (reservationId: string) => {
  // This endpoint might not exist in your backend, implement if needed
  const response = await apiRequest(`/reservations/${reservationId}/complete`, {
    method: 'POST',
  });
  const data = await response.json();
  return data;
};

// Suspend player (admin)
export const suspendPlayerApi = async (playerId: string, reason: string, suspensionDays: number) => {
  // This might be handled through kick player, adjust as needed
  const response = await apiRequest(`/users/${playerId}/suspend`, {
    method: 'POST',
    body: JSON.stringify({
      reason,
      suspensionDays
    }),
  });
  const data = await response.json();
  return data;
};

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

// Add game summary (admin)
export const addGameSummaryApi = async (reservationId: string, summaryData: GameSummaryData) => {
  const response = await apiRequest(`/reservations/${reservationId}/summary`, {
    method: 'POST',
    body: JSON.stringify(summaryData),
  });
  const data = await response.json();
  return data;
};
