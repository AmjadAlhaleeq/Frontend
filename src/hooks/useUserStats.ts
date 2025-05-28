
import { useCallback } from "react";
import { Reservation } from "@/types/reservation";

// Updated interface to match backend stats structure
interface BackendUserStats {
  matches: number;
  wins: number;
  mvp: number;
  goals: number;
  assists: number;
  interceptions: number;
  cleanSheets: number;
}

// Legacy UserStats interface for backward compatibility
export interface UserStats {
  wins: number;
  goals: number;
  assists: number;
  matches: number;
  winPercentage: number;
  cleanSheets: number;
  mvp: number;
  interceptions: number;
}

export const useUserStats = (reservations: Reservation[]) => {
  const getUserStats = useCallback(
    (userId: string): UserStats => {
      let wins = 0;
      let goals = 0;
      let assists = 0;
      let matches = 0;
      let goalsScored = 0;
      let cleansheets = 0;
      let mvp = 0;

      // Calculate stats from reservations (legacy fallback)
      reservations.forEach((reservation) => {
        // Check if user participated in this game
        const userInLineup = reservation.lineup?.some(
          (player) => player.userId === userId
        );

        if (userInLineup && reservation.status === "completed") {
          matches++;
          // Check if user was MVP in any highlights
          if (reservation.highlights) {
            reservation.highlights.forEach((highlight) => {
              if (highlight.playerId === userId && highlight.type === "mvp") {
                mvp++;
              }
              if (highlight.playerId === userId && highlight.type === "goal") {
                goals++;
                goalsScored++;
              }
              if (
                highlight.playerId === userId &&
                highlight.type === "assist"
              ) {
                assists++;
              }
              if (
                highlight.playerId === userId &&
                highlight.type === "cleanSheet"
              ) {
                cleansheets++;
              }
            });
          }

          // Check game summary for additional stats
          if (reservation.summary && typeof reservation.summary === "object") {
            const summary = reservation.summary as any;

            // Check if user was MVP
            if (summary.mvp === userId) {
              mvp++;
            }

            // Check player stats in summary
            if (summary.players) {
              const playerStats = summary.players.find(
                (p: any) => p.userId === userId
              );
              if (playerStats) {
                if (playerStats.goals) goals += playerStats.goals;
                if (playerStats.assists) assists += playerStats.assists;
                if (playerStats.cleanSheet) cleansheets++;
                if (playerStats.won) wins++;
              }
            }
          }
        }
      });

      const winPercentage =
        matches > 0 ? Math.round((wins / matches) * 100) : 0;

      return {
        wins,
        goals,
        assists,
        matches,
        winPercentage,
        cleanSheets: cleansheets,
        mvp,
        interceptions: 0, // or calculate if available
      };
    },
    [reservations]
  );

  // Helper function to convert backend stats to frontend format
  const convertBackendStats = useCallback((backendStats: BackendUserStats): UserStats => {
    const winPercentage = backendStats.matches > 0 
      ? Math.round((backendStats.wins / backendStats.matches) * 100) 
      : 0;

    return {
      wins: backendStats.wins,
      goals: backendStats.goals,
      assists: backendStats.assists,
      matches: backendStats.matches,
      winPercentage,
      cleanSheets: backendStats.cleanSheets,
      mvp: backendStats.mvp,
      interceptions: backendStats.interceptions,
    };
  }, []);

  return { getUserStats, convertBackendStats };
};
