
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useReservation } from "@/context/ReservationContext";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

interface SuspendPlayerFormProps {
  reservationId: number;
  onCancel: () => void;
  onSuspend: (playerId: string, playerName: string, duration: number, reason: string) => void;
}

/**
 * SuspendPlayerForm component
 * Allows admin to suspend a player for a specified duration with a reason
 */
const SuspendPlayerForm: React.FC<SuspendPlayerFormProps> = ({ 
  reservationId, 
  onCancel,
  onSuspend
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>("");
  const [duration, setDuration] = useState<string>("1");
  const [reason, setReason] = useState<string>("");
  const [availablePlayers, setAvailablePlayers] = useState<{id: string, name: string}[]>([]);
  
  const { reservations } = useReservation();

  // Load players who participated in this game
  useEffect(() => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation && reservation.lineup) {
      // Extract player names from lineup
      const players = reservation.lineup
        .filter(player => player.status === 'joined' && player.playerName)
        .map(player => ({
          id: player.userId || `player-${Math.random().toString(36).substring(2, 9)}`, // Ensure ID is never empty
          name: player.playerName || `Player ${player.userId}`
        }));
      
      setAvailablePlayers(players);
      // Set default player if available
      if (players.length > 0) {
        setSelectedPlayerId(players[0].id);
        setSelectedPlayerName(players[0].name);
      }
    }
  }, [reservationId, reservations]);

  // Update player name when player ID changes
  const handlePlayerChange = (playerId: string) => {
    setSelectedPlayerId(playerId);
    const player = availablePlayers.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayerName(player.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate duration is a positive number
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum < 1) {
      toast({
        title: "Invalid duration",
        description: "Please enter a valid suspension duration in days",
        variant: "destructive"
      });
      return;
    }
    
    // Validate reason is provided
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for the suspension",
        variant: "destructive"
      });
      return;
    }
    
    onSuspend(
      selectedPlayerId || `player-${Date.now()}`, // Ensure ID is never empty
      selectedPlayerName, 
      durationNum, 
      reason
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 mb-4">
        <div className="flex gap-2 text-amber-800 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">Warning</p>
            <p className="text-xs">Suspending a player will prevent them from joining games for the specified duration. This action should only be taken for serious rule violations.</p>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Select Player</label>
        {availablePlayers.length > 0 ? (
          <Select 
            value={selectedPlayerId} 
            onValueChange={handlePlayerChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((player) => (
                <SelectItem key={player.id} value={player.id || `player-${Math.random().toString(36).substring(2, 9)}`}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input 
            value={selectedPlayerName}
            placeholder="No players found in the lineup"
            disabled
          />
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Suspension Duration (days)</label>
        <Select 
          value={duration} 
          onValueChange={setDuration}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 day</SelectItem>
            <SelectItem value="3">3 days</SelectItem>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="14">14 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Reason for Suspension</label>
        <Textarea 
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why the player is being suspended"
          className="resize-none"
          rows={4}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive">
          Suspend Player
        </Button>
      </div>
    </form>
  );
};

export default SuspendPlayerForm;
