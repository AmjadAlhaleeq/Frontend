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

// Define the Pitch interface
export interface Pitch {
  id: number;
  name: string;
  image: string;
  location: string;
  rating: number;
  features: string[];
  playersPerSide: number;
  isAdmin: boolean; // This can be used to control edit/delete privileges later
  details: {
    description: string;
    openingHours: string;
    address: string; // Detailed address, can be same as location for new pitches
    price: string; // e.g., "$25 per hour"
    facilities: string[];
    surfaceType: string;
    pitchSize: string;
    rules: string[];
  };
}

// Initial pitch data, moved from Pitches.tsx
const initialPitchesData: Pitch[] = [
  {
    id: 1,
    name: "Green Valley Pitch",
    image:
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=500&auto=format&fit=crop",
    location: "Downtown, Football City",
    rating: 4.8,
    features: ["Indoor", "Floodlights", "Changing Rooms"],
    playersPerSide: 5,
    isAdmin: true,
    details: {
      description:
        "Premier indoor football facility with high-quality artificial turf and state-of-the-art lighting system.",
      openingHours: "Mon-Fri: 8:00 - 22:00, Sat-Sun: 9:00 - 20:00",
      address: "123 Main St, Downtown, Football City",
      price: "$25 per hour",
      facilities: [
        "Changing Rooms",
        "Showers",
        "Parking",
        "Cafe",
        "Equipment Rental",
        "Wifi",
      ],
      surfaceType: "Premium Artificial Turf (FIFA Quality Pro)",
      pitchSize: "40m x 20m",
      rules: [
        "No smoking",
        "Clean football boots only",
        "No food on the pitch",
      ],
    },
  },
  {
    id: 2,
    name: "Central Park Field",
    image:
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=500&auto=format&fit=crop",
    location: "Eastside, Football City",
    rating: 4.5,
    features: ["Outdoor", "Floodlights", "Parking"],
    playersPerSide: 7,
    isAdmin: false,
    details: {
      description:
        "Natural grass pitch located in the heart of Central Park. Perfect for casual games and amateur leagues.",
      openingHours: "Open daily: 7:00 - 22:00",
      address: "Central Park, Eastside, Football City",
      price: "$30 per hour",
      facilities: ["Public Restrooms", "Water Fountains", "Picnic Area", "Gym"],
      surfaceType: "Natural Grass",
      pitchSize: "60m x 40m",
      rules: [
        "No cleats on wet ground",
        "Public use priority on weekends",
        "No private coaching without permit",
      ],
    },
  },
  {
    id: 3,
    name: "Stadium Pro",
    image:
      "https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=500&auto=format&fit=crop",
    location: "Northside, Football City",
    rating: 4.9,
    features: ["Indoor", "Changing Rooms", "Cafeteria"],
    playersPerSide: 11,
    isAdmin: true,
    details: {
      description:
        "Professional-grade stadium with full-size pitch. Used by local professional teams for training and matches.",
      openingHours: "By reservation only",
      address: "55 Stadium Road, Northside, Football City",
      price: "$40 per hour",
      facilities: [
        "Professional Locker Rooms",
        "Media Room",
        "VIP Boxes",
        "Medical Staff",
        "Performance Analysis",
        "Showers",
        "Wifi"
      ],
      surfaceType: "Hybrid Grass (Natural + Artificial)",
      pitchSize: "105m x 68m (Full Size)",
      rules: [
        "Professional conduct required",
        "Referee mandatory for matches",
        "No unauthorized media",
      ],
    },
  },
  {
    id: 4,
    name: "Riverside Turf",
    image:
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=500&auto=format&fit=crop",
    location: "Westside, Football City",
    rating: 4.2,
    features: ["Outdoor", "Artificial Grass", "Parking"],
    playersPerSide: 5,
    isAdmin: false,
    details: {
      description:
        "Convenient 5-a-side pitches with beautiful riverside views. Popular for after-work leagues.",
      openingHours: "Mon-Fri: 16:00 - 22:00, Sat-Sun: 10:00 - 22:00",
      address: "78 River Road, Westside, Football City",
      price: "$20 per hour",
      facilities: ["Changing Rooms", "Bar", "Spectator Area", "Free Parking"],
      surfaceType: "3G Artificial Turf",
      pitchSize: "30m x 20m",
      rules: [
        "No alcohol on pitches",
        "Maximum 7 players per team",
        "Flat-soled or turf shoes only",
      ],
    },
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
  pitches: Pitch[]; // Add pitches state
  addPitch: (pitchData: Omit<Pitch, 'id' | 'rating' | 'features' | 'isAdmin' | 'details'> & { playersPerSide: string; price: string; description: string; openingHours: string; surfaceType: string; pitchSize: string; }) => void; // Function to add a new pitch
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

  // Add state for pitches, initialized from localStorage or initialPitchesData
  const [pitches, setPitches] = useState<Pitch[]>(() => {
    const savedPitches = localStorage.getItem("pitches");
    return savedPitches ? JSON.parse(savedPitches) : initialPitchesData;
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentUser = "user1"; // Assuming admin adds pitches

  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  // Persist pitches to localStorage
  useEffect(() => {
    localStorage.setItem("pitches", JSON.stringify(pitches));
  }, [pitches]);

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

  // Function to add a new pitch
  const addPitch = (newPitchData: Omit<Pitch, 'id' | 'rating' | 'features' | 'isAdmin' | 'details'> & { playersPerSide: string; price: string; description: string; openingHours: string; surfaceType: string; pitchSize: string; }) => {
    setPitches(prevPitches => {
      const newId = prevPitches.length > 0 ? Math.max(...prevPitches.map(p => p.id)) + 1 : 1;
      const newPitch: Pitch = {
        id: newId,
        name: newPitchData.name,
        location: newPitchData.location,
        image: newPitchData.image,
        playersPerSide: parseInt(newPitchData.playersPerSide, 10) || 5, // Convert to number, default to 5
        rating: 0, // Default rating for new pitches
        features: [], // Default empty features
        isAdmin: true, // Assuming admin adds this pitch
        details: {
          description: newPitchData.description,
          openingHours: newPitchData.openingHours,
          address: newPitchData.location, // Use location as address for simplicity
          price: newPitchData.price, // Already a string
          facilities: [], // Default empty facilities
          surfaceType: newPitchData.surfaceType,
          pitchSize: newPitchData.pitchSize,
          rules: [], // Default empty rules
        }
      };
      toast({
        title: "Pitch Added",
        description: `${newPitch.name} has been successfully added.`,
        duration: 3000,
      });
      return [...prevPitches, newPitch];
    });
  };

  return (
    <ReservationContext.Provider value={{ 
      reservations, 
      pitches, // Expose pitches
      addPitch, // Expose addPitch
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
