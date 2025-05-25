import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

interface Player {
  _id: string;
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  name: string; // Made required to match ModernLeaderboard expectations
  profilePicture?: string;
  avatar?: string;
  email: string;
  matches: number;
  statValue: number;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    rating: number;
    winRate: number;
    mvpScore?: number;
    interceptions?: number;
  };
}

interface UseLeaderboardParams {
  sortBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseLeaderboardReturn {
  players: Player[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateSort: (sortBy: string) => Promise<void>;
}

export const useLeaderboard = (params: UseLeaderboardParams = {}): UseLeaderboardReturn => {
  const {
    sortBy = 'wins',
    autoRefresh = false,
    refreshInterval = 30000
  } = params;

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState(sortBy);

  const { toast } = useToast();

  const fetchLeaderboard = useCallback(async (type: string = currentSort) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getLeaderboardByType(type);

      if (response.success && response.data?.leaderboard) {
        const { players: leaderboardPlayers } = response.data.leaderboard;
        
        // Transform backend data to match frontend Player interface
        const transformedPlayers = leaderboardPlayers.map((player: any) => ({
          _id: player.userId,
          rank: player.rank,
          userId: player.userId,
          firstName: player.firstName,
          lastName: player.lastName,
          name: `${player.firstName} ${player.lastName}`, // Always provide name
          profilePicture: player.profilePicture,
          avatar: player.profilePicture,
          email: '', // Provide default empty email
          matches: player.matches,
          statValue: player.statValue,
          stats: {
            gamesPlayed: player.matches,
            wins: type === 'wins' ? player.statValue : 0,
            losses: 0,
            draws: 0,
            goals: type === 'goals' ? player.statValue : 0,
            assists: type === 'assists' ? player.statValue : 0,
            cleanSheets: type === 'cleanSheets' ? player.statValue : 0,
            rating: player.statValue,
            winRate: 0,
            mvpScore: type === 'mvp' ? player.statValue : 0,
            interceptions: type === 'interceptions' ? player.statValue : 0,
          }
        }));
        
        setPlayers(transformedPlayers);
      } else {
        throw new Error(response.error || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentSort, toast]);

  const refresh = useCallback(async () => {
    await fetchLeaderboard(currentSort);
  }, [fetchLeaderboard, currentSort]);

  const updateSort = useCallback(async (newSortBy: string) => {
    setCurrentSort(newSortBy);
    await fetchLeaderboard(newSortBy);
  }, [fetchLeaderboard]);

  // Initial load
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    players,
    loading,
    error,
    refresh,
    updateSort,
  };
};

export default useLeaderboard;
