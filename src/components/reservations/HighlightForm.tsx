
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReservation, Highlight } from "@/context/ReservationContext";

interface HighlightFormProps {
  reservationId: number;
  onSave: (highlight: Highlight) => void;
  onCancel: () => void;
}

/**
 * HighlightForm component for adding match highlights
 * Allows admin to select highlight type, player, minute, and add description
 */
const HighlightForm = ({ reservationId, onSave, onCancel }: HighlightFormProps) => {
  const [highlightType, setHighlightType] = useState<string>("goal");
  const [playerName, setPlayerName] = useState<string>("");
  const [minute, setMinute] = useState<string>("1");
  const [description, setDescription] = useState<string>("");
  const [availablePlayers, setAvailablePlayers] = useState<string[]>([]);
  
  const { reservations } = useReservation();

  // Load players who participated in this game
  useEffect(() => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation && reservation.lineup) {
      // Extract player names from lineup
      const players = reservation.lineup
        .filter(player => player.status === 'joined' && player.playerName)
        .map(player => player.playerName || `Player ${player.userId}`);
      
      setAvailablePlayers(players);
      // Set default player if available
      if (players.length > 0) {
        setPlayerName(players[0]);
      }
    }
  }, [reservationId, reservations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate minute is a number between 1-90
    const minuteNum = parseInt(minute);
    if (isNaN(minuteNum) || minuteNum < 1 || minuteNum > 90) {
      alert("Please enter a valid minute between 1 and 90");
      return;
    }
    
    // Create highlight object
    const highlight: Highlight = {
      id: Date.now(),
      type: highlightType as "goal" | "assist" | "yellowCard" | "redCard" | "save" | "other",
      playerName: playerName,
      minute: minuteNum,
      description: description,
      playerId: `player-${Date.now()}` // Generate a temporary playerId if not available
    };
    
    onSave(highlight);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Highlight Type</label>
        <Select 
          value={highlightType} 
          onValueChange={setHighlightType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select highlight type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="goal">Goal</SelectItem>
            <SelectItem value="assist">Assist</SelectItem>
            <SelectItem value="yellowCard">Yellow Card</SelectItem>
            <SelectItem value="redCard">Red Card</SelectItem>
            <SelectItem value="save">Save</SelectItem>
            <SelectItem value="tackle">Tackle</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Player</label>
        {availablePlayers.length > 0 ? (
          <Select 
            value={playerName} 
            onValueChange={setPlayerName}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((player, index) => (
                <SelectItem key={index} value={player}>{player}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name"
          />
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Minute</label>
        <Input 
          type="number" 
          min="1" 
          max="90" 
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          placeholder="Minute"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description (Optional)</label>
        <Input 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Highlight</Button>
      </div>
    </form>
  );
};

export default HighlightForm;
