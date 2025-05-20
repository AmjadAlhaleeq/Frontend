import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSameDay } from 'date-fns';

// Define HighlightType enum
export type HighlightType = "goal" | "assist" | "yellowCard" | "redCard" | "save" | "other";

// Define Highlight interface
export interface Highlight {
  id: number;
  type: HighlightType;
  playerName: string;
  playerId: string;
  minute: number;
  description?: string;
}

// Types for player in lineup
export interface LineupPlayer {
  userId: string;
  status: 'joined' | 'left' | 'invited';
  joinedAt?: string;
  playerName?: string;
}

// Types for reservation status
export type ReservationStatus = 'open' | 'full' | 'completed' | 'cancelled';

// Type for a single reservation
export interface Reservation {
  id: number;
  title?: string; // Added title field
  pitchName: string;
  date: string; // ISO date string format
  time: string; // e.g., "18:00 - 19:30"
  status: ReservationStatus;
  playersJoined: number;
  maxPlayers: number;
  lineup: LineupPlayer[];
  waitingList: string[]; // User IDs
  location?: string;
  city?: string; // Added city field
  locationLink?: string; // Added locationLink field
  price?: number;
  imageUrl?: string;
  pitchImage?: string; // For linking to pitch image
  finalScore?: string;
  mvpPlayerId?: string;
  highlights?: Highlight[]; // Add highlights property
}

// Type for new reservation data
export interface NewReservationData {
  title?: string; // Added title field
  pitchName: string;
  date: string;
  time: string;
  location?: string;
  city?: string; // Added city field
  locationLink?: string; // Added locationLink field
  maxPlayers: number;
  price?: number;
  imageUrl?: string;
}

// Pitch interface with updated fields
export interface Pitch {
  id: number;
  name: string;
  location: string; // Google Maps link
  city?: string; // New field for city
  image: string; // Main image
  additionalImages?: string[]; // For multiple images
  playersPerSide: number;
  description?: string;
  price: number;
  facilities?: string[]; // Renamed from features for consistency
  openingHours?: string; // Add openingHours property
  details?: {
    address?: string;
    description?: string;
    price?: string;
    facilities?: string[];
  };
}

// User stats interface
export interface UserStats {
  gamesPlayed: number;
  goalsScored: number;
  matches: number;
  wins: number;
  goals: number;
  assists: number;
  cleansheets: number;
  tackles: number;
  yellowCards: number;
  redCards: number;
  mvps: number;
}

// Context type definition
interface ReservationContextType {
  reservations: Reservation[];
  addReservation: (data: NewReservationData) => void;
  joinGame: (reservationId: number, playerName?: string, userId?: string) => void;
  cancelReservation: (reservationId: number, userId: string) => void;
  updateReservationStatus: (reservationId: number, newStatus: ReservationStatus) => void;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  joinWaitingList: (reservationId: number, userId: string) => void;
  leaveWaitingList: (reservationId: number, userId: string) => void;
  hasUserJoinedOnDate: (date: Date, userId: string) => boolean;
  getReservationsForDate: (date: Date) => Reservation[];
  editReservation: (reservationId: number, data: Partial<Omit<Reservation, 'id'>>) => void;
  navigateToReservation: (pitchName: string) => void;
  pitches: Pitch[];
  deletePitch: (pitchId: number) => void;
  addPitch: (pitch: Omit<Pitch, 'id'>) => Pitch;
  updatePitch: (pitchId: number, data: Partial<Omit<Pitch, 'id'>>) => void;
  getUserStats: (userId: string) => UserStats;
  suspendPlayer: (userId: string, duration: number, reason: string) => void;
  // Add new functions for highlight management
  addHighlight: (reservationId: number, highlight: Omit<Highlight, 'id'>) => void;
  deleteHighlight: (reservationId: number, highlightId: number) => void;
  // Add new function to delete a reservation
  deleteReservation: (id: number) => void;
}

// Create the context
const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

