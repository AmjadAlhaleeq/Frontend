
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStats } from "@/types/reservation";
import {
  Calendar,
  Target,
  Users,
  Trophy,
  Star,
  ShieldCheck,
  TrendingUp,
  Zap,
  Award,
} from "lucide-react";

interface PlayerStatsProps {
  stats: UserStats;
  className?: string;
  isLoading?: boolean;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({
  stats,
  className = "",
  isLoading = false,
}) => {
  // Calculate win percentage if not provided
  const winPercentage =
    stats.winPercentage ||
    (stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0);

  // Get total matches played (use the more appropriate field from your interface)
  const totalMatches = stats.matches ?? 0;

  return (
    <div className={className}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-teal-50 rounded-t-2xl border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Zap className="h-5 w-5" style={{ color: "#0f766e" }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Your Performance
                </h2>
                <p className="text-sm text-gray-600">Season overview</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: "#0f766e" }}>
                {totalMatches}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Total Games
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Primary Stats - Top Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="group relative p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:border-green-300 transition-all duration-200 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-1">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto"></div>
                  ) : (
                    stats.goals || 0
                  )}
                </div>
                <div className="text-sm font-medium text-green-600">Goals</div>
              </div>
            </div>

            <div className="group relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-1">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto"></div>
                  ) : (
                    stats.assists || 0
                  )}
                </div>
                <div className="text-sm font-medium text-blue-600">Assists</div>
              </div>
            </div>

            <div className="group relative p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:border-purple-300 transition-all duration-200 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700 mb-1">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto"></div>
                  ) : (
                    stats.mvp || 0
                  )}
                </div>
                <div className="text-sm font-medium text-purple-600">MVP</div>
              </div>
            </div>

            <div className="group relative p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200 hover:border-yellow-300 transition-all duration-200 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-700 mb-1">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto"></div>
                  ) : (
                    winPercentage
                  )}%
                </div>
                <div className="text-sm font-medium text-yellow-600">Win Rate</div>
              </div>
            </div>
          </div>

          {/* Secondary Stats Row - Bottom Row */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="group relative p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl border border-teal-200 hover:border-teal-300 transition-all duration-200 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-700 mb-1">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto"></div>
                  ) : (
                    stats.wins || 0
                  )}
                </div>
                <div className="text-sm font-medium text-teal-600">Wins</div>
              </div>
            </div>

            <div className="group relative p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700 mb-1">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto"></div>
                  ) : (
                    stats.cleanSheets || 0
                  )}
                </div>
                <div className="text-sm font-medium text-slate-600">Clean Sheets</div>
              </div>
            </div>

            <div className="group relative p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200 hover:border-indigo-300 transition-all duration-200 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-700 mb-1">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto"></div>
                  ) : (
                    stats.interceptions || 0
                  )}
                </div>
                <div className="text-sm font-medium text-indigo-600">Interceptions</div>
              </div>
            </div>
          </div>

          {/* Performance Highlight */}
          {!isLoading && totalMatches > 0 && (
            <div
              className="relative overflow-hidden p-6 rounded-2xl text-white"
              style={{
                background: "linear-gradient(135deg, #0f766e 0%, #134e4a 100%)",
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90 mb-1">Total Impact</div>
                    <div className="text-4xl font-bold">
                      {stats.goals && stats.assists
                        ? stats.goals + stats.assists
                        : stats.goals || 0}
                    </div>
                    <div className="text-sm opacity-75">
                      Goals + Assists combined
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced No Data State */}
          {!isLoading && totalMatches === 0 && (
            <div className="text-center py-12">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Calendar
                    className="h-10 w-10"
                    style={{ color: "#0f766e" }}
                  />
                </div>
                <div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#0f766e" }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Ready to Make History!
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Your journey starts here. Every great player began with their
                first match.
              </p>
              <div
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-full font-medium hover:opacity-90 transition-all cursor-pointer"
                style={{ backgroundColor: "#0f766e" }}
              >
                <Zap className="h-4 w-4" />
                Book Your First Game
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
