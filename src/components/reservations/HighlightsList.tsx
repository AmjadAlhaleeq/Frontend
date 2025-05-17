
import React from "react";
import { Trash2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReservation } from "@/context/ReservationContext";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    return (
      <div className="py-4 text-center">
        <div className="text-sm text-gray-500 italic mb-2">No highlights recorded for this game.</div>
        {isAdmin && (
          <p className="text-xs text-gray-400">Use the form below to add game highlights as they occur.</p>
        )}
      </div>
    );
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

  // Group highlights by type for a summary
  const goalCount = highlights.filter(h => h.type === 'goal').length;
  const assistCount = highlights.filter(h => h.type === 'assist').length;
  const yellowCardCount = highlights.filter(h => h.type === 'yellowCard').length;
  const redCardCount = highlights.filter(h => h.type === 'redCard').length;

  return (
    <div className="space-y-4">
      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 pb-2">
        {goalCount > 0 && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <span>⚽</span> {goalCount} {goalCount === 1 ? 'Goal' : 'Goals'}
          </Badge>
        )}
        {assistCount > 0 && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <span>👟</span> {assistCount} {assistCount === 1 ? 'Assist' : 'Assists'}
          </Badge>
        )}
        {yellowCardCount > 0 && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <span>🟨</span> {yellowCardCount} {yellowCardCount === 1 ? 'Yellow Card' : 'Yellow Cards'}
          </Badge>
        )}
        {redCardCount > 0 && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <span>🟥</span> {redCardCount} {redCardCount === 1 ? 'Red Card' : 'Red Cards'}
          </Badge>
        )}
      </div>
      
      <Separator className="my-2" />
      
      {/* Timeline of events */}
      <div className="relative space-y-2">
        {sortedHighlights.map((highlight) => (
          <div 
            key={highlight.id} 
            className={`flex items-center text-sm p-3 rounded-md ${
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
            <div className="w-16 text-muted-foreground font-mono font-semibold">{highlight.minute}'</div>
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
    </div>
  );
};

export default HighlightsList;
