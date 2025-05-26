
const API_BASE_URL = 'http://127.0.0.1:3000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Get user's bookings/reservations
export const getMyBookings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'success' && result.data?.reservations) {
      // Filter reservations to show only those the user has joined
      const userId = JSON.parse(localStorage.getItem('user') || '{}')._id;
      const userReservations = result.data.reservations.filter((reservation: any) => 
        reservation.currentPlayers.some((player: any) => player._id === userId)
      );
      
      return {
        status: 'success',
        data: {
          reservations: userReservations
        }
      };
    }
    
    throw new Error(result.message || 'Failed to fetch bookings');
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};
