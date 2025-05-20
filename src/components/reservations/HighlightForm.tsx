
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReservation, Highlight, HighlightType } from "@/context/ReservationContext";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Goal, Award, Whistle, ShieldAlert, ShieldX, 
  HandMetal, Zap, User, Clock, Football 
} from "lucide-react";

interface HighlightFormProps {
  reservationId: number;
  onSave: (highlight: Highlight) => void;
  onCancel: () => void;
}

/**
 * HighlightForm component for adding match highlights
 * Allows admin to select highlight type, player from the game lineup, minute, and add description
 * Now includes assist player selection and enhanced icons
 */
const HighlightForm = ({ reservationId, onSave, onCancel }: HighlightFormProps) => {
  const [highlightType, setHighlightType] = useState<HighlightType>("goal");
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [assistPlayerId, setAssistPlayerId] = useState<string>("");
  const [assistPlayerName, setAssistPlayerName] = useState<string>("");
  const [minute, setMinute] = useState<string>("1");
  const [description, setDescription] = useState<string>("");
  const [isPenalty, setIsPenalty] = useState<boolean>(false);
  const [showAssistField, setShowAssistField] = useState<boolean>(false);
  const [availablePlayers, setAvailablePlayers] = useState<{id: string, name: string}[]>([]);
  
  const { reservations } = useReservation();
  const { toast } = useToast();

  // Load players who participated in this game
  useEffect(() => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation && reservation.lineup) {
      // Extract player names and IDs from lineup
      const players = reservation.lineup
        .filter(player => player.status === 'joined' && player.playerName)
        .map(player => ({
          id: player.userId || `player-${Math.random().toString(36).substring(2, 9)}`, // Ensure ID is never empty
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

  // Update assist player name when assist player ID changes
  const handleAssistPlayerChange = (selectedPlayerId: string) => {
    setAssistPlayerId(selectedPlayerId);
    const player = availablePlayers.find(p => p.id === selectedPlayerId);
    if (player) {
      setAssistPlayerName(player.name);
    }
  };

  // Show/hide assist field based on highlight type
  useEffect(() => {
    setShowAssistField(highlightType === 'goal');
    if (highlightType !== 'goal') {
      setAssistPlayerId('');
      setAssistPlayerName('');
      setIsPenalty(false);
    }
  }, [highlightType]);

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
      playerId: playerId || `player-${Date.now()}`, // Ensure playerId is never empty
      assistPlayerId: assistPlayerId || undefined,
      assistPlayerName: assistPlayerId ? assistPlayerName : undefined,
      isPenalty: highlightType === 'goal' ? isPenalty : undefined
    };
    
    onSave(highlight);
  };

  // Get icon for highlight type
  const getHighlightTypeIcon = () => {
    switch (highlightType) {
      case 'goal':
        return <Goal className="h-4 w-4 mr-2 text-green-500" />;
      case 'assist':
        return <Zap className="h-4 w-4 mr-2 text-blue-500" />;
      case 'yellowCard':
        return <ShieldAlert className="h-4 w-4 mr-2 text-yellow-500" />;
      case 'redCard':
        return <ShieldX className="h-4 w-4 mr-2 text-red-500" />;
      case 'save':
        return <HandMetal className="h-4 w-4 mr-2 text-purple-500" />;
      case 'other':
        return <Award className="h-4 w-4 mr-2 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Highlight Type</label>
        <div className="relative">
          {getHighlightTypeIcon()}
          <Select 
            value={highlightType} 
            onValueChange={(value: HighlightType) => setHighlightType(value)}
          >
            <SelectTrigger className="pl-8">
              <SelectValue placeholder="Select highlight type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goal">
                <div className="flex items-center">
                  <Goal className="h-4 w-4 mr-2 text-green-500" />
                  <span>Goal</span>
                </div>
              </SelectItem>
              <SelectItem value="assist">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Assist</span>
                </div>
              </SelectItem>
              <SelectItem value="yellowCard">
                <div className="flex items-center">
                  <ShieldAlert className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>Yellow Card</span>
                </div>
              </SelectItem>
              <SelectItem value="redCard">
                <div className="flex items-center">
                  <ShieldX className="h-4 w-4 mr-2 text-red-500" />
                  <span>Red Card</span>
                </div>
              </SelectItem>
              <SelectItem value="save">
                <div className="flex items-center">
                  <HandMetal className="h-4 w-4 mr-2 text-purple-500" />
                  <span>Save</span>
                </div>
              </SelectItem>
              <SelectItem value="other">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Other</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span>Player</span>
          </div>
        </label>
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
                <SelectItem key={player.id} value={player.id || "player-default"}>
                  {player.name}
                </SelectItem>
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
      
      {showAssistField && (
        <div>
          <label className="block text-sm font-medium mb-1">
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-blue-500" />
              <span>Assisted By (Optional)</span>
            </div>
          </label>
          <Select 
            value={assistPlayerId} 
            onValueChange={handleAssistPlayerChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select assist player (if any)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-assist">No Assist</SelectItem>
              {availablePlayers
                .filter(player => player.id !== playerId)
                .map((player) => (
                  <SelectItem key={`assist-${player.id}`} value={player.id || "player-default"}>
                    {player.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
      )}
      
      {highlightType === 'goal' && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPenalty"
            checked={isPenalty}
            onChange={(e) => setIsPenalty(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="isPenalty" className="text-sm font-medium flex items-center">
            <Whistle className="h-4 w-4 mr-1 text-amber-500" />
            <span>Penalty Kick</span>
          </label>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>Minute</span>
          </div>
        </label>
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
        <label className="block text-sm font-medium mb-1">
          <div className="flex items-center">
            <Football className="h-4 w-4 mr-2 text-gray-500" />
            <span>Description</span>
          </div>
        </label>
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
