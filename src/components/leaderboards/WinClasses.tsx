
import React from "react";
import { Medal, Crown, Star, Users } from "lucide-react";

// Display leaderboard rows with special highlighting for top win classes
export function WinClasses({ players, metric, getMetricIcon }: { players: any[], metric: string, getMetricIcon: (metric: string) => React.ReactNode }) {
  return (
    <>
      {players.map((player, idx) => (
        <div
          key={player.id}
          className={`flex items-center p-4 rounded-lg transition-colors
            ${idx === 0 ? "border-2 border-yellow-500 bg-yellow-100" : ""}
            ${idx === 1 ? "border-2 border-gray-400 bg-gray-50" : ""}
            ${idx === 2 ? "border-2 border-amber-600 bg-amber-50" : ""}
            ${idx > 2 ? "border" : ""}
          `}
        >
          <div className="w-8 text-center font-bold text-muted-foreground flex items-center justify-center">
            {idx === 0 ? (
              <Crown className="h-6 w-6 text-yellow-400" />
            ) : idx === 1 ? (
              <Medal className="h-6 w-6 text-gray-400" />
            ) : idx === 2 ? (
              <Medal className="h-6 w-6 text-amber-600" />
            ) : (
              idx + 1
            )}
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden mx-4">
            <img
              src={player.avatar}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{player.name}</h4>
            <div className="text-xs text-muted-foreground mt-1">
              Matches played: {player.gamesPlayed}
            </div>
          </div>
          <div className="text-right flex items-center gap-2">
            {getMetricIcon(metric)}
            <span className="text-lg font-bold">
              {metric === "wins"
                ? player.wins
                : metric === "goals"
                ? player.goalsScored
                : metric === "assists"
                ? player.assists
                : metric === "mvps"
                ? player.mvps
                : metric === "cleanSheets"
                ? player.cleanSheets
                : metric === "tackles"
                ? player.tackles
                : "-"}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
