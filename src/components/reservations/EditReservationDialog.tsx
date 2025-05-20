
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Users, Banknote, Image } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useReservation, Reservation, Highlight } from "@/context/ReservationContext";
import { Textarea } from "@/components/ui/textarea";
import HighlightForm from "./HighlightForm";

interface EditReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation;
}

const EditReservationDialog: React.FC<EditReservationDialogProps> = ({
  open,
  onOpenChange,
  reservation,
}) => {
  const { toast } = useToast();
  const { updateReservation } = useReservation();
  const [date, setDate] = useState<Date | undefined>();
  const [formState, setFormState] = useState({
    pitchName: reservation.pitchName,
    date: reservation.date,
    time: reservation.time,
    location: reservation.location,
    maxPlayers: reservation.maxPlayers,
    price: reservation.price,
    imageUrl: reservation.imageUrl || "",
    highlights: reservation.highlights || [],
  });

  const [isAddHighlightOpen, setIsAddHighlightOpen] = useState(false);

  useEffect(() => {
    // Parse the date string from reservation
    try {
      const parsedDate = parse(reservation.date, "yyyy-MM-dd", new Date());
      setDate(parsedDate);
    } catch (error) {
      console.error("Error parsing date:", error);
      setDate(new Date());
    }

    // Update form state when reservation changes
    setFormState({
      pitchName: reservation.pitchName,
      date: reservation.date,
      time: reservation.time,
      location: reservation.location,
      maxPlayers: reservation.maxPlayers,
      price: reservation.price,
      imageUrl: reservation.imageUrl || "",
      highlights: reservation.highlights || [],
    });
  }, [reservation]);

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
    
    const updatedReservation = {
      ...reservation,
      pitchName: formState.pitchName,
      date: formState.date,
      time: formState.time,
      location: formState.location,
      price: formState.price,
      maxPlayers: formState.maxPlayers,
      imageUrl: formState.imageUrl,
      highlights: formState.highlights,
    };
    
    updateReservation(updatedReservation);
    onOpenChange(false);
    toast({
      title: "Reservation Updated",
      description: `Your reservation for ${formState.pitchName} has been updated.`,
    });
  };

  const handleAddHighlight = (highlight: Highlight) => {
    setFormState((prev) => ({
      ...prev,
      highlights: [...prev.highlights, highlight],
    }));
    setIsAddHighlightOpen(false);
    toast({
      title: "Highlight Added",
      description: `A new highlight has been added.`,
    });
  };

  const handleDeleteHighlight = (highlightId: string) => {
    setFormState((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((h) => h.id !== highlightId),
    }));
    toast({
      title: "Highlight Deleted",
      description: "The highlight has been removed.",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic reservation details */}
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

            {/* Date picker */}
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

            {/* Time input */}
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

            {/* Location */}
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

            {/* Players and Price */}
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="price">Price</Label>
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
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
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

            {/* Highlights section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Game Highlights</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddHighlightOpen(true)}
                >
                  Add Highlight
                </Button>
              </div>
              
              {formState.highlights.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md">
                  No highlights recorded yet
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {formState.highlights.map((highlight) => (
                    <div 
                      key={highlight.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div>
                        <div className="font-medium">{highlight.type.charAt(0).toUpperCase() + highlight.type.slice(1)}</div>
                        <div className="text-sm text-gray-600">
                          {highlight.playerId} {highlight.minute}' - {highlight.description}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHighlight(highlight.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-4">
              <Button type="submit">Update Reservation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add highlight form dialog */}
      <HighlightForm 
        open={isAddHighlightOpen}
        onOpenChange={setIsAddHighlightOpen}
        onSubmit={handleAddHighlight}
        reservationId={reservation.id}
      />
    </>
  );
};

export default EditReservationDialog;
