
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { addDays, isSameDay } from "date-fns";

interface EnhancedDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  hasReservations: (date: Date) => boolean;
  userRole?: "admin" | "player" | null;
}

const EnhancedDatePicker: React.FC<EnhancedDatePickerProps> = ({
  date,
  onDateChange,
  hasReservations,
  userRole,
}) => {
  const today = new Date();
  const minBookingDate = addDays(today, 4); // 5 days from today for new bookings

  // Allow all users to view past dates, only restrict booking new games
  const isDateDisabled = (checkDate: Date) => {
    // No dates are disabled for viewing - all users can see past and future games
    return false;
  };

  const modifiers = {
    hasReservations: (day: Date) => hasReservations(day),
    disabled: isDateDisabled,
    pastDate: (day: Date) => day < today && !isSameDay(day, today),
  };

  const modifiersStyles = {
    hasReservations: {
      backgroundColor: "#0f766e",
      color: "white",
      fontWeight: "bold",
    },
    disabled: {
      color: "#d1d5db",
      backgroundColor: "#f3f4f6",
      cursor: "not-allowed",
    },
    pastDate: {
      color: "#6b7280",
    },
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-teal-600 dark:text-teal-400 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Select Date
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          className="rounded-md border-0"
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          disabled={isDateDisabled}
        />
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <div className="w-3 h-3 rounded bg-emerald-600"></div>
            <span>Has games</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <div className="w-3 h-3 rounded bg-gray-500"></div>
            <span>Past dates</span>
          </div>
          <div className="text-xs text-teal-600 font-medium">
            {userRole === "admin" 
              ? "Admin: View and manage all games" 
              : "View all games - past and upcoming"}
          </div>
          {userRole !== "admin" && (
            <div className="text-xs text-gray-500 mt-1">
              Note: New bookings require 5 days advance notice
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDatePicker;
