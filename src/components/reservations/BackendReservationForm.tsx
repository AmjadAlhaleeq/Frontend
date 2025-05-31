import React, { useState } from "react";
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
import {
  CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Users,
  DollarSign,
} from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createReservation } from "@/lib/reservationApi";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  pitch: z.string().min(1, "Please select a pitch"),
  date: z
    .date({
      required_error: "Please select a date",
    })
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "Date must be today or in the future"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  maxPlayers: z.coerce
    .number()
    .min(12, "Minimum 12 players required")
    .max(30, "Maximum 30 players allowed"),
});

interface BackendReservationFormProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
}

const BackendReservationForm: React.FC<BackendReservationFormProps> = ({
  children,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { pitches } = useReservation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      pitch: "",
      startTime: "",
      endTime: "",
      price: 10,
      maxPlayers: 10,
    },
  });

  const validateTimeRange = (startTime: string, endTime: string): boolean => {
    if (!startTime || !endTime) return false;

    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    return end > start;
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!validateTimeRange(data.startTime, data.endTime)) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reservationData = {
        title: data.title,
        pitch: data.pitch,
        date: format(data.date, "yyyy-MM-dd"),
        startTime: data.startTime,
        endTime: data.endTime,
        price: data.price,
        maxPlayers: data.maxPlayers,
      };

      await createReservation(reservationData);

      toast({
        title: "Reservation Created Successfully!",
        description: `Game "${data.title}" scheduled for ${format(
          data.date,
          "MMM d, yyyy"
        )} from ${data.startTime} to ${data.endTime}`,
      });

      setOpen(false);
      form.reset();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast({
        title: "Failed to Create Reservation",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePitchChange = (pitchId: string) => {
    const selectedPitch = pitches.find(
      (p) => p._id === pitchId || p.id === pitchId
    );
    if (selectedPitch && !form.getValues("title")) {
      form.setValue("title", `Game at ${selectedPitch.name}`);
    }
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-[#0F766E] hover:bg-[#0d6d66] text-white">
            <Plus size={18} className="mr-2" />
            Create Game
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-850 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0F766E] dark:text-teal-400 text-xl">
            Create New Game Reservation
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Game Details
                </CardTitle>
                <CardDescription>
                  Basic information about the game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Game Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Friday Night Football"
                          {...field}
                          className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pitch Selection */}
                <FormField
                  control={form.control}
                  name="pitch"
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
                              value={pitch._id || pitch.id || pitch.name}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Date & Time
                </CardTitle>
                <CardDescription>
                  When will the game take place?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Selection */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Game Date</FormLabel>
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
                            type="time"
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
                            type="time"
                            {...field}
                            className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Game Settings
                </CardTitle>
                <CardDescription>Configure game parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Max Players and Price */}
                <div className="grid grid-cols-2 gap-4">
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

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Price per Player
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50"
                            {...field}
                            className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="border-[#0F766E]/20 text-[#0F766E] hover:bg-[#0F766E]/10 dark:text-teal-400 dark:border-teal-600/40 dark:hover:bg-teal-600/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0F766E] hover:bg-[#0d6d66] text-white dark:bg-teal-600 dark:hover:bg-teal-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Game"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BackendReservationForm;
