import React, { createContext, useContext, useState, useEffect } from "react";

// Define the player interface with role information
export interface Player {
  userId: string;
  playerName: string;
  status: string;
  joinedAt?: string;
  goals?: number;
  assists?: number;
  cleansheet?: boolean;
  mvp?: boolean;
  attended?: boolean;
  role?: string; // Player position/role
  avatar?: string; // Player avatar URL
}

// Define highlight types
export interface Highlight {
  id: string;
  playerId: string;
  playerName: string;
  type: HighlightType;
  description: string;
  timestamp: string;
}

export enum HighlightType {
  GOAL = "goal",
  ASSIST = "assist",
  SAVE = "save",
  TACKLE = "tackle",
  OTHER = "other",
}

// Define user stats interface
export interface UserStats {
  gamesPlayed: number;
  goalsScored: number;
  assists: number;
  cleansheets: number;
  mvps: number;
  wins: number;
  losses?: number;
  draws?: number;
}

// Define the Pitch interface with up to 4 images
export interface Pitch {
  _id: string; // MongoDB uses _id as the unique identifier
  name: string;
  location: string;
  city: string;
  backgroundImage: string;
  playersPerSide: number;
  description: string;
  services: {
    type: string; // "Indoor" or "Outdoor"
    water: boolean;
    cafeteria: boolean;
    lockers: boolean;
    bathrooms: boolean;
    parking: boolean;
    wifi: boolean;
  };
  images: string[]; // Optional multiple images
}

// Define the Reservation interface with new status system
export interface Reservation {
  id: number;
  title: string;
  pitchName: string;
  date: string;
  time: string;
  startTime?: string;
  endTime?: string; // Added endTime property
  duration?: number;
  location: string;
  city: string;
  maxPlayers: number;
  playersJoined?: number;
  price?: number;
  imageUrl?: string;
  additionalImages?: string[];
  lineup?: Player[];
  waitingList?: string[];
  status: "upcoming" | "completed" | "cancelled"; // Updated status system
  description?: string;
  locationLink?: string;
  highlights?: Highlight[];
  summary?: {
    homeScore: number;
    awayScore: number;
    completed: boolean;
    completedAt: string;
    mvpPlayerId?: string;
  };
}

// Define the ReservationContextType interface
interface ReservationContextType {
  pitches: Pitch[];
  reservations: Reservation[];
  addPitch: (pitch: Omit<Pitch, "id">) => void;
  updatePitch: (pitch: Pitch) => void;
  deletePitch: (pitchId: number) => void;
  setPitches: (pitches: Pitch[]) => void;
  addReservation: (reservation: any) => Reservation | null;
  updateReservation: (id: number, reservation: Partial<Reservation>) => void;
  deleteReservation: (id: number) => void;
  setReservations: (reservations: Reservation[]) => void;
  joinGame: (id: number, playerName?: string, userId?: string) => void;
  cancelReservation: (id: number, userId: string) => void;
  joinWaitingList: (id: number, userId: string) => void;
  leaveWaitingList: (id: number, userId: string) => void;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  updateReservationStatus: (
    id: number,
    status: "upcoming" | "completed" | "cancelled"
  ) => void;
  isDateAvailableForPitch: (
    date: string,
    pitchName: string,
    timeSlot: string
  ) => boolean;
  navigateToReservation: (pitchName: string) => void;
  hasUserJoinedOnDate: (date: Date, userId: string) => boolean;
  getReservationsForDate: (date: Date) => Reservation[];
  updateGameSummary: (
    reservationId: number,
    summary: any,
    playerStats: Player[]
  ) => void;
  updatePlayerStats: (userId: string, stats: any) => void;
  suspendPlayer: (userId: string, reason: string, duration: number) => void;
  kickPlayerFromGame: (reservationId: number, userId: string) => void;
  editReservation: (id: number, updates: Partial<Reservation>) => void;
  getUserStats: (userId: string) => UserStats;
  addHighlight: (
    reservationId: number,
    highlight: Omit<Highlight, "id">
  ) => void;
  deleteHighlight: (reservationId: number, highlightId: string) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined
);

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error("useReservation must be used within a ReservationProvider");
  }
  return context;
};

/**
 * Safe localStorage wrapper with error handling
 * @param key The key to store data under
 * @param value The data to store
 * @returns boolean indicating success or failure
 */
