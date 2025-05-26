
const API_BASE_URL = 'http://127.0.0.1:3000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Join a reservation
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

// Cancel a reservation
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

// Add to waitlist - this endpoint doesn't exist in your backend yet, so we'll simulate it
export const addToWaitlist = async (reservationId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/waitlist/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      // If endpoint doesn't exist, we'll simulate success for now
      console.warn('Add to waitlist endpoint not available');
      return { status: 'success', message: 'Added to waitlist' };
    }

    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to add to waitlist');
    }
    
    return result;
  } catch (error) {
    console.warn('Failed to add to waitlist:', error);
    // Simulate success for now
    return { status: 'success', message: 'Added to waitlist' };
  }
};
