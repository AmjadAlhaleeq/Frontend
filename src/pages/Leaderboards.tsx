
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Crown,
  Medal,
  Goal,
  ShieldCheck,
  Scissors,
  Users,
  Star,
  Trophy,
  Target,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { generateRandomPlayers } from "@/utils/playerGenerator";

// Generate data for our overall leaderboard
const overallPlayerData = generateRandomPlayers(15);

const Leaderboards = () => {
  const [selectedMetric, setSelectedMetric] = useState<string>("wins");

  // Sort players based on selected metric
  const sortPlayers = (players: typeof overallPlayerData) => {
    const sorted = [...players];
    switch (selectedMetric) {
      case "wins":
        return sorted.sort((a, b) => b.wins - a.wins);
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
      case "wins":
        return <Trophy className="h-4 w-4" />;
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

  const getMetricValue = (player: any, metric: string) => {
    switch (metric) {
      case "wins":
        return player.wins;
      case "goals":
        return player.goalsScored;
      case "assists":
        return player.assists;
      case "mvps":
        return player.mvps;
      case "cleanSheets":
        return player.cleanSheets;
      case "interceptions":
        return player.interceptions;
      default:
        return player.points;
    }
  };

  const metrics = [
    { key: "wins", label: "Wins", icon: <Trophy className="h-4 w-4 mr-1" /> },
    { key: "goals", label: "Goals", icon: <Goal className="h-4 w-4 mr-1" /> },
    { key: "assists", label: "Assists", icon: <Users className="h-4 w-4 mr-1" /> },
    { key: "mvps", label: "MVPs", icon: <Award className="h-4 w-4 mr-1" /> },
    { key: "cleanSheets", label: "Clean Sheets", icon: <ShieldCheck className="h-4 w-4 mr-1" /> },
    { key: "interceptions", label: "Interceptions", icon: <Scissors className="h-4 w-4 mr-1" /> }
  ];

  const sortedPlayers = sortPlayers(overallPlayerData);
  const topThree = sortedPlayers.slice(0, 3);
  const otherPlayers = sortedPlayers.slice(3);

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
          Track top performers across all metrics and celebrate excellence.
        </motion.p>
      </div>

      {/* Metric Selection */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {metrics.map((metric) => (
            <Button
              key={metric.key}
              variant={selectedMetric === metric.key ? "default" : "ghost"}
              size="sm"
              className={`${
                selectedMetric === metric.key 
                  ? "bg-teal-600 hover:bg-teal-700 text-white" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              onClick={() => setSelectedMetric(metric.key)}
            >
              {metric.icon}
              {metric.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Podium Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Crown className="mr-2 h-5 w-5 text-yellow-500" />
                Top 3 Champions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topThree.map((player, idx) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                      idx === 0
                        ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-600"
                        : idx === 1
                        ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 dark:from-gray-800 dark:to-slate-800 dark:border-gray-600"
                        : "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-600"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? "bg-yellow-400 text-yellow-900" :
                          idx === 1 ? "bg-gray-400 text-gray-900" :
                          "bg-orange-400 text-orange-900"
                        }`}>
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{player.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          {getMetricIcon(selectedMetric)}
                          <span className="font-semibold text-lg">
                            {getMetricValue(player, selectedMetric)}
                          </span>
                        </div>
                      </div>
                      {idx === 0 && <Crown className="h-6 w-6 text-yellow-500" />}
                      {idx === 1 && <Medal className="h-6 w-6 text-gray-500" />}
                      {idx === 2 && <Award className="h-6 w-6 text-orange-500" />}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="mr-2 h-5 w-5 text-teal-500" />
                Season Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <div className="font-bold text-2xl text-teal-600">147</div>
                  <div className="text-muted-foreground">Total Games</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="font-bold text-2xl text-blue-600">15</div>
                  <div className="text-muted-foreground">Active Players</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="font-bold text-2xl text-green-600">89%</div>
                  <div className="text-muted-foreground">Attendance</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="font-bold text-2xl text-purple-600">4.8</div>
                  <div className="text-muted-foreground">Avg Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Rankings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-teal-500" />
                  Complete Rankings
                </div>
                <Badge variant="outline" className="text-sm">
                  {sortedPlayers.length} Players
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedMetric}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {sortedPlayers.map((player, idx) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: Math.min(idx * 0.02, 0.5),
                          duration: 0.2,
                        }}
                        className={`flex items-center p-3 rounded-lg transition-all hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 border ${
                          idx < 3 ? "border-teal-200 bg-teal-50/50 dark:border-teal-700 dark:bg-teal-900/10" : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="w-8 text-center font-bold text-muted-foreground flex items-center justify-center">
                          {idx < 3 ? (
                            idx === 0 ? <Crown className="h-5 w-5 text-yellow-500" /> :
                            idx === 1 ? <Medal className="h-5 w-5 text-gray-500" /> :
                            <Award className="h-5 w-5 text-orange-500" />
                          ) : (
                            <span className="text-lg">{idx + 1}</span>
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
                          <h4 className="font-medium text-lg">{player.name}</h4>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-3">
                            <span>Games: {player.gamesPlayed}</span>
                            <span>•</span>
                            <span>Win Rate: {Math.round((player.wins / player.gamesPlayed) * 100)}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {getMetricIcon(selectedMetric)}
                            <span className="text-2xl font-bold text-teal-600">
                              {getMetricValue(player, selectedMetric)}
                            </span>
                          </div>
                          {idx < 3 && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Top Performer
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
