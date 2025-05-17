
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
import { useReservation } from "@/context/ReservationContext";

interface HighlightFormProps {
  reservationId: number;
  onComplete?: () => void;
}

const HighlightForm: React.FC<HighlightFormProps> = ({ 
  reservationId, 
  onComplete 
}) => {
  const [minute, setMinute] = useState<string>('');
  const [eventType, setEventType] = useState<string>('goal');
  const [playerName, setPlayerName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  const { addHighlight } = useReservation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!minute || !playerName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const minuteValue = parseInt(minute, 10);
    if (isNaN(minuteValue) || minuteValue < 0 || minuteValue > 120) {
      toast({
        title: "Invalid Minute",
        description: "Please enter a valid minute between 0 and 120.",
        variant: "destructive",
      });
      return;
    }
    
    addHighlight(reservationId, {
      minute: minuteValue,
      type: eventType as any,
      playerId: `player-${Date.now()}`,
      playerName,
      description: description || undefined
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
            max="120"
            value={minute} 
            onChange={(e) => setMinute(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div className="w-full sm:w-1/3">
          <Label htmlFor="event-type">Event Type</Label>
          <Select 
            value={eventType}
            onValueChange={setEventType}
          >
            <SelectTrigger id="event-type" className="mt-1">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goal">Goal</SelectItem>
              <SelectItem value="assist">Assist</SelectItem>
              <SelectItem value="yellowCard">Yellow Card</SelectItem>
              <SelectItem value="redCard">Red Card</SelectItem>
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
