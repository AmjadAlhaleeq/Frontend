
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { demoReservations, demoPitches } from './demoData';
import { toast } from '@/hooks/use-toast';

// Types
export type Highlight = {
  id: number;
  type: HighlightType;
  minute: number;
  playerId: string;
  playerName: string;
  description?: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  isPenalty?: boolean;
};

export type HighlightType = 'goal' | 'assist' | 'yellowCard' | 'redCard' | 'save' | 'other';

export type LineupPlayer = {
  userId: string;
  playerName?: string;
  status: 'joined' | 'left' | 'invited';
};

export type Reservation = {
  id: number;
  pitchName: string;
  title?: string;
  date: string;
  time: string;
  location: string;
  status: 'open' | 'full' | 'completed' | 'cancelled';
  maxPlayers: number;
  playersJoined: number;
  waitingList: string[];
  price?: number;
  finalScore?: string;
  mvpPlayerId?: string;
  lineup: LineupPlayer[];
  highlights: Highlight[];
  imageUrl?: string;
};

export type Pitch = {
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
};

export type UserStats = {
  gamesPlayed: number;
  goalsScored: number;
  assists: number;
  cleansheets: number;
  mvps: number;
  yellowCards: number;
  redCards: number;
};

interface ReservationContextType {
  reservations: Reservation[];
  pitches: Pitch[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'status' | 'playersJoined' | 'waitingList' | 'lineup' | 'highlights'>) => void;
  joinGame: (reservationId: number, playerName?: string, userId?: string) => void;
  cancelReservation: (reservationId: number, userId: string) => void;
  deleteReservation: (reservationId: number) => void;
  updateReservationStatus: (reservationId: number, status: 'open' | 'full' | 'completed' | 'cancelled') => void;
  addHighlight: (reservationId: number, highlight: Omit<Highlight, 'id'>) => void;
  deleteHighlight: (reservationId: number, highlightId: number) => void;
  editReservation: (reservationId: number, updates: Partial<Reservation>) => void;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  hasUserJoinedOnDate: (date: Date, userId: string) => boolean;
  getReservationsForDate: (date: Date) => Reservation[];
  joinWaitingList: (reservationId: number, userId: string) => void;
  leaveWaitingList: (reservationId: number, userId: string) => void;
  addPitch: (pitch: Omit<Pitch, 'id'>) => void;
  editPitch: (pitchId: number, updates: Partial<Pitch>) => void;
  deletePitch: (pitchId: number) => void;
  navigateToReservation: (pitchName: string) => void;
  removePlayerFromReservation: (reservationId: number, userId: string) => void;
  notifyWaitingListPlayers: (reservationId: number) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const ReservationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>(demoReservations);
  const [pitches, setPitches] = useState<Pitch[]>(demoPitches);

  // Add a new reservation
  const addReservation = (reservation: Omit<Reservation, 'id' | 'status' | 'playersJoined' | 'waitingList' | 'lineup' | 'highlights'>) => {
    const newReservation: Reservation = {
      ...reservation,
      id: Date.now(),
      status: 'open',
      playersJoined: 0,
      waitingList: [],
      lineup: [],
      highlights: []
    };
    
    setReservations(prevReservations => [...prevReservations, newReservation]);
  };

