
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
export const kickPlayer = async (reservationId: string, playerId: string) => {
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/kick`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ playerId }),
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
