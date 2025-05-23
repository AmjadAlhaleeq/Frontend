import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSameDay } from 'date-fns';
import { toast } from '@/hooks/use-toast';

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
  title?: string;
  pitchName: string;
  date: string; // ISO date string format
  time: string; // e.g., "18:00 - 19:30"
  status: ReservationStatus;
  playersJoined: number;
  maxPlayers: number;
  lineup: LineupPlayer[];
  waitingList: string[]; // User IDs
  location?: string;
  city?: string;
  locationLink?: string;
  price?: number;
  imageUrl?: string;
  pitchImage?: string;
  finalScore?: string;
  mvpPlayerId?: string;
  highlights?: Highlight[];
  description?: string; // Add description to the Reservation interface
}

// Type for new reservation data
export interface NewReservationData {
  title?: string;
  pitchName: string;
  date: string;
  time: string;
  location?: string;
  city?: string;
  locationLink?: string;
  maxPlayers: number;
  price?: number;
  imageUrl?: string;
  description?: string; // Add description field to NewReservationData
}

// Pitch interface with updated fields
export interface Pitch {
  id: number;
  name: string;
  location: string; // Google Maps link
  city?: string;
  image: string;
  additionalImages?: string[];
  playersPerSide: number;
  description?: string;
  price: number;
  facilities?: string[];
  openingHours?: string;
  highlights?: string[];
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
  addReservation: (data: NewReservationData) => Reservation | undefined;
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
  addHighlight: (reservationId: number, highlight: Omit<Highlight, 'id'>) => void;
  deleteHighlight: (reservationId: number, highlightId: number) => void;
  deleteReservation: (id: number) => void;
  setPitches: (pitches: Pitch[]) => void;
  setReservations: (reservations: Reservation[]) => void;
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
  
