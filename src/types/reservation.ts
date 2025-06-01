
export interface Player {
  userId: string;
  name: string;
  playerName: string;
  status: "joined" | "pending" | "cancelled";
  joinedAt: string;
  avatar?: string;
}

export interface UserStats {
  wins: number;
  interceptions: number;
  goals: number;
  assists: number;
  matches: number;
  winPercentage: number;
  cleanSheets: number;
  mvp: number;
}

export interface Highlight {
  id: string;
  type: "goal" | "assist" | "save" | "tackle" | "mvp" | "cleanSheet";
  playerId: string;
  playerName: string;
  minute: number;
  description?: string;
  timestamp: string;
}

export interface Pitch {
  _id: string;
  id?: string;
  name: string;
  location: string;
  city: string;
  backgroundImage: string;
  images: string[];
  image?: string;
  additionalImages?: string[];
  playersPerSide: number;
  description: string;
  services: Record<string, boolean | string>;
}

export interface Reservation {
  id: number;
  backendId?: string;
  pitchId: string;
  pitchName: string;
  location: string;
  city: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  title: string;
  maxPlayers: number;
  lineup?: Player[];
  waitList?: string[];
  status: "upcoming" | "completed" | "cancelled";
  photos?: string[];
  backgroundImage?: string;
  createdBy: string;
  gameFormat?: string;
  description?: string;
  time?: string;
  price?: number;
  imageUrl?: string;
  playersJoined?: number;
  highlights?: Highlight[];
  summary?:
    | string
    | {
        homeScore: number;
        awayScore: number;
        completed: boolean;
        completedAt: string;
      };
  additionalImages?: string[];
  userInWaitlist?: boolean;
  pitch?: {
    _id: string;
    name: string;
    location: string;
    city: string;
    playersPerSide: number;
    services: Record<string, boolean | string>;
    description: string;
    images: string[];
    backgroundImage: string;
  };
}