const safeSetLocalStorage = (key: string, value: any): boolean => {
  try {
    // For large objects, we can check size before attempting to store
    const serialized = JSON.stringify(value);

    // If serialized data is too large (over 2MB), return false
    if (serialized.length > 2000000) {
      console.warn(
        `LocalStorage: Data for '${key}' is too large (${Math.round(
          serialized.length / 1024
        )}KB). Consider reducing data size.`
      );
      return false;
    }

    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`LocalStorage: Failed to save ${key}`, error);
    return false;
  }
};

/**
 * Safe localStorage getter with error handling
 * @param key The key to retrieve data from
 * @param defaultValue Default value if key doesn't exist or error occurs
 * @returns The retrieved value or defaultValue
 */
const safeGetLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const value = localStorage.getItem(key);
    if (value === null) {
      return defaultValue;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`LocalStorage: Failed to get ${key}`, error);
    return defaultValue;
  }
};

export const ReservationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [pitches, setPitches] = useState<Pitch[]>(() => {
    return safeGetLocalStorage<Pitch[]>("pitches", []);
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    return safeGetLocalStorage<Reservation[]>("reservations", []);
  });

  useEffect(() => {
    const success = safeSetLocalStorage("pitches", pitches);
    if (!success) {
      console.warn(
        "Failed to save pitches to localStorage due to size limits."
      );
    }
  }, [pitches]);

  useEffect(() => {
    // Try to save all reservations first
    const success = safeSetLocalStorage("reservations", reservations);

    // If saving all failed, try saving a maximum of 50 most recent reservations
    if (!success && reservations.length > 50) {
      console.warn("Trimming reservations data to fit in localStorage");

      // Sort by date (most recent first) and take only 50
      const sortedReservations = [...reservations]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 50);

      // Try saving the reduced set
      const reducedSuccess = safeSetLocalStorage(
        "reservations",
        sortedReservations
      );

      if (!reducedSuccess) {
        console.error(
          "Even reduced reservations data is too large for localStorage"
        );
      }
    }
  }, [reservations]);

  const addPitch = (pitch: Omit<Pitch, "id">) => {
    const newPitch = {
      ...pitch,
      id: pitches.length > 0 ? Math.max(...pitches.map((p) => p.id)) + 1 : 1,
    };
    setPitches([...pitches, newPitch]);
  };

  const updatePitch = (pitch: Pitch) => {
    setPitches(pitches.map((p) => (p.id === pitch.id ? pitch : p)));
  };

  const deletePitch = (pitchId: number) => {
    setPitches(pitches.filter((pitch) => pitch.id !== pitchId));
  };

  const addReservation = (reservation: any): Reservation | null => {
    if (!reservation.pitchName) {
      console.error("Pitch name is required for reservation.");
      return null;
    }

    const pitch = pitches.find((p) => p.name === reservation.pitchName);
    if (!pitch) {
      console.error(`Pitch with name ${reservation.pitchName} not found.`);
      return null;
    }

    if (
      isDateAvailableForPitch(
        reservation.date,
        reservation.pitchName,
        reservation.time
      )
    ) {
      const newReservation = {
        ...reservation,
        id:
          reservations.length > 0
            ? Math.max(...reservations.map((r) => r.id)) + 1
            : 1,
        location: pitch.location,
        city: pitch.city,
        imageUrl: pitch.image,
        additionalImages: pitch.additionalImages || [],
        playersJoined: 0,
        status: "upcoming" as "upcoming" | "completed" | "cancelled",
        lineup: [],
        waitingList: [],
      };
      setReservations([...reservations, newReservation]);
      return newReservation;
    } else {
      console.warn("Date is not available for this pitch and time.");
      return null;
    }
  };

  const updateReservation = (id: number, reservation: Partial<Reservation>) => {
    setReservations(
      reservations.map((res) =>
        res.id === id ? { ...res, ...reservation } : res
      )
    );
  };

  const deleteReservation = (id: number) => {
    const reservation = reservations.find((res) => res.id === id);
    if (reservation && reservation.lineup) {
      // Send email notifications to all players
      reservation.lineup.forEach((player) => {
        const playerEmail = localStorage.getItem(
          `playerEmail_${player.userId}`
        );
        if (playerEmail) {
          sendEmailNotification(playerEmail, "deletion", {
            reservationTitle: reservation.title,
            date: reservation.date,
            time: reservation.time,
          });
        }
      });
    }

    setReservations(reservations.filter((res) => res.id !== id));
  };

  const joinGame = (id: number, playerName?: string, userId?: string) => {
    setReservations((prev) => {
      return prev.map((reservation) => {
        if (reservation.id === id && userId) {
          const isAlreadyJoined = reservation.lineup?.some(
            (player) => player.userId === userId
          );
          if (isAlreadyJoined) {
            return reservation;
          }

          const newPlayer = {
            userId: userId,
            playerName: playerName || `Player ${userId.substring(0, 4)}`,
            status: "joined",
            joinedAt: new Date().toISOString(),
            role: `Player ${(reservation.lineup?.length || 0) + 1}`,
          };

          const updatedLineup = reservation.lineup
            ? [...reservation.lineup, newPlayer]
            : [newPlayer];
          const playersJoined = updatedLineup.length;

          let updatedWaitingList = reservation.waitingList || [];

          return {
            ...reservation,
            lineup: updatedLineup,
            playersJoined,
            waitingList: updatedWaitingList,
          };
        }
        return reservation;
      });
    });
  };

  const cancelReservation = (id: number, userId: string) => {
    setReservations((prev) => {
      return prev.map((reservation) => {
        if (reservation.id === id) {
          const updatedLineup =
            reservation.lineup?.filter((player) => player.userId !== userId) ||
            [];
          const playersJoined = updatedLineup.length;

          return {
            ...reservation,
            lineup: updatedLineup,
            playersJoined,
          };
        }
        return reservation;
      });
    });
  };

  const isUserJoined = (reservationId: number, userId: string): boolean => {
    const reservation = reservations.find((res) => res.id === reservationId);
    return (
      reservation?.lineup?.some((player) => player.userId === userId) || false
    );
  };

  const joinWaitingList = (id: number, userId: string) => {
    setReservations((prev) => {
      return prev.map((reservation) => {
        if (reservation.id === id) {
          const currentWaitingList = reservation.waitingList || [];
          if (!currentWaitingList.includes(userId)) {
            return {
              ...reservation,
              waitingList: [...currentWaitingList, userId],
            };
          }
        }
        return reservation;
      });
    });
  };

  const leaveWaitingList = (id: number, userId: string) => {
    setReservations((prev) => {
      return prev.map((reservation) => {
        if (reservation.id === id && reservation.waitingList) {
          return {
            ...reservation,
            waitingList: reservation.waitingList.filter((id) => id !== userId),
          };
        }
        return reservation;
      });
    });
  };

  // Update reservation status function for new status system
  const updateReservationStatus = (
    id: number,
    status: "upcoming" | "completed" | "cancelled"
  ) => {
    setReservations(
      reservations.map((res) => (res.id === id ? { ...res, status } : res))
    );
  };

  const isDateAvailableForPitch = (
    date: string,
    pitchName: string,
    timeSlot: string
  ): boolean => {
    return !reservations.some(
      (res) =>
        res.date === date &&
        res.pitchName === pitchName &&
        res.time === timeSlot
    );
  };

  const navigateToReservation = (pitchName: string) => {
    console.log(`Navigating to reservation for pitch: ${pitchName}`);
  };

  const hasUserJoinedOnDate = (date: Date, userId: string): boolean => {
    const dateString = date.toISOString().split("T")[0];
    return reservations.some(
      (reservation) =>
        reservation.date === dateString &&
        reservation.lineup?.some((player) => player.userId === userId)
    );
  };

  const getReservationsForDate = (date: Date): Reservation[] => {
    const dateString = date.toISOString().split("T")[0];
    return reservations.filter(
      (reservation) => reservation.date === dateString
    );
  };

  const updateGameSummary = (
    reservationId: number,
    summary: any,
    playerStats: Player[]
  ) => {
    setReservations((prev) => {
      return prev.map((reservation) => {
        if (reservation.id === reservationId) {
          const updatedLineup = reservation.lineup?.map((player) => {
            const updatedPlayer = playerStats.find(
              (p) => p.userId === player.userId
            );
            return updatedPlayer || player;
          });

          return {
            ...reservation,
            summary,
            status: "completed",
            lineup: updatedLineup,
          };
        }
        return reservation;
      });
    });

    playerStats.forEach((player) => {
      if (player.attended) {
        updatePlayerStats(player.userId, {
          goals: player.goals || 0,
          assists: player.assists || 0,
          cleansheets: player.cleansheet ? 1 : 0,
          mvps: player.mvp ? 1 : 0,
          gamesPlayed: 1,
        });
      }
    });
  };

  const updatePlayerStats = (userId: string, newStats: any) => {
    try {
      const userStatsString = localStorage.getItem(`userStats_${userId}`);
      let userStats = userStatsString
        ? JSON.parse(userStatsString)
        : {
            goals: 0,
            assists: 0,
            cleansheets: 0,
            mvps: 0,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
          };

      Object.entries(newStats).forEach(([key, value]) => {
        if (typeof value === "number") {
          userStats[key] = (userStats[key] || 0) + value;
        }
      });

      localStorage.setItem(`userStats_${userId}`, JSON.stringify(userStats));

      window.dispatchEvent(
        new CustomEvent("playerStatsUpdated", {
          detail: { userId, stats: userStats },
        })
      );

      return userStats;
    } catch (error) {
      console.error("Error updating player stats:", error);
      return null;
    }
  };

  const sendEmailNotification = (
    email: string,
    type: "suspension" | "kick" | "deletion",
    details: any
  ) => {
    console.log(`Sending ${type} email to ${email}:`, details);
  };

  const suspendPlayer = (userId: string, reason: string, duration: number) => {
    const now = new Date();
    const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

    const suspension = {
      userId,
      reason,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      active: true,
    };

    try {
      const suspensionsString = localStorage.getItem("playerSuspensions");
      const suspensions = suspensionsString
        ? JSON.parse(suspensionsString)
        : [];

      suspensions.push(suspension);
      localStorage.setItem("playerSuspensions", JSON.stringify(suspensions));

      const playerEmail = localStorage.getItem(`playerEmail_${userId}`);
      if (playerEmail) {
        sendEmailNotification(playerEmail, "suspension", {
          reason,
          duration,
          endDate: endDate.toISOString(),
        });
      }

      window.dispatchEvent(
        new CustomEvent("playerSuspended", {
          detail: { userId, endDate: endDate.toISOString() },
        })
      );

      return true;
    } catch (error) {
      console.error("Error suspending player:", error);
      return false;
    }
  };

  const kickPlayerFromGame = (reservationId: number, userId: string) => {
    setReservations((prev) => {
      return prev.map((reservation) => {
        if (reservation.id === reservationId) {
          const updatedLineup =
            reservation.lineup?.filter((player) => player.userId !== userId) ||
            [];
          const playersJoined = updatedLineup.length;

          const playerEmail = localStorage.getItem(`playerEmail_${userId}`);
          if (playerEmail) {
            sendEmailNotification(playerEmail, "kick", {
              reservationTitle: reservation.title,
              date: reservation.date,
              time: reservation.time,
            });
          }

          return {
            ...reservation,
            lineup: updatedLineup,
            playersJoined,
          };
        }
        return reservation;
      });
    });
  };

  const editReservation = (id: number, updates: Partial<Reservation>) => {
    setReservations(
      reservations.map((res) => (res.id === id ? { ...res, ...updates } : res))
    );
  };

  const getUserStats = (userId: string): UserStats => {
    try {
      const userStatsString = localStorage.getItem(`userStats_${userId}`);
      if (userStatsString) {
        return JSON.parse(userStatsString);
      }
    } catch (error) {
      console.error("Error getting user stats:", error);
    }

    return {
      gamesPlayed: 0,
      goalsScored: 0,
      assists: 0,
      cleansheets: 0,
      mvps: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    };
  };

  const addHighlight = (
    reservationId: number,
    highlight: Omit<Highlight, "id">
  ) => {
    setReservations((prev) => {
      return prev.map((res) => {
        if (res.id === reservationId) {
          const newHighlight = {
            ...highlight,
            id: `highlight_${Date.now()}_${Math.random()
              .toString(36)
              .substring(2, 9)}`,
          };
          const currentHighlights = res.highlights || [];
          return {
            ...res,
            highlights: [...currentHighlights, newHighlight],
          };
        }
        return res;
      });
    });
  };

  const deleteHighlight = (reservationId: number, highlightId: string) => {
    setReservations((prev) => {
      return prev.map((res) => {
        if (res.id === reservationId && res.highlights) {
          return {
            ...res,
            highlights: res.highlights.filter((h) => h.id !== highlightId),
          };
        }
        return res;
      });
    });
  };

  return (
    <ReservationContext.Provider
      value={{
        pitches,
        reservations,
        addPitch,
        updatePitch,
        deletePitch,
        setPitches,
        addReservation,
        updateReservation,
        deleteReservation,
        setReservations,
        joinGame,
        cancelReservation,
        isUserJoined,
        joinWaitingList,
        leaveWaitingList,
        updateReservationStatus,
        isDateAvailableForPitch,
        navigateToReservation,
        hasUserJoinedOnDate,
        getReservationsForDate,
        updateGameSummary,
        updatePlayerStats,
        suspendPlayer,
        kickPlayerFromGame,
        editReservation,
        getUserStats,
        addHighlight,
        deleteHighlight,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export default ReservationContext;
