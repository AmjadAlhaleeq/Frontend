import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

type ReservationStatus = "open" | "full" | "completed" | "cancelled";

interface Player {
  id: number; 
  status: 'empty' | 'joined';
  playerName?: string;
  position?: string; 
  userId?: string; // Identifier for the user who joined
}

export interface Highlight {
    id: number; // Unique ID for the highlight
    type: 'goal' | 'assist' | 'yellowCard' | 'redCard' | 'save' | 'other'; // Type of highlight
    playerName: string; // Name of the player involved
    minute: number; // Minute of the game when the highlight occurred
    description?: string; // Optional description
    playerId: string; // ID of the player involved
}

export interface Reservation {
  id: number; // Unique ID for the reservation
  pitchName: string; // Name of the pitch
  date: string; // Date of the reservation (YYYY-MM-DD)
  time: string; // Time slot of the reservation
  location: string; // Location of the pitch
  price: number; // Price per player
  playersJoined: number; // Current number of players joined
  maxPlayers: number; // Maximum number of players allowed
  status: ReservationStatus; // Current status of the reservation
  waitingList: string[]; // Array of userIds on the waiting list
  lineup: Player[]; // Detailed lineup of players
  highlights: Highlight[]; // Array of game highlights
  imageUrl?: string; // Optional URL for an image of the pitch/event
  finalScore?: string; // Final score after a game is completed (e.g., "3-2")
  mvpPlayerId?: string; // ID of the player who was MVP of the game
}

export interface NewPitchData {
  name: string;
  location: string;
  image: string;
  playersPerSide: string;
  description: string;
  openingHours: string;
  price: string;
  surfaceType: string;
  pitchSize: string;
}

// Interface for data required when creating a new reservation
export interface NewReservationData {
  pitchName: string;
  date: string; 
  time: string;
  location: string;
  price: number;
  maxPlayers: number;
  imageUrl?: string;
}

interface ReservationContextType {
  reservations: Reservation[]; // List of all reservations
  pitches: Pitch[]; // List of all pitches
  addPitch: (pitchData: NewPitchData) => void; // Adds a new pitch
  deletePitch: (pitchId: number) => void; // Deletes a pitch
  addReservation: (reservationData: NewReservationData) => void; // Adds a new reservation
  deleteReservation: (reservationId: number) => void; // Deletes a reservation
  joinGame: (id: number, position?: number, userId?: string) => void; // Allows a user to join a game
  cancelReservation: (id: number, userId?: string) => void; // Allows a user to cancel their spot in a game
  joinWaitingList: (id: number, userId?: string) => void; // Adds a user to a game's waiting list
  leaveWaitingList: (id: number, userId?: string) => void; // Removes a user from a game's waiting list
  editReservation: (id: number, updatedData: Partial<Omit<Reservation, 'id' | 'status' | 'playersJoined' | 'waitingList' | 'lineup' | 'highlights'>>) => void; // Edits an existing reservation's details
  updateReservationStatus: (id: number, status: ReservationStatus) => void; // Updates the status of a reservation
  navigateToReservation: (pitchName: string) => void; // Placeholder for navigation logic
  getPitchByName: (name: string) => Pitch | undefined; // Retrieves a pitch by its name
  getReservationsByPitch: (pitchName: string) => Reservation[]; // Retrieves reservations for a specific pitch
  updateLineup: (reservationId: number, lineup: Player[]) => void; // Updates the lineup for a reservation
  addHighlight: (reservationId: number, highlight: Omit<Highlight, 'id'>) => void; // Adds a highlight to a reservation
  editHighlight: (reservationId: number, highlightId: number, updatedHighlight: Partial<Omit<Highlight, 'id'>>) => void; // Edits an existing highlight
  deleteHighlight: (reservationId: number, highlightId: number) => void; // Deletes a highlight
  isUserJoined: (reservationId: number, userId?: string) => boolean; // Checks if a user has joined a specific game
  hasUserJoinedOnDate: (date: string, userId?: string) => boolean; // Checks if a user has joined any game on a specific date
  getReservationsForDate: (targetDate: Date) => Reservation[]; // Retrieves reservations for a specific date
  getUserReservations: (userId: string) => Reservation[]; // Retrieves all reservations a specific user has joined
  getUserStats: (userId: string) => UserStats; // Get statistics for a specific user
}

// Interface for user statistics
export interface UserStats {
  matches: number;
  wins: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleansheets: number;
  tackles: number;
  mvps: number;
}

