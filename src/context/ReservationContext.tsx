import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

type JoinedPlayer = {
  userId: string;
  position?: number;
};

type Highlight = {
  id: number;
  minute: number;
  type: "goal" | "assist" | "yellowCard" | "redCard";
  playerId: string;
  playerName: string;
  description?: string;
};

const initialReservationsData = [
  {
    id: 1,
    pitchName: "Green Valley Pitch",
    date: "2025-04-15",
    time: "18:00 - 19:30",
    playersJoined: 7,
    maxPlayers: 10,
    location: "Downtown, Football City",
    price: 25,
    status: "open",
    joinedPlayers: [{ userId: "user1", position: 8 }],
    highlights: []
  },
  {
    id: 2,
    pitchName: "Central Park Field",
    date: "2025-04-16",
    time: "19:00 - 20:30",
    playersJoined: 14,
    maxPlayers: 14,
    location: "Eastside, Football City",
    price: 30,
    status: "full",
    joinedPlayers: [],
    highlights: []
  },
  {
    id: 3,
    pitchName: "Stadium Pro",
    date: "2025-04-18",
    time: "17:30 - 19:00",
    playersJoined: 8,
    maxPlayers: 22,
    location: "Northside, Football City",
    price: 40,
    status: "open",
    joinedPlayers: [],
    highlights: []
  },
  {
    id: 4,
    pitchName: "Riverside Turf",
    date: "2025-04-12",
    time: "14:00 - 15:30",
    playersJoined: 10,
    maxPlayers: 10,
    location: "Westside, Football City",
    price: 20,
    status: "completed",
    joinedPlayers: [{ userId: "user1", position: 8 }],
    highlights: [
      {
        id: 1,
        minute: 14,
        type: "goal",
        playerId: "player1",
        playerName: "John D."
      },
      {
        id: 2,
        minute: 32,
        type: "yellowCard",
        playerId: "player2",
        playerName: "Michael S."
      },
      {
        id: 3,
        minute: 47,
        type: "goal",
        playerId: "player3",
        playerName: "Sarah L."
      },
      {
        id: 4,
        minute: 63,
        type: "goal",
        playerId: "player4",
        playerName: "Alex P."
      }
    ]
  },
  {
    id: 5,
    pitchName: "Green Valley Pitch",
    date: "2025-04-10",
    time: "18:00 - 19:30",
    playersJoined: 8,
    maxPlayers: 10,
    location: "Downtown, Football City",
    price: 25,
    status: "completed",
    joinedPlayers: [],
    highlights: []
  },
];

export interface Reservation {
  id: number;
  pitchName: string;
  date: string;
  time: string;
  playersJoined: number;
  maxPlayers: number;
  location: string;
  price: number;
  status: "open" | "full" | "started" | "completed";
  joinedPlayers: JoinedPlayer[];
  highlights: Highlight[];
}

interface ReservationContextType {
  reservations: Reservation[];
  joinGame: (id: number, position?: number) => void;
  cancelReservation: (id: number) => void;
  joinWaitingList: (id: number) => void;
  isUserJoined: (id: number) => boolean;
  hasUserJoinedOnDate: (date: string) => boolean;
  navigateToReservation: (pitchName: string) => void;
  getReservationsForDate: (date: Date) => Reservation[];
  getReservationsForPitch: (pitchName: string) => Reservation[];
  getUserReservations: () => Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'status' | 'playersJoined' | 'joinedPlayers' | 'highlights'>) => void;
  deleteReservation: (id: number) => void;
  editReservation: (id: number, updatedData: Partial<Reservation>) => void;
  addHighlight: (reservationId: number, highlight: Omit<Highlight, 'id'>) => void;
  removeHighlight: (reservationId: number, highlightId: number) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error("useReservation must be used within a ReservationProvider");
  }
  return context;
};

