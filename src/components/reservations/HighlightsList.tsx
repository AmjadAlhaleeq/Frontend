
import React, { useState } from "react";
import { Trash2, Trophy, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReservation } from "@/context/ReservationContext";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface HighlightsListProps {
  reservationId: number;
  isAdmin?: boolean;
}

type HighlightType = "goal" | "assist" | "yellowCard" | "redCard";

type NewHighlight = {
  minute: number;
  type: HighlightType;
  playerId: string;
  playerName: string;
  description?: string;
};

const HighlightsList: React.FC<HighlightsListProps> = ({ 
  reservationId,
  isAdmin = false 
}) => {
  const { reservations, removeHighlight, addHighlight } = useReservation();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHighlight, setNewHighlight] = useState<NewHighlight>({
    minute: 1,
    type: "goal",
    playerId: "player1",
    playerName: "",
    description: ""
  });
  
  const reservation = reservations.find(r => r.id === reservationId);
  if (!reservation) return null;
  
  const { highlights } = reservation;
  
  const handleAddHighlight = () => {
    if (!newHighlight.playerName.trim()) {
      toast({
        title: "Player name required",
        description: "Please enter a player name",
        variant: "destructive"
      });
      return;
    }

    addHighlight(reservationId, {
      minute: newHighlight.minute,
      type: newHighlight.type,
      playerId: newHighlight.playerId,
      playerName: newHighlight.playerName,
      description: newHighlight.description?.trim() || undefined
    });
    
    toast({
      title: "Highlight added",
      description: `${newHighlight.type === "goal" ? "Goal" : newHighlight.type === "assist" ? "Assist" : "Event"} at ${newHighlight.minute}' has been recorded`,
    });
    
    // Reset form
    setNewHighlight({
      minute: 1,
      type: "goal",
      playerId: "player1",
      playerName: "",
      description: ""
    });
  };
  
  if (highlights.length === 0 && !showAddForm) {
    return (
      <div className="py-4 text-center">
        <div className="text-sm text-gray-500 italic mb-4">No highlights recorded for this game.</div>
        {isAdmin && (
          <Button 
            variant="outline"
            className="border-[#0F766E] text-[#0F766E] hover:bg-[#0F766E]/10"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Game Highlight
          </Button>
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
      {/* Admin controls */}
      {isAdmin && (
        <div className="flex justify-end">
          <Button 
            variant="outline"
            size="sm"
            className="border-[#0F766E] text-[#0F766E] hover:bg-[#0F766E]/10"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add Highlight
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Add highlight form */}
      {isAdmin && showAddForm && (
        <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
          <h4 className="font-medium text-sm mb-3">Add New Highlight</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">Minute</label>
              <Input 
                type="number" 
                min="1" 
                max="90" 
                value={newHighlight.minute}
                onChange={(e) => setNewHighlight({...newHighlight, minute: parseInt(e.target.value) || 1})}
                className="h-8"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium">Type</label>
              <Select 
                value={newHighlight.type} 
                onValueChange={(value) => setNewHighlight({...newHighlight, type: value as HighlightType})}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goal">⚽ Goal</SelectItem>
                  <SelectItem value="assist">👟 Assist</SelectItem>
                  <SelectItem value="yellowCard">🟨 Yellow Card</SelectItem>
                  <SelectItem value="redCard">🟥 Red Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium">Player Name</label>
              <Input 
                value={newHighlight.playerName}
                onChange={(e) => setNewHighlight({...newHighlight, playerName: e.target.value})}
                className="h-8"
                placeholder="Enter player name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium">Description (Optional)</label>
              <Input 
                value={newHighlight.description || ''}
                onChange={(e) => setNewHighlight({...newHighlight, description: e.target.value})}
                className="h-8"
                placeholder="Great finish, header, etc."
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleAddHighlight}
              size="sm"
              className="bg-[#0F766E] hover:bg-[#0F766E]/90"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Highlight
            </Button>
          </div>
        </div>
      )}
      
      {/* Summary badges */}
      {highlights.length > 0 && (
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
      )}
      
      {highlights.length > 0 && <Separator className="my-2" />}
      
      {/* Timeline of events */}
      {highlights.length > 0 && (
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
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600"
                    onClick={() => {
                      if (confirm("Are you sure you want to remove this highlight?")) {
                        removeHighlight(reservationId, highlight.id);
                        toast({
                          title: "Highlight removed",
                          description: "The highlight has been deleted successfully"
                        });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HighlightsList;
