
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Calendar as CalendarIcon, Check, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useReservation } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

/**
 * AddReservationDialog Component
 * Dialog for creating new game reservations with simplified fields
 */
const AddReservationDialog = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [pitchName, setPitchName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("90"); // Default 90 minutes
  const [maxPlayers, setMaxPlayers] = useState<number | null>(null);
  
  const { addReservation, pitches } = useReservation();
  const { toast } = useToast();

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setDate(undefined);
        setTitle("");
        setPitchName("");
        setStartTime("");
        setDuration("90");
        setMaxPlayers(null);
      }, 200);
    }
  }, [open]);

  // Update maxPlayers when pitch changes - add 2 players for substitutes
  useEffect(() => {
    if (pitchName) {
      const selectedPitch = pitches.find(p => p.name === pitchName);
      if (selectedPitch) {
        // Calculate max players: (playersPerSide * 2) + 2 subs
        setMaxPlayers(selectedPitch.playersPerSide * 2 + 2);
      }
    }
  }, [pitchName, pitches]);

  // Time slots for the start time select dropdown
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  // Duration options in minutes
  const durationOptions = [
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
  ];

  // Validate date - cannot book more than 3 days in advance
  const isDateInvalid = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxDate = addDays(today, 3);
    
    return date > maxDate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title || !date || !pitchName || !startTime || !duration) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields (title and start time are required).",
        variant: "destructive"
      });
      return;
    }
    
    // Find the selected pitch to get additional details
    const selectedPitch = pitches.find(p => p.name === pitchName);
    if (!selectedPitch && pitchName) {
      toast({
        title: "Invalid Pitch",
        description: "The selected pitch does not exist.",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate end time
    const durationMinutes = parseInt(duration);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    
    const endTimeDate = new Date();
    endTimeDate.setHours(startHour);
    endTimeDate.setMinutes(startMinute + durationMinutes);
    
    const endTime = `${endTimeDate.getHours().toString().padStart(2, '0')}:${endTimeDate.getMinutes().toString().padStart(2, '0')}`;
    
    // Format time range
    const timeRange = `${startTime} - ${endTime}`;
    
    // Create the reservation data object
    const reservationData = {
      title,
      pitchName,
      date: format(date, 'yyyy-MM-dd'),
      time: timeRange,
      startTime,
      duration: durationMinutes,
      location: selectedPitch?.location || "",
      city: selectedPitch?.city || "",
      maxPlayers: maxPlayers || (selectedPitch?.playersPerSide ? selectedPitch.playersPerSide * 2 + 2 : 12),
      price: selectedPitch?.price || 0,
      imageUrl: selectedPitch?.image,
      additionalImages: selectedPitch?.additionalImages || [],
    };
    
    // Add the reservation
    const newReservation = addReservation(reservationData);
    
    if (newReservation) {
      toast({
        title: "Success!",
        description: "Reservation created successfully.",
      });
      setOpen(false);
    } else {
      toast({
        title: "Error",
        description: "A reservation for this pitch at this time already exists or the pitch doesn't exist.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Reservation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Reservation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title Input - Required */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title* (Required)
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Game title"
              required
            />
          </div>

          {/* Pitch Name Select */}
          <div className="space-y-2">
            <label htmlFor="pitchName" className="text-sm font-medium">
              Pitch*
            </label>
            <Select
              value={pitchName}
              onValueChange={setPitchName}
            >
              <SelectTrigger id="pitchName" className="w-full">
                <SelectValue placeholder="Select a pitch" />
              </SelectTrigger>
              <SelectContent>
                {pitches.map((pitch) => (
                  <SelectItem key={pitch.id} value={pitch.name}>
                    {pitch.name} ({pitch.playersPerSide}v{pitch.playersPerSide})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date*</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today || isDateInvalid(date);
                  }}
                  className="pointer-events-auto"
                />
                <div className="p-3 border-t text-xs text-muted-foreground">
                  You can only book up to 3 days in advance.
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Start Time Select - Required */}
          <div className="space-y-2">
            <label htmlFor="startTime" className="text-sm font-medium">
              Start Time* (Required)
            </label>
            <Select
              value={startTime}
              onValueChange={setStartTime}
            >
              <SelectTrigger id="startTime" className="w-full">
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {slot}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Duration Select - Replaces time slot */}
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium">
              Duration*
            </label>
            <Select
              value={duration}
              onValueChange={setDuration}
            >
              <SelectTrigger id="duration" className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Create Reservation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReservationDialog;
