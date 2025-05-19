
import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSameDay } from 'date-fns';

// Types for player in lineup
export interface LineupPlayer {
  userId: string;
  status: 'joined' | 'left' | 'invited';
  joinedAt?: string;
  playerName?: string; // Adding playerName property that's being used
}

// Types for highlight events
export type HighlightType = 'goal' | 'assist' | 'yellowCard' | 'redCard' | 'save' | 'other';

// Type for a single highlight
export interface Highlight {
  id: number;
  type: HighlightType;
  minute: number;
  playerName: string;
  playerId: string;
  description?: string;
}

// Type for reservation status
export type ReservationStatus = 'open' | 'full' | 'completed' | 'cancelled';

// Type for a single reservation
export interface Reservation {
  id: number;
  pitchName: string;
  date: string; // ISO date string format
  time: string; // e.g., "18:00 - 19:30"
  status: ReservationStatus;
  playersJoined: number;
  maxPlayers: number;
  lineup: LineupPlayer[];
  waitingList: string[]; // User IDs
  highlights: Highlight[];
  location?: string;
  price?: number;
  imageUrl?: string;
  finalScore?: string;
  title?: string;
  mvpPlayerId?: string; // Adding mvpPlayerId property
}

// Type for new reservation data
export interface NewReservationData {
  pitchName: string;
  date: string;
  time: string;
  location?: string;
  maxPlayers: number;
  price?: number; // Adding price property
  imageUrl?: string;
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
  addHighlight: (reservationId: number, highlight: Omit<Highlight, 'id'>) => void;
  deleteHighlight: (reservationId: number, highlightId: number) => void;
  editReservation: (reservationId: number, data: Partial<Omit<Reservation, 'id'>>) => void;
}

// Create the context
const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

// Sample data for initial reservations
const initialReservations: Reservation[] = [
  {
    id: 1,
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
    highlights: [],
    location: "Downtown Sports Complex",
    price: 15,
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    id: 2,
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
    highlights: [],
    location: "Riverside Sports Center",
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
  }
];

// Provider component
export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to store all reservations
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);

  // Add a new reservation
  const addReservation = (data: NewReservationData) => {
    const newReservation: Reservation = {
      id: Date.now(), // Simple ID generation
      ...data,
      status: 'open',
      playersJoined: 0,
      lineup: [],
      waitingList: [],
      highlights: [],
    };
    
    setReservations(prev => [...prev, newReservation]);
    
    return newReservation.id;
  };

  // Join a game
  const joinGame = (reservationId: number, playerName?: string, userId?: string) => {
    if (!userId) return;
    
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
      
      // Add to lineup
      const newLineup = [
        ...res.lineup,
        {
          userId,
          status: 'joined',
          joinedAt: new Date().toISOString(),
          playerName: playerName || `Player ${userId.substring(0, 4)}`,
        }
      ];
      
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
      
      // Update lineup to mark player as left
      const newLineup = res.lineup.filter(p => p.userId !== userId);
      const playersRemaining = newLineup.filter(p => p.status === 'joined').length;
      
      // Check if there are players in waiting list to promote
      let updatedWaitingList = [...res.waitingList];
      
      return {
        ...res,
        lineup: newLineup,
        playersJoined: playersRemaining,
        waitingList: updatedWaitingList,
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

  // Add a highlight to a game
  const addHighlight = (reservationId: number, highlight: Omit<Highlight, 'id'>) => {
    setReservations(prev => prev.map(res => {
      if (res.id !== reservationId) return res;
      
      const newHighlight: Highlight = {
        ...highlight,
        id: res.highlights.length > 0 
          ? Math.max(...res.highlights.map(h => h.id)) + 1
          : 1
      };
      
      return {
        ...res,
        highlights: [...res.highlights, newHighlight]
      };
    }));
  };

  // Delete a highlight from a game
  const deleteHighlight = (reservationId: number, highlightId: number) => {
    setReservations(prev => prev.map(res => {
      if (res.id !== reservationId) return res;
      
      return {
        ...res,
        highlights: res.highlights.filter(h => h.id !== highlightId)
      };
    }));
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

  // Return provider with context value
  return (
    <ReservationContext.Provider value={{ 
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
      addHighlight,
      deleteHighlight,
      editReservation
    }}>
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
