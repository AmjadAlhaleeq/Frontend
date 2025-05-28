
import React from "react";
import { Plus } from "lucide-react";

interface ReservationsEnhancedHeaderProps {
  userRole: "admin" | "player" | null;
}

const ReservationsEnhancedHeader: React.FC<ReservationsEnhancedHeaderProps> = ({
  userRole,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-400">
        Football Reservations
      </h1>
      {userRole === "admin" && (
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create Reservation
        </button>
      )}
    </div>
  );
};

export default ReservationsEnhancedHeader;
