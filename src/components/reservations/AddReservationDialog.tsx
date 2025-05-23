
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
import { format } from "date-fns";

/**
 * AddReservationDialog Component
 * Dialog for creating new game reservations
 */
const AddReservationDialog = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [pitchName, setPitchName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState<string>("90");
  const [maxPlayers, setMaxPlayers] = useState<string>("10");
  
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
        setMaxPlayers("10");
      }, 200);
    }
  }, [open]);

  // Duration options
  const durationOptions = [
    "60", "90", "120", "150", "180"
  ];

  // Start time options
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", 
    "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !title || !pitchName || !startTime || !duration || !maxPlayers) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
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
    
    // Format time to include duration
    const durationInMinutes = parseInt(duration);
    const endTimeHours = Math.floor(parseInt(startTime.split(':')[0]) + (durationInMinutes / 60));
    const endTimeMinutes = parseInt(startTime.split(':')[1] || "0") + (durationInMinutes % 60);
    const formattedEndTimeHours = String(endTimeHours + Math.floor(endTimeMinutes / 60)).padStart(2, '0');
    const formattedEndTimeMinutes = String(endTimeMinutes % 60).padStart(2, '0');
    const timeSlot = `${startTime} - ${formattedEndTimeHours}:${formattedEndTimeMinutes}`;
    
    // Create the reservation data object
    const reservationData = {
      title,
      pitchName,
      date: format(date, 'yyyy-MM-dd'),
      time: timeSlot,
      location: selectedPitch?.location,
      city: selectedPitch?.city,
      maxPlayers: parseInt(maxPlayers),
      price: selectedPitch?.price,
      imageUrl: selectedPitch?.image
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
          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title*
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter game title"
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
              required
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
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Start Time Select */}
          <div className="space-y-2">
            <label htmlFor="startTime" className="text-sm font-medium">
              Start Time*
            </label>
            <Select
              value={startTime}
              onValueChange={setStartTime}
              required
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
          
          {/* Duration Select */}
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium">
              Duration (minutes)*
            </label>
            <Select
              value={duration}
              onValueChange={setDuration}
              required
            >
              <SelectTrigger id="duration" className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Max Players Select */}
          <div className="space-y-2">
            <label htmlFor="maxPlayers" className="text-sm font-medium">
              Max Players*
            </label>
            <Select
              value={maxPlayers}
              onValueChange={setMaxPlayers}
              required
            >
              <SelectTrigger id="maxPlayers" className="w-full">
                <SelectValue placeholder="Select max players" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 players (2v2)</SelectItem>
                <SelectItem value="6">6 players (3v3)</SelectItem>
                <SelectItem value="8">8 players (4v4)</SelectItem>
                <SelectItem value="10">10 players (5v5)</SelectItem>
                <SelectItem value="12">12 players (6v6)</SelectItem>
                <SelectItem value="14">14 players (7v7)</SelectItem>
                <SelectItem value="22">22 players (11v11)</SelectItem>
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
