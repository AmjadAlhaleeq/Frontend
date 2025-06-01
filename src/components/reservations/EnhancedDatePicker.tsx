
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
  const minBookingDate = addDays(today, 4); // 5 days from today

  const isDateDisabled = (checkDate: Date) => {
    // Admin can view all dates, players can only view future dates
    if (userRole === "admin") {
      return false; // Admin can see all dates
    }
    return checkDate < minBookingDate;
  };

  const modifiers = {
    hasReservations: (day: Date) => hasReservations(day),
    disabled: isDateDisabled,
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
          fromDate={userRole === "admin" ? undefined : minBookingDate}
        />
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <div className="w-3 h-3 rounded bg-emerald-600"></div>
            <span>Has games</span>
          </div>
          {userRole !== "admin" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded bg-gray-300"></div>
              <span>Booking not allowed (min 5 days advance)</span>
            </div>
          )}
          {userRole === "admin" && (
            <div className="text-xs text-teal-600 font-medium">
              Admin: View all dates including past games
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDatePicker;
