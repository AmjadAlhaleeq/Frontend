
const API_BASE_URL = 'http://127.0.0.1:3000';

export interface PlayerProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  age?: number;
  profilePicture?: string;
  preferredPosition?: string;
  bio?: string;
}

export const getPlayerById = async (playerId: string): Promise<PlayerProfile> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/users/${playerId}`, {
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
  
  if (result.status === 'success' && result.data?.user) {
    return result.data.user;
  }
  
  throw new Error(result.message || 'Failed to fetch player');
};

export const getMultiplePlayersByIds = async (playerIds: string[]): Promise<PlayerProfile[]> => {
  const token = localStorage.getItem('authToken');
  
  // Make individual requests for each player
  const playerPromises = playerIds.map(playerId => 
    getPlayerById(playerId).catch(error => {
      console.error(`Failed to fetch player ${playerId}:`, error);
      return null;
    })
  );
  
  const players = await Promise.all(playerPromises);
  
  // Filter out null results (failed requests)
  return players.filter((player): player is PlayerProfile => player !== null);
};
