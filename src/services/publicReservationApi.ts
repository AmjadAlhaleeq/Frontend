
const API_BASE_URL = 'http://127.0.0.1:3000';

// Get all reservations
export const getAllReservations = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  // Return the reservations array directly to match the hook expectations
  if (result.status === 'success' && result.data?.reservations) {
    return result.data.reservations;
  }
  
  throw new Error(result.message || 'Failed to fetch reservations');
};

// Get reservation by ID
export const getReservationById = async (id: string) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.status === 'success' && result.data?.reservation) {
    return result.data.reservation;
  }
  
  throw new Error(result.message || 'Failed to fetch reservation');
};

// Fetch pitches - create a mock endpoint since backend doesn't have this yet
export const fetchPitches = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/pitches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });

    if (!response.ok) {
      // If pitches endpoint doesn't exist, return empty array
      console.warn('Pitches endpoint not available, returning empty array');
      return [];
    }

    const result = await response.json();
    
    if (result.status === 'success' && result.data) {
      return Array.isArray(result.data) ? result.data : result.data.pitches || [];
    }
    
    return [];
  } catch (error) {
    console.warn('Failed to fetch pitches:', error);
    return [];
  }
};
