import { useState, useEffect, useCallback } from "react";
import {
  getLeaderboardByType,
  LEADERBOARD_TYPES,
  LeaderboardPlayer,
  LeaderboardType,
} from "@/lib/leaderboardApi";
import { useToast } from "@/hooks/use-toast";

interface UseLeaderboardParams {
  sortBy?: LeaderboardType;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialType?: LeaderboardType;
}

interface UseLeaderboardReturn {
  players: LeaderboardPlayer[];
  loading: boolean;
  error: string | null;
  currentType: LeaderboardType;
  refresh: () => Promise<void>;
  updateSort: (sortBy: LeaderboardType) => Promise<void>;
  getTotalPlayers: () => number;
  getPlayerByRank: (rank: number) => LeaderboardPlayer | undefined;
  getPlayerById: (userId: string) => LeaderboardPlayer | undefined;
}

export const useLeaderboard = (
  params: UseLeaderboardParams = {}
): UseLeaderboardReturn => {
  const {
    limit = 50,
    sortBy = "goals",
    autoRefresh = false,
    refreshInterval = 60000,
    initialType = "goals",
  } = params;

  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<LeaderboardType>(initialType);

  const { toast } = useToast();

  const fetchLeaderboard = useCallback(
    async (type: LeaderboardType = currentType) => {
      try {
        setLoading(true);
        setError(null);

        const response = await getLeaderboardByType(type);

        if (response.success && response.data?.leaderboard) {
          const { players: leaderboardPlayers } = response.data.leaderboard;

          // Apply limit if specified
          const limitedPlayers = limit
            ? leaderboardPlayers.slice(0, limit)
            : leaderboardPlayers;
          setPlayers(limitedPlayers);
        } else {
          throw new Error("Failed to fetch leaderboard");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        setPlayers([]);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [currentType, limit, toast]
  );

  const refresh = useCallback(async () => {
    await fetchLeaderboard(currentType);
  }, [fetchLeaderboard, currentType]);

  const updateSort = useCallback(
    async (newType: LeaderboardType) => {
      setCurrentType(newType);
      await fetchLeaderboard(newType);
    },
    [fetchLeaderboard]
  );

  // Initial load
  useEffect(() => {
    fetchLeaderboard(initialType);
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchLeaderboard(currentType);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchLeaderboard, currentType]);

  // Utility functions
  const getTotalPlayers = useCallback(() => players.length, [players]);
  const getPlayerByRank = useCallback(
    (rank: number) => players.find((p) => p.rank === rank),
    [players]
  );
  const getPlayerById = useCallback(
    (userId: string) => players.find((p) => p.userId === userId),
    [players]
  );

  return {
    players,
    loading,
    error,
    currentType,
    refresh,
    updateSort,
    getTotalPlayers,
    getPlayerByRank,
    getPlayerById,
  };
};

export default useLeaderboard;
