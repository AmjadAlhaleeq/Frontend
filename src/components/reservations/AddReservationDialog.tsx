
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, Clock, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useReservation } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

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
  const [duration, setDuration] = useState("90");
  const [description, setDescription] = useState("");
  
  const { addReservation, pitches } = useReservation();
  const { toast } = useToast();
  
  const maxBookingDate = addDays(new Date(), 90); // 3 months ahead

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setDate(undefined);
        setTitle("");
        setPitchName("");
        setStartTime("");
        setDuration("90");
        setDescription("");
      }, 200);
    }
  }, [open]);

  // Time slots for the select dropdown
  const timeOptions = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", 
    "20:00", "21:00", "22:00"
  ];
  
  // Duration options
  const durationOptions = [
    { value: "60", label: "60 minutes" },
    { value: "90", label: "90 minutes" },
    { value: "120", label: "120 minutes" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date || !pitchName || !startTime || !duration) {
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
    
    // Calculate max players based on pitch format (players per side * 2 + substitutes)
    const playersPerSide = selectedPitch?.playersPerSide || 5;
    const totalMaxPlayers = playersPerSide * 2 + Math.min(4, Math.ceil(playersPerSide / 2));
    
    // Create the reservation data object
    const reservationData = {
      title: title,
      pitchName,
      pitchId: selectedPitch?.id || 0,
      date: format(date, 'yyyy-MM-dd'),
      time: `${startTime} - ${parseInt(duration)} mins`,
      startTime,
      duration: parseInt(duration),
      location: selectedPitch?.location || "",
      city: selectedPitch?.city || "",
      maxPlayers: selectedPitch ? playersPerSide * 2 : 10,
      price: selectedPitch?.price || 0,
      imageUrl: selectedPitch?.image || "",
      description: description,
      status: "upcoming",
      playersPerSide: selectedPitch?.playersPerSide || 5,
      actualMaxPlayers: totalMaxPlayers
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
          {/* Title Input - Now required */}
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
              onValueChange={(value) => {
                setPitchName(value);
                // Auto-populate the title if it's empty
                if (!title) {
                  setTitle(`Game at ${value}`);
                }
              }}
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
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today || date > maxBookingDate;
                  }}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              You can only book up to 3 months in advance.
            </p>
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
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Duration Select */}
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium">
              Duration*
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
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Description - Optional */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Add any additional details about the game..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-y min-h-[100px]"
            />
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
