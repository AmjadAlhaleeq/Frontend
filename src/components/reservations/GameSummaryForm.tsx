
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface GameSummaryFormProps {
  summary: string;
  onSummaryChange: (summary: string) => void;
}

const GameSummaryForm: React.FC<GameSummaryFormProps> = ({
  summary,
  onSummaryChange
}) => {
  return (
    <div>
      <Label htmlFor="summary">Game Summary</Label>
      <Textarea
        id="summary"
        placeholder="Describe the game highlights, final score, key moments..."
        value={summary}
        onChange={(e) => onSummaryChange(e.target.value)}
        className="min-h-[200px]"
      />
    </div>
  );
};

export default GameSummaryForm;
