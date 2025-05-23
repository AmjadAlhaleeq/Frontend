
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReservation } from "@/context/ReservationContext";
import { toast } from "@/components/ui/use-toast";

// Define simplified HighlightType enum and Highlight interface here to avoid circular dependency
enum HighlightType {
  GOAL = "goal",
  ASSIST = "assist",
  SAVE = "save",
  TACKLE = "tackle",
  OTHER = "other"
}

interface Highlight {
  id: string;
  playerId: string;
  playerName: string;
  type: HighlightType;
  description: string;
  timestamp: string;
}

interface HighlightsListProps {
  highlights: Highlight[];
  reservationId: number;
  isAdmin?: boolean;
}

/**
 * HighlightsList component for displaying game highlights
 */
const HighlightsList: React.FC<HighlightsListProps> = ({
  highlights,
  reservationId,
  isAdmin = false
}) => {
  const { deleteHighlight } = useReservation();

  // Function to get the color for a highlight type
  const getHighlightColor = (type: HighlightType) => {
    switch (type) {
      case HighlightType.GOAL:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case HighlightType.ASSIST:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case HighlightType.SAVE:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case HighlightType.TACKLE:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };
  
  // Format a timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return "Unknown time";
    }
  };

  // Handle delete highlight
  const handleDeleteHighlight = (highlightId: string) => {
    if (deleteHighlight) {
      deleteHighlight(reservationId, highlightId);
      toast({
        title: "Highlight Deleted",
        description: "The highlight has been removed from this game.",
      });
    }
  };

  if (!highlights || highlights.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-500">
        No highlights have been added yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {highlights.map((highlight) => (
        <Card key={highlight.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-1">
                  <Badge className={getHighlightColor(highlight.type)}>
                    {highlight.type.charAt(0).toUpperCase() + highlight.type.slice(1)}
                  </Badge>
                  <span className="ml-2 font-medium">{highlight.playerName}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{highlight.description}</p>
                <p className="text-xs text-gray-500 mt-1">{formatTime(highlight.timestamp)}</p>
              </div>
              
              {isAdmin && deleteHighlight && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                  onClick={() => handleDeleteHighlight(highlight.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HighlightsList;