// Interface for a pitch
export interface Pitch {
  id: number;
  name: string;
  location: string;
  image: string;
  rating: number;
  features: string[];
  playersPerSide: number;
  isAdmin: boolean; 
  details?: {
    description: string;
    openingHours: string;
    address: string;
    price: string;
    facilities: string[];
    surfaceType: string;
    pitchSize: string;
    rules: string[];
  };
}

// Initial sample data for pitches (can be replaced by API call)
const initialPitchesData: Pitch[] = [
    {
    id: 1,
    name: "Central Park Soccer Field",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1531415077573-submitted.jpg?q=80&w=1000&auto=format&fit=crop",
    rating: 4.5,
    features: ["Outdoor", "Well-maintained"],
    playersPerSide: 7,
    isAdmin: false,
    details: {
      description: "A beautiful outdoor soccer field located in the heart of Central Park. Perfect for 7v7 games.",
      openingHours: "08:00 - 22:00",
      address: "Central Park West, New York, NY 10024",
      price: "$50 per hour",
      facilities: ["Showers", "Parking", "Water Fountains"],
      surfaceType: "Natural Grass",
      pitchSize: "70m x 50m",
      rules: ["No metal cleats", "Respect park hours"],
    },
  },
  {
    id: 2,
    name: "Brooklyn Bridge Park Pitch 5",
    location: "Brooklyn, NY",
    image: "https://images.unsplash.com/photo-1592994601039-35c950ad1ba4?q=80&w=1000&auto=format&fit=crop",
    rating: 4.8,
    features: ["Outdoor", "Floodlit", "Waterfront View"],
    playersPerSide: 5,
    isAdmin: false,
    details: {
      description: "State-of-the-art 5-a-side pitch with stunning views of the Manhattan skyline. Features floodlights for evening games.",
      openingHours: "09:00 - 23:00",
      address: "Pier 5, Brooklyn Bridge Park, Brooklyn, NY 11201",
      price: "$40 per hour",
      facilities: ["Changing Rooms", "Public Restrooms", "Cafe Nearby"],
      surfaceType: "Artificial Turf",
      pitchSize: "40m x 20m",
      rules: ["Bookings essential", "Turf shoes only"],
    },
  },
];

// Create the ReservationContext
const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined
);

/**
 * Custom hook to use the ReservationContext.
 * Throws an error if used outside of a ReservationProvider.
 */
export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error(
      "useReservation must be used within a ReservationProvider"
    );
  }
  return context;
};

// Initial sample data for reservations (can be replaced by API call)
const initialReservationsData: Reservation[] = [
  {
    id: 1,
    pitchName: "Central Park Soccer Field",
    date: "2025-05-22",
    time: "18:00",
    location: "New York, NY",
    price: 10,
    playersJoined: 8,
    maxPlayers: 14,
    status: "open",
    waitingList: [],
    lineup: Array.from({ length: 14 }, (_, i) => ({
      id: i,
      status: i < 8 ? 'joined' : 'empty',
      playerName: i < 8 ? `Player ${i+1}` : undefined,
      userId: i < 8 ? `user${i+1}` : undefined
    })),
    highlights: [],
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    pitchName: "Brooklyn Bridge Park Pitch 5",
    date: "2025-05-23",
    time: "19:30",
    location: "Brooklyn, NY",
    price: 8,
    playersJoined: 10,
    maxPlayers: 10,
    status: "full",
    waitingList: ["user11", "user12"],
    lineup: Array.from({ length: 10 }, (_, i) => ({
      id: i,
      status: 'joined',
      playerName: `Player ${i+1}`,
      userId: `user${i+1}`
    })),
    highlights: [],
    imageUrl: "https://images.unsplash.com/photo-1570496062523-38954834daa7?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    pitchName: "Queens Indoor Soccer Center",
    date: "2025-05-24",
    time: "20:00",
    location: "Queens, NY",
    price: 12,
    playersJoined: 6,
    maxPlayers: 12,
    status: "open",
    waitingList: [],
    lineup: Array.from({ length: 12 }, (_, i) => ({
      id: i,
      status: i < 6 ? 'joined' : 'empty',
      playerName: i < 6 ? `Player ${i+1}` : undefined,
      userId: i < 6 ? `user${i+1}` : undefined
    })),
    highlights: [],
    imageUrl: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 4,
    pitchName: "Central Park Soccer Field",
    date: "2025-04-15",
    time: "17:00",
    location: "New York, NY",
    price: 10,
    playersJoined: 14,
    maxPlayers: 14,
    status: "completed",
    waitingList: [],
    lineup: Array.from({ length: 14 }, (_, i) => ({
      id: i,
      status: 'joined',
      playerName: `Player ${i+1}`,
      userId: `user${i+1}`
    })),
    highlights: [
      {
        id: 1,
        type: 'goal',
        playerName: 'Player 1',
        minute: 23,
        playerId: 'user1'
      },
      {
        id: 2,
        type: 'assist',
        playerName: 'Player 3',
        minute: 23,
        playerId: 'user3'
      },
      {
        id: 3,
        type: 'goal',
        playerName: 'Player 2',
        minute: 45,
        playerId: 'user2'
      }
    ],
    finalScore: "2-1",
    mvpPlayerId: "user1",
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 5,
    pitchName: "Brooklyn Bridge Park Pitch 5",
    date: "2025-04-10",
    time: "19:00",
    location: "Brooklyn, NY",
    price: 8,
    playersJoined: 10,
    maxPlayers: 10,
    status: "completed",
    waitingList: [],
    lineup: Array.from({ length: 10 }, (_, i) => ({
      id: i,
      status: 'joined',
      playerName: `Player ${i+1}`,
      userId: `user${i+1}`
    })),
    highlights: [
      {
        id: 1,
        type: 'goal',
        playerName: 'Player 5',
        minute: 12,
        playerId: 'user5'
      },
      {
        id: 2,
        type: 'yellowCard',
        playerName: 'Player 7',
        minute: 35,
        playerId: 'user7'
      }
    ],
    finalScore: "1-0",
    mvpPlayerId: "user5",
    imageUrl: "https://images.unsplash.com/photo-1570496062523-38954834daa7?q=80&w=1000&auto=format&fit=crop"
  }
];

