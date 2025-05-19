
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// Interface for data required when creating a new reservation
export interface NewReservationData {
  pitchName: string;
  date: string; 
  time: string;
  location: string;
  price: number;
  maxPlayers: number;
  imageUrl?: string;
  title?: string;
}

// Player status in a reservation
export type PlayerStatus = 'joined' | 'invited' | 'pending' | 'declined';

// Lineup player interface
export interface LineupPlayer {
  userId: string;
  playerName?: string;
  status: PlayerStatus;
  joinedAt?: string;
}

// Highlight types
export type HighlightType = 'goal' | 'assist' | 'yellowCard' | 'redCard' | 'save' | 'other';

// Highlight interface
export interface Highlight {
  id: number;
  type: HighlightType;
  playerId: string;
  playerName: string;
  minute: number;
  description?: string;
}

// Reservation status types
export type ReservationStatus = 'open' | 'full' | 'completed' | 'cancelled';

// Reservation interface
export interface Reservation {
  id: number;
  pitchName: string;
  date: string;
  time: string;
  location: string;
  price: number;
  maxPlayers: number;
  playersJoined: number;
  status: ReservationStatus;
  lineup: LineupPlayer[];
  waitingList: string[];
  highlights: Highlight[];
  finalScore?: string;
  mvpPlayerId?: string;
  imageUrl?: string;
  title?: string;
  createdBy?: string;
  createdAt: string;
}

// Pitch interface
export interface Pitch {
  id: number;
  name: string;
  location: string;
  imageUrl: string;
  price: number;
  amenities: string[];
  availability?: string;
  rating: number;
}

// User statistics interface
export interface UserStats {
  gamesPlayed: number;
  goalsScored: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  mvps: number;
}

// Context interface
interface ReservationContextType {
  reservations: Reservation[];
  pitches: Pitch[];
  addReservation: (data: NewReservationData) => void;
  editReservation: (id: number, data: Partial<Reservation>) => void;
  deleteReservation: (id: number) => void;
  joinReservation: (id: number, userId: string, playerName?: string) => void;
  cancelReservation: (id: number, userId: string) => void;
  joinWaitingList: (id: number, userId: string) => void;
  leaveWaitingList: (id: number, userId: string) => void;
  updateReservationStatus: (id: number, status: ReservationStatus) => void;
  addHighlight: (reservationId: number, highlight: Highlight) => void;
  removeHighlight: (reservationId: number, highlightId: number) => void;
  getUserStats: (userId: string) => UserStats;
  navigateToReservation: (id: number) => void;
}

// Create the context
const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

