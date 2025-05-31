import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Plus } from "lucide-react";
import { format, addDays } from "date-fns";
import { useReservation } from "@/context/ReservationContext";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

// Enhanced schema with start time, end time, and max players
const formSchema = z.object({
  pitchName: z.string().min(2, "Pitch name must be at least 2 characters"),
  date: z
    .date({
      required_error: "Please select a date",
    })
    .refine((date) => {
      const minDate = addDays(new Date(), 5);
      return date >= minDate;
    }, "Date must be at least 5 days from today"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  maxPlayers: z.coerce
    .number()
    .min(12, "Minimum 12 players required")
    .max(30, "Maximum 30 players allowed"),
});

interface EnhancedAddReservationDialogProps {
  children?: React.ReactNode;
}

const EnhancedAddReservationDialog: React.FC<
  EnhancedAddReservationDialogProps
> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { addReservation, pitches } = useReservation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pitchName: "",
      location: "",
      startTime: "",
      endTime: "",
      maxPlayers: 10,
    },
  });

  const validateTimeRange = (startTime: string, endTime: string): boolean => {
    if (!startTime || !endTime) return false;

    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    return end > start;
  };

  const onSubmit = useCallback(
    (data: z.infer<typeof formSchema>) => {
      // Validate time range
      if (!validateTimeRange(data.startTime, data.endTime)) {
        toast({
          title: "Invalid Time Range",
          description: "End time must be after start time",
          variant: "destructive",
        });
        return;
      }

      const selectedPitch = pitches.find((p) => p.name === data.pitchName);

      const reservationData = {
        pitchId:
          selectedPitch?._id || selectedPitch?.id || `pitch_${Date.now()}`,
        pitchName: data.pitchName,
        date: format(data.date, "yyyy-MM-dd"),
        startTime: data.startTime,
        endTime: data.endTime,
        duration: 120, // Default 2 hours
        time: `${data.startTime} - ${data.endTime}`, // For backward compatibility
        location: data.location,
        city: selectedPitch?.city || "Unknown",
        maxPlayers: data.maxPlayers,
        status: "upcoming" as const,
        title: `Game at ${data.pitchName}`,
        playersJoined: 0,
        lineup: [],
        waitingList: [],
        createdBy: localStorage.getItem("currentUser")
          ? JSON.parse(localStorage.getItem("currentUser")!).id
          : "admin",
        imageUrl:
          selectedPitch?.images?.[0] ||
          selectedPitch?.backgroundImage ||
          "/football-pitch-bg.jpg",
      };

      try {
        addReservation(reservationData);

        // Update localStorage
        const storedReservations = localStorage.getItem("reservations");
        const existingReservations = storedReservations
          ? JSON.parse(storedReservations)
          : [];
        const updatedReservations = [
          ...existingReservations,
          { ...reservationData, id: Date.now() },
        ];
        localStorage.setItem(
          "reservations",
          JSON.stringify(updatedReservations)
        );

        toast({
          title: "Reservation Created",
          description: `Game scheduled for ${format(
            data.date,
            "MMM d, yyyy"
          )} from ${data.startTime} to ${data.endTime}`,
        });

        setOpen(false);
        form.reset();
      } catch (error) {
        console.error("Error creating reservation:", error);
        toast({
          title: "Error",
          description: "Failed to create reservation. Please try again.",
          variant: "destructive",
        });
      }
    },
    [addReservation, pitches, toast, form]
  );

  const handlePitchChange = useCallback(
    (pitchName: string) => {
      const selectedPitch = pitches.find((p) => p.name === pitchName);
      if (selectedPitch) {
        form.setValue("location", selectedPitch.location);
      }
    },
    [pitches, form]
  );

  const minDate = addDays(new Date(), 5);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-[#0F766E] hover:bg-[#0d6d66] text-white">
            <Plus size={18} className="mr-2" />
            Add Reservation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-850 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0F766E] dark:text-teal-400">
            Create New Game
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Pitch Selection */}
            <FormField
              control={form.control}
              name="pitchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pitch</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handlePitchChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100">
                        <SelectValue placeholder="Select a pitch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-800 max-h-40 overflow-y-auto">
                      {pitches.map((pitch) => (
                        <SelectItem
                          key={pitch._id || pitch.id}
                          value={pitch.name}
                        >
                          {pitch.name} - {pitch.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Selection */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date (minimum 5 days from today)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 dark:bg-gray-800"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < minDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="14:00"
                        {...field}
                        className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="16:00"
                        {...field}
                        className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pitch location"
                      {...field}
                      className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100"
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Players */}
            <FormField
              control={form.control}
              name="maxPlayers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Players</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(parseInt(value, 10))
                    }
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100">
                        <SelectValue placeholder="Select max players" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-800">
                      <SelectItem value="12">(12 players)</SelectItem>
                      <SelectItem value="14">(14 players)</SelectItem>
                      <SelectItem value="16">(16 players)</SelectItem>
                      <SelectItem value="18">(18 players)</SelectItem>
                      <SelectItem value="20">(20 players)</SelectItem>
                      <SelectItem value="22">(22 players)</SelectItem>
                      <SelectItem value="24">(24 players)</SelectItem>
                      <SelectItem value="26">(26 players)</SelectItem>
                      <SelectItem value="28">(28 players)</SelectItem>
                      <SelectItem value="30">(30 players)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-[#0F766E]/20 text-[#0F766E] hover:bg-[#0F766E]/10 dark:text-teal-400 dark:border-teal-600/40 dark:hover:bg-teal-600/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0F766E] hover:bg-[#0d6d66] text-white dark:bg-teal-600 dark:hover:bg-teal-700"
              >
                Create Game
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAddReservationDialog;
