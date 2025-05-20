import React from "react";
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
import { X, Award, Goal, Star, Zap } from "lucide-react"; // Replace Whistle and Football with appropriate icons

interface HighlightFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const HighlightForm: React.FC<HighlightFormProps> = ({ onClose, onSubmit }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Add Highlight</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = {
            type: formData.get("type"),
            minute: formData.get("minute"),
            playerId: formData.get("playerId"),
            description: formData.get("description"),
            isPenalty: formData.get("isPenalty"),
          };
          onSubmit(data);
          onClose();
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="type">Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a highlight type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goal">
                <Goal className="mr-2 h-4 w-4" />
                Goal
              </SelectItem>
              <SelectItem value="assist">
                <Zap className="mr-2 h-4 w-4" />
                Assist
              </SelectItem>
              <SelectItem value="yellowCard">
                <Award className="mr-2 h-4 w-4" />
                Yellow Card
              </SelectItem>
              <SelectItem value="redCard">
                <Star className="mr-2 h-4 w-4" />
                Red Card
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="minute">Minute</Label>
          <Input type="number" id="minute" placeholder="Enter minute" />
        </div>
        <div>
          <Label htmlFor="playerId">Player ID</Label>
          <Input type="text" id="playerId" placeholder="Enter player ID" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input type="text" id="description" placeholder="Enter description" />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="isPenalty" />
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
