
import React, { useState } from "react";
import { Trash2, Trophy, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReservation, Highlight, HighlightType } from "@/context/ReservationContext";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface HighlightsListProps {
  reservationId: number;
  isAdmin?: boolean;
}

// Define the structure for a new highlight, matching Omit<Highlight, 'id'>
type NewHighlightInput = Omit<Highlight, 'id'>;

const HighlightsList: React.FC<HighlightsListProps> = ({ 
  reservationId,
  isAdmin = false 
}) => {
  const { reservations, deleteHighlight, addHighlight } = useReservation();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const initialNewHighlightState: NewHighlightInput = {
    type: "goal" as HighlightType,
    minute: 1,
    playerId: `player-temp-${Date.now()}`, // Temporary, can be refined
    playerName: "",
    description: ""
  };
  const [newHighlight, setNewHighlight] = useState<NewHighlightInput>(initialNewHighlightState);
  
  const reservation = reservations.find(r => r.id === reservationId);
  if (!reservation) return <div className="py-4 text-center text-sm text-gray-500 italic">Reservation not found.</div>;
  
  const { highlights = [] } = reservation;
  
  const handleAddHighlight = () => {
    if (!newHighlight.playerName.trim()) {
      toast({
        title: "Player name required",
        description: "Please enter a player name for the highlight.",
        variant: "destructive"
      });
      return;
    }
    if (newHighlight.minute <= 0) {
        toast({
            title: "Invalid minute",
            description: "Minute must be greater than 0.",
            variant: "destructive"
        });
        return;
    }

    // Ensure a unique playerId if needed for the actual highlight object
    const highlightToAdd: NewHighlightInput = {
      ...newHighlight,
      playerId: `player-${Date.now()}-${newHighlight.playerName.replace(/\s+/g, '-')}`, // Example of a more unique ID
      description: newHighlight.description?.trim() || undefined
    };

    addHighlight(highlightToAdd);
    
    toast({
      title: "Highlight added",
      description: `${highlightToAdd.type.charAt(0).toUpperCase() + highlightToAdd.type.slice(1)} at ${highlightToAdd.minute}' has been recorded for ${highlightToAdd.playerName}.`,
    });
    
    // Reset form
    setNewHighlight(initialNewHighlightState);
    setShowAddForm(false); // Optionally close form after adding
  };
  
  if (highlights.length === 0 && !showAddForm && !isAdmin) { // Also check isAdmin for the button
    return (
      <div className="py-4 text-center">
        <div className="text-sm text-gray-500 italic mb-4">No highlights recorded for this game.</div>
      </div>
    );
  }
  
  if (highlights.length === 0 && !showAddForm && isAdmin) {
    return (
      <div className="py-4 text-center">
        <div className="text-sm text-gray-500 italic mb-4">No highlights recorded for this game.</div>
        <Button 
          variant="outline"
          className="border-[#0F766E] text-[#0F766E] hover:bg-[#0F766E]/10"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Game Highlight
        </Button>
      </div>
    );
  }
  
  const sortedHighlights = [...highlights].sort((a, b) => a.minute - b.minute);

  const getEventIcon = (type: HighlightType) => {
    switch (type) {
      case 'goal':
        return <span className="text-green-500 font-bold">⚽</span>;
      case 'assist':
        return <span className="text-blue-500 font-bold">👟</span>;
      case 'yellowCard':
        return <span className="text-yellow-500 font-bold">🟨</span>;
      case 'redCard':
        return <span className="text-red-500 font-bold">🟥</span>;
      case 'save':
        return <span className="text-purple-500 font-bold">🧤</span>;
      case 'other':
        return <span className="text-gray-500 font-bold">⭐</span>;
      default:
        return <span>•</span>;
    }
  };

  const goalCount = highlights.filter(h => h.type === 'goal').length;
  const assistCount = highlights.filter(h => h.type === 'assist').length;
  const yellowCardCount = highlights.filter(h => h.type === 'yellowCard').length;
  const redCardCount = highlights.filter(h => h.type === 'redCard').length;

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Button 
            variant="outline"
            size="sm"
            className="border-[#0F766E] text-[#0F766E] hover:bg-[#0F766E]/10"
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) setNewHighlight(initialNewHighlightState); // Reset if closing
            }}
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
      
      {isAdmin && showAddForm && (
        <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
          <h4 className="font-medium text-sm mb-3">Add New Highlight</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Minute</label>
              <Input 
                type="number" 
                min="1" 
                max="120" 
                value={newHighlight.minute}
                onChange={(e) => setNewHighlight({...newHighlight, minute: parseInt(e.target.value) || 1})}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Type</label>
              <Select 
                value={newHighlight.type} 
                onValueChange={(value: HighlightType) => setNewHighlight({...newHighlight, type: value})}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goal">⚽ Goal</SelectItem>
                  <SelectItem value="assist">👟 Assist</SelectItem>
                  <SelectItem value="yellowCard">🟨 Yellow Card</SelectItem>
                  <SelectItem value="redCard">🟥 Red Card</SelectItem>
                  <SelectItem value="save">🧤 Save</SelectItem>
                  <SelectItem value="other">⭐ Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1 md:col-span-1">
              <label className="text-xs font-medium text-gray-700">Player Name</label>
              <Input 
                value={newHighlight.playerName}
                onChange={(e) => setNewHighlight({...newHighlight, playerName: e.target.value})}
                className="h-8 text-sm"
                placeholder="Enter player name"
              />
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-700">Description (Optional)</label>
              <Input 
                value={newHighlight.description || ''}
                onChange={(e) => setNewHighlight({...newHighlight, description: e.target.value})}
                className="h-8 text-sm"
                placeholder="E.g., great finish, header, foul for card"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleAddHighlight}
              size="sm"
              className="bg-[#0F766E] hover:bg-[#0F766E]/90 text-white"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Highlight
            </Button>
          </div>
        </div>
      )}
      
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {goalCount > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 text-xs">
              <span>⚽</span> {goalCount} {goalCount === 1 ? 'Goal' : 'Goals'}
            </Badge>
          )}
          {assistCount > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 text-xs">
              <span>👟</span> {assistCount} {assistCount === 1 ? 'Assist' : 'Assists'}
            </Badge>
          )}
          {yellowCardCount > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 text-xs">
              <span>🟨</span> {yellowCardCount} {yellowCardCount === 1 ? 'Yellow Card' : 'Yellow Cards'}
            </Badge>
          )}
          {redCardCount > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 text-xs">
              <span>🟥</span> {redCardCount} {redCardCount === 1 ? 'Red Card' : 'Red Cards'}
            </Badge>
          )}
        </div>
      )}
      
      {highlights.length > 0 && <Separator className="my-2" />}
      
      {highlights.length > 0 && (
        <div className="relative space-y-2">
          {sortedHighlights.map((highlight) => (
            <div 
              key={highlight.id} 
              className={`flex items-start text-sm p-3 rounded-md ${
                highlight.type === 'goal' 
                  ? 'bg-green-50 border-l-4 border-green-500' 
                  : highlight.type === 'assist'
                  ? 'bg-blue-50 border-l-4 border-blue-500'
                  : highlight.type === 'yellowCard'
                  ? 'bg-yellow-50 border-l-4 border-yellow-400'
                  : highlight.type === 'redCard'
                  ? 'bg-red-50 border-l-4 border-red-500'
                  : highlight.type === 'save'
                  ? 'bg-purple-50 border-l-4 border-purple-500'
                  : 'bg-gray-50 border-l-4 border-gray-300'
              }`}
            >
              <div className="w-12 text-muted-foreground font-mono font-semibold text-xs pt-0.5">{highlight.minute}'</div>
              <div className="flex-1 flex items-start">
                <div className="mr-2 pt-0.5">{getEventIcon(highlight.type)}</div>
                <div className="flex-grow">
                  <span className="font-medium mr-2">{highlight.playerName}</span>
                  {highlight.type === 'goal' && <span className="text-green-600 font-semibold">GOAL!</span>}
                  {highlight.type === 'assist' && <span className="text-blue-600 font-semibold">Assist</span>}
                  {highlight.type === 'yellowCard' && <span className="text-yellow-600 font-semibold">Yellow Card</span>}
                  {highlight.type === 'redCard' && <span className="text-red-600 font-semibold">Red Card</span>}
                  {highlight.type === 'save' && <span className="text-purple-600 font-semibold">Save</span>}
                  {highlight.type === 'other' && <span className="text-gray-600 font-semibold">Event</span>}
                  {highlight.description && (
                    <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{highlight.description}</p>
                  )}
                </div>
              </div>
              {isAdmin && (
                <div className="flex space-x-1 ml-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:bg-red-100 hover:text-red-600"
                    onClick={() => {
                      if (confirm("Are you sure you want to remove this highlight?")) {
                        deleteHighlight(reservationId, highlight.id);
                        toast({
                          title: "Highlight removed",
                          description: "The highlight has been deleted successfully"
                        });
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