  // Join a game
  const joinGame = (reservationId: number, playerName?: string, userId?: string) => {
    const currentUserId = userId || 'user1'; // Default to 'user1' if no userId provided
    const currentPlayerName = playerName || 'John Smith'; // Default name if not provided
    
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          // Check if user is already in the lineup
          const isUserAlreadyJoined = reservation.lineup.some(player => player.userId === currentUserId);
          
          if (isUserAlreadyJoined) {
            return reservation; // User already joined, no change
          }
          
          // Add user to lineup
          const updatedLineup = [
            ...reservation.lineup,
            { userId: currentUserId, playerName: currentPlayerName, status: 'joined' as const }
          ];
          
          const updatedPlayersJoined = reservation.playersJoined + 1;
          
          // Update status to 'full' if maximum players reached
          let updatedStatus = reservation.status;
          if (updatedPlayersJoined >= reservation.maxPlayers && updatedStatus === 'open') {
            updatedStatus = 'full';
          }
          
          return {
            ...reservation,
            lineup: updatedLineup,
            playersJoined: updatedPlayersJoined,
            status: updatedStatus
          };
        }
        return reservation;
      });
    });
  };

  // Cancel a reservation (leave a game)
  const cancelReservation = (reservationId: number, userId: string) => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          // Find user in lineup
          const updatedLineup = reservation.lineup.map(player => {
            if (player.userId === userId) {
              return { ...player, status: 'left' as const };
            }
            return player;
          });
          
          // Decrease players joined count
          const updatedPlayersJoined = reservation.playersJoined - 1;
          
          // Update status back to 'open' if it was 'full'
          let updatedStatus = reservation.status;
          if (updatedStatus === 'full' && updatedPlayersJoined < reservation.maxPlayers) {
            updatedStatus = 'open';
          }
          
          // Notify first person in waiting list if there is one
          if (reservation.waitingList.length > 0) {
            toast({
              title: "Waiting List Notification",
              description: `A spot has opened up! First player on the waiting list has been notified.`,
            });
            // In a real app, we would send an email notification here
          }
          
          return {
            ...reservation,
            lineup: updatedLineup,
            playersJoined: updatedPlayersJoined,
            status: updatedStatus
          };
        }
        return reservation;
      });
    });
  };

  // Delete a reservation
  const deleteReservation = (reservationId: number) => {
    setReservations(prevReservations => 
      prevReservations.filter(reservation => reservation.id !== reservationId)
    );
  };

  // Update reservation status
  const updateReservationStatus = (reservationId: number, status: 'open' | 'full' | 'completed' | 'cancelled') => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          return { ...reservation, status };
        }
        return reservation;
      });
    });
  };

  // Add highlight to a reservation
  const addHighlight = (reservationId: number, highlight: Omit<Highlight, 'id'>) => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          const newHighlight: Highlight = {
            ...highlight,
            id: Date.now()
          };
          
          return {
            ...reservation,
            highlights: [...reservation.highlights, newHighlight]
          };
        }
        return reservation;
      });
    });
  };

  // Delete highlight from a reservation
  const deleteHighlight = (reservationId: number, highlightId: number) => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          return {
            ...reservation,
            highlights: reservation.highlights.filter(h => h.id !== highlightId)
          };
        }
        return reservation;
      });
    });
  };

  // Edit reservation
  const editReservation = (reservationId: number, updates: Partial<Reservation>) => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          return { ...reservation, ...updates };
        }
        return reservation;
      });
    });
  };

  // Check if a user has joined a specific reservation
  const isUserJoined = (reservationId: number, userId: string): boolean => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return false;
    
    return reservation.lineup.some(player => player.userId === userId && player.status === 'joined');
  };

  // Check if a user has joined any reservation on a given date
  const hasUserJoinedOnDate = (date: Date, userId: string): boolean => {
    const dateString = date.toISOString().split('T')[0];
    
    return reservations.some(reservation => {
      return (
        reservation.date === dateString &&
        (reservation.status === 'open' || reservation.status === 'full') &&
        reservation.lineup.some(player => player.userId === userId && player.status === 'joined')
      );
    });
  };

  // Get all reservations for a specific date
  const getReservationsForDate = (date: Date): Reservation[] => {
    const dateString = date.toISOString().split('T')[0];
    return reservations.filter(reservation => reservation.date === dateString);
  };

  // Join waiting list for a reservation
  const joinWaitingList = (reservationId: number, userId: string) => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          // Check if user is already in the waiting list
          if (reservation.waitingList.includes(userId)) {
            return reservation; // User already in waiting list, no change
          }
          
          // Add user to waiting list
          return {
            ...reservation,
            waitingList: [...reservation.waitingList, userId]
          };
        }
        return reservation;
      });
    });
  };

  // Leave waiting list for a reservation
  const leaveWaitingList = (reservationId: number, userId: string) => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          // Remove user from waiting list
          return {
            ...reservation,
            waitingList: reservation.waitingList.filter(id => id !== userId)
          };
        }
        return reservation;
      });
    });
  };

  // Add a new pitch
  const addPitch = (pitch: Omit<Pitch, 'id'>) => {
    const newPitch: Pitch = {
      ...pitch,
      id: Date.now()
    };
    
    setPitches(prevPitches => [...prevPitches, newPitch]);
  };

  // Edit a pitch
  const editPitch = (pitchId: number, updates: Partial<Pitch>) => {
    setPitches(prevPitches => {
      return prevPitches.map(pitch => {
        if (pitch.id === pitchId) {
          return { ...pitch, ...updates };
        }
        return pitch;
      });
    });
  };

  // Delete a pitch
  const deletePitch = (pitchId: number) => {
    setPitches(prevPitches => 
      prevPitches.filter(pitch => pitch.id !== pitchId)
    );
  };

  // Navigate to a reservation for a specific pitch (mock function)
  const navigateToReservation = (pitchName: string) => {
    // This would typically be handled by a router, but for now just show a toast
    toast({
      title: "Navigating to Reservations",
      description: `You're being redirected to book ${pitchName}`,
    });
  };

  // Remove a player from a reservation and update stats
  const removePlayerFromReservation = (reservationId: number, userId: string) => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          // Remove user from lineup
          const updatedLineup = reservation.lineup.filter(player => player.userId !== userId);
          
          const updatedPlayersJoined = reservation.playersJoined - 1;
          
          // Update status back to 'open' if it was 'full'
          let updatedStatus = reservation.status;
          if (updatedStatus === 'full' && updatedPlayersJoined < reservation.maxPlayers) {
            updatedStatus = 'open';
          }
          
          return {
            ...reservation,
            lineup: updatedLineup,
            playersJoined: updatedPlayersJoined,
            status: updatedStatus
          };
        }
        return reservation;
      });
    });
    
    toast({
      title: "Player Removed",
      description: `The player has been removed from the reservation.`,
    });
  };

  // Notify players on the waiting list
  const notifyWaitingListPlayers = (reservationId: number) => {
    // In a real app, this would send an email notification
    // For now, just display a toast message
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation && reservation.waitingList.length > 0) {
      toast({
        title: "Waiting List Notified",
        description: `${reservation.waitingList.length} players have been notified about an open spot.`,
      });
    }
  };

  const value = {
    reservations,
    pitches,
    addReservation,
    joinGame,
    cancelReservation,
    deleteReservation,
    updateReservationStatus,
    addHighlight,
    deleteHighlight,
    editReservation,
    isUserJoined,
    hasUserJoinedOnDate,
    getReservationsForDate,
    joinWaitingList,
    leaveWaitingList,
    addPitch,
    editPitch,
    deletePitch,
    navigateToReservation,
    removePlayerFromReservation,
    notifyWaitingListPlayers
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};
