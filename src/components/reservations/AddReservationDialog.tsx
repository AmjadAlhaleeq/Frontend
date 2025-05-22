
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
  const [time, setTime] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<string>("10");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  
  const { addReservation, pitches } = useReservation();
  const { toast } = useToast();

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setDate(undefined);
        setTitle("");
        setPitchName("");
        setTime("");
        setMaxPlayers("10");
        setLocation("");
        setCity("");
        setPrice("");
        setDescription("");
      }, 200);
    }
  }, [open]);

  // Time slots for the select dropdown
  const timeSlots = [
    "08:00 - 09:30", "09:30 - 11:00", "11:00 - 12:30",
    "12:30 - 14:00", "14:00 - 15:30", "15:30 - 17:00",
    "17:00 - 18:30", "18:30 - 20:00", "20:00 - 21:30",
    "21:30 - 23:00"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !pitchName || !time || !maxPlayers) {
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
    
    // Create the reservation data object
    const reservationData = {
      title: title || `${pitchName} Game`,
      pitchName,
      date: format(date, 'yyyy-MM-dd'),
      time,
      location: location || selectedPitch?.location,
      city: city || selectedPitch?.city,
      maxPlayers: parseInt(maxPlayers),
      price: price ? parseFloat(price) : selectedPitch?.price,
      imageUrl: selectedPitch?.image,
      description: description // Pass description to the context
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
              Title (optional)
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Game title (defaults to pitch name if empty)"
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
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Time Select */}
          <div className="space-y-2">
            <label htmlFor="time" className="text-sm font-medium">
              Time Slot*
            </label>
            <Select
              value={time}
              onValueChange={setTime}
            >
              <SelectTrigger id="time" className="w-full">
                <SelectValue placeholder="Select a time" />
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
          
          {/* Max Players Select */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="maxPlayers" className="text-sm font-medium">
                Game Format*
              </label>
              <Select
                value={maxPlayers}
                onValueChange={setMaxPlayers}
              >
                <SelectTrigger id="maxPlayers" className="w-full">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">2v2</SelectItem>
                  <SelectItem value="6">3v3</SelectItem>
                  <SelectItem value="8">4v4</SelectItem>
                  <SelectItem value="10">5v5</SelectItem>
                  <SelectItem value="12">6v6</SelectItem>
                  <SelectItem value="14">7v7</SelectItem>
                  <SelectItem value="22">11v11</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Price Input - Optional */}
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price Per Player
              </label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          
          {/* Location Information - Optional */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">
                City
              </label>
              <Input
                id="city"
                placeholder="e.g., New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                From pitch if empty
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                placeholder="e.g., Central Park"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                From pitch if empty
              </p>
            </div>
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
