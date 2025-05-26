
import React, { useState } from "react";
import ModernLeaderboard from "@/components/leaderboards/ModernLeaderboard";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trophy, Target, Users, Shield, Award, Zap } from "lucide-react";
import { LEADERBOARD_TYPES, LeaderboardType } from "@/lib/leaderboardApi";

const Leaderboards = () => {
  const [selectedType, setSelectedType] = useState<LeaderboardType>('goals');
  
  const { 
    players, 
    loading, 
    error,
    currentType,
    refresh, 
    updateSort,
    getTotalPlayers 
  } = useLeaderboard({
    limit: 50,
    autoRefresh: true,
    refreshInterval: 60000,
    initialType: selectedType
  });

  // Updated leaderboard types to match backend schema
  const leaderboardTypes = [
    {
      key: 'goals' as LeaderboardType,
      label: 'Goals',
      icon: Target,
      color: 'bg-green-500',
      description: 'Top goal scorers this season'
    },
    {
      key: 'assists' as LeaderboardType,
      label: 'Assists',
      icon: Users,
      color: 'bg-blue-500',
      description: 'Players with most assists'
    },
    {
      key: 'wins' as LeaderboardType,
      label: 'Wins',
      icon: Trophy,
      color: 'bg-yellow-500',
      description: 'Players with most wins'
    },
    {
      key: 'mvp' as LeaderboardType,
      label: 'MVP',
      icon: Award,
      color: 'bg-purple-500',
      description: 'Most valuable players'
    },
    {
      key: 'interceptions' as LeaderboardType,
      label: 'Interceptions',
      icon: Zap,
      color: 'bg-orange-500',
      description: 'Players with most interceptions'
    },
    {
      key: 'cleanSheets' as LeaderboardType,
      label: 'Clean Sheets',
      icon: Shield,
      color: 'bg-cyan-500',
      description: 'Players with most clean sheets'
    }
  ];

  const handleTypeChange = async (type: LeaderboardType) => {
    setSelectedType(type);
    await updateSort(type);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const currentTypeConfig = leaderboardTypes.find(type => type.key === currentType) || leaderboardTypes[0];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Trophy className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Failed to Load Leaderboards
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Button onClick={handleRefresh} className="bg-teal-600 hover:bg-teal-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
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
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {getTotalPlayers()} Players
              </Badge>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
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
              
              return (
                <Button
                  key={type.key}
                  onClick={() => handleTypeChange(type.key)}
                  variant={isActive ? "default" : "outline"}
                  className={`gap-2 ${
                    isActive 
                      ? `${type.color} text-white hover:opacity-90` 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  disabled={loading}
                >
                  <Icon className="h-4 w-4" />
                  {type.label}
                  {isActive && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {players.length}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
          
          {/* Current Type Description */}
          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <currentTypeConfig.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {currentTypeConfig.label} Leaderboard
              </span>
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
