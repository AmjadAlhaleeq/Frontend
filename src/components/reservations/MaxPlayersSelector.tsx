
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";

interface MaxPlayersSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const MaxPlayersSelector: React.FC<MaxPlayersSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const playerOptions = [
    { value: 10, label: "10 Players (5v5)" },
    { value: 12, label: "12 Players (6v6)" },
    { value: 14, label: "14 Players (7v7)" },
    { value: 16, label: "16 Players (8v8)" },
    { value: 18, label: "18 Players (9v9)" },
    { value: 20, label: "20 Players (10v10)" },
    { value: 22, label: "22 Players (11v11)" },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="maxPlayers" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        Maximum Players
      </Label>
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select max players" />
        </SelectTrigger>
        <SelectContent>
          {playerOptions.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Choose the maximum number of players for this game
      </p>
    </div>
  );
};

export default MaxPlayersSelector;
