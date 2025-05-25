
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

interface Player {
  _id: string;
  name: string;
  avatar?: string;
  email: string;
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
  };
  previousRank?: number;
  rankChange?: 'up' | 'down' | 'same';
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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  search: (term: string) => Promise<void>;
  updateSort: (sortBy: string, order?: 'asc' | 'desc') => Promise<void>;
}

export const useLeaderboard = (params: UseLeaderboardParams = {}): UseLeaderboardReturn => {
  const {
    sortBy = 'rating',
    order = 'desc',
    limit = 20,
    autoRefresh = false,
    refreshInterval = 30000
  } = params;

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSort, setCurrentSort] = useState({ sortBy, order });

  const { toast } = useToast();

  const fetchLeaderboard = useCallback(async (
    page = 1,
    append = false,
    search = searchTerm,
    sort = currentSort
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getLeaderboard({
        sortBy: sort.sortBy,
        order: sort.order,
        page,
        limit,
        search: search || undefined,
      });

      if (response.success && response.data) {
        const { data: newPlayers, pagination: newPagination } = response.data;
        
        if (append) {
          setPlayers(prev => [...prev, ...newPlayers]);
        } else {
          setPlayers(newPlayers);
        }
        
        setPagination(newPagination);
        setCurrentPage(page);
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
  }, [limit, searchTerm, currentSort, toast]);

  const refresh = useCallback(async () => {
    await fetchLeaderboard(1, false);
  }, [fetchLeaderboard]);

  const loadMore = useCallback(async () => {
    if (pagination && currentPage < pagination.totalPages) {
      await fetchLeaderboard(currentPage + 1, true);
    }
  }, [fetchLeaderboard, pagination, currentPage]);

  const search = useCallback(async (term: string) => {
    setSearchTerm(term);
    await fetchLeaderboard(1, false, term);
  }, [fetchLeaderboard]);

  const updateSort = useCallback(async (newSortBy: string, newOrder: 'asc' | 'desc' = 'desc') => {
    const newSort = { sortBy: newSortBy, order: newOrder };
    setCurrentSort(newSort);
    await fetchLeaderboard(1, false, searchTerm, newSort);
  }, [fetchLeaderboard, searchTerm]);

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
    pagination,
    refresh,
    loadMore,
    search,
    updateSort,
  };
};

export default useLeaderboard;
