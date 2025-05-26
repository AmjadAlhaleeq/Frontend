
const API_BASE_URL = 'http://127.0.0.1:3000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Delete a reservation
export const deleteReservationApi = async (reservationId: string) => {
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete reservation');
  }

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to delete reservation');
  }
  
  return result;
};

// Kick a player from reservation
export const kickPlayer = async (reservationId: string, playerId: string, reason: string, suspensionDays: number) => {
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/kick`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      userId: playerId,
      reason,
      suspensionDays
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to kick player');
  }

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to kick player');
  }
  
  return result;
};

// Add game summary with backend format
export const addGameSummary = async (reservationId: string, summaryData: {
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
}) => {
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/summary`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(summaryData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add summary');
  }

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to add summary');
  }
  
  return result;
};

// Create a reservation
export const createReservation = async (reservationData: any) => {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(reservationData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create reservation');
  }

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to create reservation');
  }
  
  return result;
};

// Add user suspension API
export const suspendUser = async (userId: string, reason: string, suspensionDays: number) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/suspend`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      reason,
      suspensionDays
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to suspend user');
  }

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to suspend user');
  }
  
  return result;
};
