
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

export interface KickPlayerRequest {
  userId: string;
  reason: string;
  suspensionDays: number;
}

export interface AddSummaryRequest {
  mvp?: string;
  players: {
    userId: string;
    played: boolean;
    won: boolean;
    goals?: number;
    assists?: number;
    interceptions?: number;
    cleanSheet?: boolean;
  }[];
  absentees: {
    userId: string;
    reason: string;
    suspensionDays: number;
  }[];
}