// Sample data for initial reservations
const initialReservations: Reservation[] = [
  {
    id: 1,
    title: "Evening Football Session",
    pitchName: "Downtown Turf",
    date: "2025-05-20",
    time: "18:00 - 19:30",
    status: "open",
    playersJoined: 6,
    maxPlayers: 10,
    lineup: [
      { userId: "user1", status: "joined", playerName: "Alex Johnson" },
      { userId: "user2", status: "joined", playerName: "Sam Wilson" },
      { userId: "user3", status: "joined", playerName: "Jordan Lee" },
      { userId: "user4", status: "joined", playerName: "Taylor Smith" },
      { userId: "user5", status: "joined", playerName: "Casey Brown" },
      { userId: "user6", status: "joined", playerName: "Morgan Davis" },
    ],
    waitingList: [],
    location: "Downtown Sports Complex",
    city: "New York",
    locationLink: "https://maps.google.com/?q=downtown+sports+complex",
    price: 15,
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    id: 2,
    title: "Late Night Game",
    pitchName: "Riverside Field",
    date: "2025-05-19",
    time: "20:00 - 21:30",
    status: "full",
    playersJoined: 10,
    maxPlayers: 10,
    lineup: [
      { userId: "user1", status: "joined", playerName: "Alex Johnson" },
      { userId: "user3", status: "joined", playerName: "Jordan Lee" },
      { userId: "user4", status: "joined", playerName: "Taylor Smith" },
      { userId: "user7", status: "joined", playerName: "Riley Martin" },
      { userId: "user8", status: "joined", playerName: "Jamie Garcia" },
      { userId: "user9", status: "joined", playerName: "Drew Thompson" },
      { userId: "user10", status: "joined", playerName: "Avery Roberts" },
      { userId: "user11", status: "joined", playerName: "Cameron White" },
      { userId: "user12", status: "joined", playerName: "Quinn Murphy" },
      { userId: "user13", status: "joined", playerName: "Parker Collins" },
    ],
    waitingList: ["user14", "user15"],
    location: "Riverside Sports Center",
    city: "Chicago",
    locationLink: "https://maps.google.com/?q=riverside+sports+center",
    price: 20,
    imageUrl: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    id: 3,
    pitchName: "Central Park",
    date: "2025-05-18",
    time: "17:00 - 18:30",
    status: "completed",
    playersJoined: 10,
    maxPlayers: 10,
    lineup: [
      { userId: "user1", status: "joined", playerName: "Alex Johnson" },
      { userId: "user2", status: "joined", playerName: "Sam Wilson" },
      { userId: "user3", status: "joined", playerName: "Jordan Lee" },
      { userId: "user4", status: "joined", playerName: "Taylor Smith" },
      { userId: "user5", status: "joined", playerName: "Casey Brown" },
      { userId: "user7", status: "joined", playerName: "Riley Martin" },
      { userId: "user8", status: "joined", playerName: "Jamie Garcia" },
      { userId: "user9", status: "joined", playerName: "Drew Thompson" },
      { userId: "user10", status: "joined", playerName: "Avery Roberts" },
      { userId: "user11", status: "joined", playerName: "Cameron White" },
    ],
    waitingList: [],
    highlights: [
      { id: 1, type: "goal", playerName: "Alex Johnson", minute: 15, playerId: "user1",
       description: "Beautiful long-range shot into the top corner" },
      { id: 2, type: "assist", playerName: "Sam Wilson", minute: 15, playerId: "user2" },
      { id: 3, type: "yellowCard", playerName: "Jordan Lee", minute: 27, playerId: "user3",
       description: "Late tackle" },
      { id: 4, type: "goal", playerName: "Taylor Smith", minute: 53, playerId: "user4" },
    ],
    finalScore: "2-1",
    location: "Central Park Fields",
    price: 12,
    imageUrl: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=876&q=80",
    mvpPlayerId: "user1",
  },
  // Additional past games for examples
  {
    id: 4,
    pitchName: "City Stadium",
    date: "2025-05-15",
    time: "19:00 - 20:30",
    status: "completed",
    playersJoined: 10,
    maxPlayers: 10,
    lineup: [
      { userId: "user1", status: "joined", playerName: "Alex Johnson" },
      { userId: "user2", status: "joined", playerName: "Sam Wilson" },
      { userId: "user3", status: "joined", playerName: "Jordan Lee" },
      { userId: "user4", status: "joined", playerName: "Taylor Smith" },
      { userId: "user5", status: "joined", playerName: "Casey Brown" },
      { userId: "user6", status: "joined", playerName: "Morgan Davis" },
      { userId: "user7", status: "joined", playerName: "Riley Martin" },
      { userId: "user8", status: "joined", playerName: "Jamie Garcia" },
      { userId: "user9", status: "joined", playerName: "Drew Thompson" },
      { userId: "user10", status: "joined", playerName: "Avery Roberts" },
    ],
    waitingList: [],
    highlights: [
      { id: 1, type: "goal", playerName: "Alex Johnson", minute: 12, playerId: "user1" },
      { id: 2, type: "assist", playerName: "Sam Wilson", minute: 12, playerId: "user2" },
      { id: 3, type: "goal", playerName: "Alex Johnson", minute: 34, playerId: "user1" },
      { id: 4, type: "assist", playerName: "Jordan Lee", minute: 34, playerId: "user3" },
      { id: 5, type: "yellowCard", playerName: "Riley Martin", minute: 41, playerId: "user7" },
    ],
    finalScore: "3-2",
    location: "City Stadium Complex",
    price: 18,
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    mvpPlayerId: "user1",
  },
  {
    id: 5,
    pitchName: "Olympus Pitch",
    date: "2025-05-13",
    time: "18:30 - 20:00",
    status: "completed",
    playersJoined: 10,
    maxPlayers: 10,
    lineup: [
      { userId: "user1", status: "joined", playerName: "Alex Johnson" },
      { userId: "user2", status: "joined", playerName: "Sam Wilson" },
      { userId: "user3", status: "joined", playerName: "Jordan Lee" },
      { userId: "user4", status: "joined", playerName: "Taylor Smith" },
      { userId: "user5", status: "joined", playerName: "Casey Brown" },
      { userId: "user6", status: "joined", playerName: "Morgan Davis" },
      { userId: "user7", status: "joined", playerName: "Riley Martin" },
      { userId: "user8", status: "joined", playerName: "Jamie Garcia" },
      { userId: "user9", status: "joined", playerName: "Drew Thompson" },
      { userId: "user10", status: "joined", playerName: "Avery Roberts" },
    ],
    waitingList: [],
    highlights: [
      { id: 1, type: "goal", playerName: "Sam Wilson", minute: 8, playerId: "user2" },
      { id: 2, type: "goal", playerName: "Jordan Lee", minute: 23, playerId: "user3" },
      { id: 3, type: "goal", playerName: "Casey Brown", minute: 47, playerId: "user5" },
      { id: 4, type: "redCard", playerName: "Drew Thompson", minute: 55, playerId: "user9", description: "Serious foul play" },
    ],
    finalScore: "3-0",
    location: "Olympus Sports Center",
    price: 22,
    imageUrl: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    mvpPlayerId: "user2",
  }
];

