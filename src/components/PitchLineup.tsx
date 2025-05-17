import React from "react";

const POS_LAYOUT = [
  // 10 outfield positions + 1 keeper for up to 11
  // { row, col, label }
  { row: 5, col: 3, label: "GK" },
  { row: 4, col: 2, label: "LB" },
  { row: 4, col: 3, label: "CB" },
  { row: 4, col: 4, label: "RB" },
  { row: 3, col: 2, label: "LM" },
  { row: 3, col: 3, label: "CM" },
  { row: 3, col: 4, label: "RM" },
  { row: 2, col: 2, label: "LW" },
  { row: 2, col: 3, label: "ST" },
  { row: 2, col: 4, label: "RW" },
];

type Player = { name: string | null };

interface PitchLineupProps {
  maxPlayers: number;
  players: (string | null)[];
}

/**
 * Simple football pitch with named positions.
 * Unknown slots are shown as empty.
 */
const PitchLineup: React.FC<PitchLineupProps> = ({ maxPlayers, players }) => {
  // Build layout
  const lineup = Array.from({ length: maxPlayers }, (_, i) => ({
    label:
      POS_LAYOUT[i]?.label ||
      `#${i + 1}`,
    name: players[i] || null,
    slot: i,
    row: POS_LAYOUT[i]?.row || Math.floor(i / 5) + 1,
    col: POS_LAYOUT[i]?.col || ((i % 5) + 1),
  }));

  // Grid (6 rows x 5 cols)
  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative bg-bokit-500 rounded-lg w-full max-w-md aspect-[2/3] shadow border-4 border-bokit-700 overflow-hidden flex justify-center items-center select-none">
        {/* Pitch lines */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute bg-white/20 left-1/2 -translate-x-1/2 w-1 h-full" />
          <div className="absolute bg-white/20 top-1/3 left-0 w-full h-1" />
          <div className="absolute bg-white/20 bottom-1/3 left-0 w-full h-1" />
          <div className="absolute border-[3px] border-white/70 rounded-full" style={{ width: '80px', height: '80px', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
        </div>
        {/* Position slots */}
        <div className="relative w-full h-full grid grid-rows-6 grid-cols-5 gap-1 z-10 px-2 py-3">
          {lineup.map((pos, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center"
              style={{ gridRow: pos.row, gridColumn: pos.col }}
            >
              <div className={`rounded-full bg-white border-2 border-bokit-500 w-10 h-10 flex items-center justify-center shadow
                ${pos.name ? "bg-bokit-100" : "bg-gray-200 opacity-60"}
              `}>
                <span className="text-xs font-bold text-bokit-800">{pos.label}</span>
              </div>
              <span className="text-[11px] text-center mt-1 text-bokit-900 font-medium" style={{ minWidth: 44 }}>
                {pos.name || <span className="italic text-gray-400">Empty</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-3">
        <span className="font-semibold">{players.filter(Boolean).length}</span> of <span className="font-semibold">{maxPlayers}</span> spots filled
      </div>
    </div>
  );
};

export default PitchLineup;
