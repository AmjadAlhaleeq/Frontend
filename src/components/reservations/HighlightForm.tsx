
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useReservation, Highlight } from "@/context/ReservationContext"; // Import Highlight type

interface HighlightFormProps {
  reservationId: number;
  onComplete?: () => void;
}

// Use the type from context for consistency, or a subset if needed
type EventType = Extract<Highlight['type'], 'goal' | 'assist' | 'yellowCard' | 'redCard'>;


const HighlightForm: React.FC<HighlightFormProps> = ({ 
  reservationId, 
  onComplete 
}) => {
  const [minute, setMinute] = useState<string>('');
  const [eventType, setEventType] = useState<EventType>('goal'); // Use EventType
  const [playerName, setPlayerName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  const { addHighlight } = useReservation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!minute || !playerName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (minute, player name).",
        variant: "destructive",
      });
      return;
    }

    const minuteValue = parseInt(minute, 10);
    if (isNaN(minuteValue) || minuteValue < 0 || minuteValue > 120) { // Max game time, adjust if needed
      toast({
        title: "Invalid Minute",
        description: "Please enter a valid minute (e.g., 0-120).",
        variant: "destructive",
      });
      return;
    }
    
    const highlightData: Omit<Highlight, 'id'> = {
      minute: minuteValue,
      type: eventType, // No 'as any' needed
      playerId: `player-${Date.now()}-${Math.random().toString(36).substring(7)}`, // More unique ID
      playerName,
      description: description.trim() || undefined
    };

    addHighlight(reservationId, highlightData);
    
    toast({
        title: "Highlight Added",
        description: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} by ${playerName} at ${minuteValue}' recorded.`,
    });

    // Reset form
    setMinute('');
    setEventType('goal');
    setPlayerName('');
    setDescription('');
    
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/4">
          <Label htmlFor="minute">Minute</Label>
          <Input 
            id="minute" 
            type="number" 
            placeholder="45" 
            min="0"
            max="120" // Assuming max 120 minutes for a match
            value={minute} 
            onChange={(e) => setMinute(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        
        <div className="w-full sm:w-1/3">
          <Label htmlFor="event-type">Event Type</Label>
          <Select 
            value={eventType}
            onValueChange={(value: EventType) => setEventType(value)}
          >
            <SelectTrigger id="event-type" className="mt-1">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goal">Goal</SelectItem>
              <SelectItem value="assist">Assist</SelectItem>
              <SelectItem value="yellowCard">Yellow Card</SelectItem>
              <SelectItem value="redCard">Red Card</SelectItem>
              {/* Add 'save' or 'other' if they become relevant */}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-1/3">
          <Label htmlFor="player-name">Player Name</Label>
          <Input 
            id="player-name" 
            placeholder="John Doe" 
            value={playerName} 
            onChange={(e) => setPlayerName(e.target.value)}
            className="mt-1"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Input 
          id="description" 
          placeholder="Great goal from outside the box" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700"
        >
          Add Highlight
        </Button>
      </div>
    </form>
  );
};

export default HighlightForm;
