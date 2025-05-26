
const API_BASE_URL = 'http://127.0.0.1:3000';

export interface BackendReservation {
  _id: string;
  title: string;
  pitch: {
    _id: string;
    name: string;
    backgroundImage: string;
    playersPerSide: number;
    city: string;
    location: string;
    format: string;
    services: {
      type: string;
      water: boolean;
      cafeteria: boolean;
      lockers: boolean;
      bathrooms: boolean;
      parking: boolean;
      wifi: boolean;
    };
  };
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  maxPlayers: number;
  currentPlayers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  }>;
  waitList: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  }>;
  __v: number;
}

// Get all reservations
export const getAllReservations = async (): Promise<BackendReservation[]> => {
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
  
  if (result.status === 'success' && result.data?.reservations) {
    return result.data.reservations;
  }
  
  throw new Error(result.message || 'Failed to fetch reservations');
};

// Get reservation by ID
export const getReservationById = async (id: string): Promise<BackendReservation> => {
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

// Create reservation (admin)
export const createReservation = async (data: {
  title: string;
  pitch: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  maxPlayers: number;
}) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.status === 'success') {
    return result.data.reservation;
  }
  
  throw new Error(result.message || 'Failed to create reservation');
};

// Delete reservation (admin)
export const deleteReservation = async (id: string) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.status === 'success') {
    return result;
  }
  
  throw new Error(result.message || 'Failed to delete reservation');
};

// Join reservation (player)
export const joinReservation = async (id: string) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/reservations/${id}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.status === 'success') {
    return result;
  }
  
  throw new Error(result.message || 'Failed to join reservation');
};

// Cancel reservation (player)
export const cancelReservation = async (id: string) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/reservations/${id}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.status === 'success') {
    return result;
  }
  
  throw new Error(result.message || 'Failed to cancel reservation');
};

// Transform backend reservation to frontend format
export const transformReservation = (backendRes: BackendReservation) => {
  return {
    id: Date.now(), // Generate a temporary ID for frontend
    backendId: backendRes._id,
    pitchId: backendRes.pitch._id,
    pitchName: backendRes.pitch.name,
    location: backendRes.pitch.location,
    city: backendRes.pitch.city,
    date: backendRes.date.split('T')[0], // Convert to YYYY-MM-DD format
    startTime: new Date(backendRes.startTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    }),
    endTime: new Date(backendRes.endTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    }),
    duration: Math.round((new Date(backendRes.endTime).getTime() - new Date(backendRes.startTime).getTime()) / (1000 * 60)), // in minutes
    title: backendRes.title,
    maxPlayers: backendRes.maxPlayers,
    lineup: backendRes.currentPlayers.map(player => ({
      userId: player._id,
      name: `${player.firstName} ${player.lastName}`,
      playerName: `${player.firstName} ${player.lastName}`,
      status: 'joined' as const,
      joinedAt: new Date().toISOString(),
      avatar: player.profilePicture
    })),
    waitingList: backendRes.waitList.map(player => player._id),
    status: 'upcoming' as const,
    backgroundImage: backendRes.pitch.backgroundImage,
    createdBy: 'admin',
    gameFormat: backendRes.pitch.format,
    price: backendRes.price,
    playersJoined: backendRes.currentPlayers.length
  };
};
