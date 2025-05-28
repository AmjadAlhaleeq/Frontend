
const API_BASE_URL = 'http://127.0.0.1:3000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Join a reservation (handles both joining game and waitlist automatically)
export const joinReservation = async (reservationId: string) => {
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/join`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to join reservation');
  }

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to join reservation');
  }
  
  return result;
};

// Cancel a reservation (leave game)
export const cancelReservation = async (reservationId: string) => {
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/cancel`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to cancel reservation');
  }

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to cancel reservation');
  }
  
  return result;
};

// Remove from waitlist
export const removeFromWaitlist = async (reservationId: string) => {
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/waitlist/remove`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to remove from waitlist');
  }

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Failed to remove from waitlist');
  }
  
  return result;
};

// Add to waitlist - use the same join endpoint as backend handles this automatically
export const addToWaitlist = async (reservationId: string) => {
  // Use the same join endpoint as your backend automatically adds to waitlist when full
  return await joinReservation(reservationId);
};
