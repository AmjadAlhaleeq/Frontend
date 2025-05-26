import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Highlight } from "@/types/reservation";

interface HighlightFormProps {
  reservationId: number;
  onSave: (highlight: Omit<Highlight, "id" | "timestamp">) => void;
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
  const [type, setType] = useState<"goal" | "assist" | "save" | "tackle">("goal");
  const [description, setDescription] = useState("");
  const [minute, setMinute] = useState<number>(0);
  
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
      minute
    });
    
    // Reset form
    setPlayerId("");
    setPlayerName("");
    setType("goal");
    setDescription("");
    setMinute(0);
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
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="highlight-type">Highlight Type</Label>
          <Select 
            value={type} 
            onValueChange={(value: "goal" | "assist" | "save" | "tackle") => setType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goal">Goal</SelectItem>
              <SelectItem value="assist">Assist</SelectItem>
              <SelectItem value="save">Save</SelectItem>
              <SelectItem value="tackle">Tackle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minute">Minute</Label>
          <Input 
            id="minute"
            type="number"
            value={minute}
            onChange={(e) => setMinute(parseInt(e.target.value) || 0)}
            placeholder="Match minute"
            min="0"
            max="120"
          />
        </div>
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
