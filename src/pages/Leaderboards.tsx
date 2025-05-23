
// This is the Leaderboards.tsx page. It handles UI and logic for Leaderboards.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Award,
  Crown,
  Medal,
  Goal,
  ShieldCheck,
  Scissors,
  Users,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { generateRandomPlayers } from "@/utils/playerGenerator";
import WinClasses from "@/components/leaderboards/WinClasses";

// Generate data for our overall leaderboard
const overallPlayerData = generateRandomPlayers(10);

const Leaderboards = () => {
  const [selectedMetric, setSelectedMetric] = useState<string>("mvps");

  const sortPlayers = (players: typeof overallPlayerData) => {
    const sorted = [...players];
    switch (selectedMetric) {
      case "goals":
        return sorted.sort((a, b) => b.goalsScored - a.goalsScored);
      case "assists":
        return sorted.sort((a, b) => b.assists - a.assists);
      case "mvps":
        return sorted.sort((a, b) => b.mvps - a.mvps);
      case "cleanSheets":
        return sorted.sort((a, b) => b.cleanSheets - a.cleanSheets);
      case "interceptions":
        return sorted.sort((a, b) => b.interceptions - a.interceptions);
      default:
        return sorted;
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "goals":
        return <Goal className="h-4 w-4" />;
      case "assists":
        return <Users className="h-4 w-4" />;
      case "mvps":
        return <Award className="h-4 w-4" />;
      case "cleanSheets":
        return <ShieldCheck className="h-4 w-4" />;
      case "interceptions":
        return <Scissors className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const sortedPlayers = sortPlayers(overallPlayerData);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <motion.h1
          className="text-4xl font-bold mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Leaderboards
        </motion.h1>
        <motion.p
          className="text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Track top performers across all seasons.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center gap-4 mb-6">
            <h2 className="text-xl font-bold">Overall Top 10</h2>

            <div className="flex flex-wrap gap-2">
              {[
                {
                  key: "goals",
                  label: "Goals",
                  icon: <Goal className="h-4 w-4 mr-1" />,
                },
                {
                  key: "assists",
                  label: "Assists",
                  icon: <Users className="h-4 w-4 mr-1" />,
                },
                {
                  key: "mvps",
                  label: "MVPs",
                  icon: <Award className="h-4 w-4 mr-1" />,
                },
                {
                  key: "cleanSheets",
                  label: "Clean Sheets",
                  icon: <ShieldCheck className="h-4 w-4 mr-1" />,
                },
                {
                  key: "interceptions",
                  label: "Interceptions",
                  icon: <Scissors className="h-4 w-4 mr-1" />,
                },
              ].map((metric) => (
                <Button
                  key={metric.key}
                  variant="outline"
                  size="sm"
                  className={selectedMetric === metric.key ? "bg-secondary" : ""}
                  onClick={() => setSelectedMetric(metric.key)}
                >
                  {metric.icon}
                  {metric.label}
                </Button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMetric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Top 10 Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {sortedPlayers.map((player, idx) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: Math.min(idx * 0.05, 1),
                            duration: 0.3,
                          }}
                          className={`flex items-center p-4 rounded-lg transition-colors
                          ${
                            idx === 0
                              ? " text-yellow-900 border-yellow-500"
                              : idx === 1
                              ? " text-zinc-800 border-zinc-500"
                              : idx === 2
                              ? " text-amber-900 border-amber-600"
                              : " text-foreground"
                          }
                          ${idx < 3 ? "border-2" : ""}
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
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {getMetricIcon(selectedMetric)}
                              <span className="text-lg font-bold">
                                {selectedMetric === "goals"
                                  ? player.goalsScored
                                  : selectedMetric === "assists"
                                  ? player.assists
                                  : selectedMetric === "mvps"
                                  ? player.mvps
                                  : selectedMetric === "cleanSheets"
                                  ? player.cleanSheets
                                  : selectedMetric === "interceptions"
                                  ? player.interceptions
                                  : player.points}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Win Classes Section */}
        <div>
          <WinClasses />
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