// Sample data to seed the app
const initialReservations: Reservation[] = [
  {
    id: 1,
    pitchName: "Central Park Fields",
    title: "Sunday Morning Match",
    date: "2025-05-25",
    time: "10:00 - 11:30",
    location: "Downtown Sports Complex",
    price: 15,
    maxPlayers: 10,
    playersJoined: 8,
    status: "open",
    lineup: [
      { userId: "user-1", playerName: "Alex Johnson", status: "joined", joinedAt: "2025-05-10T14:22:00Z" },
      { userId: "user-2", playerName: "Jamie Smith", status: "joined", joinedAt: "2025-05-10T15:30:00Z" },
      { userId: "user-3", playerName: "Taylor Brown", status: "joined", joinedAt: "2025-05-10T16:15:00Z" },
      { userId: "user-4", playerName: "Jordan Lee", status: "joined", joinedAt: "2025-05-11T09:10:00Z" },
      { userId: "user-5", playerName: "Casey Wilson", status: "joined", joinedAt: "2025-05-11T10:05:00Z" },
      { userId: "user-6", playerName: "Riley Martin", status: "joined", joinedAt: "2025-05-12T11:30:00Z" },
      { userId: "user-7", playerName: "Morgan Davis", status: "joined", joinedAt: "2025-05-12T14:45:00Z" },
      { userId: "user-8", playerName: "Avery Thomas", status: "joined", joinedAt: "2025-05-13T16:20:00Z" },
    ],
    waitingList: [],
    highlights: [],
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    createdAt: "2025-05-10T12:00:00Z"
  },
  {
    id: 2,
    pitchName: "Riverside Stadium",
    title: "Evening League Match",
    date: "2025-05-28",
    time: "18:30 - 20:00",
    location: "Riverside Sports Center",
    price: 20,
    maxPlayers: 10,
    playersJoined: 12,
    status: "full",
    lineup: [
      { userId: "user-2", playerName: "Jamie Smith", status: "joined", joinedAt: "2025-05-15T09:10:00Z" },
      { userId: "user-4", playerName: "Jordan Lee", status: "joined", joinedAt: "2025-05-15T10:25:00Z" },
      { userId: "user-5", playerName: "Casey Wilson", status: "joined", joinedAt: "2025-05-15T11:30:00Z" },
      { userId: "user-8", playerName: "Avery Thomas", status: "joined", joinedAt: "2025-05-15T13:40:00Z" },
      { userId: "user-9", playerName: "Quinn Miller", status: "joined", joinedAt: "2025-05-16T14:20:00Z" },
      { userId: "user-10", playerName: "Sam Roberts", status: "joined", joinedAt: "2025-05-16T15:00:00Z" },
      { userId: "user-11", playerName: "Blake Turner", status: "joined", joinedAt: "2025-05-16T16:45:00Z" },
      { userId: "user-12", playerName: "Drew Phillips", status: "joined", joinedAt: "2025-05-17T10:15:00Z" },
      { userId: "user-13", playerName: "Charlie Baker", status: "joined", joinedAt: "2025-05-17T11:50:00Z" },
      { userId: "user-14", playerName: "Reese Campbell", status: "joined", joinedAt: "2025-05-17T13:30:00Z" },
      { userId: "user-15", playerName: "Skyler Adams", status: "joined", joinedAt: "2025-05-18T14:10:00Z" },
      { userId: "user-16", playerName: "Alex Wright", status: "joined", joinedAt: "2025-05-18T16:30:00Z" },
    ],
    waitingList: ["user-17", "user-18"],
    highlights: [],
    imageUrl: "https://images.unsplash.com/photo-1518604666860-9cd681bb7b24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    createdAt: "2025-05-15T08:00:00Z"
  },
  {
    id: 3,
    pitchName: "Green Valley FC",
    title: "Weekend Tournament Game",
    date: "2025-04-10",
    time: "15:00 - 16:30",
    location: "Green Valley Sports Complex",
    price: 18,
    maxPlayers: 10,
    playersJoined: 10,
    status: "completed",
    lineup: [
      { userId: "user-1", playerName: "Alex Johnson", status: "joined", joinedAt: "2025-04-01T09:15:00Z" },
      { userId: "user-3", playerName: "Taylor Brown", status: "joined", joinedAt: "2025-04-01T10:20:00Z" },
      { userId: "user-5", playerName: "Casey Wilson", status: "joined", joinedAt: "2025-04-01T11:40:00Z" },
      { userId: "user-7", playerName: "Morgan Davis", status: "joined", joinedAt: "2025-04-02T13:00:00Z" },
      { userId: "user-9", playerName: "Quinn Miller", status: "joined", joinedAt: "2025-04-02T14:30:00Z" },
      { userId: "user-11", playerName: "Blake Turner", status: "joined", joinedAt: "2025-04-02T15:45:00Z" },
      { userId: "user-12", playerName: "Drew Phillips", status: "joined", joinedAt: "2025-04-03T09:20:00Z" },
      { userId: "user-14", playerName: "Reese Campbell", status: "joined", joinedAt: "2025-04-03T10:35:00Z" },
      { userId: "user-16", playerName: "Alex Wright", status: "joined", joinedAt: "2025-04-03T11:50:00Z" },
      { userId: "user-18", playerName: "Robin Parker", status: "joined", joinedAt: "2025-04-03T13:10:00Z" },
    ],
    waitingList: [],
    highlights: [
      { id: 1, type: "goal", playerId: "user-1", playerName: "Alex Johnson", minute: 15, description: "Great long-range shot" },
      { id: 2, type: "assist", playerId: "user-3", playerName: "Taylor Brown", minute: 15, description: "Perfect through ball" },
      { id: 3, type: "goal", playerId: "user-5", playerName: "Casey Wilson", minute: 32, description: "Header from corner" },
      { id: 4, type: "yellowCard", playerId: "user-7", playerName: "Morgan Davis", minute: 40, description: "Late tackle" },
      { id: 5, type: "save", playerId: "user-9", playerName: "Quinn Miller", minute: 55, description: "Diving save" },
      { id: 6, type: "goal", playerId: "user-1", playerName: "Alex Johnson", minute: 67, description: "Penalty kick" },
      { id: 7, type: "redCard", playerId: "user-11", playerName: "Blake Turner", minute: 75, description: "Second yellow card" },
    ],
    finalScore: "3-2",
    mvpPlayerId: "user-1",
    imageUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
    createdAt: "2025-04-01T08:00:00Z"
  }
];

