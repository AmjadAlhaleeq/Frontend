
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Calendar as CalendarIcon, Check, Clock, DollarSign, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useReservation } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

/**
 * AddReservationDialog Component
 * Dialog for creating new game reservations with comprehensive fields including max players control
 */
const AddReservationDialog = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [pitchName, setPitchName] = useState("");
  const [time, setTime] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<number>(12);
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { addReservation, pitches } = useReservation();
  const { toast } = useToast();

  // Get user role to determine max players limit
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "admin";

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setDate(undefined);
        setTitle("");
        setPitchName("");
        setTime("");
        setMaxPlayers(12);
        setPrice("");
      }, 200);
    }
  }, [open]);

  // Update maxPlayers when pitch changes - minimum 5 per side (10 players + 2 subs)
  useEffect(() => {
    if (pitchName) {
      const selectedPitch = pitches.find(p => p.name === pitchName);
      if (selectedPitch) {
        // Ensure minimum 5 players per side
        const playersPerSide = Math.max(selectedPitch.playersPerSide, 5);
        setMaxPlayers(playersPerSide * 2 + 2);
      }
    }
  }, [pitchName, pitches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title || !date || !pitchName || !time || !price) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate max players range
    if (maxPlayers < 6 || maxPlayers > 30) {
      toast({
        title: "Invalid Max Players",
        description: "Max players must be between 6 and 30.",
        variant: "destructive"
      });
      return;
    }

    // Validate time format (HH:MM or HH:MM-HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](\s*-\s*([0-1]?[0-9]|2[0-3]):[0-5][0-9])?$/;
    if (!timeRegex.test(time)) {
      toast({
        title: "Invalid Time Format",
        description: "Please use format HH:MM or HH:MM-HH:MM (e.g., 14:00 or 14:00-16:00)",
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
    
    setIsLoading(true);
    
    // Create the reservation data object with all required fields
    const reservationData = {
      pitchId: selectedPitch?._id || `pitch_${Date.now()}`,
      title,
      pitchName,
      date: format(date, 'yyyy-MM-dd'),
      time: time,
      startTime: time.split('-')[0]?.trim() || time,
      endTime: time.split('-')[1]?.trim() || time,
      duration: 90, // Default duration
      location: selectedPitch?.location || "",
      city: selectedPitch?.city || "",
      maxPlayers: maxPlayers,
      price: parseFloat(price) || 0,
      imageUrl: selectedPitch?.images?.[0] || selectedPitch?.backgroundImage || "/football-pitch-bg.jpg",
      additionalImages: selectedPitch?.images || [],
      status: "upcoming" as const,
      createdBy: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).id : 'admin',
      playersJoined: 0,
      lineup: [],
      waitingList: [],
    };
    
    // Add the reservation
    try {
      addReservation(reservationData);
      toast({
        title: "Success!",
        description: "Reservation created successfully.",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "A reservation for this pitch at this time already exists or the pitch doesn't exist.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title Input - Required */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Game Title* (Required)
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Friday Night Game"
              required
            />
          </div>

          {/* Pitch Name Select */}
          <div className="space-y-2">
            <label htmlFor="pitchName" className="text-sm font-medium">
              Pitch*
            </label>
            <Select value={pitchName} onValueChange={setPitchName}>
              <SelectTrigger id="pitchName" className="w-full">
                <SelectValue placeholder="Select a pitch" />
              </SelectTrigger>
              <SelectContent>
                {pitches.map((pitch) => (
                  <SelectItem key={pitch._id} value={pitch.name}>
                    {pitch.name} ({Math.max(pitch.playersPerSide, 5)}v{Math.max(pitch.playersPerSide, 5)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Picker - No restrictions */}
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
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Manual Time Input */}
          <div className="space-y-2">
            <label htmlFor="time" className="text-sm font-medium">
              Time* (Required)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 14:00 or 14:00-16:00"
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Format: HH:MM (e.g., 14:00) or HH:MM-HH:MM (e.g., 14:00-16:00)
            </p>
          </div>

          {/* Max Players Input with Admin Control */}
          <div className="space-y-2">
            <label htmlFor="maxPlayers" className="text-sm font-medium">
              Max Players* (Required)
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="maxPlayers"
                type="number"
                min="6"
                max={isAdmin ? "30" : "22"}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 12)}
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {isAdmin 
                ? "Admin can set up to 30 players (minimum 6)" 
                : "Regular limit is 22 players (minimum 6)"}
            </p>
          </div>

          {/* Price Input */}
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              Price* (Per Player)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25.00"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Reservation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReservationDialog;
