
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MaxPlayersSelectorProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const MaxPlayersSelector: React.FC<MaxPlayersSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const playerOptions = Array.from({ length: 13 }, (_, i) => i + 10); // 10-22 players

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="maxPlayers">Maximum Players</Label>
      <Select value={value.toString()} onValueChange={(val) => onChange(parseInt(val))}>
        <SelectTrigger id="maxPlayers">
          <SelectValue placeholder="Select max players" />
        </SelectTrigger>
        <SelectContent>
          {playerOptions.map((num) => (
            <SelectItem key={num} value={num.toString()}>
              {num} players
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MaxPlayersSelector;
