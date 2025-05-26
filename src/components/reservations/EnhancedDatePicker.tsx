
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

interface EnhancedDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  hasReservations: (date: Date) => boolean;
}

const EnhancedDatePicker: React.FC<EnhancedDatePickerProps> = ({
  date,
  onDateChange,
  hasReservations,
}) => {
  const modifiers = {
    hasReservations: (day: Date) => hasReservations(day),
  };

  const modifiersStyles = {
    hasReservations: {
      backgroundColor: '#059669',
      color: 'white',
      fontWeight: 'bold',
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
        />
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded bg-emerald-600"></div>
            <span>Has games</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDatePicker;
