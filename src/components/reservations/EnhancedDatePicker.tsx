
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EnhancedDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  hasReservations?: (date: Date) => boolean;
}

const EnhancedDatePicker = ({ date, onDateChange, hasReservations }: EnhancedDatePickerProps) => {
  // Generate quick access dates
  const today = new Date();
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const quickDates = [
    { label: "Today", date: today, icon: <CalendarIcon className="w-4 h-4 mr-2" /> },
    { label: "Tomorrow", date: tomorrow, icon: <ChevronRight className="w-4 h-4 mr-2" /> },
    { label: "Next Week", date: nextWeek, icon: <ChevronRight className="w-4 h-4 mr-2 rotate-45" /> },
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-[#0F766E] to-[#0d6d66] text-white p-4">
          <h3 className="text-lg font-semibold flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Select Date
          </h3>
          <p className="text-sm opacity-90">Choose when you want to play</p>
        </div>
        
        <div className="p-4 grid grid-cols-3 gap-2">
          {quickDates.map((quickDate, index) => (
            <Button
              key={index}
              variant={date && format(date, 'yyyy-MM-dd') === format(quickDate.date, 'yyyy-MM-dd') 
                ? "default" 
                : "outline"}
              className={cn(
                "h-auto py-3 justify-start",
                date && format(date, 'yyyy-MM-dd') === format(quickDate.date, 'yyyy-MM-dd') 
                  ? "bg-[#0F766E] hover:bg-[#0d6d66]" 
                  : "hover:bg-[#ecfdf5] hover:text-[#0F766E]"
              )}
              onClick={() => onDateChange(quickDate.date)}
            >
              <div className="flex flex-col items-start">
                <span className="flex items-center text-sm font-medium">
                  {quickDate.icon}
                  {quickDate.label}
                </span>
                <span className="text-xs mt-1 opacity-80">
                  {format(quickDate.date, 'MMM d')}
                </span>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="px-4 pb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between border border-dashed",
                  !date && "text-muted-foreground"
                )}
              >
                <span className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick another date"}
                </span>
                {date && hasReservations && hasReservations(date) && (
                  <Badge variant="outline" className="bg-[#ecfdf5] text-[#0F766E] border-[#d1fae5]">
                    Has games
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateChange}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDatePicker;
