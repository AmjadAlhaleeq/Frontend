import React, { createContext, useContext, useState, useEffect } from "react";

type ReservationStatus = "open" | "full" | "completed" | "cancelled";

interface Player {
  id: number;
  status: 'empty' | 'joined';
  playerName?: string;
  position?: string;
}

interface Highlight {
    id: number;
    type: 'Goal' | 'Assist' | 'Save' | 'Other';
    playerName: string;
    minute: number;
    description?: string;
}

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

export interface Reservation {
  id: number;
  pitchName: string;
  date: string;
  time: string;
  location: string;
  price: number;
  playersJoined: number;
  maxPlayers: number;
  status: ReservationStatus;
  waitingList: string[];
  lineup: Player[];
  highlights: Highlight[];
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

import { toast } from "@/components/ui/use-toast"; // Ensure toast is imported

interface ReservationContextType {
  reservations: Reservation[];
  pitches: Pitch[];
  addPitch: (pitchData: NewPitchData) => void;
  deletePitch: (pitchId: number) => void; // Added deletePitch
  joinGame: (id: number, position?: number) => void;
  cancelReservation: (id: number) => void;
  joinWaitingList: (id: number) => void;
  leaveWaitingList: (id: number) => void;
  editReservation: (id: number, updatedData: Partial<Omit<Reservation, 'id' | 'status' | 'playersJoined' | 'waitingList' | 'lineup' | 'highlights'>>) => void;
  updateReservationStatus: (id: number, status: ReservationStatus) => void;
  navigateToReservation: (pitchName: string) => void;
  getPitchByName: (name: string) => Pitch | undefined;
  getReservationsByPitch: (pitchName: string) => Reservation[];
  updateLineup: (reservationId: number, lineup: Player[]) => void;
  addHighlight: (reservationId: number, highlight: Omit<Highlight, 'id'>) => void;
  editHighlight: (reservationId: number, highlightId: number, updatedHighlight: Partial<Omit<Highlight, 'id'>>) => void;
  deleteHighlight: (reservationId: number, highlightId: number) => void;
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

// Define an empty array for initial reservations if not found in localStorage
const initialReservationsData: Reservation[] = [];
// Define initial pitches data (can be empty or from a default set)
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


export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for reservations
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const savedReservations = localStorage.getItem("reservations");
    return savedReservations ? JSON.parse(savedReservations) : initialReservationsData;
  });

  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  // State for pitches
  const [pitches, setPitches] = useState<Pitch[]>(() => {
    const savedPitches = localStorage.getItem("pitches");
    // If no pitches in local storage, use initialPitchesData. If that's also empty, use an empty array.
    return savedPitches ? JSON.parse(savedPitches) : (initialPitchesData.length > 0 ? initialPitchesData : []);
  });

  // Effect to save pitches to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("pitches", JSON.stringify(pitches));
  }, [pitches]);

  const addPitch = (newPitchData: NewPitchData) => { // Use NewPitchData here
    setPitches(prevPitches => {
      const newId = prevPitches.length > 0 ? Math.max(...prevPitches.map(p => p.id)) + 1 : 1;
      const newPitch: Pitch = {
        id: newId,
        name: newPitchData.name,
        location: newPitchData.location,
        image: newPitchData.image,
        playersPerSide: parseInt(newPitchData.playersPerSide, 10) || 5, // Convert string to number
        rating: 0, // Default rating for new pitches
        features: [], // Default empty features
        isAdmin: true, // This property on Pitch might need re-evaluation for its purpose. User-level admin status is different.
        details: {
          description: newPitchData.description,
          openingHours: newPitchData.openingHours,
          address: newPitchData.location, // Or a more detailed address if provided
          price: newPitchData.price, // Price remains string as per Pitch interface
          facilities: [], // Default empty facilities
          surfaceType: newPitchData.surfaceType,
          pitchSize: newPitchData.pitchSize,
          rules: [], // Default empty rules
        }
      };
      toast({
        title: "Pitch Added Successfully!",
        description: `${newPitch.name} has been added to the list.`,
      });
      return [...prevPitches, newPitch];
    });
  };

  // Function to delete a pitch
  const deletePitch = (pitchId: number) => {
    setPitches(prevPitches => {
      const updatedPitches = prevPitches.filter(pitch => pitch.id !== pitchId);
      const deletedPitch = prevPitches.find(pitch => pitch.id === pitchId);
      if (deletedPitch) {
        toast({
          title: "Pitch Deleted",
          description: `${deletedPitch.name} has been successfully removed.`,
          variant: "default", 
        });
      }
      return updatedPitches;
    });
    // Optional: Also remove reservations associated with this pitch
    // setReservations(prevReservations => prevReservations.filter(res => res.pitchName !== deletedPitch?.name));
  };

  const joinGame = (id: number, position?: number) => {
    setReservations(prev => {
      return prev.map(res => {
        if (res.id === id && res.playersJoined < res.maxPlayers && res.status !== 'cancelled' && res.status !== 'completed') {
          const updatedLineup = [...res.lineup];
          if (position !== undefined && updatedLineup[position]?.status === 'empty') {
            updatedLineup[position] = { ...updatedLineup[position], status: 'joined', playerName: 'You' }; // Or get actual player name
          } else {
            // Find first empty spot if position not specified or taken
            const emptySpotIndex = updatedLineup.findIndex(p => p.status === 'empty');
            if (emptySpotIndex !== -1) {
              updatedLineup[emptySpotIndex] = { ...updatedLineup[emptySpotIndex], status: 'joined', playerName: 'You' };
            } else {
               toast({ title: "Error", description: "No empty spot available in lineup.", variant: "destructive" });
               return res; // No change if no spot found
            }
          }
          
          const newPlayersJoined = res.playersJoined + 1;
          const newStatus = newPlayersJoined >= res.maxPlayers ? 'full' : 'open';
          toast({ title: "Joined Game!", description: `Successfully joined ${res.pitchName}.` });
          return { ...res, playersJoined: newPlayersJoined, status: newStatus, lineup: updatedLineup };
        }
        return res;
      });
    });
  };

  const cancelReservation = (id: number) => {
    setReservations(prev => {
      return prev.map(res => {
        if (res.id === id) {
          // Find player's spot in lineup and mark as empty
          const playerSpotIndex = res.lineup.findIndex(p => p.playerName === 'You' && p.status === 'joined'); // Assuming 'You' is placeholder
          const updatedLineup = [...res.lineup];
          if(playerSpotIndex !== -1) {
            updatedLineup[playerSpotIndex] = { id: updatedLineup[playerSpotIndex].id, status: 'empty', playerName: undefined, position: updatedLineup[playerSpotIndex].position };
          }
          
          const newPlayersJoined = Math.max(0, res.playersJoined - (playerSpotIndex !== -1 ? 1 : 0));
          // If game was full, it's now open. Otherwise, status might not change unless it was 'full'.
          const newStatus = res.status === 'full' ? 'open' : res.status; 
          toast({ title: "Reservation Cancelled", description: `Your spot for ${res.pitchName} has been cancelled.` });
          return { ...res, playersJoined: newPlayersJoined, status: newStatus, lineup: updatedLineup };
        }
        return res;
      });
    });
  };

  const joinWaitingList = (id: number) => {
    setReservations(prev => {
      return prev.map(res => {
        if (res.id === id && res.status === 'full' && !res.waitingList.includes("User")) { // Assuming "User" for now
          toast({ title: "Joined Waitlist", description: `You've been added to the waitlist for ${res.pitchName}.` });
          return { ...res, waitingList: [...res.waitingList, "User"] };
        }
        return res;
      });
    });
  };

  const leaveWaitingList = (id: number) => {
    setReservations(prev => {
      return prev.map(res => {
        if (res.id === id && res.waitingList.includes("User")) {
          toast({ title: "Left Waitlist", description: `You've been removed from the waitlist for ${res.pitchName}.` });
          return { ...res, waitingList: res.waitingList.filter(user => user !== "User") };
        }
        return res;
      });
    });
  };
  
  const editReservation = (id: number, updatedData: Partial<Omit<Reservation, 'id' | 'status' | 'playersJoined' | 'waitingList' | 'lineup' | 'highlights'>>) => {
    setReservations(prev =>
      prev.map(res =>
        res.id === id ? { ...res, ...updatedData, date: updatedData.date ? new Date(updatedData.date).toISOString().split('T')[0] : res.date } : res
      )
    );
    toast({ title: "Reservation Updated", description: "Details have been saved." });
  };

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
    // This function would typically use react-router's navigate
    // For now, it can log or be a placeholder
    console.log(`Navigating to reservations for pitch: ${pitchName}`);
    // If you have a navigate function from useNavigate() available here, use it.
    // Example: navigate(`/reservations?pitch=${encodeURIComponent(pitchName)}`);
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


  return (
    <ReservationContext.Provider value={{ 
      reservations, 
      pitches, 
      addPitch, 
      deletePitch, // Provide deletePitch
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
      deleteHighlight
    }}>
      {children}
    </ReservationContext.Provider>
  );
};

