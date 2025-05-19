import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the types
export interface Highlight {
  id: number;
  type: "goal" | "assist" | "save" | "tackle" | "yellow" | "red" | "other";
  playerId: string;
  playerName: string;
  description: string;
  minute: number;
}

export interface LineupPlayer {
  userId: string;
  name?: string;
  position?: string;
  status: 'joined' | 'waiting' | 'left' | 'suspended';
}

export interface Pitch {
  id: number;
  name: string;
  location: string;
  image: string;
  playersPerSide: number;
  description: string;
  openingHours: string;
  price: number;
  surfaceType: string;
  pitchSize: string;
  features: string[];
  details?: {
    address: string;
    description: string;
    price: string;
    facilities: string[];
  };
}

export interface UserStats {
  matches: number;
  wins: number;
  goals: number;
  assists: number;
  cleansheets: number;
  tackles: number;
  yellowCards: number;
  redCards: number;
  mvps: number;
  gamesPlayed: number;
  goalsScored: number;
}

export interface Reservation {
  id: number;
  date: string;
  time: string;
  pitchId: number;
  pitchName: string;
  maxPlayers: number;
  playersJoined: number;
  status: "open" | "full" | "cancelled" | "completed";
  playersPerSide: number;
  playersIds: string[];
  waitingList: string[];
  highlights: Highlight[];
  title?: string;
  location?: string;
  price?: number;
  lineup: LineupPlayer[];
  finalScore?: string;
}

export interface NewReservationData {
  date: string;
  time: string;
  pitchId: number;
  pitchName: string;
  maxPlayers: number;
  playersPerSide: number;
  title?: string;
  location?: string;
}

export interface NewPitchData {
  name: string;
  location: string;
  image: string;
  playersPerSide: number;
  description: string;
  openingHours: string;
  price: number;
  surfaceType: string;
  pitchSize: string;
}

// Define the context type
interface ReservationContextType {
  reservations: Reservation[];
  pitches: Pitch[];
  addReservation: (data: NewReservationData) => void;
  cancelReservation: (reservationId: number, userId: string) => void;
  transferReservation: (reservationId: number, newPitchId: number) => void;
  updateReservationTime: (reservationId: number, newTime: string) => void;
  addHighlight: (reservationId: number, highlight: Omit<Highlight, "id">) => void;
  removeHighlight: (reservationId: number, highlightId: number) => void;
  joinGame: (reservationId: number, position?: string, userId?: string) => void;
  joinWaitingList: (reservationId: number, userId: string) => void;
  leaveWaitingList: (reservationId: number, userId: string) => void;
  getReservationsForDate: (date: Date) => Reservation[];
  suspendPlayer: (playerId: string, reason: string, duration: number) => void;
  updateReservationStatus: (reservationId: number, status: Reservation["status"]) => void;
  addPitch: (pitch: NewPitchData) => void;
  deletePitch: (pitchId: number) => void;
  navigateToReservation: (pitchName: string) => void;
  getUserStats: (userId: string) => UserStats;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  hasUserJoinedOnDate: (date: Date, userId: string) => boolean;
  deleteHighlight: (reservationId: number, highlightId: number) => void;
  editReservation: (reservationId: number, updates: Partial<Omit<Reservation, 'id'>>) => void;
}

// Create the context
const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