// Sample data for pitches
const initialPitches: Pitch[] = [
  {
    id: 1,
    name: "Downtown Turf",
    location: "https://maps.google.com/?q=downtown+sports+complex",
    city: "New York",
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=876&q=80",
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    ],
    playersPerSide: 5,
    price: 15,
    facilities: ["parking", "changing_rooms", "floodlights"]
  },
  {
    id: 2,
    name: "Riverside Field",
    location: "https://maps.google.com/?q=riverside+sports+center",
    city: "Chicago",
    image: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    playersPerSide: 5,
    price: 20,
    facilities: ["parking", "showers", "wifi"]
  },
  {
    id: 3,
    name: "Central Park",
    location: "https://maps.google.com/?q=central+park+fields",
    city: "Boston",
    image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=876&q=80",
    playersPerSide: 5,
    price: 12,
    facilities: ["floodlights"]
  }
];

// Provider component
export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to store all reservations
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  // State to store all pitches
  const [pitches, setPitches] = useState<Pitch[]>(initialPitches);
  // State to track suspended players
  const [suspendedPlayers, setSuspendedPlayers] = useState<{userId: string, until: Date, reason: string}[]>([]);
  
  // Remove the useNavigate hook from here as it needs to be inside Router context
  const navigateToReservation = (pitchName: string) => {
    // Instead of using navigate, we'll create a function that can be used
    // to pass the state when needed
    window.history.pushState({ pitchFilter: pitchName }, '', '/reservations');
    // Force navigation by changing the window location
    window.location.href = '/reservations';
  };

  // Add a new reservation
  const addReservation = (data: NewReservationData) => {
    const newReservation: Reservation = {
      id: Date.now(), // Simple ID generation
      ...data,
      status: 'open',
      playersJoined: 0,
      lineup: [],
      waitingList: [],
    };
    
    setReservations(prev => [...prev, newReservation]);
    
    return newReservation.id;
  };

  // Join a game
  const joinGame = (reservationId: number, playerName?: string, userId?: string) => {
    if (!userId) return;
    
    // Check if player is suspended
    const isSuspended = suspendedPlayers.some(p => 
      p.userId === userId && new Date() < p.until
    );
    
    if (isSuspended) {
      console.log("User is suspended and cannot join games");
      return;
    }
    
    setReservations(prev => prev.map(res => {
      if (res.id !== reservationId) return res;
      
      // Check if player is already in lineup
      const alreadyJoined = res.lineup.some(p => p.userId === userId && p.status === 'joined');
      if (alreadyJoined) return res;
      
      // Calculate new lineup count
      const currentLineupCount = res.lineup.filter(p => p.status === 'joined').length;
      
      // Check if max players reached, don't add player if full
      const actualMaxPlayers = res.maxPlayers + 2; // Buffer of 2 extra players
      if (currentLineupCount >= actualMaxPlayers) return res;
      
      // Remove from waiting list if present
      const newWaitingList = res.waitingList.filter(id => id !== userId);
      
      // Add to lineup - fixed the type issue
      const newLineupPlayer: LineupPlayer = {
        userId,
        status: 'joined',
        joinedAt: new Date().toISOString(),
        playerName: playerName || `Player ${userId.substring(0, 4)}`,
      };
      
      const newLineup = [...res.lineup, newLineupPlayer];
      
      return {
        ...res,
        lineup: newLineup,
        playersJoined: newLineup.filter(p => p.status === 'joined').length,
        waitingList: newWaitingList,
        status: newLineup.filter(p => p.status === 'joined').length >= res.maxPlayers ? 'full' : 'open'
      };
    }));
  };

  // Cancel reservation (player leaves the game)
  const cancelReservation = (reservationId: number, userId: string) => {
    setReservations(prev => prev.map(res => {
      if (res.id !== reservationId) return res;
      
      // Update lineup to remove player
      const newLineup = res.lineup.filter(p => p.userId !== userId);
      const playersRemaining = newLineup.filter(p => p.status === 'joined').length;
      
      return {
        ...res,
        lineup: newLineup,
        playersJoined: playersRemaining,
        // Update status if needed
        status: playersRemaining < res.maxPlayers ? 'open' : 'full'
      };
    }));
  };

  // Update reservation status
  const updateReservationStatus = (reservationId: number, newStatus: ReservationStatus) => {
    setReservations(prev => prev.map(res => 
      res.id === reservationId ? { ...res, status: newStatus } : res
    ));
  };

  // Check if a user has joined a specific game
  const isUserJoined = (reservationId: number, userId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return false;
    
    return reservation.lineup.some(p => p.userId === userId && p.status === 'joined');
  };

  // Join waiting list
  const joinWaitingList = (reservationId: number, userId: string) => {
    setReservations(prev => prev.map(res => {
      if (res.id !== reservationId) return res;
      
      // Check if already in waiting list
      if (res.waitingList.includes(userId)) return res;
      
      // Check if already in lineup
      if (res.lineup.some(p => p.userId === userId && p.status === 'joined')) return res;
      
      return {
        ...res,
        waitingList: [...res.waitingList, userId]
      };
    }));
  };

  // Leave waiting list
  const leaveWaitingList = (reservationId: number, userId: string) => {
    setReservations(prev => prev.map(res => {
      if (res.id !== reservationId) return res;
      
      return {
        ...res,
        waitingList: res.waitingList.filter(id => id !== userId)
      };
    }));
  };

  // Check if user has joined any game on a specific date
  const hasUserJoinedOnDate = (date: Date, userId: string) => {
    return reservations.some(res => {
      // Check if the date matches
      const resDate = new Date(res.date);
      const sameDay = isSameDay(resDate, date);
      
      // If date matches and status is open or full (not cancelled/completed)
      if (sameDay && (res.status === 'open' || res.status === 'full')) {
        // Check if user is in lineup
        return res.lineup.some(p => p.userId === userId && p.status === 'joined');
      }
      return false;
    });
  };

  // Get all reservations for a specific date
  const getReservationsForDate = (date: Date) => {
    return reservations.filter(res => {
      const resDate = new Date(res.date);
      return isSameDay(resDate, date);
    });
  };

  // Edit an existing reservation
  const editReservation = (reservationId: number, data: Partial<Omit<Reservation, 'id'>>) => {
    setReservations(prev => prev.map(res => {
      if (res.id !== reservationId) return res;
      
      return {
        ...res,
        ...data
      };
    }));
  };
  
  // Add a new pitch
  const addPitch = (pitchData: Omit<Pitch, 'id'>): Pitch => {
    const newPitch: Pitch = {
      ...pitchData,
      id: Date.now(),
    };
    
    setPitches(prev => [...prev, newPitch]);
    return newPitch;
  };
  
  // Update an existing pitch
  const updatePitch = (pitchId: number, data: Partial<Omit<Pitch, 'id'>>) => {
    setPitches(prev => prev.map(pitch => {
      if (pitch.id !== pitchId) return pitch;
      
      return {
        ...pitch,
        ...data
      };
    }));
  };
  
  // Delete a pitch
  const deletePitch = (pitchId: number) => {
    setPitches(prev => prev.filter(pitch => pitch.id !== pitchId));
  };
  
  // Get user statistics
  const getUserStats = (userId: string): UserStats => {
    // Calculate user statistics from reservation data
    const userGames = reservations.filter(res => 
      res.lineup.some(p => p.userId === userId && p.status === 'joined')
    );
    
    // Calculate MVPs
    const mvps = userGames.filter(game => game.mvpPlayerId === userId).length;
    
    return {
      gamesPlayed: userGames.length,
      goalsScored: 0,
      matches: userGames.length,
      wins: 0,
      goals: 0,
      assists: 0,
      cleansheets: 0,
      tackles: 0,
      yellowCards: 0,
      redCards: 0,
      mvps
    };
  };
  
  // Suspend a player
  const suspendPlayer = (userId: string, duration: number, reason: string) => {
    // Calculate end date of suspension
    const until = new Date();
    until.setDate(until.getDate() + duration);
    
    // Add to suspended players list
    setSuspendedPlayers(prev => [
      ...prev.filter(p => p.userId !== userId), // Remove previous suspension if exists
      { userId, until, reason }
    ]);
    
    // Remove player from all upcoming games
    setReservations(prev => prev.map(res => {
      // Only process upcoming games
      if (res.status !== 'open' && res.status !== 'full') return res;
      
      // Check if player is in this game
      const isInGame = res.lineup.some(p => p.userId === userId);
      const isInWaitingList = res.waitingList.includes(userId);
      
      if (!isInGame && !isInWaitingList) return res;
      
      return {
        ...res,
        lineup: res.lineup.filter(p => p.userId !== userId),
        waitingList: res.waitingList.filter(id => id !== userId),
        playersJoined: res.lineup.filter(p => p.userId !== userId && p.status === 'joined').length
      };
    }));
    
    console.log(`Player ${userId} suspended for ${duration} days. Reason: ${reason}`);
  };

  // Add new highlight to a reservation
  const addHighlight = (reservationId: number, highlight: Omit<Highlight, 'id'>) => {
    setReservations(prev => prev.map(res => {
      if (res.id !== reservationId) return res;
      
      const newHighlight = {
        ...highlight,
        id: Date.now(), // Simple ID generation
      };
      
      const highlights = res.highlights || [];
      
      return {
        ...res,
        highlights: [...highlights, newHighlight],
      };
    }));
  };
  
  // Delete a highlight from a reservation
  const deleteHighlight = (reservationId: number, highlightId: number) => {
    setReservations(prev => prev.map(res => {
      if (res.id !== reservationId) return res;
      
      const highlights = res.highlights || [];
      
      return {
        ...res,
        highlights: highlights.filter(h => h.id !== highlightId),
      };
    }));
  };

  // Delete a reservation (for admins)
  const deleteReservation = (id: number) => {
    setReservations(prev => prev.filter(reservation => reservation.id !== id));
  };

  // Return provider with context value
  const value = {
    reservations, 
    addReservation, 
    joinGame,
    cancelReservation,
    updateReservationStatus,
    isUserJoined,
    joinWaitingList,
    leaveWaitingList,
    hasUserJoinedOnDate,
    getReservationsForDate,
    editReservation,
    navigateToReservation,
    pitches,
    deletePitch,
    addPitch,
    updatePitch,
    getUserStats,
    suspendPlayer,
    addHighlight,
    deleteHighlight,
    deleteReservation
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};

// Custom hook for accessing reservation context
export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error("useReservation must be used within a ReservationProvider");
  }
  return context;
};
