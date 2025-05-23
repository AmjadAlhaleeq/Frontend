import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, parseISO, isAfter } from 'date-fns';

export interface Reservation {
  id: number;
  pitchId: number;
  pitchName: string;
  title?: string;
  date: string;
  time: string;
  maxPlayers: number;
  playersJoined: number;
  status: "open" | "full" | "completed" | "cancelled";
  imageUrl?: string;
  price?: number;
  location?: string;
  city?: string;
  lineup?: Player[];
  waitingList?: string[];
  summary?: ReservationSummary;
  duration?: string;
  highlights?: Highlight[];
}

export interface Player {
  userId: string;
  playerName?: string;
  joinedAt?: string;
  status: "confirmed" | "waiting";
}

export interface ReservationSummary {
  finalScore?: string;
  mvpPlayerId?: string;
  mostGoalsPlayerId?: string;
  mostAssistsPlayerId?: string;
  bestDefenderPlayerId?: string;
  matchNotes?: string;
  reservationId?: number;
}

export interface Highlight {
  id: string;
  reservationId: number;
  playerId: string;
  playerName: string;
  type: HighlightType;
  timestamp: string;
  description?: string;
}

export enum HighlightType {
  GOAL = "goal",
  ASSIST = "assist",
  SAVE = "save",
  RED_CARD = "red_card",
  YELLOW_CARD = "yellow_card",
  INJURY = "injury",
  OTHER = "other"
}

export interface UserStats {
  matches: number;
  wins: number;
  mvp: number;
  goals: number;
  assists: number;
  interceptions: number;
  cleanSheets: number;
}

export interface Pitch {
  id: number;
  name: string;
  location: string;
  image: string;
  additionalImages?: string[];
  playersPerSide: number;
  description?: string;
  city?: string;
  facilities?: string[];
  pitchType?: "indoor" | "outdoor";
  price?: number;
}

export interface ReservationContextType {
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  pitches: Pitch[];
  setPitches: React.Dispatch<React.SetStateAction<Pitch[]>>;
  addReservation: (reservation: Omit<Reservation, "id" | "status" | "playersJoined">) => void;
  cancelReservation: (reservationId: number, userId: string) => void;
  joinGame: (reservationId: number, pitchId?: number, userId?: string) => void;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  hasUserJoinedOnDate: (date: Date, userId: string) => boolean;
  addPitch: (pitch: Omit<Pitch, "id">) => void;
  updatePitch: (id: number, updatedPitch: Omit<Pitch, "id">) => void;
  deletePitch: (id: number) => void;
  getPitches: () => Pitch[];
  getPitchById: (id: number) => Pitch | undefined;
  updateReservationStatus: (id: number, status: Reservation['status']) => void;
  joinWaitingList: (reservationId: number, userId: string) => void;
  leaveWaitingList: (reservationId: number, userId: string) => void;
  deleteReservation: (id: number) => void;
  addReservationSummary: (summaryData: any) => void;
  editReservation: (id: number, updatedData: Partial<Reservation>) => void;
  getUserStats: (userId: string) => UserStats;
  navigateToReservation: (pitchName: string) => void;
  addHighlight: (highlight: Omit<Highlight, "id">) => void;
  deleteHighlight: (reservationId: number, highlightId: string) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined
);

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error(
      "useReservation must be used within a ReservationProvider"
    );
  }
  return context;
};

