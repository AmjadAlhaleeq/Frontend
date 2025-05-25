import { API_BASE_URL } from '@/lib/api';

export interface BackendReservation {
  _id: string;
  title: string;
  pitch: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  maxPlayers: number;
  currentPlayers: string[];
  waitList: string[];
  status?: 'upcoming' | 'completed' | 'cancelled';
}

export interface CreateReservationRequest {
  title: string;
  pitch: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  maxPlayers: number;
}

export interface PlayerStats {
  playerId: string;
  goals: number;
  assists: number;
  mvp: boolean;
  rating: number;
}

export interface GameSummary {
  summary: string;
  playerStats: PlayerStats[];
}

const API_BASE = API_BASE_URL;

// Update to use the new API functions
export { 
  getAllReservations,
  getReservationById as fetchReservationById,
  createReservation,
  deleteReservationApi as deleteReservationById,
  addGameSummary,
  joinReservation,
  cancelReservation,
  removeFromWaitlist as suspendPlayer,
  kickPlayer
} from '@/lib/reservationApi';

// Keep existing fetchAllReservations as alias
export const fetchAllReservations = getAllReservations;

// Keep existing fetchPitches function
export const fetchPitches = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE}/pitches`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch pitches');
  }
  
  const data = await response.json();
  return data.data?.pitches || data.data || [];
};
