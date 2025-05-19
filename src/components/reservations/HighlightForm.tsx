
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReservation, Highlight, HighlightType } from "@/context/ReservationContext";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface HighlightFormProps {
  reservationId: number;
  onSave: (highlight: Highlight) => void;
  onCancel: () => void;
}

/**
 * HighlightForm component for adding match highlights
 * Allows admin to select highlight type, player from the game lineup, minute, and add description
 */
const HighlightForm = ({ reservationId, onSave, onCancel }: HighlightFormProps) => {
  const [highlightType, setHighlightType] = useState<HighlightType>("goal");
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [minute, setMinute] = useState<string>("1");
  const [description, setDescription] = useState<string>("");
  const [availablePlayers, setAvailablePlayers] = useState<{id: string, name: string}[]>([]);
  
  const { reservations } = useReservation();

  // Load players who participated in this game
  useEffect(() => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation && reservation.lineup) {
      // Extract player names and IDs from lineup
      const players = reservation.lineup
        .filter(player => player.status === 'joined' && player.playerName)
        .map(player => ({
          id: player.userId,
          name: player.playerName || `Player ${player.userId}`
        }));
      
      setAvailablePlayers(players);
      // Set default player if available
      if (players.length > 0) {
        setPlayerId(players[0].id);
        setPlayerName(players[0].name);
      }
    }
  }, [reservationId, reservations]);

  // Update player name when player ID changes
  const handlePlayerChange = (selectedPlayerId: string) => {
    setPlayerId(selectedPlayerId);
    const player = availablePlayers.find(p => p.id === selectedPlayerId);
    if (player) {
      setPlayerName(player.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate minute is a number between 1-90
    const minuteNum = parseInt(minute);
    if (isNaN(minuteNum) || minuteNum < 1 || minuteNum > 90) {
      toast({
        title: "Invalid minute",
        description: "Please enter a valid minute between 1 and 90",
        variant: "destructive"
      });
      return;
    }
    
    // Create highlight object
    const highlight: Highlight = {
      id: Date.now(),
      type: highlightType,
      playerName: playerName,
      minute: minuteNum,
      description: description,
      playerId: playerId
    };
    
    onSave(highlight);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Highlight Type</label>
        <Select 
          value={highlightType} 
          onValueChange={(value: HighlightType) => setHighlightType(value)}
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
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Player</label>
        {availablePlayers.length > 0 ? (
          <Select 
            value={playerId} 
            onValueChange={handlePlayerChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((player) => (
                <SelectItem key={player.id} value={player.id}>{player.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="No players found in the lineup"
            disabled
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
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about the highlight"
          className="resize-none"
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
