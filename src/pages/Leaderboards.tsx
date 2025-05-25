
import React from "react";
import ModernLeaderboard from "@/components/leaderboards/ModernLeaderboard";
import { useLeaderboard } from "@/hooks/useLeaderboard";

const Leaderboards = () => {
  const { players, loading, refresh, updateSort } = useLeaderboard({
    limit: 50,
    sortBy: 'wins',
    autoRefresh: true,
    refreshInterval: 60000
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <ModernLeaderboard 
          players={players}
          loading={loading}
          onRefresh={refresh}
          onUpdateSort={updateSort}
        />
      </div>
    </div>
  );
};

export default Leaderboards;