export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    // Initialize reservations from localStorage
    const storedReservations = localStorage.getItem('reservations');
    return storedReservations ? JSON.parse(storedReservations) : [];
  });
  
  const [pitches, setPitches] = useState<Pitch[]>(() => {
    // Initialize pitches from localStorage
    const storedPitches = localStorage.getItem('pitches');
    return storedPitches ? JSON.parse(storedPitches) : [];
  });

  useEffect(() => {
    // Save pitches to localStorage whenever it changes
    localStorage.setItem('pitches', JSON.stringify(pitches));
  }, [pitches]);
  
  useEffect(() => {
    // Save reservations to localStorage whenever it changes
    localStorage.setItem('reservations', JSON.stringify(reservations));
  }, [reservations]);

  const addReservation = (
    reservation: Omit<Reservation, "id" | "status" | "playersJoined">
  ) => {
    setReservations((prevReservations) => {
      const newReservation = {
        ...reservation,
        id: prevReservations.length > 0 ? Math.max(...prevReservations.map(r => r.id)) + 1 : 1,
        status: "open" as const,
        playersJoined: 1,
      };
      return [...prevReservations, newReservation];
    });
  };
  
  const editReservation = (id: number, updatedData: Partial<Reservation>) => {
    setReservations(prevReservations =>
      prevReservations.map(res => {
        if (res.id === id) {
          return { ...res, ...updatedData };
        }
        return res;
      })
    );
  };

  const cancelReservation = (reservationId: number, userId: string) => {
    setReservations((prevReservations) =>
      prevReservations.map((res) => {
        if (res.id === reservationId) {
          const updatedLineup = res.lineup?.filter((player) => player.userId !== userId) || [];
          return {
            ...res,
            playersJoined: Math.max(0, res.playersJoined - 1),
            lineup: updatedLineup,
            waitingList: [...(res.waitingList || [])], // Keep the waiting list unchanged
            status: updatedLineup.length < res.maxPlayers ? "open" : "full",
          };
        }
        return res;
      })
    );
  };

  const joinGame = (reservationId: number, pitchId?: number, userId?: string) => {
    setReservations((prevReservations) =>
      prevReservations.map((res) => {
        if (res.id === reservationId) {
          const newPlayer = {
            userId: userId || 'unknown',
            playerName: `Player ${userId}`,
            joinedAt: new Date().toISOString(),
            status: "confirmed" as const,
          };
          
          const updatedLineup = [...(res.lineup || []), newPlayer];
          
          // Remove the user from the waiting list if they are on it
          const updatedWaitingList = (res.waitingList || []).filter(uId => uId !== userId);
          
          return {
            ...res,
            playersJoined: Math.min(res.maxPlayers, res.playersJoined + 1),
            lineup: updatedLineup,
            waitingList: updatedWaitingList, // Update the waiting list
            status: updatedLineup.length >= res.maxPlayers ? "full" : "open",
          };
        }
        return res;
      })
    );
  };
  
  const joinWaitingList = (reservationId: number, userId: string) => {
    setReservations(prevReservations =>
      prevReservations.map(res => {
        if (res.id === reservationId) {
          // Add the user to the waiting list if not already there
          const updatedWaitingList = res.waitingList?.includes(userId)
            ? res.waitingList
            : [...(res.waitingList || []), userId];
          
          return {
            ...res,
            waitingList: updatedWaitingList,
          };
        }
        return res;
      })
    );
  };
  
  const leaveWaitingList = (reservationId: number, userId: string) => {
    setReservations(prevReservations =>
      prevReservations.map(res => {
        if (res.id === reservationId) {
          // Remove the user from the waiting list
          const updatedWaitingList = (res.waitingList || []).filter(uId => uId !== userId);
          
          return {
            ...res,
            waitingList: updatedWaitingList,
          };
        }
        return res;
      })
    );
  };

  const isUserJoined = (reservationId: number, userId: string) => {
    const reservation = reservations.find((res) => res.id === reservationId);
    return reservation?.lineup?.some((player) => player.userId === userId) || false;
  };
  
  const hasUserJoinedOnDate = (date: Date, userId: string): boolean => {
    const dateString = format(date, 'yyyy-MM-dd');
    return reservations.some(res => {
      return res.date === dateString && res.lineup?.some(player => player.userId === userId);
    });
  };

  const addPitch = (pitch: Omit<Pitch, "id">) => {
    setPitches((prevPitches) => {
      const newPitch = {
        ...pitch,
        id: prevPitches.length > 0 ? Math.max(...prevPitches.map(p => p.id)) + 1 : 1,
      };
      return [...prevPitches, newPitch];
    });
  };
  
  const updatePitch = (id: number, updatedPitch: Omit<Pitch, "id">) => {
    setPitches(prevPitches => 
      prevPitches.map(pitch => 
        pitch.id === id ? { ...updatedPitch, id } : pitch
      )
    );
  };
  
  const deletePitch = (id: number) => {
    setPitches(prevPitches => prevPitches.filter(pitch => pitch.id !== id));
  };

  const getPitches = () => {
    return pitches;
  };

  const getPitchById = (id: number) => {
    return pitches.find(pitch => pitch.id === id);
  };
  
  const updateReservationStatus = (id: number, status: Reservation['status']) => {
    setReservations(prevReservations => {
      return prevReservations.map(res => {
        if (res.id === id) {
          return {
            ...res,
            status: status,
          };
        }
        return res;
      });
    });
  };
  
  const deleteReservation = (id: number) => {
    setReservations(prevReservations => {
      return prevReservations.filter(res => res.id !== id);
    });
  };

  // Implement the addReservationSummary function in the provider
  const addReservationSummary = (summaryData: any) => {
    setReservations(prevReservations => {
      return prevReservations.map(res => {
        if (res.id === summaryData.reservationId) {
          return {
            ...res,
            summary: {
              finalScore: summaryData.finalScore,
              mvpPlayerId: summaryData.mvpPlayerId,
              mostGoalsPlayerId: summaryData.mostGoalsPlayerId,
              mostAssistsPlayerId: summaryData.mostAssistsPlayerId,
              bestDefenderPlayerId: summaryData.bestDefenderPlayerId,
              matchNotes: summaryData.matchNotes,
              reservationId: summaryData.reservationId
            },
            status: "completed" as const
          };
        }
        return res;
      });
    });
  };
  
  // Add highlight to a reservation
  const addHighlight = (highlight: Omit<Highlight, "id">) => {
    setReservations(prevReservations => {
      return prevReservations.map(res => {
        if (res.id === highlight.reservationId) {
          const newHighlight = {
            ...highlight,
            id: Date.now().toString(), // Simple ID generation
          };
          return {
            ...res,
            highlights: [...(res.highlights || []), newHighlight]
          };
        }
        return res;
      });
    });
  };
  
  // Delete highlight from a reservation
  const deleteHighlight = (reservationId: number, highlightId: string) => {
    setReservations(prevReservations => {
      return prevReservations.map(res => {
        if (res.id === reservationId && res.highlights) {
          return {
            ...res,
            highlights: res.highlights.filter(h => h.id !== highlightId)
          };
        }
        return res;
      });
    });
  };
  
  // Mock navigation function
  const navigateToReservation = (pitchName: string) => {
    console.log(`Navigating to reservations for pitch: ${pitchName}`);
    // Implementation would typically use router navigation here
  };
  
  // Mock function to get user stats
  const getUserStats = (userId: string): UserStats => {
    // Calculate stats based on user's participation in games
    const userReservations = reservations.filter(res => 
      res.lineup?.some(player => player.userId === userId)
    );
    
    const completedGames = userReservations.filter(res => res.status === "completed");
    const mvpCount = completedGames.filter(res => res.summary?.mvpPlayerId === userId).length;
    const goalScorerCount = completedGames.filter(res => res.summary?.mostGoalsPlayerId === userId).length;
    
    return {
      matches: userReservations.length,
      wins: Math.floor(completedGames.length * 0.6), // Mock calculation
      mvp: mvpCount,
      goals: goalScorerCount * 3, // Assuming 3 goals per top scorer award
      assists: Math.floor(completedGames.length * 0.5),
      interceptions: Math.floor(completedGames.length * 0.7),
      cleanSheets: Math.floor(completedGames.length * 0.2),
    };
  };

  // Make sure to include all functions in the context value
  const value = {
    reservations,
    setReservations,
    pitches,
    setPitches,
    addReservation,
    cancelReservation,
    joinGame,
    isUserJoined,
    hasUserJoinedOnDate,
    addPitch,
    updatePitch,
    deletePitch,
    getPitches,
    getPitchById,
    updateReservationStatus,
    joinWaitingList,
    leaveWaitingList,
    deleteReservation,
    addReservationSummary,
    editReservation,
    getUserStats,
    navigateToReservation,
    addHighlight,
    deleteHighlight
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};
