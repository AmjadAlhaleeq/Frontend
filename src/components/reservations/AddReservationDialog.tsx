import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Users, Banknote, Image } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useReservation, Reservation } from "@/context/ReservationContext";

export interface AddReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddReservationDialog: React.FC<AddReservationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { addReservation } = useReservation();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formState, setFormState] = useState({
    pitchName: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "18:00",
    location: "",
    maxPlayers: 10,
    price: 0,
    imageUrl: "",
  });

  // Handle dialog state
  const handleOpenChange = (newOpenState: boolean) => {
    setDialogOpen(newOpenState);
    onOpenChange(newOpenState);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === "maxPlayers" || name === "price" ? Number(value) : value,
    }));
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setFormState((prev) => ({
        ...prev,
        date: format(newDate, "yyyy-MM-dd"),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReservation: Partial<Reservation> = {
      pitchName: formState.pitchName,
      date: formState.date,
      time: formState.time,
      location: formState.location,
      price: formState.price,
      maxPlayers: formState.maxPlayers,
      imageUrl: formState.imageUrl,
      status: 'open',
      playersJoined: 0,
      waitingList: [],
      lineup: []
    };
    
    addReservation(newReservation);
    handleOpenChange(false);
    toast({
      title: "Reservation Created",
      description: `Your reservation for ${formState.pitchName} on ${formState.date} at ${formState.time} has been created.`,
    });
  };

  return (
    <>
      <Button 
        onClick={() => handleOpenChange(true)}
        className="bg-teal-600 hover:bg-teal-700 text-white"
      >
        Add Reservation
      </Button>

      <Dialog open={open || dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Reservation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pitchName">Pitch Name</Label>
              <div className="relative">
                <Input
                  id="pitchName"
                  name="pitchName"
                  value={formState.pitchName}
                  onChange={handleInputChange}
                  placeholder="Enter pitch name"
                  className="pl-10"
                  required
                />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal pl-10",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formState.time}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <Input
                  id="location"
                  name="location"
                  value={formState.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  className="pl-10"
                  required
                />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Maximum Players</Label>
              <div className="relative">
                <Input
                  id="maxPlayers"
                  name="maxPlayers"
                  type="number"
                  value={formState.maxPlayers}
                  onChange={handleInputChange}
                  min={2}
                  max={22}
                  className="pl-10"
                  required
                />
                <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (optional)</Label>
              <div className="relative">
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formState.price}
                  onChange={handleInputChange}
                  min={0}
                  placeholder="0"
                  className="pl-10"
                />
                <Banknote className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <div className="relative">
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formState.imageUrl}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                  className="pl-10"
                />
                <Image className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">Create Reservation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddReservationDialog;
