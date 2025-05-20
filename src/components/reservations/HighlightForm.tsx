import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Award,
  Star,
  ArrowRight,
  Zap
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Highlight, HighlightType } from "@/context/ReservationContext";

// Define a Goal component since it's not available in lucide-react
const Goal = (props) => (
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

interface HighlightFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose: () => void;
  onSubmit: (data: Highlight) => void;
  reservationId?: number; // Optional prop for reservation ID
}

const HighlightForm: React.FC<HighlightFormProps> = ({
  open,
  onOpenChange,
  onClose,
  onSubmit,
  reservationId
}) => {
  const [highlightType, setHighlightType] = useState<HighlightType>("goal");
  const [minute, setMinute] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isPenalty, setIsPenalty] = useState<boolean>(false);
  const [assistPlayerId, setAssistPlayerId] = useState<string>("");
  const [showAssist, setShowAssist] = useState<boolean>(false);

  const handleTypeChange = (value: HighlightType) => {
    setHighlightType(value);
    // Show assist field only for goals
    setShowAssist(value === "goal");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Highlight = {
      id: `temp-${Date.now()}`, // Temporary ID that will be replaced by the server
      type: highlightType,
      minute: parseInt(minute),
      playerId,
      description,
      isPenalty,
      assistPlayerId: showAssist ? assistPlayerId : undefined,
      reservationId,
      timestamp: new Date().toISOString(),
    };
    onSubmit(data);
    resetForm();
  };

  const resetForm = () => {
    setHighlightType("goal");
    setMinute("");
    setPlayerId("");
    setDescription("");
    setIsPenalty(false);
    setAssistPlayerId("");
    setShowAssist(false);
  };

  const content = (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Add Highlight</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={highlightType} onValueChange={handleTypeChange}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select a highlight type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goal">
                <div className="flex items-center">
                  <Goal className="mr-2 h-4 w-4 text-green-500" />
                  <span>Goal</span>
                </div>
              </SelectItem>
              <SelectItem value="assist">
                <div className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Assist</span>
                </div>
              </SelectItem>
              <SelectItem value="yellowCard">
                <div className="flex items-center">
                  <Award className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>Yellow Card</span>
                </div>
              </SelectItem>
              <SelectItem value="redCard">
                <div className="flex items-center">
                  <Star className="mr-2 h-4 w-4 text-red-500" />
                  <span>Red Card</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="minute">Minute</Label>
          <Input 
            type="number" 
            id="minute" 
            placeholder="Enter minute" 
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            min="0"
            max="120"
          />
        </div>
        <div>
          <Label htmlFor="playerId">Player ID</Label>
          <Input 
            type="text" 
            id="playerId" 
            placeholder="Enter player ID" 
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
          />
        </div>
        
        {showAssist && (
          <div>
            <Label htmlFor="assistPlayerId">Assisted By</Label>
            <Input 
              type="text" 
              id="assistPlayerId" 
              placeholder="Enter assist player ID" 
              value={assistPlayerId}
              onChange={(e) => setAssistPlayerId(e.target.value)}
            />
          </div>
        )}
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Input 
            type="text" 
            id="description" 
            placeholder="Enter description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isPenalty" 
            checked={isPenalty}
            onCheckedChange={(checked) => setIsPenalty(checked === true)}
          />
          <Label htmlFor="isPenalty">Is Penalty</Label>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Add Highlight</Button>
        </div>
      </form>
    </div>
  );

  // If open prop is provided, render using Dialog, otherwise render directly
  if (open !== undefined && onOpenChange !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Highlight</h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={highlightType} onValueChange={handleTypeChange}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select a highlight type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goal">
                      <div className="flex items-center">
                        <Goal className="mr-2 h-4 w-4 text-green-500" />
                        <span>Goal</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="assist">
                      <div className="flex items-center">
                        <Zap className="mr-2 h-4 w-4 text-blue-500" />
                        <span>Assist</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="yellowCard">
                      <div className="flex items-center">
                        <Award className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>Yellow Card</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="redCard">
                      <div className="flex items-center">
                        <Star className="mr-2 h-4 w-4 text-red-500" />
                        <span>Red Card</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="minute">Minute</Label>
                <Input 
                  type="number" 
                  id="minute" 
                  placeholder="Enter minute" 
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  min="0"
                  max="120"
                />
              </div>
              <div>
                <Label htmlFor="playerId">Player ID</Label>
                <Input 
                  type="text" 
                  id="playerId" 
                  placeholder="Enter player ID" 
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                />
              </div>
              
              {showAssist && (
                <div>
                  <Label htmlFor="assistPlayerId">Assisted By</Label>
                  <Input 
                    type="text" 
                    id="assistPlayerId" 
                    placeholder="Enter assist player ID" 
                    value={assistPlayerId}
                    onChange={(e) => setAssistPlayerId(e.target.value)}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input 
                  type="text" 
                  id="description" 
                  placeholder="Enter description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isPenalty" 
                  checked={isPenalty}
                  onCheckedChange={(checked) => setIsPenalty(checked === true)}
                />
                <Label htmlFor="isPenalty">Is Penalty</Label>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Add Highlight</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise, render the content directly
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Add Highlight</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={highlightType} onValueChange={handleTypeChange}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select a highlight type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goal">
                <div className="flex items-center">
                  <Goal className="mr-2 h-4 w-4 text-green-500" />
                  <span>Goal</span>
                </div>
              </SelectItem>
              <SelectItem value="assist">
                <div className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Assist</span>
                </div>
              </SelectItem>
              <SelectItem value="yellowCard">
                <div className="flex items-center">
                  <Award className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>Yellow Card</span>
                </div>
              </SelectItem>
              <SelectItem value="redCard">
                <div className="flex items-center">
                  <Star className="mr-2 h-4 w-4 text-red-500" />
                  <span>Red Card</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="minute">Minute</Label>
          <Input 
            type="number" 
            id="minute" 
            placeholder="Enter minute" 
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            min="0"
            max="120"
          />
        </div>
        <div>
          <Label htmlFor="playerId">Player ID</Label>
          <Input 
            type="text" 
            id="playerId" 
            placeholder="Enter player ID" 
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
          />
        </div>
        
        {showAssist && (
          <div>
            <Label htmlFor="assistPlayerId">Assisted By</Label>
            <Input 
              type="text" 
              id="assistPlayerId" 
              placeholder="Enter assist player ID" 
              value={assistPlayerId}
              onChange={(e) => setAssistPlayerId(e.target.value)}
            />
          </div>
        )}
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Input 
            type="text" 
            id="description" 
            placeholder="Enter description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isPenalty" 
            checked={isPenalty}
            onCheckedChange={(checked) => setIsPenalty(checked === true)}
          />
          <Label htmlFor="isPenalty">Is Penalty</Label>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Add Highlight</Button>
        </div>
      </form>
    </div>
  );
};

export default HighlightForm;