  // Load data from localStorage when component mounts
  useEffect(() => {
    try {
      // Load pitches from localStorage
      const storedPitches = localStorage.getItem('pitches');
      if (storedPitches) {
        const parsedPitches = JSON.parse(storedPitches);
        if (Array.isArray(parsedPitches) && parsedPitches.length > 0) {
          setPitches(parsedPitches);
          console.log("Loaded pitches from localStorage in provider:", parsedPitches);
        }
      } else {
        // Initialize localStorage with initial pitches
        localStorage.setItem('pitches', JSON.stringify(initialPitches));
      }
      
      // Load reservations from localStorage
      const storedReservations = localStorage.getItem('reservations');
      if (storedReservations) {
        const parsedReservations = JSON.parse(storedReservations);
        if (Array.isArray(parsedReservations) && parsedReservations.length > 0) {
          setReservations(parsedReservations);
          console.log("Loaded reservations from localStorage in provider:", parsedReservations);
        }
      } else {
        // Initialize localStorage with initial reservations
        localStorage.setItem('reservations', JSON.stringify(initialReservations));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  // Initialize suspended players from localStorage
  useEffect(() => {
    try {
      const storedSuspensions = localStorage.getItem('suspendedPlayers');
      if (storedSuspensions) {
        const parsedSuspensions = JSON.parse(storedSuspensions);
        if (Array.isArray(parsedSuspensions) && parsedSuspensions.length > 0) {
          // Convert date strings back to Date objects
          const validSuspensions = parsedSuspensions.map(suspension => ({
            ...suspension,
            until: new Date(suspension.until)
          }));
          
          // Only keep suspensions that haven't expired
          const activeSuspensions = validSuspensions.filter(
            suspension => new Date() < suspension.until
          );
          
          if (activeSuspensions.length < validSuspensions.length) {
            // Some suspensions expired, update localStorage
            localStorage.setItem('suspendedPlayers', JSON.stringify(activeSuspensions));
          }
          
          setSuspendedPlayers(activeSuspensions);
          console.log("Loaded active suspensions from localStorage:", activeSuspensions);
        }
      }
    } catch (error) {
      console.error("Error loading suspended players from localStorage:", error);
    }
  }, []);

  // Remove the useNavigate hook from here as it needs to be inside Router context
  const navigateToReservation = (pitchName: string) => {
    // Instead of using navigate, we'll create a function that can be used
    // to pass the state when needed
    window.history.pushState({ pitchFilter: pitchName }, '', '/reservations');
    // Force navigation by changing the window location
    window.location.href = '/reservations';
  };

  // Add a new reservation
  const addReservation = (data: NewReservationData): Reservation | undefined => {
    // Validate that the pitch exists
    const pitchExists = pitches.some(p => p.name === data.pitchName);
    if (!pitchExists) {
      console.error(`Cannot create reservation: Pitch "${data.pitchName}" does not exist`);
      return undefined;
    }
    
    // Check for duplicate reservations
    const isDuplicate = reservations.some(
      r => r.date === data.date && 
          r.time === data.time && 
          r.pitchName === data.pitchName
    );
    
    if (isDuplicate) {
      console.error("Cannot create reservation: A reservation for this pitch at this time already exists");
      return undefined;
    }
    
    // Create a new reservation object with all required fields
    const newReservation: Reservation = {
      id: Date.now(), // Simple ID generation
      title: data.title,
      pitchName: data.pitchName,
      date: data.date,
      time: data.time,
      location: data.location,
      city: data.city,
      locationLink: data.locationLink,
      status: 'open',
      playersJoined: 0,
      maxPlayers: data.maxPlayers,
      lineup: [],
      waitingList: [],
      price: data.price,
      imageUrl: data.imageUrl,
      description: data.description // Add description from NewReservationData
    };
    
    // Update state with the new reservation
    setReservations(prev => {
      const updated = [...prev, newReservation];
      // Update localStorage
      try {
        localStorage.setItem('reservations', JSON.stringify(updated));
        console.log("Saved new reservation to localStorage:", newReservation);
      } catch (error) {
        console.error("Error saving reservation to localStorage:", error);
      }
      return updated;
    });
    
    return newReservation;
  };

  // Join a game
  const joinGame = (reservationId: number, playerName?: string, userId?: string) => {
    if (!userId) return;
    
    // Check if player is suspended
    const isSuspended = suspendedPlayers.some(p => 
      p.userId === userId && new Date() < new Date(p.until)
    );
    
    if (isSuspended) {
      console.log(`User ${userId} is suspended and cannot join games`);
      
      // Find suspension details for toast
      const suspension = suspendedPlayers.find(p => p.userId === userId);
      if (suspension) {
        const endDate = new Date(suspension.until);
        const formattedDate = endDate.toLocaleDateString(undefined, {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        
        // Show toast with suspension details
        toast({
          title: "Account Suspended",
          description: `You cannot join games until your suspension ends on ${formattedDate}`,
          variant: "destructive",
        });
      }
      return;
    }
    
    setReservations(prev => {
      const updated = prev.map(res => {
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
        
        // Fixed: Explicitly casting to ReservationStatus
        const newStatus: ReservationStatus = newLineup.filter(p => p.status === 'joined').length >= res.maxPlayers 
          ? 'full' 
          : 'open';
        
        return {
          ...res,
          lineup: newLineup,
          playersJoined: newLineup.filter(p => p.status === 'joined').length,
          waitingList: newWaitingList,
          status: newStatus
        };
      });
      
      // Update localStorage
      try {
        localStorage.setItem('reservations', JSON.stringify(updated));
      } catch (error) {
        console.error("Error updating reservations in localStorage:", error);
      }
      
      return updated;
    });
  };

  // Cancel reservation (player leaves the game)
  const cancelReservation = (reservationId: number, userId: string) => {
    setReservations(prev => {
      const updated = prev.map(res => {
        if (res.id !== reservationId) return res;
        
        // Update lineup to remove player
        const newLineup = res.lineup.filter(p => p.userId !== userId);
        const playersRemaining = newLineup.filter(p => p.status === 'joined').length;
        
        // Fixed: Explicitly casting to ReservationStatus
        const newStatus: ReservationStatus = playersRemaining < res.maxPlayers ? 'open' : 'full';
        
        return {
          ...res,
          lineup: newLineup,
          playersJoined: playersRemaining,
          status: newStatus
        };
      });
      
      // Update localStorage
      try {
        localStorage.setItem('reservations', JSON.stringify(updated));
      } catch (error) {
        console.error("Error updating reservations in localStorage:", error);
      }
      
      return updated;
    });
  };

  // Update reservation status
  const updateReservationStatus = (reservationId: number, newStatus: ReservationStatus) => {
    setReservations(prev => {
      const updated = prev.map(res => 
        res.id === reservationId ? { ...res, status: newStatus } : res
      );
      
      // Update localStorage
      try {
        localStorage.setItem('reservations', JSON.stringify(updated));
      } catch (error) {
        console.error("Error updating reservation status in localStorage:", error);
      }
      
      return updated;
    });
  };

  // Check if a user has joined a specific game
  const isUserJoined = (reservationId: number, userId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return false;
    
    return reservation.lineup.some(p => p.userId === userId && p.status === 'joined');
  };

  // Join waiting list
  const joinWaitingList = (reservationId: number, userId: string) => {
    setReservations(prev => {
      const updated = prev.map(res => {
        if (res.id !== reservationId) return res;
        
        // Check if already in waiting list
        if (res.waitingList.includes(userId)) return res;
        
        // Check if already in lineup
        if (res.lineup.some(p => p.userId === userId && p.status === 'joined')) return res;
        
        return {
          ...res,
          waitingList: [...res.waitingList, userId]
        };
      });
      
      // Update localStorage
      try {
        localStorage.setItem('reservations', JSON.stringify(updated));
      } catch (error) {
        console.error("Error updating waiting list in localStorage:", error);
      }
      
      return updated;
    });
  };

  // Leave waiting list
  const leaveWaitingList = (reservationId: number, userId: string) => {
    setReservations(prev => {
      const updated = prev.map(res => {
        if (res.id !== reservationId) return res;
        
        return {
          ...res,
          waitingList: res.waitingList.filter(id => id !== userId)
        };
      });
      
      // Update localStorage
      try {
        localStorage.setItem('reservations', JSON.stringify(updated));
      } catch (error) {
        console.error("Error updating waiting list in localStorage:", error);
      }
      
      return updated;
    });
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
    setReservations(prev => {
      const updated = prev.map(res => {
        if (res.id !== reservationId) return res;
        
        return {
          ...res,
          ...data
        };
      });
      
      // Update localStorage
      try {
        localStorage.setItem('reservations', JSON.stringify(updated));
      } catch (error) {
        console.error("Error updating reservation in localStorage:", error);
      }
      
      return updated;
    });
  };
  
  // Add a new pitch
  const addPitch = (pitchData: Omit<Pitch, 'id'>): Pitch => {
    const newPitch: Pitch = {
      ...pitchData,
      id: Date.now(),
    };
    
    setPitches(prev => {
      const updated = [...prev, newPitch];
      
      // Update localStorage
      try {
        localStorage.setItem('pitches', JSON.stringify(updated));
        console.log("Saved new pitch to localStorage:", newPitch);
      } catch (error) {
        console.error("Error saving pitch to localStorage:", error);
      }
      
      return updated;
    });
    
    return newPitch;
  };
  
  // Update an existing pitch
  const updatePitch = (pitchId: number, data: Partial<Omit<Pitch, 'id'>>) => {
    setPitches(prev => {
      // Create new array of pitches with the updated pitch
      const updatedPitches = prev.map(pitch => {
        if (pitch.id !== pitchId) return pitch;
        
        // Create updated pitch with new data
        const updatedPitch = {
          ...pitch,
          ...data
        };
        
        return updatedPitch;
      });
      
      // Update localStorage
      try {
        localStorage.setItem('pitches', JSON.stringify(updatedPitches));
        console.log("Updated pitches in localStorage after update:", updatedPitches);
      } catch (error) {
        console.error("Error updating pitches in localStorage:", error);
      }
      
      return updatedPitches;
    });
  };
  
  // Delete a pitch
  const deletePitch = (pitchId: number) => {
    setPitches(prev => {
      const filteredPitches = prev.filter(pitch => pitch.id !== pitchId);
      
      // Update localStorage
      try {
        localStorage.setItem('pitches', JSON.stringify(filteredPitches));
        console.log("Updated pitches in localStorage after deletion:", filteredPitches);
      } catch (error) {
        console.error("Error updating pitches in localStorage:", error);
      }
      
      return filteredPitches;
    });
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
    
    // Store suspended players in localStorage for persistence
    try {
      const suspendedPlayersData = [
        ...suspendedPlayers.filter(p => p.userId !== userId),
        { userId, until: until.toISOString(), reason }
      ];
      localStorage.setItem('suspendedPlayers', JSON.stringify(suspendedPlayersData));
      console.log(`Player ${userId} suspension stored in localStorage until ${until}`);
    } catch (error) {
      console.error("Error storing player suspension in localStorage:", error);
    }
    
    // Remove player from all upcoming games
    setReservations(prev => {
      const updated = prev.map(res => {
        // Only process upcoming games
        if (res.status !== 'open' && res.status !== 'full') return res;
        
        // Check if player is in this game
        const isInGame = res.lineup.some(p => p.userId === userId);
        const isInWaitingList = res.waitingList.includes(userId);
        
        if (!isInGame && !isInWaitingList) return res;
        
        // Remove player from lineup and waiting list
        const newLineup = res.lineup.filter(p => p.userId !== userId);
        const newWaitingList = res.waitingList.filter(id => id !== userId);
        const playersJoined = newLineup.filter(p => p.status === 'joined').length;
        
        // Update reservation status if needed
        const newStatus: ReservationStatus = playersJoined < res.maxPlayers ? 'open' : 'full';
        
        return {
          ...res,
          lineup: newLineup,
          waitingList: newWaitingList,
          playersJoined,
          status: newStatus
        };
      });
      
      // Update localStorage
      try {
        localStorage.setItem('reservations', JSON.stringify(updated));
      } catch (error) {
        console.error("Error updating reservations in localStorage after suspension:", error);
      }
      
      return updated;
    });
    
    console.log(`Player ${userId} suspended for ${duration} days. Reason: ${reason}`);
  };

  // Add new highlight to a reservation
  const addHighlight = (reservationId: number, highlight: Omit<Highlight, 'id'>) => {
    setReservations(prev => {
      const updated = prev.map(res => {
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
      });
      
      // Update localStorage
      try {
        localStorage.setItem('reservations', JSON.stringify(updated));
      } catch (error) {
        console.error("Error updating highlights in localStorage:", error);
      }
      
      return updated;
    });
  };
  
  // Delete a highlight from a reservation
  const deleteHighlight = (reservationId: number, highlightId: number) => {
    setReservations(prev => {
      const updated = prev.map(res => {
        if (res.id !== reservationId) return res;
        
        const highlights = res.highlights || [];
        
        return {
          ...res,
          highlights: highlights.filter(h => h.id !== highlightId),
        };
      });
      
      // Update localStorage
      try {
        localStorage.setItem('reservations', JSON.stringify(updated));
      } catch (error) {
        console.error("Error updating highlights in localStorage:", error);
      }
      
      return updated;
    });
  };

  // Delete a reservation (for admins)
  const deleteReservation = (id: number) => {
    setReservations(prev => {
      const updated = prev.filter(reservation => reservation.id !== id);
      
      // Update localStorage
      try {
        localStorage.setItem('reservations', JSON.stringify(updated));
      } catch (error) {
        console.error("Error deleting reservation from localStorage:", error);
      }
      
      return updated;
    });
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
    deleteReservation,
    setPitches,  // Added the setter function
    setReservations  // Added the setter function
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
