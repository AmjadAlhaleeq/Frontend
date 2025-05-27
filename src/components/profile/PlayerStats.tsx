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
} from "lucide-react";

interface PlayerStatsProps {
  stats: UserStats;
  className?: string;
  isLoading?: boolean;
}

const StatItem = ({
  icon: Icon,
  label,
  value,
  isLoading = false,
  color = "text-blue-500",
  subtitle,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  isLoading?: boolean;
  color?: string;
  subtitle?: string;
}) => (
  <div className="flex flex-col items-center p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
    <Icon className={`h-8 w-8 ${color} mb-3`} />
    <div className="text-2xl font-bold text-gray-900 mb-1">
      {isLoading ? (
        <div className="animate-pulse bg-gray-200 h-7 w-12 rounded"></div>
      ) : (
        value ?? 0
      )}
    </div>
    <div className="text-sm font-medium text-gray-700 text-center mb-1">
      {label}
    </div>
    {subtitle && (
      <div className="text-xs text-gray-500 text-center">{subtitle}</div>
    )}
  </div>
);

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
          {/* Primary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="group relative p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-100 hover:border-teal-200 transition-all duration-200 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <Target
                  className="h-6 w-6 group-hover:scale-110 transition-transform duration-200"
                  style={{ color: "#0f766e" }}
                />
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "#0f766e" }}
                ></div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  <span style={{ color: "#0f766e" }}>{stats.goals || 0}</span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-700">
                Goals Scored
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Find the back of the net
              </div>
            </div>

            <div className="group relative p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-200 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <Users className="h-6 w-6 text-slate-600 group-hover:scale-110 transition-transform duration-200" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  <span className="text-slate-700">{stats.assists || 0}</span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-700">Assists</div>
              <div className="text-xs text-gray-500 mt-1">Team player</div>
            </div>

            <div className="group relative p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:border-amber-200 transition-all duration-200 hover:scale-105 cursor-pointer md:col-span-1 col-span-2">
              <div className="flex items-center justify-between mb-3">
                <Trophy className="h-6 w-6 text-amber-600 group-hover:scale-110 transition-transform duration-200" />
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  <span className="text-amber-600">{stats.mvp || 0}</span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-700">
                MVP Awards
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Outstanding performances
              </div>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-8 p-6 bg-gray-50 rounded-2xl">
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full mb-2 group-hover:bg-teal-200 transition-colors">
                  <Star className="h-5 w-5" style={{ color: "#0f766e" }} />
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.wins || 0}
                </div>
                <div className="text-xs text-gray-600">Wins</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-2 group-hover:bg-slate-200 transition-colors">
                  <ShieldCheck className="h-5 w-5 text-slate-600" />
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.cleanSheets || 0}
                </div>
                <div className="text-xs text-gray-600">Clean Sheets</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2 group-hover:bg-gray-200 transition-colors">
                  <TrendingUp className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.interceptions || 0}
                </div>
                <div className="text-xs text-gray-600">Interceptions</div>
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
