// This is the Leaderboards.tsx page. It handles UI and logic for Leaderboards.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Award,
  Crown,
  Medal,
  Goal,
  ShieldCheck,
  Zap,
  Users,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { generateRandomPlayers } from "@/utils/playerGenerator";
import { WinClasses } from "@/components/leaderboards/WinClasses";

const playerData = generateRandomPlayers(10);

const Leaderboards = () => {
  const [selectedMetric, setSelectedMetric] = useState<string>("mvps");

  const sortPlayers = (players: typeof playerData) => {
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
      case "tackles":
        return sorted.sort((a, b) => b.tackles - a.tackles);
      case "wins":
        return sorted.sort((a, b) => b.wins - a.wins);
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
      case "tackles":
        return <Zap className="h-4 w-4" />;
      case "wins":
        return <Medal className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const sortedPlayers = sortPlayers(playerData);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Leaderboards</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track top performers across all time.
        </p>
      </div>
      {/* Remove Current/Last Season Tabs and just show All Time */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {[
          { key: "goals", label: "Goals", icon: <Goal className="h-4 w-4 mr-1" /> },
          { key: "assists", label: "Assists", icon: <Users className="h-4 w-4 mr-1" /> },
          { key: "mvps", label: "MVPs", icon: <Award className="h-4 w-4 mr-1" /> },
          { key: "cleanSheets", label: "Clean Sheets", icon: <ShieldCheck className="h-4 w-4 mr-1" /> },
          { key: "tackles", label: "Tackles", icon: <Zap className="h-4 w-4 mr-1" /> },
          { key: "wins", label: "Wins", icon: <Medal className="h-4 w-4 mr-1" /> },
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
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All Time Top 10</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              <WinClasses players={sortedPlayers.slice(0, 10)} metric={selectedMetric} getMetricIcon={getMetricIcon} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboards;
