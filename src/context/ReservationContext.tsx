
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

interface Player {
  userId: string;
  name: string;
  playerName: string;
  status: "joined" | "pending" | "cancelled";
  joinedAt: string;
}

export interface UserStats {
  wins: number;
  losses: number;
  draws: number;
  goals: number;
  assists: number;
  matchesPlayed: number;
  winPercentage: number;
  gamesPlayed: number;
  goalsScored: number;
  cleansheets: number;
  mvps: number;
}

export interface Highlight {
  id: string;
  type: 'goal' | 'assist' | 'save' | 'tackle';
  playerId: string;
  playerName: string;
  minute: number;
  description?: string;
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
  waitingList?: string[];
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
  summary?: string;
  additionalImages?: string[];
}

interface ReservationContextProps {
  reservations: Reservation[];
  pitches: Pitch[];
  addReservation: (reservation: Omit<Reservation, "id">) => void;
  updateReservation: (id: number, updates: Partial<Reservation>) => void;
  editReservation: (id: number, updates: Partial<Reservation>) => void;
  deleteReservation: (id: number) => void;
  joinReservation: (reservationId: number, userId: string, playerName: string) => void;
  cancelReservation: (reservationId: number, userId: string) => void;
  joinWaitingList: (reservationId: number, userId: string) => void;
  leaveWaitingList: (reservationId: number, userId: string) => void;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  addPitch: (pitch: Pitch) => void;
  updatePitch: (id: string, updates: Partial<Pitch>) => void;
  deletePitch: (id: number) => void;
  navigateToReservation: (pitchName: string) => void;
  setPitches: (pitches: Pitch[]) => void;
  setReservations: (reservations: Reservation[]) => void;
  joinGame: (reservationId: number, playerName?: string, userId?: string) => void;
  updateReservationStatus: (id: number, status: "upcoming" | "completed" | "cancelled") => void;
  getUserStats: (userId: string) => UserStats;
  deleteHighlight: (reservationId: number, highlightId: string) => void;
}

const ReservationContext = createContext<ReservationContextProps>({
  reservations: [],
  pitches: [],
  addReservation: () => {},
  updateReservation: () => {},
  editReservation: () => {},
  deleteReservation: () => {},
  joinReservation: () => {},
  cancelReservation: () => {},
  joinWaitingList: () => {},
  leaveWaitingList: () => {},
  isUserJoined: () => false,
  addPitch: () => {},
  updatePitch: () => {},
  deletePitch: () => {},
  navigateToReservation: () => {},
  setPitches: () => {},
  setReservations: () => {},
  joinGame: () => {},
  updateReservationStatus: () => {},
  getUserStats: () => ({ 
    wins: 0, 
    losses: 0, 
    draws: 0, 
    goals: 0, 
    assists: 0, 
    matchesPlayed: 0, 
    winPercentage: 0,
    gamesPlayed: 0,
    goalsScored: 0,
    cleansheets: 0,
    mvps: 0
  }),
  deleteHighlight: () => {},
});

interface ReservationProviderProps {
  children: ReactNode;
}

