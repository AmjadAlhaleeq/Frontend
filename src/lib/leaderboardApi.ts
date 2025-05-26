
const API_BASE_URL = 'http://127.0.0.1:3000';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

// Helper function to get headers with auth
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Available leaderboard types - updated to match backend schema
export const LEADERBOARD_TYPES = {
  WINS: 'wins',
  MVP: 'mvp',
  GOALS: 'goals',
  ASSISTS: 'assists',
  INTERCEPTIONS: 'interceptions',
  CLEAN_SHEETS: 'cleanSheets'
} as const;

export type LeaderboardType = typeof LEADERBOARD_TYPES[keyof typeof LEADERBOARD_TYPES];

export interface LeaderboardPlayer {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  profilePicture: string;
  avatar: string;
  matches: number;
  statValue: number;
  // Computed stats for frontend
  stats: {
    gamesPlayed: number;
    wins: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    mvpScore: number;
    winRate: number;
    interceptions: number;
  };
}

// GET leaderboard by type
export const getLeaderboardByType = async (type: LeaderboardType) => {
  try {
    console.log(`Fetching leaderboard for type: ${type}`);
    
    const response = await fetch(`${API_BASE_URL}/leaderboards/${type}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch ${type} leaderboard:`, response.status, errorText);
      throw new Error(`Failed to fetch ${type} leaderboard: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Leaderboard data for ${type}:`, data);
    
    if (data.status === 'success' && data.data?.leaderboard) {
      return {
        success: true,
        data: {
          leaderboard: {
            type: data.data.leaderboard.type,
            players: data.data.leaderboard.players.map((player: any) => ({
              rank: player.rank,
              userId: player.userId,
              firstName: player.firstName,
              lastName: player.lastName,
              name: `${player.firstName} ${player.lastName}`.trim(),
              profilePicture: player.profilePicture || '',
              avatar: player.profilePicture || '',
              matches: player.matches || 0,
              statValue: player.statValue,
              stats: {
                gamesPlayed: player.matches || 0,
                wins: type === 'wins' ? player.statValue : 0,
                goals: type === 'goals' ? player.statValue : 0,
                assists: type === 'assists' ? player.statValue : 0,
                cleanSheets: type === 'cleanSheets' ? player.statValue : 0,
                mvpScore: type === 'mvp' ? player.statValue : 0,
                interceptions: type === 'interceptions' ? player.statValue : 0,
                winRate: type === 'wins' && player.matches > 0 ? 
                  parseFloat(((player.statValue / player.matches) * 100).toFixed(1)) : 0
              }
            }))
          }
        }
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error(`Error fetching ${type} leaderboard:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
