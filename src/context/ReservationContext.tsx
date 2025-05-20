import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { games, pitches, generateRandomLineup, generateRandomHighlights } from './demoData';

// Define types
export interface Pitch {
  id: number;
  name: string;
  location: string;
  imageUrl?: string;
  availability?: string;
  hours?: string;
  capacity?: string;
  price?: number;
  description?: string;
  amenities?: string[];
  image?: string;
  details?: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  playersPerSide?: number;
  features?: string[];
  galleryImages?: string[];
}

export interface Player {
  userId: string;
  playerName?: string;
  position?: string;
  avatarUrl?: string;
  status?: 'joined' | 'invited' | 'pending';
}

export type HighlightType = 'goal' | 'assist' | 'yellowCard' | 'redCard' | 'save' | 'other';

export interface Highlight {
  id: string;
  type: HighlightType;
  minute: number;
  playerId: string;
  playerName?: string;
  assistPlayerId?: string;
  description?: string;
  isPenalty?: boolean;
  timestamp?: string;
  reservationId?: number;
}

export interface NewReservationData {
  date: string;
  time: string;
  pitchName: string;
  location: string;
  maxPlayers: number;
  price?: number;
  title?: string;
  imageUrl?: string;
  status: 'open' | 'full' | 'completed' | 'cancelled';
}

export interface Reservation {
  id: number;
  date: string;
  time: string;
  pitchName: string;
  location: string;
  maxPlayers: number;
  playersJoined: number;
  status: 'open' | 'full' | 'completed' | 'cancelled';
  price?: number;
  title?: string;
  lineup: Player[];
  waitingList: string[];
  imageUrl?: string;
  highlights: Highlight[];
  finalScore?: {
    home: number;
    away: number;
  };
  mvp?: string;
}

export interface UserStats {
  gamesPlayed: number;
  goals: number;
  goalsScored?: number;
  assists: number;
  cleansheets: number;
  mvps: number;
  yellowCards?: number;
  redCards?: number;
  matches?: number;
  wins?: number;
  tackles?: number;
}

export interface ReservationContextType {
  reservations: Reservation[];
  pitches: Pitch[];
  addReservation: (newReservation: Omit<Reservation, 'id' | 'lineup' | 'waitingList' | 'highlights'>) => void;
  joinGame: (reservationId: number, player?: Player, userId?: string) => void;
  cancelReservation: (reservationId: number, userId: string) => void;
  deleteReservation: (reservationId: number) => void;
  updateReservation: (updatedReservation: Reservation) => void;
  editReservation: (updatedReservation: Reservation) => void;
  updateReservationStatus: (reservationId: number, status: 'open' | 'full' | 'completed' | 'cancelled') => void;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  joinWaitingList: (reservationId: number, userId: string) => void;
  leaveWaitingList: (reservationId: number, userId: string) => void;
  addPitch: (newPitch: Omit<Pitch, 'id'>) => void;
  updatePitch: (updatedPitch: Pitch) => void;
  deletePitch: (pitchId: number) => void;
  hasUserJoinedOnDate: (date: Date, userId: string) => boolean;
  getReservationsForDate: (date: Date) => Reservation[];
  navigateToReservation: (pitchName: string) => void;
  getUserStats: (userId: string) => UserStats;
  addHighlight: (reservationId: number, highlight: Omit<Highlight, 'id'>) => void;
  deleteHighlight: (reservationId: number, highlightId: string) => void;
}

// Create context
const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