export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const savedReservations = localStorage.getItem("reservations");
    return savedReservations ? JSON.parse(savedReservations) : initialReservationsData;
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentUser = "user1";

  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  const hasUserJoinedOnDate = (date: string) => {
    return reservations.some(reservation => 
      reservation.date === date && 
      reservation.joinedPlayers.some(p => p.userId === currentUser) &&
      (reservation.status === "open" || reservation.status === "full")
    );
  };

  const joinGame = (id: number, position?: number) => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === id) {
          if (reservation.joinedPlayers.some(p => p.userId === currentUser)) {
            if (position !== undefined) {
              const updatedJoinedPlayers = reservation.joinedPlayers.map(p => 
                p.userId === currentUser ? { ...p, position } : p
              );
              
              toast({
                title: "Position Updated",
                description: "Your position has been updated!",
                duration: 3000,
              });
              
              return {
                ...reservation,
                joinedPlayers: updatedJoinedPlayers
              };
            }
            
            toast({
              title: "Already Joined",
              description: "You have already joined this game.",
              duration: 3000,
            });
            return reservation;
          }
          
          if (hasUserJoinedOnDate(reservation.date)) {
            toast({
              title: "Already Booked",
              description: "You have already joined a game on this date.",
              duration: 3000,
            });
            return reservation;
          }
          
          if (reservation.playersJoined >= reservation.maxPlayers) {
            toast({
              title: "Game is Full",
              description: "This game is full. You can join the waiting list.",
              duration: 3000,
            });
            return reservation;
          }
          
          const updatedPlayersJoined = reservation.playersJoined + 1;
          const updatedStatus = updatedPlayersJoined >= reservation.maxPlayers ? "full" : "open";
          
          toast({
            title: "Joined Game",
            description: `You've successfully joined ${reservation.pitchName}!`,
            duration: 3000,
          });
          
          return {
            ...reservation,
            playersJoined: updatedPlayersJoined,
            status: updatedStatus,
            joinedPlayers: [...reservation.joinedPlayers, { userId: currentUser, position }]
          };
        }
        return reservation;
      });
    });
  };

  const cancelReservation = (id: number) => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === id) {
          if (!reservation.joinedPlayers.some(p => p.userId === currentUser)) {
            toast({
              title: "Not Joined",
              description: "You haven't joined this game yet.",
              duration: 3000,
            });
            return reservation;
          }
          
          const updatedPlayersJoined = reservation.playersJoined - 1;
          const updatedStatus = "open";
          
          toast({
            title: "Reservation Cancelled",
            description: `You've cancelled your spot at ${reservation.pitchName}.`,
            duration: 3000,
          });
          
          return {
            ...reservation,
            playersJoined: updatedPlayersJoined,
            status: updatedStatus,
            joinedPlayers: reservation.joinedPlayers.filter(p => p.userId !== currentUser)
          };
        }
        return reservation;
      });
    });
  };

  const joinWaitingList = (id: number) => {
    toast({
      title: "Added to Waiting List",
      description: "You'll be notified if a spot becomes available.",
      duration: 3000,
    });
  };

  const isUserJoined = (id: number) => {
    const reservation = reservations.find(r => r.id === id);
    return reservation ? reservation.joinedPlayers.some(p => p.userId === currentUser) : false;
  };

  const navigateToReservation = (pitchName: string) => {
    const hasReservations = reservations.some(r => r.pitchName === pitchName && r.status === "open");
    
    if (hasReservations) {
      navigate('/reservations');
      toast({
        title: "View Reservations",
        description: `Check available times for ${pitchName}`,
        duration: 3000,
      });
    } else {
      navigate('/reservations');
      toast({
        title: "No Available Games",
        description: `Create a new reservation for ${pitchName}`,
        duration: 3000,
      });
    }
  };

  const getReservationsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(r => r.date === dateStr);
  };

  const getReservationsForPitch = (pitchName: string) => {
    return reservations.filter(r => r.pitchName === pitchName);
  };

  const getUserReservations = () => {
    return reservations.filter(r => r.joinedPlayers.some(p => p.userId === currentUser));
  };

  const addReservation = (newReservation: Omit<Reservation, 'id' | 'status' | 'playersJoined' | 'joinedPlayers' | 'highlights'>) => {
    const newId = Math.max(...reservations.map(r => r.id), 0) + 1;
    
    setReservations(prevReservations => [
      ...prevReservations,
      {
        ...newReservation,
        id: newId,
        status: "open",
        playersJoined: 0,
        joinedPlayers: [],
        highlights: []
      }
    ]);
    
    toast({
      title: "Reservation Created",
      description: `New reservation for ${newReservation.pitchName} has been created.`,
      duration: 3000,
    });
    
    navigate('/reservations');
  };

  const deleteReservation = (id: number) => {
    setReservations(prevReservations => {
      const updatedReservations = prevReservations.filter(r => r.id !== id);
      toast({
        title: "Reservation Deleted",
        description: "The reservation has been successfully deleted.",
        duration: 3000,
      });
      return updatedReservations;
    });
  };

  const editReservation = (id: number, updatedData: Partial<Reservation>) => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === id) {
          const updated = {
            ...reservation,
            ...updatedData,
          };
          
          toast({
            title: "Reservation Updated",
            description: `Changes to ${reservation.pitchName} have been saved.`,
            duration: 3000,
          });
          
          return updated;
        }
        return reservation;
      });
    });
  };

  // New functions to manage highlights
  const addHighlight = (reservationId: number, highlight: Omit<Highlight, 'id'>) => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          const newHighlightId = reservation.highlights.length > 0 
            ? Math.max(...reservation.highlights.map(h => h.id)) + 1 
            : 1;
            
          const newHighlight = {
            ...highlight,
            id: newHighlightId
          };
          
          toast({
            title: "Highlight Added",
            description: `${highlight.type === 'goal' ? 'Goal' : 'Event'} at ${highlight.minute}' has been added.`,
            duration: 3000,
          });
          
          return {
            ...reservation,
            highlights: [...reservation.highlights, newHighlight]
          };
        }
        return reservation;
      });
    });
  };
  
  const removeHighlight = (reservationId: number, highlightId: number) => {
    setReservations(prevReservations => {
      return prevReservations.map(reservation => {
        if (reservation.id === reservationId) {
          toast({
            title: "Highlight Removed",
            description: "The highlight has been removed.",
            duration: 3000,
          });
          
          return {
            ...reservation,
            highlights: reservation.highlights.filter(h => h.id !== highlightId)
          };
        }
        return reservation;
      });
    });
  };

  return (
    <ReservationContext.Provider value={{ 
      reservations, 
      joinGame,
      cancelReservation,
      joinWaitingList, 
      isUserJoined,
      hasUserJoinedOnDate,
      navigateToReservation,
      getReservationsForDate,
      getReservationsForPitch,
      getUserReservations,
      addReservation,
      deleteReservation,
      editReservation,
      addHighlight,
      removeHighlight
    }}>
      {children}
    </ReservationContext.Provider>
  );
};