// Provider component
export const ReservationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Sample data for development
  const [pitches, setPitches] = useState<Pitch[]>([
    {
      id: 1,
      name: "Community Sports Arena",
      location: "123 Main St, City Center",
      image: "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      playersPerSide: 5,
      description: "A modern indoor football pitch with excellent facilities.",
      openingHours: "Mon-Fri: 9 AM - 10 PM, Sat-Sun: 8 AM - 11 PM",
      price: 25,
      surfaceType: "Artificial Turf",
      pitchSize: "40m x 20m",
      features: ["Indoor", "Floodlights", "Changing Rooms"],
      details: {
        address: "123 Main Street, City Center, NY 10001",
        description: "A modern indoor football pitch with excellent facilities including changing rooms, showers, and parking. Perfect for 5-a-side games with professional-grade artificial turf.",
        price: "$25 per hour",
        facilities: ["Showers", "Changing Rooms", "Free Parking", "WiFi"]
      }
    },
    {
      id: 2,
      name: "Downtown Football Center",
      location: "456 Park Ave, Downtown",
      image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      playersPerSide: 7,
      description: "Large outdoor pitch, perfect for 7-a-side games.",
      openingHours: "Daily: 8 AM - 9 PM",
      price: 35,
      surfaceType: "Natural Grass",
      pitchSize: "60m x 40m",
      features: ["Outdoor", "Natural Grass", "Floodlights"],
      details: {
        address: "456 Park Avenue, Downtown, NY 10002",
        description: "A spacious outdoor pitch with natural grass and floodlights for evening games. Ideal for larger teams with plenty of space for spectators.",
        price: "$35 per hour",
        facilities: ["Public Restrooms", "Water Fountains", "Picnic Area"]
      }
    },
    {
      id: 3,
      name: "Riverside Pitch Complex",
      location: "789 River Rd, Riverside",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1936&q=80",
      playersPerSide: 11,
      description: "Professional-grade football field for 11-a-side matches.",
      openingHours: "Mon-Sun: 7 AM - 11 PM",
      price: 50,
      surfaceType: "Hybrid Turf",
      pitchSize: "105m x 68m",
      features: ["Outdoor", "Professional", "Stadium Seating"],
      details: {
        address: "789 River Road, Riverside, NY 10003",
        description: "A professional-grade football field suitable for official matches. Features stadium seating, professional locker rooms, and high-quality hybrid turf for all-weather play.",
        price: "$50 per hour",
        facilities: ["Professional Locker Rooms", "Showers", "Parking", "Cafe"]
      }
    }
  ]);

  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 1,
      date: "2025-05-25",
      time: "18:00 - 19:00",
      pitchId: 1,
      pitchName: "Community Sports Arena",
      maxPlayers: 10,
      playersJoined: 7,
      status: "open",
      playersPerSide: 5,
      playersIds: ["user1", "user2", "user3", "user4", "user5", "user6", "user7"],
      waitingList: [],
      highlights: [],
      title: "Evening 5-a-side",
      location: "123 Main St, City Center",
      price: 25,
      lineup: [
        { userId: "user1", name: "John Player", position: "forward", status: "joined" },
        { userId: "user2", name: "Mike Johnson", position: "midfielder", status: "joined" },
        { userId: "user3", name: "Sarah Smith", position: "defender", status: "joined" },
        { userId: "user4", name: "David Brown", position: "goalkeeper", status: "joined" },
        { userId: "user5", name: "Alex Wilson", position: "forward", status: "joined" },
        { userId: "user6", name: "Emma Davis", position: "midfielder", status: "joined" },
        { userId: "user7", name: "Tom Harris", position: "defender", status: "joined" }
      ]
    },
    {
      id: 2,
      date: "2025-05-22",
      time: "20:00 - 21:00",
      pitchId: 2,
      pitchName: "Downtown Football Center",
      maxPlayers: 14,
      playersJoined: 14,
      status: "full",
      playersPerSide: 7,
      playersIds: ["user1", "user2", "user3", "user4", "user5", "user6", "user7", "user8", "user9", "user10", "user11", "user12", "user13", "user14"],
      waitingList: ["user15", "user16"],
      highlights: [],
      title: "Downtown League Match",
      location: "456 Park Ave, Downtown",
      price: 35,
      lineup: [
        { userId: "user1", name: "John Player", position: "forward", status: "joined" },
        { userId: "user2", name: "Mike Johnson", position: "midfielder", status: "joined" },
        { userId: "user3", name: "Sarah Smith", position: "defender", status: "joined" },
        { userId: "user4", name: "David Brown", position: "goalkeeper", status: "joined" },
        { userId: "user5", name: "Alex Wilson", position: "forward", status: "joined" },
        { userId: "user6", name: "Emma Davis", position: "midfielder", status: "joined" },
        { userId: "user7", name: "Tom Harris", position: "defender", status: "joined" },
        { userId: "user8", name: "Lisa Jones", position: "midfielder", status: "joined" },
        { userId: "user9", name: "Kevin Clark", position: "forward", status: "joined" },
        { userId: "user10", name: "Anna White", position: "defender", status: "joined" },
        { userId: "user11", name: "James Miller", position: "midfielder", status: "joined" },
        { userId: "user12", name: "Olivia Martin", position: "forward", status: "joined" },
        { userId: "user13", name: "Ryan Taylor", position: "defender", status: "joined" },
        { userId: "user14", name: "Sophia Moore", position: "goalkeeper", status: "joined" }
      ]
    },
    {
      id: 3,
      date: "2025-05-20",
      time: "15:00 - 17:00",
      pitchId: 3,
      pitchName: "Riverside Pitch Complex",
      maxPlayers: 22,
      playersJoined: 18,
      status: "open",
      playersPerSide: 11,
      playersIds: ["user1", "user2", "user3", "user4", "user5", "user6", "user7", "user8", "user9", "user10", "user11", "user12", "user13", "user14", "user15", "user16", "user17", "user18"],
      waitingList: [],
      highlights: [],
      title: "Full Field Friendly",
      location: "789 River Rd, Riverside",
      price: 50,
      lineup: [
        { userId: "user1", name: "John Player", position: "forward", status: "joined" },
        { userId: "user2", name: "Mike Johnson", position: "midfielder", status: "joined" },
        { userId: "user3", name: "Sarah Smith", position: "defender", status: "joined" },
        { userId: "user4", name: "David Brown", position: "goalkeeper", status: "joined" },
        { userId: "user5", name: "Alex Wilson", position: "forward", status: "joined" },
        { userId: "user6", name: "Emma Davis", position: "midfielder", status: "joined" },
        { userId: "user7", name: "Tom Harris", position: "defender", status: "joined" },
        { userId: "user8", name: "Lisa Jones", position: "midfielder", status: "joined" },
        { userId: "user9", name: "Kevin Clark", position: "forward", status: "joined" },
        { userId: "user10", name: "Anna White", position: "defender", status: "joined" },
        { userId: "user11", name: "James Miller", position: "midfielder", status: "joined" },
        { userId: "user12", name: "Olivia Martin", position: "forward", status: "joined" },
        { userId: "user13", name: "Ryan Taylor", position: "defender", status: "joined" },
        { userId: "user14", name: "Sophia Moore", position: "goalkeeper", status: "joined" },
        { userId: "user15", name: "William Johnson", position: "midfielder", status: "joined" },
        { userId: "user16", name: "Ava Brown", position: "forward", status: "joined" },
        { userId: "user17", name: "Noah Wilson", position: "defender", status: "joined" },
        { userId: "user18", name: "Emma Davis", position: "midfielder", status: "joined" }
      ]
    },
    {
      id: 4,
      date: "2025-05-15",
      time: "19:00 - 20:00",
      pitchId: 1,
      pitchName: "Community Sports Arena",
      maxPlayers: 10,
      playersJoined: 10,
      status: "completed",
      playersPerSide: 5,
      playersIds: ["user1", "user2", "user3", "user4", "user5", "user6", "user7", "user8", "user9", "user10"],
      waitingList: [],
      highlights: [
        {
          id: 1,
          type: "goal",
          playerId: "user1",
          playerName: "John Player",
          description: "Amazing free kick goal from outside the box",
          minute: 15
        },
        {
          id: 2,
          type: "assist",
          playerId: "user2",
          playerName: "Mike Johnson",
          description: "Perfect through ball for the second goal",
          minute: 35
        }
      ],
      title: "Past Arena Game",
      location: "123 Main St, City Center",
      price: 25,
      finalScore: "3-2",
      lineup: [
        { userId: "user1", name: "John Player", position: "forward", status: "joined" },
        { userId: "user2", name: "Mike Johnson", position: "midfielder", status: "joined" },
        { userId: "user3", name: "Sarah Smith", position: "defender", status: "joined" },
        { userId: "user4", name: "David Brown", position: "goalkeeper", status: "joined" },
        { userId: "user5", name: "Alex Wilson", position: "forward", status: "joined" },
        { userId: "user6", name: "Emma Davis", position: "midfielder", status: "joined" },
        { userId: "user7", name: "Tom Harris", position: "defender", status: "joined" },
        { userId: "user8", name: "Lisa Jones", position: "midfielder", status: "joined" },
        { userId: "user9", name: "Kevin Clark", position: "forward", status: "joined" },
        { userId: "user10", name: "Anna White", position: "defender", status: "joined" }
      ]
    }
  ]);

  // Add a new reservation
  const addReservation = (data: NewReservationData) => {
    const newId = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1;
    
    const newReservation: Reservation = {
      id: newId,
      date: data.date,
      time: data.time,
      pitchId: data.pitchId,
      pitchName: data.pitchName,
      maxPlayers: data.maxPlayers,
      playersJoined: 0,
      status: "open",
      playersPerSide: data.playersPerSide,
      playersIds: [],
      waitingList: [],
      highlights: [],
      title: data.title,
      location: data.location,
      lineup: [],
    };
    
    setReservations([...reservations, newReservation]);
  };

  // Cancel reservation
  const cancelReservation = (reservationId: number, userId: string) => {
    setReservations(
      reservations.map(res => {
        if (res.id !== reservationId) return res;
        
        // If the user is part of the game, remove them
        if (res.playersIds.includes(userId)) {
          return {
            ...res,
            playersIds: res.playersIds.filter(id => id !== userId),
            playersJoined: res.playersJoined - 1
          };
        }
        return res;
      })
    );
  };

  // Transfer reservation to new pitch
  const transferReservation = (reservationId: number, newPitchId: number) => {
    const newPitch = pitches.find(p => p.id === newPitchId);
    if (!newPitch) return;
    
    setReservations(
      reservations.map(res => {
        if (res.id === reservationId) {
          return {
            ...res,
            pitchId: newPitchId,
            pitchName: newPitch.name
          };
        }
        return res;
      })
    );
  };

  // Update reservation time
  const updateReservationTime = (reservationId: number, newTime: string) => {
    setReservations(
      reservations.map(res => {
        if (res.id === reservationId) {
          return {
            ...res,
            time: newTime
          };
        }
        return res;
      })
    );
  };

  // Add highlight
  const addHighlight = (reservationId: number, highlight: Omit<Highlight, "id">) => {
    setReservations(
      reservations.map(res => {
        if (res.id === reservationId) {
          const newHighlightId = res.highlights.length > 0 ? Math.max(...res.highlights.map(h => h.id)) + 1 : 1;
          
          return {
            ...res,
            highlights: [...res.highlights, { id: newHighlightId, ...highlight }]
          };
        }
        return res;
      })
    );
  };

  // Remove highlight
  const removeHighlight = (reservationId: number, highlightId: number) => {
    setReservations(
      reservations.map(res => {
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

  // Join game
  const joinGame = (reservationId: number, position?: string, userId?: string) => {
    if (!userId) return;
    
    setReservations(
      reservations.map(res => {
        if (res.id === reservationId) {
          // Check if user is already in the game
          if (res.playersIds.includes(userId)) {
            return res;
          }
          
          // Add user to the game
          const updatedPlayers = [...res.playersIds, userId];
          const updatedCount = updatedPlayers.length;
          
          // Update status if the game is now full
          const updatedStatus = updatedCount >= res.maxPlayers ? "full" : res.status;
          
          // Remove from waiting list if they were on it
          const updatedWaitingList = res.waitingList.filter(id => id !== userId);
          
          return {
            ...res,
            playersIds: updatedPlayers,
            playersJoined: updatedCount,
            status: updatedStatus,
            waitingList: updatedWaitingList
          };
        }
        return res;
      })
    );
  };

  // Join waiting list
  const joinWaitingList = (reservationId: number, userId: string) => {
    setReservations(
      reservations.map(res => {
        if (res.id === reservationId) {
          // Check if user is already in the waiting list
          if (res.waitingList.includes(userId)) {
            return res;
          }
          
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
    setReservations(
      reservations.map(res => {
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

  // Edit reservation
  const editReservation = (reservationId: number, updates: Partial<Omit<Reservation, 'id'>>) => {
    setReservations(
      reservations.map(res => {
        if (res.id === reservationId) {
          return {
            ...res,
            ...updates,
          };
        }
        return res;
      })
    );
  };

  // Delete a highlight
  const deleteHighlight = (reservationId: number, highlightId: number) => {
    setReservations(
      reservations.map(res => {
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

  // Get reservations for a specific date
  const getReservationsForDate = (date: Date) => {
    if (!date || !(date instanceof Date)) {
      console.error("Invalid date provided to getReservationsForDate:", date);
      return [];
    }
    
    const dateString = date.toISOString().split('T')[0];
    return reservations.filter(res => res.date === dateString);
  };

  // Check if a user is joined in a specific game
  const isUserJoined = (reservationId: number, userId: string): boolean => {
    const reservation = reservations.find(res => res.id === reservationId);
    if (!reservation) return false;
    
    return reservation.lineup.some(player => player.userId === userId && player.status === 'joined');
  };

  // Check if a user has joined any game on a specific date
  const hasUserJoinedOnDate = (date: Date, userId: string): boolean => {
    if (!date || !(date instanceof Date)) {
      console.error("Invalid date provided to hasUserJoinedOnDate:", date);
      return false;
    }
    
    const dateString = date.toISOString().split('T')[0];
    return reservations.some(
      res => res.date === dateString && 
      res.lineup.some(player => player.userId === userId && player.status === 'joined')
    );
  };

  // Update reservation status
  const updateReservationStatus = (reservationId: number, status: Reservation["status"]) => {
    setReservations(
      reservations.map(res => {
        if (res.id === reservationId) {
          return { ...res, status };
        }
        return res;
      })
    );
  };

  // Suspend a player (mock implementation)
  const suspendPlayer = (playerId: string, reason: string, duration: number) => {
    console.log(`Player ${playerId} suspended for ${duration} days. Reason: ${reason}`);
    // In a real app, you would update a player's status in the database
  };

  // Add a new pitch
  const addPitch = (pitch: NewPitchData) => {
    const newId = pitches.length > 0 ? Math.max(...pitches.map(p => p.id)) + 1 : 1;
    
    const newPitch: Pitch = {
      id: newId,
      name: pitch.name,
      location: pitch.location,
      image: pitch.image || "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
      playersPerSide: pitch.playersPerSide,
      description: pitch.description,
      openingHours: pitch.openingHours,
      price: pitch.price,
      surfaceType: pitch.surfaceType,
      pitchSize: pitch.pitchSize,
      features: ["Indoor"],
      details: {
        address: pitch.location,
        description: pitch.description,
        price: `$${pitch.price} per hour`,
        facilities: ["Changing Rooms", "Parking"]
      }
    };
    
    setPitches([...pitches, newPitch]);
  };

  // Delete a pitch
  const deletePitch = (pitchId: number) => {
    setPitches(pitches.filter(pitch => pitch.id !== pitchId));
    
    // Also delete any reservations associated with this pitch
    setReservations(reservations.filter(res => res.pitchId !== pitchId));
  };

  // Navigate to reservation (mock implementation)
  const navigateToReservation = (pitchName: string) => {
    console.log(`Navigating to reservations for pitch: ${pitchName}`);
    // In a real app with routing, this would use navigate("/reservations?pitch=" + pitchName)
    window.location.href = "/reservations";
  };

  // Get user stats
  const getUserStats = (userId: string): UserStats => {
    // Calculate user stats from reservations and highlights
    // Just a mock implementation
    const userMatches = reservations.filter(res => 
      res.status === "completed" && res.playersIds.includes(userId)
    );
    
    const userGoals = reservations.reduce((total, res) => {
      return total + res.highlights.filter(h => h.playerId === userId && h.type === "goal").length;
    }, 0);
    
    const userAssists = reservations.reduce((total, res) => {
      return total + res.highlights.filter(h => h.playerId === userId && h.type === "assist").length;
    }, 0);
    
    return {
      matches: userMatches.length,
      wins: Math.floor(userMatches.length * 0.6), // Mock win rate
      goals: userGoals,
      assists: userAssists,
      cleansheets: 0,
      tackles: 0,
      yellowCards: 0,
      redCards: 0,
      mvps: 0,
      gamesPlayed: userMatches.length,
      goalsScored: userGoals
    };
  };

  // Provide the context value
  const contextValue: ReservationContextType = {
    reservations,
    pitches,
    addReservation,
    cancelReservation,
    transferReservation,
    updateReservationTime,
    addHighlight,
    removeHighlight,
    joinGame,
    joinWaitingList,
    leaveWaitingList,
    getReservationsForDate,
    suspendPlayer,
    updateReservationStatus,
    addPitch,
    deletePitch,
    navigateToReservation,
    getUserStats,
    isUserJoined,
    hasUserJoinedOnDate,
    deleteHighlight,
    editReservation,
  };

  return (
    <ReservationContext.Provider value={contextValue}>
      {children}
    </ReservationContext.Provider>
  );
};

// Custom hook to use the reservation context
export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error("useReservation must be used within a ReservationProvider");
  }
  return context;
};