export const ReservationProvider: React.FC<ReservationProviderProps> = ({
  children,
}) => {
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const storedReservations = localStorage.getItem("reservations");
      return storedReservations ? JSON.parse(storedReservations) : [];
    } catch (error) {
      console.error("Error parsing reservations from localStorage:", error);
      return [];
    }
  });
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  const addReservation = (reservation: Omit<Reservation, "id">) => {
    const newReservation: Reservation = {
      ...reservation,
      id: Date.now(),
      playersJoined: 0,
    };
    setReservations([...reservations, newReservation]);
  };

  const updateReservation = (id: number, updates: Partial<Reservation>) => {
    setReservations((prevReservations) =>
      prevReservations.map((reservation) =>
        reservation.id === id ? { ...reservation, ...updates } : reservation
      )
    );
  };

  const editReservation = (id: number, updates: Partial<Reservation>) => {
    updateReservation(id, updates);
  };

  const deleteReservation = (id: number) => {
    setReservations((prevReservations) =>
      prevReservations.filter((reservation) => reservation.id !== id)
    );
  };

  const joinReservation = (reservationId: number, userId: string, playerName: string) => {
    setReservations((prevReservations) =>
      prevReservations.map((reservation) => {
        if (reservation.id === reservationId) {
          const newPlayer: Player = { 
            userId: userId, 
            name: playerName,
            playerName: playerName,
            status: "joined",
            joinedAt: new Date().toISOString()
          };
          if (!reservation.lineup) {
            reservation.lineup = [];
          }
          return {
            ...reservation,
            lineup: [...reservation.lineup, newPlayer],
            playersJoined: (reservation.lineup.length + 1)
          };
        }
        return reservation;
      })
    );
  };

  const joinGame = (reservationId: number, playerName?: string, userId?: string) => {
    if (!userId) return;
    joinReservation(reservationId, userId, playerName || `Player ${userId.substring(0, 4)}`);
  };

  const cancelReservation = (reservationId: number, userId: string) => {
    setReservations((prevReservations) =>
      prevReservations.map((reservation) => {
        if (reservation.id === reservationId) {
          const updatedLineup = reservation.lineup?.filter((player) => player.userId !== userId) || [];
          return {
            ...reservation,
            lineup: updatedLineup,
            playersJoined: updatedLineup.length
          };
        }
        return reservation;
      })
    );
  };

  const joinWaitingList = (reservationId: number, userId: string) => {
    setReservations((prevReservations) =>
      prevReservations.map((reservation) => {
        if (reservation.id === reservationId) {
          return {
            ...reservation,
            waitingList: [...(reservation.waitingList || []), userId],
          };
        }
        return reservation;
      })
    );
  };

  const leaveWaitingList = (reservationId: number, userId: string) => {
    setReservations((prevReservations) =>
      prevReservations.map((reservation) => {
        if (reservation.id === reservationId) {
          return {
            ...reservation,
            waitingList: reservation.waitingList?.filter(id => id !== userId),
          };
        }
        return reservation;
      })
    );
  };

  const isUserJoined = (reservationId: number, userId: string) => {
    const reservation = reservations.find((res) => res.id === reservationId);
    return !!reservation?.lineup?.some((player) => player.userId === userId);
  };

  const updateReservationStatus = (id: number, status: "upcoming" | "completed" | "cancelled") => {
    updateReservation(id, { status });
  };

  const getUserStats = (userId: string): UserStats => {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let goals = 0;
    let assists = 0;
    let matchesPlayed = 0;
    let gamesPlayed = 0;
    let goalsScored = 0;
    let cleansheets = 0;
    let mvps = 0;

    reservations.forEach(reservation => {
      if (reservation.status === 'completed' && reservation.lineup?.some(player => player.userId === userId)) {
        matchesPlayed++;
        gamesPlayed++;
        // Add logic to calculate wins/losses/draws based on game results
        // This is a simplified version - you might want to enhance this
      }
    });

    const winPercentage = matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0;

    return {
      wins,
      losses,
      draws,
      goals,
      assists,
      matchesPlayed,
      winPercentage,
      gamesPlayed,
      goalsScored,
      cleansheets,
      mvps
    };
  };

  const deleteHighlight = (reservationId: number, highlightId: string) => {
    setReservations((prevReservations) =>
      prevReservations.map((reservation) => {
        if (reservation.id === reservationId) {
          return {
            ...reservation,
            highlights: reservation.highlights?.filter(h => h.id !== highlightId) || []
          };
        }
        return reservation;
      })
    );
  };

  const addPitch = (pitch: Pitch) => {
    setPitches([...pitches, pitch]);
  };

  const updatePitch = (id: string, updates: Partial<Pitch>) => {
    setPitches((prevPitches) =>
      prevPitches.map((pitch) => (pitch._id === id ? { ...pitch, ...updates } : pitch))
    );
  };

  const deletePitch = (id: number) => {
    setPitches((prevPitches) =>
      prevPitches.filter((pitch) => Number(pitch._id) !== id)
    );
  };

  const navigateToReservation = (pitchName: string) => {
    navigate(`/reservations?pitch=${pitchName}`);
  };

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        pitches,
        addReservation,
        updateReservation,
        editReservation,
        deleteReservation,
        joinReservation,
        cancelReservation,
        joinWaitingList,
        leaveWaitingList,
        isUserJoined,
        addPitch,
        updatePitch,
        deletePitch,
        navigateToReservation,
        setPitches,
        setReservations,
        joinGame,
        updateReservationStatus,
        getUserStats,
        deleteHighlight,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => useContext(ReservationContext);

export default ReservationContext;
export type { Player };