const initialPitches: Pitch[] = [
  {
    id: 1,
    name: "Central Park Fields",
    location: "Downtown Sports Complex",
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    price: 15,
    amenities: ["Floodlights", "Changing Rooms", "Parking", "Café"],
    rating: 4.7
  },
  {
    id: 2,
    name: "Riverside Stadium",
    location: "Riverside Sports Center",
    imageUrl: "https://images.unsplash.com/photo-1518604666860-9cd681bb7b24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    price: 20,
    amenities: ["Synthetic Turf", "Floodlights", "Changing Rooms", "Showers", "Parking"],
    rating: 4.9
  },
  {
    id: 3,
    name: "Green Valley FC",
    location: "Green Valley Sports Complex",
    imageUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
    price: 18,
    amenities: ["Natural Grass", "Changing Rooms", "Parking", "Spectator Seating"],
    rating: 4.5
  }
];

// Provider component
export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  
  // State for reservations and pitches
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [pitches, setPitches] = useState<Pitch[]>(initialPitches);

  // Add a new reservation
  const addReservation = (data: NewReservationData) => {
    const newReservation: Reservation = {
      id: Date.now(),
      ...data,
      playersJoined: 0,
      status: 'open',
      lineup: [],
      waitingList: [],
      highlights: [],
      createdAt: new Date().toISOString()
    };
    
    setReservations(prev => [...prev, newReservation]);
    toast({
      title: "Reservation Created",
      description: `A new reservation at ${data.pitchName} has been created.`,
    });
  };

  // Edit existing reservation
  const editReservation = (id: number, data: Partial<Reservation>) => {
    setReservations(prev => 
      prev.map(res => 
        res.id === id ? { ...res, ...data } : res
      )
    );
    
    toast({
      title: "Reservation Updated",
      description: "The reservation details have been updated.",
    });
  };

  // Delete a reservation
  const deleteReservation = (id: number) => {
    setReservations(prev => prev.filter(res => res.id !== id));
    
    toast({
      title: "Reservation Deleted",
      description: "The reservation has been deleted.",
    });
  };

  // Join a reservation
  const joinReservation = (id: number, userId: string, playerName?: string) => {
    setReservations(prev => 
      prev.map(res => {
        if (res.id === id) {
          // Check if user is already in lineup
          const isInLineup = res.lineup.some(player => player.userId === userId);
          
          if (isInLineup) {
            return res;
          }
          
          // Add user to lineup
          const newLineup = [
            ...res.lineup,
            {
              userId,
              playerName,
              status: 'joined' as PlayerStatus,
              joinedAt: new Date().toISOString()
            }
          ];
          
          const newPlayersJoined = newLineup.filter(player => player.status === 'joined').length;
          
          // Check if reservation is now full (with 2 subs for 5v5, 7v7 and 11v11)
          let newStatus = res.status;
          const actualMaxPlayers = res.maxPlayers === 10 ? 12 : res.maxPlayers + 2;
          
          if (newPlayersJoined >= actualMaxPlayers && newStatus === 'open') {
            newStatus = 'full';
          }
          
          return {
            ...res,
            lineup: newLineup,
            playersJoined: newPlayersJoined,
            status: newStatus
          };
        }
        return res;
      })
    );
    
    toast({
      title: "Game Joined",
      description: "You've successfully joined this game. See you on the pitch!",
    });
  };

  // Cancel/leave a reservation
  const cancelReservation = (id: number, userId: string) => {
    setReservations(prev => 
      prev.map(res => {
        if (res.id === id) {
          // Remove user from lineup
          const newLineup = res.lineup.filter(player => player.userId !== userId);
          const newPlayersJoined = newLineup.filter(player => player.status === 'joined').length;
          
          // Check if there's someone on the waiting list
          let newWaitingList = [...res.waitingList];
          
          // If there was space created and someone is on the waiting list, move them to the lineup
          const actualMaxPlayers = res.maxPlayers === 10 ? 12 : res.maxPlayers + 2;
          if (res.status === 'full' && newPlayersJoined < actualMaxPlayers && newWaitingList.length > 0) {
            const nextPlayer = newWaitingList[0];
            newLineup.push({
              userId: nextPlayer,
              status: 'joined',
              joinedAt: new Date().toISOString()
            });
            newWaitingList = newWaitingList.slice(1);
          }
          
          // Update status if needed
          let newStatus = res.status;
          if (newPlayersJoined < actualMaxPlayers && newStatus === 'full') {
            newStatus = 'open';
          }
          
          return {
            ...res,
            lineup: newLineup,
            playersJoined: newLineup.filter(player => player.status === 'joined').length,
            waitingList: newWaitingList,
            status: newStatus
          };
        }
        return res;
      })
    );
    
    toast({
      title: "Reservation Cancelled",
      description: "You've left this game.",
    });
  };

  // Join waiting list
  const joinWaitingList = (id: number, userId: string) => {
    setReservations(prev => 
      prev.map(res => {
        if (res.id === id) {
          // Check if user is already in waiting list
          if (res.waitingList.includes(userId)) {
            return res;
          }
          
          // Check if waiting list is full (maximum 3 players)
          if (res.waitingList.length >= 3) {
            toast({
              title: "Waiting List Full",
              description: "The waiting list for this game is full.",
              variant: "destructive"
            });
            return res;
          }
          
          // Add user to waiting list
          const newWaitingList = [...res.waitingList, userId];
          
          return {
            ...res,
            waitingList: newWaitingList
          };
        }
        return res;
      })
    );
    
    toast({
      title: "Added to Waiting List",
      description: "You've been added to the waiting list for this game.",
    });
  };

  // Leave waiting list
  const leaveWaitingList = (id: number, userId: string) => {
    setReservations(prev => 
      prev.map(res => {
        if (res.id === id) {
          // Remove user from waiting list
          const newWaitingList = res.waitingList.filter(id => id !== userId);
          
          return {
            ...res,
            waitingList: newWaitingList
          };
        }
        return res;
      })
    );
    
    toast({
      title: "Removed from Waiting List",
      description: "You've been removed from the waiting list for this game.",
    });
  };

  // Update reservation status
  const updateReservationStatus = (id: number, status: ReservationStatus) => {
    setReservations(prev => 
      prev.map(res => 
        res.id === id ? { ...res, status } : res
      )
    );
  };

  // Add highlight
  const addHighlight = (reservationId: number, highlight: Highlight) => {
    setReservations(prev => 
      prev.map(res => {
        if (res.id === reservationId) {
          const newHighlights = [...res.highlights, highlight];
          return { ...res, highlights: newHighlights };
        }
        return res;
      })
    );
  };

  // Remove highlight
  const removeHighlight = (reservationId: number, highlightId: number) => {
    setReservations(prev => 
      prev.map(res => {
        if (res.id === reservationId) {
          const newHighlights = res.highlights.filter(h => h.id !== highlightId);
          return { ...res, highlights: newHighlights };
        }
        return res;
      })
    );
  };

  // Get user statistics
  const getUserStats = (userId: string): UserStats => {
    const userGames = reservations.filter(res => 
      res.lineup.some(player => player.userId === userId && player.status === 'joined') &&
      res.status === 'completed'
    );
    
    const gamesPlayed = userGames.length;
    const goalsScored = userGames.reduce(
      (total, game) => total + game.highlights.filter(h => h.playerId === userId && h.type === 'goal').length,
      0
    );
    const assists = userGames.reduce(
      (total, game) => total + game.highlights.filter(h => h.playerId === userId && h.type === 'assist').length,
      0
    );
    const yellowCards = userGames.reduce(
      (total, game) => total + game.highlights.filter(h => h.playerId === userId && h.type === 'yellowCard').length,
      0
    );
    const redCards = userGames.reduce(
      (total, game) => total + game.highlights.filter(h => h.playerId === userId && h.type === 'redCard').length,
      0
    );
    const mvps = userGames.filter(game => game.mvpPlayerId === userId).length;
    
    return {
      gamesPlayed,
      goalsScored,
      assists,
      yellowCards,
      redCards,
      mvps
    };
  };

  // Navigate to reservation details
  const navigateToReservation = (id: number) => {
    navigate('/reservations', { state: { selectedReservationId: id } });
  };

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        pitches,
        addReservation,
        editReservation,
        deleteReservation,
        joinReservation,
        cancelReservation,
        joinWaitingList,
        leaveWaitingList,
        updateReservationStatus,
        addHighlight,
        removeHighlight,
        getUserStats,
        navigateToReservation
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

// Custom hook for using the context
export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};
