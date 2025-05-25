
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
  playerName?: string;
  status?: "joined" | "pending" | "cancelled";
  joinedAt?: string;
}

export interface Pitch {
  _id: string;
  name: string;
  location: string;
  city: string;
  backgroundImage: string;
  images: string[];
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
  highlights?: any[];
}

interface ReservationContextProps {
  reservations: Reservation[];
  pitches: Pitch[];
  addReservation: (reservation: Omit<Reservation, "id">) => void;
  updateReservation: (id: number, updates: Partial<Reservation>) => void;
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
  joinGame: (reservationId: number, playerName?: string, userId?: string) => void;
  updateReservationStatus: (id: number, status: "upcoming" | "completed" | "cancelled") => void;
}

const ReservationContext = createContext<ReservationContextProps>({
  reservations: [],
  pitches: [],
  addReservation: () => {},
  updateReservation: () => {},
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
  joinGame: () => {},
  updateReservationStatus: () => {},
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

  const deleteReservation = (id: number) => {
    setReservations((prevReservations) =>
      prevReservations.filter((reservation) => reservation.id !== id)
    );
  };

  const joinReservation = (reservationId: number, userId: string, playerName: string) => {
    setReservations((prevReservations) =>
      prevReservations.map((reservation) => {
        if (reservation.id === reservationId) {
          const newPlayer = { 
            userId: userId, 
            name: playerName,
            playerName: playerName,
            status: "joined" as const,
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
        joinGame,
        updateReservationStatus,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => useContext(ReservationContext);

export default ReservationContext;
export { Player };
