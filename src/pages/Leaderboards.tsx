// components/Leaderboards.jsx
import React, { useState, useEffect } from "react";
import ModernLeaderboard from "@/components/leaderboards/ModernLeaderboard";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Trophy,
  Target,
  Users,
  Shield,
  Award,
  Zap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { LEADERBOARD_TYPES, LeaderboardType } from "@/lib/leaderboardApi";

const Leaderboards = () => {
  const [selectedType, setSelectedType] = useState<LeaderboardType>("goals");
  const [refreshing, setRefreshing] = useState(false);

  const {
    players,
    loading,
    error,
    currentType,
    refresh,
    updateSort,
    getTotalPlayers,
  } = useLeaderboard({
    limit: 50,
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
    initialType: selectedType,
  });

  // Leaderboard types configuration
  const leaderboardTypes = [
    {
      key: "goals" as LeaderboardType,
      label: "Goals",
      icon: Target,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      description: "Top goal scorers this season",
    },
    {
      key: "assists" as LeaderboardType,
      label: "Assists",
      icon: Users,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      description: "Players with most assists",
    },
    {
      key: "wins" as LeaderboardType,
      label: "Wins",
      icon: Trophy,
      color: "bg-yellow-500",
      hoverColor: "hover:bg-yellow-600",
      description: "Players with most wins",
    },
    {
      key: "mvp" as LeaderboardType,
      label: "MVP",
      icon: Award,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      description: "Most valuable players",
    },
    {
      key: "interceptions" as LeaderboardType,
      label: "Interceptions",
      icon: Zap,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      description: "Players with most interceptions",
    },
    {
      key: "cleanSheets" as LeaderboardType,
      label: "Clean Sheets",
      icon: Shield,
      color: "bg-cyan-500",
      hoverColor: "hover:bg-cyan-600",
      description: "Players with most clean sheets",
    },
  ];

  const handleTypeChange = async (type: LeaderboardType) => {
    if (type !== currentType && !loading) {
      console.log(`Changing leaderboard type to: ${type}`);
      setSelectedType(type);
      await updateSort(type);
    }
  };

  const handleRefresh = async () => {
    if (!refreshing && !loading) {
      setRefreshing(true);
      try {
        console.log("Manual refresh triggered");
        await refresh();
      } catch (error) {
        console.error("Manual refresh failed:", error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  const currentTypeConfig =
    leaderboardTypes.find((type) => type.key === currentType) ||
    leaderboardTypes[0];

  // Error state
  if (error && !loading && players.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Failed to Load Leaderboards
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {error}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Season Leaderboards
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track top performers across different categories
              </p>
              {error && players.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Warning: {error}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {getTotalPlayers()} Players
              </Badge>
              <Button
                onClick={handleRefresh}
                disabled={loading || refreshing}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                {loading || refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </div>

        {/* Leaderboard Type Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {leaderboardTypes.map((type) => {
              const Icon = type.icon;
              const isActive = currentType === type.key;
              const isLoading = loading && currentType === type.key;

              return (
                <Button
                  key={type.key}
                  onClick={() => handleTypeChange(type.key)}
                  variant={isActive ? "default" : "outline"}
                  className={`gap-2 transition-all duration-200 ${
                    isActive
                      ? `${type.color} text-white ${type.hoverColor}`
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  disabled={loading || refreshing}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  {type.label}
                  {isActive && !isLoading && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {players.length}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Current Type Description */}
          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2">
              <currentTypeConfig.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {currentTypeConfig.label} Leaderboard
              </span>
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {currentTypeConfig.description}
            </p>
          </div>
        </div>

        {/* Leaderboard Component */}
        <ModernLeaderboard
          players={players}
          loading={loading}
          onRefresh={handleRefresh}
          onUpdateSort={updateSort}
          currentType={currentType}
          typeConfig={currentTypeConfig}
        />
      </div>
    </div>
  );
};

export default Leaderboards;
