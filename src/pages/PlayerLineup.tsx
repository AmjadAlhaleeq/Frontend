
import React, { useState } from "react";
import { Users, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";

const POSITION_NAMES = [
  "Goalkeeper", "Left Back", "Center Back", "Right Back",
  "Left Midfield", "Center Midfield", "Right Midfield",
  "Left Wing", "Striker", "Right Wing"
];

interface PlayerLineupProps {
  maxPlayers: number;
  currentPlayers: number;
  onSelect: (position: number, positionName: string) => void;
  onCancel: () => void;
  pickedPosition?: number | null;
  joinedPlayers?: (string | null)[];
}

const PlayerLineup: React.FC<PlayerLineupProps> = ({
  maxPlayers,
  currentPlayers,
  onSelect,
  onCancel,
  pickedPosition,
  joinedPlayers = []
}) => {
  // If a pickedPosition is passed (from dialog), use it, else null
  const [selectedPos, setSelectedPos] = useState<number | null>(pickedPosition ?? null);

  // Generate lineup based on maxPlayers, ensuring we don't exceed the array length
  const lineup = Array.from({ length: maxPlayers }, (_, i) => {
    // Make sure we don't go out of bounds
    return {
      slot: i + 1,
      name: i < POSITION_NAMES.length ? POSITION_NAMES[i] : `Player ${i + 1}`,
      assigned: joinedPlayers[i] || null
    };
  });

  // When props.pickedPosition changes (from parent dialog), update local state as well
  React.useEffect(() => {
    setSelectedPos(pickedPosition ?? null);
  }, [pickedPosition]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-400" />
        <span>
          Select your position (
          <span className="font-semibold">{currentPlayers}/{maxPlayers}</span>
          )
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        {lineup.map((pos, idx) => {
          const disabled = !!pos.assigned && pos.assigned !== "You";
          const isSelected = selectedPos === idx;
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => setSelectedPos(idx)}
              className={`flex flex-col items-center justify-center p-2 rounded border transition
              ${
                disabled
                  ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                  : isSelected
                  ? "bg-blue-100 border-blue-500 text-blue-700"
                  : "bg-white dark:bg-gray-800 hover:bg-blue-50 border-gray-300"
              }
              `}
            >
              <CircleDot className="h-6 w-6 mb-1" />
              <span className="text-xs whitespace-nowrap">{pos.name}</span>
              <span className="text-xs text-gray-400">#{idx + 1}</span>
              {pos.assigned && (
                <span className={`block text-xs mt-1 font-semibold ${
                  pos.assigned === "You" ? "text-green-600" : "text-blue-900"
                }`}>
                  {pos.assigned}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          disabled={selectedPos === null || (selectedPos !== null && !!lineup[selectedPos]?.assigned && lineup[selectedPos]?.assigned !== "You")}
          onClick={() =>
            selectedPos !== null && onSelect(selectedPos, lineup[selectedPos].name)
          }
        >
          Join as {selectedPos !== null && lineup[selectedPos] ? lineup[selectedPos].name : "Position"}
        </Button>
      </div>
    </div>
  );
};

export default PlayerLineup;