// Provider component
export const ReservationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>(games);
  const [availablePitches, setAvailablePitches] = useState<Pitch[]>(pitches);

  // Add a new reservation
  const addReservation = (newReservation: Omit<Reservation, 'id' | 'lineup' | 'waitingList' | 'highlights'>) => {
    const newId = Math.max(0, ...reservations.map(r => r.id)) + 1;
    const reservation: Reservation = {
      ...newReservation,
      id: newId,
      lineup: [],
      waitingList: [],
      highlights: [],
      playersJoined: 0
    };
    setReservations([...reservations, reservation]);
  };

  // Join a game
  const joinGame = (reservationId: number, player?: Player, userId?: string) => {
    setReservations(prevReservations => 
      prevReservations.map(res => {
        if (res.id === reservationId) {
          // If userId is provided but no player object, create a basic player
          let newPlayer = player;
          if (!player && userId) {
            newPlayer = {
              userId,
              playerName: `Player ${Math.floor(Math.random() * 1000)}`,
              status: 'joined'
            };
          } else if (!player && !userId) {
            return res; // No player or userId provided, don't modify
          }
          
          // Add player to lineup
          const updatedLineup = [...res.lineup, newPlayer!];
          
          // Update status if now full
          let newStatus = res.status;
          if (updatedLineup.length >= res.maxPlayers) {
            newStatus = 'full';
          }
          
          return {
            ...res,
            lineup: updatedLineup,
            playersJoined: updatedLineup.length,
            status: newStatus
          };
        }
        return res;
      })
    );
  };

  // Cancel a reservation (player leaves)
  const cancelReservation = (reservationId: number, userId: string) => {
    setReservations(prevReservations => 
      prevReservations.map(res => {
        if (res.id === reservationId) {
          const updatedLineup = res.lineup.filter(player => player.userId !== userId);
          
          // If game was full but now has space, update status
          let newStatus = res.status;
          if (res.status === 'full' && updatedLineup.length < res.maxPlayers) {
            newStatus = 'open';
          }
          
          return {
            ...res,
            lineup: updatedLineup,
            playersJoined: updatedLineup.length,
            status: newStatus
          };
        }
        return res;
      })
    );
  };

  // Delete a reservation
  const deleteReservation = (reservationId: number) => {
    setReservations(prevReservations => 
      prevReservations.filter(res => res.id !== reservationId)
    );
  };

  // Update a reservation
  const updateReservation = (updatedReservation: Reservation) => {
    setReservations(prevReservations => 
      prevReservations.map(res => 
        res.id === updatedReservation.id ? updatedReservation : res
      )
    );
  };
  
  // Edit a reservation (alias for updateReservation for compatibility)
  const editReservation = (updatedReservation: Reservation) => {
    updateReservation(updatedReservation);
  };

  // Update reservation status
  const updateReservationStatus = (reservationId: number, status: 'open' | 'full' | 'completed' | 'cancelled') => {
    setReservations(prevReservations => 
      prevReservations.map(res => 
        res.id === reservationId ? {...res, status} : res
      )
    );
  };

  // Check if user has joined a game
  const isUserJoined = (reservationId: number, userId: string) => {
    const reservation = reservations.find(res => res.id === reservationId);
    return reservation?.lineup.some(player => player.userId === userId) || false;
  };

  // Join waiting list
  const joinWaitingList = (reservationId: number, userId: string) => {
    setReservations(prevReservations => 
      prevReservations.map(res => {
        if (res.id === reservationId && !res.waitingList.includes(userId)) {
          return {
            ...res,
            waitingList: [...res.waitingList, userId]
          };
        }
        return res;
      })
    );
  };

  // Leave waiting list
  const leaveWaitingList = (reservationId: number, userId: string) => {
    setReservations(prevReservations => 
      prevReservations.map(res => {
        if (res.id === reservationId) {
          return {
            ...res,
            waitingList: res.waitingList.filter(id => id !== userId)
          };
        }
        return res;
      })
    );
  };

  // Add a new pitch
  const addPitch = (newPitch: Omit<Pitch, 'id'>) => {
    const newId = Math.max(0, ...availablePitches.map(p => p.id)) + 1;
    const pitch: Pitch = {
      ...newPitch,
      id: newId,
      image: newPitch.imageUrl // Set image field to be compatible
    };
    setAvailablePitches([...availablePitches, pitch]);
  };

  // Update a pitch
  const updatePitch = (updatedPitch: Pitch) => {
    const pitchWithImage = {
      ...updatedPitch,
      image: updatedPitch.imageUrl // Ensure image is set from imageUrl
    };
    
    setAvailablePitches(prevPitches => 
      prevPitches.map(pitch => 
        pitch.id === updatedPitch.id ? pitchWithImage : pitch
      )
    );
  };

  // Delete a pitch
  const deletePitch = (pitchId: number) => {
    setAvailablePitches(prevPitches => 
      prevPitches.filter(pitch => pitch.id !== pitchId)
    );
  };

  // Check if user has joined a game on a specific date
  const hasUserJoinedOnDate = (date: Date, userId: string): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.some(res => 
      res.date.startsWith(dateStr) && 
      res.lineup.some(player => player.userId === userId) &&
      res.status !== 'cancelled'
    );
  };

  // Get all reservations for a specific date
  const getReservationsForDate = (date: Date): Reservation[] => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(res => res.date.startsWith(dateStr));
  };

  // Navigate to reservation (used for booking from pitch page)
  const navigateToReservation = (pitchName: string) => {
    // In a real app, this would navigate to the booking form
    console.log(`Navigating to book pitch: ${pitchName}`);
    // This would typically use router navigation
  };

  // Get user stats from played games
  const getUserStats = (userId: string): UserStats => {
    // Get all completed games the user has played in
    const userGames = reservations.filter(
      game => game.status === 'completed' && game.lineup.some(player => player.userId === userId)
    );
    
    // Count stats from games and highlights
    const stats: UserStats = {
      gamesPlayed: userGames.length,
      goals: 0,
      goalsScored: 0,
      assists: 0,
      cleansheets: 0,
      mvps: 0,
      yellowCards: 0,
      redCards: 0,
      matches: userGames.length, // Alias for gamesPlayed
      wins: Math.floor(userGames.length * 0.6), // Estimate some wins
      tackles: Math.floor(Math.random() * 20) // Random tackles for display purposes
    };
    
    userGames.forEach(game => {
      // Count goals scored by this user
      const userGoals = game.highlights.filter(
        h => h.type === 'goal' && h.playerId === userId
      ).length;
      stats.goals += userGoals;
      stats.goalsScored = stats.goals; // Alias for compatibility
      
      // Count assists by this user
      stats.assists += game.highlights.filter(
        h => h.type === 'assist' && h.playerId === userId
      ).length;
      
      // Count yellow cards
      stats.yellowCards = (stats.yellowCards || 0) + game.highlights.filter(
        h => h.type === 'yellowCard' && h.playerId === userId
      ).length;
      
      // Count red cards
      stats.redCards = (stats.redCards || 0) + game.highlights.filter(
        h => h.type === 'redCard' && h.playerId === userId
      ).length;
      
      // Count MVPs
      if (game.mvp === userId) {
        stats.mvps++;
      }
      
      // Cleansheets (for goalkeepers)
      // This would need game position data to really determine
    });
    
    return stats;
  };
  
  // Add a highlight to a reservation
  const addHighlight = (reservationId: number, highlight: Omit<Highlight, 'id'>) => {
    setReservations(prevReservations => 
      prevReservations.map(res => {
        if (res.id === reservationId) {
          const newHighlight = {
            ...highlight,
            id: `highlight-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          };
          return {
            ...res,
            highlights: [...res.highlights, newHighlight]
          };
        }
        return res;
      })
    );
  };
  
  // Delete a highlight from a reservation
  const deleteHighlight = (reservationId: number, highlightId: string) => {
    setReservations(prevReservations =>
      prevReservations.map(res => {
        if (res.id === reservationId) {
          return {
            ...res,
            highlights: res.highlights.filter(h => h.id !== highlightId)
          };
        }
        return res;
      })
    );
  };

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        pitches: availablePitches,
        addReservation,
        joinGame,
        cancelReservation,
        deleteReservation,
        updateReservation,
        editReservation,
        updateReservationStatus,
        isUserJoined,
        joinWaitingList,
        leaveWaitingList,
        addPitch,
        updatePitch,
        deletePitch,
        hasUserJoinedOnDate,
        getReservationsForDate,
        navigateToReservation,
        getUserStats,
        addHighlight,
        deleteHighlight
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

// Custom hook to use the reservation context
export const useReservation = (): ReservationContextType => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};
