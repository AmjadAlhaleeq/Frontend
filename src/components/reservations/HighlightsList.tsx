
import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReservation } from "@/context/ReservationContext";

interface HighlightsListProps {
  reservationId: number;
  isAdmin?: boolean;
}

const HighlightsList: React.FC<HighlightsListProps> = ({ 
  reservationId,
  isAdmin = false 
}) => {
  const { reservations, removeHighlight } = useReservation();
  
  const reservation = reservations.find(r => r.id === reservationId);
  if (!reservation) return null;
  
  const { highlights } = reservation;
  
  if (highlights.length === 0) {
    return <p className="text-sm text-gray-500 italic">No highlights recorded for this game.</p>;
  }
  
  // Sort highlights by minute
  const sortedHighlights = [...highlights].sort((a, b) => a.minute - b.minute);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <span className="text-green-500 font-bold">⚽</span>;
      case 'assist':
        return <span className="text-blue-500 font-bold">👟</span>;
      case 'yellowCard':
        return <span className="text-yellow-500 font-bold">🟨</span>;
      case 'redCard':
        return <span className="text-red-500 font-bold">🟥</span>;
      default:
        return <span>•</span>;
    }
  };

  return (
    <div className="space-y-2">
      {sortedHighlights.map((highlight) => (
        <div 
          key={highlight.id} 
          className={`flex items-center text-sm p-2 rounded-md ${
            highlight.type === 'goal' 
              ? 'bg-green-50 border-l-4 border-green-500' 
              : highlight.type === 'assist'
              ? 'bg-blue-50 border-l-4 border-blue-500'
              : highlight.type === 'yellowCard'
              ? 'bg-yellow-50 border-l-4 border-yellow-400'
              : highlight.type === 'redCard'
              ? 'bg-red-50 border-l-4 border-red-500'
              : 'bg-gray-50'
          }`}
        >
          <div className="w-16 text-muted-foreground font-mono">{highlight.minute}'</div>
          <div className="flex-1 flex items-center">
            <div className="mr-2">{getEventIcon(highlight.type)}</div>
            <div>
              <span className="font-medium mr-2">{highlight.playerName}</span>
              {highlight.type === 'goal' && <span className="text-green-600 font-semibold">GOAL!</span>}
              {highlight.type === 'assist' && <span className="text-blue-600 font-semibold">Assist</span>}
              {highlight.type === 'yellowCard' && <span className="text-yellow-600 font-semibold">Yellow Card</span>}
              {highlight.type === 'redCard' && <span className="text-red-600 font-semibold">Red Card</span>}
              {highlight.description && (
                <p className="text-xs text-gray-600 mt-1">{highlight.description}</p>
              )}
            </div>
          </div>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600"
              onClick={() => removeHighlight(reservationId, highlight.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default HighlightsList;
