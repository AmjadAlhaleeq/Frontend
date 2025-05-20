
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Highlight } from "@/context/ReservationContext";

// Define a Goal icon component
const Goal = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12" />
    <path d="M8 10h8" />
  </svg>
);

// Define a Zap icon component (already imported from lucide-react)
import { Zap, Award, Star } from "lucide-react";

export interface HighlightFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (highlight: Highlight) => void;
  reservationId: number;
  onClose?: () => void;
}

const HighlightForm: React.FC<HighlightFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  reservationId,
  onClose
}) => {
  const [formState, setFormState] = useState({
    type: "goal",
    playerId: "",
    assistPlayerId: "",
    minute: "",
    description: "",
    isPenalty: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      isPenalty: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newHighlight: Highlight = {
      id: Date.now().toString(),
      reservationId,
      type: formState.type as "goal" | "assist" | "yellowCard" | "redCard",
      playerId: formState.playerId,
      assistPlayerId: formState.type === "goal" ? formState.assistPlayerId : undefined,
      minute: formState.minute,
      description: formState.description,
      isPenalty: formState.type === "goal" && formState.isPenalty,
    };
    
    onSubmit(newHighlight);
    
    // Reset form
    setFormState({
      type: "goal",
      playerId: "",
      assistPlayerId: "",
      minute: "",
      description: "",
      isPenalty: false,
    });
    
    // Close dialog
    if (onClose) {
      onClose();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Game Highlight</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formState.type}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger>
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
                    <Award className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Yellow Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="redCard">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-red-500" />
                    <span>Red Card</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="playerId">Player</Label>
            <Input
              id="playerId"
              name="playerId"
              value={formState.playerId}
              onChange={handleInputChange}
              placeholder="Enter player name/ID"
              required
            />
          </div>

          {formState.type === "goal" && (
            <div className="space-y-2">
              <Label htmlFor="assistPlayerId">Assist By (Optional)</Label>
              <Input
                id="assistPlayerId"
                name="assistPlayerId"
                value={formState.assistPlayerId}
                onChange={handleInputChange}
                placeholder="Enter assisting player name/ID"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="minute">Minute</Label>
            <Input
              id="minute"
              name="minute"
              value={formState.minute}
              onChange={handleInputChange}
              placeholder="Enter minute (e.g. 32)"
              required
            />
          </div>

          {formState.type === "goal" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPenalty"
                checked={formState.isPenalty}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="isPenalty" className="text-sm font-normal">
                Penalty Goal
              </Label>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              placeholder="Add details about this highlight..."
              rows={3}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit">Add Highlight</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HighlightForm;
