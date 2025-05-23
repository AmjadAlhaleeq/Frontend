
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

enum HighlightType {
  GOAL = "goal",
  ASSIST = "assist",
  SAVE = "save",
  TACKLE = "tackle",
  OTHER = "other"
}

// Define simplified Highlight interface here to avoid circular dependency
interface Highlight {
  id: string;
  playerId: string;
  playerName: string;
  type: HighlightType;
  description: string;
  timestamp: string;
}

interface HighlightFormProps {
  reservationId: number;
  onSave: (highlight: Omit<Highlight, "id">) => void;
  onCancel: () => void;
}

/**
 * HighlightForm component for adding highlights to a game
 */
const HighlightForm: React.FC<HighlightFormProps> = ({
  reservationId,
  onSave,
  onCancel
}) => {
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [type, setType] = useState<HighlightType>(HighlightType.GOAL);
  const [description, setDescription] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerId || !playerName || !description) {
      return; // Form validation
    }
    
    onSave({
      playerId,
      playerName,
      type,
      description,
      timestamp: new Date().toISOString()
    });
    
    // Reset form
    setPlayerId("");
    setPlayerName("");
    setType(HighlightType.GOAL);
    setDescription("");
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="player-id">Player ID</Label>
          <Input 
            id="player-id"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="Player ID"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="player-name">Player Name</Label>
          <Input 
            id="player-name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Player name"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="highlight-type">Highlight Type</Label>
        <Select 
          value={type} 
          onValueChange={(value: any) => setType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={HighlightType.GOAL}>Goal</SelectItem>
            <SelectItem value={HighlightType.ASSIST}>Assist</SelectItem>
            <SelectItem value={HighlightType.SAVE}>Save</SelectItem>
            <SelectItem value={HighlightType.TACKLE}>Tackle</SelectItem>
            <SelectItem value={HighlightType.OTHER}>Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the highlight..."
          className="min-h-[80px]"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Highlight
        </Button>
      </div>
    </form>
  );
};

export default HighlightForm;
