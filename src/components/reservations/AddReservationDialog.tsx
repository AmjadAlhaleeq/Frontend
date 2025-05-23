import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, ImagePlus, Clock } from "lucide-react";
import { format } from "date-fns";
import { useReservation, Pitch } from "@/context/ReservationContext";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

// Zod schema for form validation
const formSchema = z.object({
  pitch: z.string().min(1, "Please select a pitch"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time slot",
  }),
  location: z.string().min(2, "Location must be at least 2 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  maxPlayers: z.string().min(1, "Please select max players"),
  price: z.number().min(1, "Price is required"),
  image: z.string().url("Must be a valid URL").optional(),
  duration: z.string().optional(),
});

/**
 * AddReservationDialog component
 * Allows admins to add a new game reservation
 */
const AddReservationDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { addReservation, pitches } = useReservation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pitch: "",
      title: "",
      date: new Date(),
      time: "17:00 - 18:30",
      location: "",
      city: "",
      maxPlayers: "10",
      price: 25,
      image: "",
      duration: "90 minutes",
    },
  });

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (e) {
        console.error("Error parsing user data:", e);
        toast({
          title: "Error",
          description: "Could not load user profile data",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a reservation",
        variant: "destructive"
      });
      return;
    }

    // Add the new reservation
    addReservation({
      pitchId: parseInt(values.pitch, 10), // Make sure pitchId is properly set
      pitchName: pitches.find(p => p.id === parseInt(values.pitch, 10))?.name || values.title,
      title: values.title,
      date: values.date.toISOString().split('T')[0],
      time: values.time,
      location: values.location,
      city: values.city,
      maxPlayers: parseInt(values.maxPlayers, 10),
      price: values.price,
      imageUrl: values.image,
      duration: values.duration,
      lineup: [{
        userId: currentUser.id,
        playerName: `${currentUser.firstName} ${currentUser.lastName}`,
        joinedAt: new Date().toISOString(),
        status: 'confirmed'
      }]
    });
    
    // Close the dialog and show a success message
    setIsOpen(false);
    toast({
      title: "Success",
      description: "Reservation created successfully",
    });
  };

  return (
    <>
      <Button onClick={handleOpen} className="bg-[#0F766E] hover:bg-[#0d6d66]">
        <Plus className="mr-2 h-4 w-4" />
        Add Reservation
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-850">
          <DialogHeader>
            <DialogTitle className="text-[#0F766E] dark:text-teal-400">Add New Reservation</DialogTitle>
            <DialogDescription>
              Schedule a new game on one of our pitches.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="pitch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pitch</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100">
                          <SelectValue placeholder="Select a pitch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-gray-800">
                        {pitches.map((pitch) => (
                          <SelectItem key={pitch.id} value={String(pitch.id)}>
                            {pitch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Game Title" {...field} className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
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
                      <PopoverContent className="w-auto p-0 dark:bg-gray-800" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100">
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-gray-800">
                        <SelectItem value="17:00 - 18:30">17:00 - 18:30</SelectItem>
                        <SelectItem value="18:30 - 20:00">18:30 - 20:00</SelectItem>
                        <SelectItem value="20:00 - 21:30">20:00 - 21:30</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxPlayers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Players</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-gray-800">
                          <SelectItem value="10">5v5 (10 players)</SelectItem>
                          <SelectItem value="14">7v7 (14 players)</SelectItem>
                          <SelectItem value="22">11v11 (22 players)</SelectItem>
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
                      <FormLabel>Price per Player</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="25" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter duration" {...field} className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="bg-[#0F766E] hover:bg-[#0d6d66] text-white dark:bg-teal-600 dark:hover:bg-teal-700">
                Create Reservation
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddReservationDialog;
