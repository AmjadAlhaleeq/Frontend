import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast"; // Ensure toast is imported

type ReservationStatus = "open" | "full" | "completed" | "cancelled";

interface Player {
  id: number; // Consider if this ID is unique across all players or per reservation
  status: 'empty' | 'joined';
  playerName?: string;
  position?: string; // e.g., 'Goalkeeper', 'Forward 1'
  userId?: string; // To identify the user
}

export interface Highlight {
    id: number;
    type: 'goal' | 'assist' | 'yellowCard' | 'redCard' | 'save' | 'other'; // Standardized to lowercase
    playerName: string;
    minute: number;
    description?: string;
    playerId: string; // Added playerId
}

export interface Reservation {
  id: number;
  pitchName: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  price: number;
  playersJoined: number;
  maxPlayers: number;
  status: ReservationStatus;
  waitingList: string[]; // Array of userIds
  lineup: Player[];
  highlights: Highlight[];
  imageUrl?: string; // Added imageUrl property
  // adminId?: string; // Optional: if you want to associate an admin with a reservation
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

// Type for data when creating a new reservation
export interface NewReservationData {
  pitchName: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  price: number;
  maxPlayers: number;
  imageUrl?: string; // Optional, as in AddReservationDialog
}

interface ReservationContextType {
  reservations: Reservation[];
  pitches: Pitch[];
  addPitch: (pitchData: NewPitchData) => void;
  deletePitch: (pitchId: number) => void;
  addReservation: (reservationData: NewReservationData) => void; 
  deleteReservation: (reservationId: number) => void; 
  joinGame: (id: number, position?: number, userId?: string) => void;
  cancelReservation: (id: number, userId?: string) => void;
  joinWaitingList: (id: number, userId?: string) => void;
  leaveWaitingList: (id: number, userId?: string) => void;
  editReservation: (id: number, updatedData: Partial<Omit<Reservation, 'id' | 'status' | 'playersJoined' | 'waitingList' | 'lineup' | 'highlights'>>) => void;
  updateReservationStatus: (id: number, status: ReservationStatus) => void;
  navigateToReservation: (pitchName: string) => void;
  getPitchByName: (name: string) => Pitch | undefined;
  getReservationsByPitch: (pitchName: string) => Reservation[];
  updateLineup: (reservationId: number, lineup: Player[]) => void;
  addHighlight: (reservationId: number, highlight: Omit<Highlight, 'id'>) => void;
  editHighlight: (reservationId: number, highlightId: number, updatedHighlight: Partial<Omit<Highlight, 'id'>>) => void;
  deleteHighlight: (reservationId: number, highlightId: number) => void;
  isUserJoined: (reservationId: number, userId?: string) => boolean; 
  hasUserJoinedOnDate: (date: string, userId?: string) => boolean; 
  getReservationsForDate: (targetDate: Date) => Reservation[]; 
  getUserReservations: (userId: string) => Reservation[]; 
}

// ... keep existing code (Pitch interface, initialPitchesData)
export interface Pitch {
  id: number;
  name: string;
  location: string;
  image: string;
  rating: number;
  features: string[];
  playersPerSide: number;
  isAdmin: boolean; // This might represent if the current user is admin for THIS pitch
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
  // Add more sample pitches as needed
];


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

const initialReservationsData: Reservation[] = [];


export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const savedReservations = localStorage.getItem("reservations");
    if (savedReservations) {
      try {
        const parsed = JSON.parse(savedReservations);
        if (Array.isArray(parsed)) {
          // Ensure each reservation has lineup and highlights initialized
          return parsed.map((res: any) => ({
            ...res,
            lineup: Array.isArray(res.lineup) ? res.lineup : Array.from({ length: res.maxPlayers || 0 }, (_, i) => ({ id: i, status: 'empty' })),
            highlights: Array.isArray(res.highlights) ? res.highlights : [],
            // Ensure imageUrl is carried over if present, or defaults if logic requires
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

  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  const [pitches, setPitches] = useState<Pitch[]>(() => {
    const savedPitches = localStorage.getItem("pitches");
    return savedPitches ? JSON.parse(savedPitches) : (initialPitchesData.length > 0 ? initialPitchesData : []);
  });

  useEffect(() => {
    localStorage.setItem("pitches", JSON.stringify(pitches));
  }, [pitches]);

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
        isAdmin: true, // Assuming newly added pitch by admin
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

  const addReservation = (reservationData: NewReservationData) => {
    setReservations(prev => {
      const newId = prev.length > 0 ? Math.max(...prev.map(r => r.id)) + 1 : 1;
      const newReservation: Reservation = {
        id: newId,
        ...reservationData, // Spreads imageUrl if present in reservationData
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
  
  const deleteReservation = (reservationId: number) => {
    setReservations(prev => {
      const reservationToDelete = prev.find(r => r.id === reservationId);
      if (reservationToDelete) {
        toast({ title: "Reservation Deleted", description: `Reservation for ${reservationToDelete.pitchName} has been deleted.` });
      }
      return prev.filter(res => res.id !== reservationId);
    });
  };

  const joinGame = (id: number, position?: number, userId: string = "user1") => {
    setReservations(prev => {
      return prev.map(res => {
        if (res.id === id && res.playersJoined < res.maxPlayers && res.status === 'open') {
          // Check if user already joined this game
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
            // User was not in the game, or trying to cancel for someone else without permission
            toast({ title: "Not Joined", description: "You are not currently in this game's lineup.", variant: "default"});
            return res;
          }
        }
        return res;
      });
    });
  };

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
  
  const editReservation = (id: number, updatedData: Partial<Omit<Reservation, 'id' | 'status' | 'playersJoined' | 'waitingList' | 'lineup' | 'highlights'>>) => {
    setReservations(prev =>
      prev.map(res => {
        if (res.id === id) {
          const newMaxPlayers = updatedData.maxPlayers !== undefined ? updatedData.maxPlayers : res.maxPlayers;
          // If maxPlayers changes, lineup might need adjustment.
          // For simplicity, this example doesn't rebuild lineup if maxPlayers changes,
          // but a real app might need to truncate or extend it.
          const updatedRes = { 
            ...res, 
            ...updatedData, 
            date: updatedData.date ? new Date(updatedData.date).toISOString().split('T')[0] : res.date,
            maxPlayers: newMaxPlayers,
          };
          // Potentially update status based on new maxPlayers vs playersJoined
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

  const updateReservationStatus = (id: number, status: ReservationStatus) => {
    setReservations(prev =>
      prev.map(res => (res.id === id ? { ...res, status } : res))
    );
    // ... keep existing code (toast messages for status update)
    if (status === 'completed') {
       toast({ title: "Game Completed!", description: "The reservation has been marked as completed." });
    } else if (status === 'cancelled') {
       toast({ title: "Game Cancelled", description: "The reservation has been cancelled by admin." });
    }
  };
  
  // ... keep existing code (navigateToReservation, getPitchByName, getReservationsByPitch, updateLineup)
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
        // Ensure the type is one of the allowed values
        const validTypes: Highlight['type'][] = ['goal', 'assist', 'yellowCard', 'redCard', 'save', 'other'];
        if (!validTypes.includes(highlight.type)) {
            console.error("Invalid highlight type:", highlight.type);
            toast({title: "Error adding highlight", description: "Invalid event type.", variant: "destructive"});
            return res; // Or handle error appropriately
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
      getUserReservations
    }}>
      {children}
    </ReservationContext.Provider>
  );
};