/**
 * ReservationProvider component.
 * Manages the state for reservations and pitches, providing context to its children.
 * Handles data persistence to localStorage (should be replaced with API calls).
 */
export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for reservations, initialized from localStorage or default
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    // TODO: API Call: Fetch initial reservations from backend instead of localStorage
    const savedReservations = localStorage.getItem("reservations");
    if (savedReservations) {
      try {
        const parsed = JSON.parse(savedReservations);
        if (Array.isArray(parsed)) {
          return parsed.map((res: any) => ({
            ...res,
            lineup: Array.isArray(res.lineup) ? res.lineup : Array.from({ length: res.maxPlayers || 0 }, (_, i) => ({ id: i, status: 'empty' })),
            highlights: Array.isArray(res.highlights) ? res.highlights : [],
            imageUrl: res.imageUrl || undefined, 
          }));
        }
        return initialReservationsData;
      } catch (error) {
        console.error("Error parsing reservations from localStorage:", error);
        return initialReservationsData;
      }
    }
    return initialReservationsData;
  });

  // Effect to save reservations to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  // State for pitches, initialized from localStorage or default
  const [pitches, setPitches] = useState<Pitch[]>(() => {
    const savedPitches = localStorage.getItem("pitches");
    return savedPitches ? JSON.parse(savedPitches) : (initialPitchesData.length > 0 ? initialPitchesData : []);
  });

  // Effect to save pitches to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("pitches", JSON.stringify(pitches));
  }, [pitches]);

  /**
   * Adds a new pitch to the list.
   * @param newPitchData - Data for the new pitch.
   */
  const addPitch = (newPitchData: NewPitchData) => {
    setPitches(prevPitches => {
      const newId = prevPitches.length > 0 ? Math.max(...prevPitches.map(p => p.id)) + 1 : 1;
      const newPitch: Pitch = {
        id: newId,
        name: newPitchData.name,
        location: newPitchData.location,
        image: newPitchData.image || `https://source.unsplash.com/random/400x300/?soccer,pitch&id=${newId}`,
        playersPerSide: parseInt(newPitchData.playersPerSide, 10) || 5,
        rating: 0,
        features: [],
        isAdmin: true, 
        details: {
          description: newPitchData.description,
          openingHours: newPitchData.openingHours,
          address: newPitchData.location,
          price: newPitchData.price,
          facilities: [],
          surfaceType: newPitchData.surfaceType,
          pitchSize: newPitchData.pitchSize,
          rules: [],
        }
      };
      toast({
        title: "Pitch Added Successfully!",
        description: `${newPitch.name} has been added to the list.`,
      });
      return [...prevPitches, newPitch];
    });
  };

  /**
   * Deletes a pitch from the list.
   * @param pitchId - The ID of the pitch to delete.
   */
  const deletePitch = (pitchId: number) => {
    setPitches(prevPitches => {
      const pitchToDelete = prevPitches.find(p => p.id === pitchId);
      const updatedPitches = prevPitches.filter(pitch => pitch.id !== pitchId);
      if(pitchToDelete){
        toast({
          title: "Pitch Deleted",
          description: `${pitchToDelete.name} has been successfully removed.`,
        });
      }
      return updatedPitches;
    });
  };

  /**
   * Adds a new reservation to the list.
   * @param reservationData - Data for the new reservation.
   */
  const addReservation = (reservationData: NewReservationData) => {
    setReservations(prev => {
      const newId = prev.length > 0 ? Math.max(...prev.map(r => r.id)) + 1 : 1;
      const newReservation: Reservation = {
        id: newId,
        ...reservationData,
        playersJoined: 0,
        status: 'open',
        waitingList: [],
        lineup: Array.from({ length: reservationData.maxPlayers }, (_, i) => ({ id: i, status: 'empty' })),
        highlights: [],
      };
      toast({ title: "Reservation Created", description: `Reservation for ${newReservation.pitchName} added.` });
      return [...prev, newReservation];
    });
  };
  
  /**
   * Deletes a reservation from the list.
   * @param reservationId - The ID of the reservation to delete.
   */
  const deleteReservation = (reservationId: number) => {
    setReservations(prev => {
      const reservationToDelete = prev.find(r => r.id === reservationId);
      if (reservationToDelete) {
        toast({ title: "Reservation Deleted", description: `Reservation for ${reservationToDelete.pitchName} has been deleted.` });
      }
      return prev.filter(res => res.id !== reservationId);
    });
  };

  /**
   * Allows a user to join a game.
   * @param id - The ID of the reservation to join.
   * @param position - Optional: The specific position the user wants to join.
   * @param userId - The ID of the user joining.
   */
  const joinGame = (id: number, position?: number, userId: string = "user1") => {
    setReservations(prev => {
      return prev.map(res => {
        if (res.id === id && res.playersJoined < res.maxPlayers && res.status === 'open') {
          if (res.lineup.some(p => p.userId === userId && p.status === 'joined')) {
            toast({ title: "Already Joined", description: "You are already in this game.", variant: "default" });
            return res;
          }

          const updatedLineup = [...res.lineup];
          let joined = false;
          if (position !== undefined && updatedLineup[position]?.status === 'empty') {
            updatedLineup[position] = { ...updatedLineup[position], status: 'joined', userId, playerName: `Player ${userId}` };
            joined = true;
          } else {
            const emptySpotIndex = updatedLineup.findIndex(p => p.status === 'empty');
            if (emptySpotIndex !== -1) {
              updatedLineup[emptySpotIndex] = { ...updatedLineup[emptySpotIndex], status: 'joined', userId, playerName: `Player ${userId}` };
              joined = true;
            }
          }
          
          if (joined) {
            const newPlayersJoined = res.playersJoined + 1;
            const newStatus = newPlayersJoined >= res.maxPlayers ? 'full' : 'open';
            toast({ title: "Joined Game!", description: `Successfully joined ${res.pitchName}.` });
            return { ...res, playersJoined: newPlayersJoined, status: newStatus, lineup: updatedLineup };
          } else {
             toast({ title: "Error", description: "No empty spot available or position taken.", variant: "destructive" });
             return res;
          }
        }
        return res;
      });
    });
  };

  /**
   * Allows a user to cancel their spot in a game.
   * @param id - The ID of the reservation.
   * @param userId - The ID of the user cancelling.
   */
  const cancelReservation = (id: number, userId: string = "user1") => {
    setReservations(prev => {
      return prev.map(res => {
        if (res.id === id) {
          const playerSpotIndex = res.lineup.findIndex(p => p.userId === userId && p.status === 'joined');
          if (playerSpotIndex !== -1) {
            const updatedLineup = [...res.lineup];
            updatedLineup[playerSpotIndex] = { ...updatedLineup[playerSpotIndex], status: 'empty', playerName: undefined, userId: undefined };
            
            const newPlayersJoined = Math.max(0, res.playersJoined - 1);
            const newStatus = res.status === 'full' && newPlayersJoined < res.maxPlayers ? 'open' : res.status; 
            toast({ title: "Reservation Cancelled", description: `Your spot for ${res.pitchName} has been cancelled.` });
            return { ...res, playersJoined: newPlayersJoined, status: newStatus, lineup: updatedLineup };
          } else {
            toast({ title: "Not Joined", description: "You are not currently in this game's lineup.", variant: "default"});
            return res;
          }
        }
        return res;
      });
    });
  };

  /**
   * Adds a user to a game's waiting list.
   * @param id - The ID of the reservation.
   * @param userId - The ID of the user joining the waitlist.
   */
  const joinWaitingList = (id: number, userId: string = "user1") => {
    setReservations(prev => {
      return prev.map(res => {
        if (res.id === id && res.status === 'full' && !res.waitingList.includes(userId)) {
          toast({ title: "Joined Waitlist", description: `You've been added to the waitlist for ${res.pitchName}.` });
          return { ...res, waitingList: [...res.waitingList, userId] };
        }
        if (res.id === id && res.waitingList.includes(userId)) {
            toast({ title: "Already on Waitlist", description: `You are already on the waitlist for ${res.pitchName}.`, variant: "default" });
        }
        return res;
      });
    });
  };

  /**
   * Removes a user from a game's waiting list.
   * @param id - The ID of the reservation.
   * @param userId - The ID of the user leaving the waitlist.
   */
  const leaveWaitingList = (id: number, userId: string = "user1") => {
    setReservations(prev => {
      return prev.map(res => {
        if (res.id === id && res.waitingList.includes(userId)) {
          toast({ title: "Left Waitlist", description: `You've been removed from the waitlist for ${res.pitchName}.` });
          return { ...res, waitingList: res.waitingList.filter(user => user !== userId) };
        }
        return res;
      });
    });
  };
  
  /**
   * Edits the details of an existing reservation (typically admin action).
   * @param id - The ID of the reservation to edit.
   * @param updatedData - Partial data with updates for the reservation.
   */
  const editReservation = (id: number, updatedData: Partial<Omit<Reservation, 'id' | 'status' | 'playersJoined' | 'waitingList' | 'lineup' | 'highlights'>>) => {
    setReservations(prev =>
      prev.map(res => {
        if (res.id === id) {
          const newMaxPlayers = updatedData.maxPlayers !== undefined ? updatedData.maxPlayers : res.maxPlayers;
          const updatedRes = { 
            ...res, 
            ...updatedData, 
            date: updatedData.date ? new Date(updatedData.date).toISOString().split('T')[0] : res.date,
            maxPlayers: newMaxPlayers,
          };
          if (updatedRes.playersJoined >= newMaxPlayers && updatedRes.status === 'open') {
            updatedRes.status = 'full';
          } else if (updatedRes.playersJoined < newMaxPlayers && updatedRes.status === 'full') {
            updatedRes.status = 'open';
          }
          return updatedRes;
        }
        return res;
      })
    );
    toast({ title: "Reservation Updated", description: "Details have been saved." });
  };

  /**
   * Updates the status of a reservation (e.g., to 'completed' or 'cancelled', typically admin action).
   * @param id - The ID of the reservation.
   * @param status - The new status for the reservation.
   */
  const updateReservationStatus = (id: number, status: ReservationStatus) => {
    setReservations(prev =>
      prev.map(res => (res.id === id ? { ...res, status } : res))
    );
    if (status === 'completed') {
       toast({ title: "Game Completed!", description: "The reservation has been marked as completed." });
    } else if (status === 'cancelled') {
       toast({ title: "Game Cancelled", description: "The reservation has been cancelled by admin." });
    }
  };
  
  const navigateToReservation = (pitchName: string) => {
    console.log(`Navigating to reservations for pitch: ${pitchName}`);
    toast({title: "Loading Reservations", description: `Showing games for ${pitchName}.`});
  };

  const getPitchByName = (name: string): Pitch | undefined => {
    return pitches.find(pitch => pitch.name.toLowerCase() === name.toLowerCase());
  };

  const getReservationsByPitch = (pitchName: string): Reservation[] => {
    return reservations.filter(res => res.pitchName.toLowerCase() === pitchName.toLowerCase() && (res.status === 'open' || res.status === 'full'));
  };
  
  const updateLineup = (reservationId: number, lineup: Player[]) => {
    setReservations(prev => 
      prev.map(res => 
        res.id === reservationId ? { ...res, lineup } : res
      )
    );
    toast({ title: "Lineup Updated", description: "Player positions saved." });
  };

  const addHighlight = (reservationId: number, highlight: Omit<Highlight, 'id'>) => {
    setReservations(prev => prev.map(res => {
      if (res.id === reservationId) {
        const newHighlightId = res.highlights.length > 0 ? Math.max(...res.highlights.map(h => h.id)) + 1 : 1;
        const validTypes: Highlight['type'][] = ['goal', 'assist', 'yellowCard', 'redCard', 'save', 'other'];
        if (!validTypes.includes(highlight.type)) {
            console.error("Invalid highlight type:", highlight.type);
            toast({title: "Error adding highlight", description: "Invalid event type.", variant: "destructive"});
            return res; 
        }
        return { ...res, highlights: [...res.highlights, { ...highlight, id: newHighlightId }] };
      }
      return res;
    }));
    toast({title: "Highlight Added", description: `${highlight.type} by ${highlight.playerName} recorded.`});
  };

  const editHighlight = (reservationId: number, highlightId: number, updatedHighlight: Partial<Omit<Highlight, 'id'>>) => {
    setReservations(prev => prev.map(res => {
      if (res.id === reservationId) {
        return { 
          ...res, 
          highlights: res.highlights.map(h => h.id === highlightId ? { ...h, ...updatedHighlight } : h) 
        };
      }
      return res;
    }));
    toast({title: "Highlight Updated", description: "Changes to the highlight have been saved."});
  };

  const deleteHighlight = (reservationId: number, highlightId: number) => {
    setReservations(prev => prev.map(res => {
      if (res.id === reservationId) {
        return { ...res, highlights: res.highlights.filter(h => h.id !== highlightId) };
      }
      return res;
    }));
    toast({title: "Highlight Deleted", description: "The highlight has been removed."});
  };

  const isUserJoined = (reservationId: number, userId: string = "user1"): boolean => {
    const reservation = reservations.find(r => r.id === reservationId);
    return reservation ? (reservation.lineup || []).some(p => p.userId === userId && p.status === 'joined') : false;
  };

  const hasUserJoinedOnDate = (date: string, userId: string = "user1"): boolean => {
    return reservations.some(res => 
      res.date === date && 
      (res.lineup || []).some(p => p.userId === userId && p.status === 'joined') &&
      res.status !== 'completed' && res.status !== 'cancelled'
    );
  };
  
  const getReservationsForDate = (targetDate: Date): Reservation[] => {
    const dateStr = targetDate.toISOString().split('T')[0];
    return reservations.filter(res => res.date === dateStr && (res.status === 'open' || res.status === 'full'));
  };

  const getUserReservations = (userId: string): Reservation[] => {
    return reservations.filter(res => 
      (res.lineup || []).some(p => p.userId === userId && p.status === 'joined')
    );
  };

  const getUserStats = (userId: string): UserStats => {
    const userCompletedReservations = reservations.filter(res => 
      res.status === 'completed' && 
      (res.lineup || []).some(p => p.userId === userId && p.status === 'joined')
    );
    
    const stats: UserStats = {
      matches: userCompletedReservations.length,
      wins: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleansheets: 0,
      tackles: 0,
      mvps: 0
    };
    
    stats.mvps = userCompletedReservations.filter(res => res.mvpPlayerId === userId).length;
    
    userCompletedReservations.forEach(res => {
      res.highlights.forEach(highlight => {
        if (highlight.playerId === userId) {
          if (highlight.type === 'goal') stats.goals++;
          if (highlight.type === 'assist') stats.assists++;
          if (highlight.type === 'yellowCard') stats.yellowCards++;
          if (highlight.type === 'redCard') stats.redCards++;
          if (highlight.type === 'other' && highlight.description?.toLowerCase().includes('tackle')) {
            stats.tackles++;
          }
        }
      });
      
      if (res.finalScore) {
        const [teamA, teamB] = res.finalScore.split('-').map(s => parseInt(s, 10));
        if (!isNaN(teamA) && !isNaN(teamB)) {
          if (teamA > teamB) stats.wins++;
          if (teamB === 0) stats.cleansheets++;
        }
      }
    });
    
    return stats;
  };

  return (
    <ReservationContext.Provider value={{ 
      reservations, 
      pitches, 
      addPitch, 
      deletePitch,
      addReservation,
      deleteReservation,
      joinGame, 
      cancelReservation,
      joinWaitingList,
      leaveWaitingList,
      editReservation,
      updateReservationStatus,
      navigateToReservation,
      getPitchByName,
      getReservationsByPitch,
      updateLineup,
      addHighlight,
      editHighlight,
      deleteHighlight,
      isUserJoined,
      hasUserJoinedOnDate,
      getReservationsForDate,
      getUserReservations,
      getUserStats
    }}>
      {children}
    </ReservationContext.Provider>
  );
};
