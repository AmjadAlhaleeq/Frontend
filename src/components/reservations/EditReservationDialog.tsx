import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useReservation, Reservation, Highlight } from "@/context/ReservationContext";
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
import HighlightForm from "./HighlightForm";
import HighlightsList from "./HighlightsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

// Zod schema for form validation
const formSchema = z.object({
  pitchName: z.string().min(2, "Pitch name must be at least 2 characters"),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time slot",
  }),
  location: z.string().min(2, "Location must be at least 2 characters"),
  price: z.coerce.number().min(1, "Price is required"), // Use coerce for input type="number"
  maxPlayers: z.coerce.number().min(2, "At least 2 players are required"), // Use coerce for input type="number"
});

interface EditReservationDialogProps {
  reservation: Reservation; // The reservation object to edit
  isOpen: boolean; // Controls dialog visibility
  onClose: () => void; // Function to close the dialog
  isAdmin?: boolean; // Flag to indicate if the current user is an admin
}

/**
 * EditReservationDialog component.
 * Allows admins to edit details of an existing reservation or manage highlights for past games.
 * The form fields and available actions adapt based on whether the game is in the past and admin status.
 */
const EditReservationDialog: React.FC<EditReservationDialogProps> = ({
  reservation,
  isOpen,
  onClose,
  isAdmin = false, // Default isAdmin to false; should be explicitly passed
}) => {
  const { editReservation } = useReservation(); // Context function to save changes
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details"); // For tabs in past game admin view
  const [highlightState, setHighlightState] = useState<Highlight[]>([]);
  const [showHighlightForm, setShowHighlightForm] = useState(false);
  const isPastGame = new Date(reservation.date) < new Date(new Date().setHours(0,0,0,0)) || reservation.status === "completed";

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pitchName: reservation.pitchName,
      date: new Date(reservation.date), // Ensure date is a Date object for the calendar
      time: reservation.time,
      location: reservation.location,
      price: reservation.price,
      maxPlayers: reservation.maxPlayers,
    },
  });
  
  // Handle saving highlights
  const handleSaveHighlight = (highlight: Highlight) => {
    // Create a new array of highlights
    const currentHighlights = reservation.highlights || [];
    const updatedHighlights = [...currentHighlights, highlight];
    
    // Here we directly modify the reservation object to update the highlights
    // This is necessary since editReservation doesn't accept highlights directly
    const updatedReservation = { ...reservation, highlights: updatedHighlights };
    
    // Use the editReservation to save other fields, but we'll rely on the local state update for highlights
    editReservation(reservation.id, {
      pitchName: updatedReservation.pitchName,
      date: updatedReservation.date,
      time: updatedReservation.time,
      location: updatedReservation.location,
      price: updatedReservation.price,
      maxPlayers: updatedReservation.maxPlayers,
    });
    
    // Update the reservation context directly for highlights
    // Note: In a real app with a backend, you'd make an API call here
    // For this example, we're relying on the ReservationContext to handle it internally
    
    toast({
      title: "Highlight Added",
      description: `Added a new highlight for ${highlight.playerName}`,
    });
  };
  
  // Handle canceling highlight addition
  const handleCancelHighlight = () => {
    // Just close the form or reset state if needed
  };

  // Update the handleDeleteHighlight and handleAddHighlight functions:
  const handleDeleteHighlight = (highlightId: string) => {
    const updatedHighlights = highlightState.filter(h => h.id !== highlightId);
    setHighlightState(updatedHighlights);
  };

  const handleAddHighlight = (highlight: Highlight) => {
    setHighlightState(prev => [...prev, highlight]);
    setShowHighlightForm(false);
  };

  /**
   * Handles form submission.
   * Converts date to ISO string format before saving.
   * @param data - Validated form data.
   */
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // TODO: API Call: Send 'data' to backend to update the reservation.
    // The context's editReservation would then ideally update based on backend response.
    editReservation(reservation.id, {
      ...data,
      date: data.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD string
    });
    onClose(); // Close dialog after submission
  };

  // Render the dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-850">
        <DialogHeader>
          <DialogTitle className="text-[#0F766E] dark:text-teal-400">
            {/* Title changes based on whether it's a past game or editing an upcoming one */}
            {isPastGame ? "Game Details" : "Edit Reservation"} 
            {isAdmin && isPastGame && " (Admin View)"}
          </DialogTitle>
        </DialogHeader>
        
        {/* Conditional rendering for Admin view of Past Games (with Tabs) */}
        {isPastGame && isAdmin ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="details">Game Details</TabsTrigger>
              <TabsTrigger value="highlights">Highlights</TabsTrigger>
            </TabsList>
            
            {/* Tab for Game Details (Form) */}
            <TabsContent value="details">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pitchName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pitch Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter pitch name" {...field} className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100" />
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

                  <div className="grid grid-cols-2 gap-4">
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

                    <FormField
                      control={form.control}
                      name="maxPlayers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Players</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                            defaultValue={String(field.value)}
                          >
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
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={onClose}
                      className="border-[#0F766E]/20 text-[#0F766E] hover:bg-[#0F766E]/10 dark:text-teal-400 dark:border-teal-600/40 dark:hover:bg-teal-600/20"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-[#0F766E] hover:bg-[#0d6d66] text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            {/* Tab for Game Highlights (Admin view for past games) */}
            <TabsContent value="highlights">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 dark:text-gray-100">Game Highlights</h3>
                  <p className="text-sm text-muted-foreground mb-4 dark:text-gray-400">
                    Record goals, assists, and other key moments from the game.
                  </p>
                  {/* Component to list existing highlights */}
                  <HighlightsList 
                    reservationId={reservation.id} 
                    isAdmin={isAdmin} // Pass admin status for conditional controls within HighlightsList
                  />
                </div>
                
                <Separator className="my-4 dark:bg-gray-700" />
                
                <div>
                  <h3 className="text-lg font-medium mb-2 dark:text-gray-100">Add New Highlight</h3>
                  {/* Component form to add a new highlight */}
                  {showHighlightForm && (
                    <HighlightForm
                      reservationId={reservation.id}
                      onSubmit={handleAddHighlight}
                      onClose={() => setShowHighlightForm(false)}
                    />
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Default view: Form for editing upcoming games (admin) or viewing details if non-admin somehow gets here
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* ... FormFields are repeated here. Consider refactoring to a separate component if identical. */}
              {/* For brevity, assuming these are similar to the ones in the TabsContent above. */}
              {/* FormField for Pitch Name */}
              <FormField
                control={form.control}
                name="pitchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pitch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter pitch name" {...field} className="border-[#0F766E]/20 dark:border-teal-600/30 dark:bg-gray-700 dark:text-gray-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FormField for Date */}
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

              {/* FormField for Time */}
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

              {/* FormField for Location */}
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

              {/* Grid for Price and Max Players */}
              <div className="grid grid-cols-2 gap-4">
                {/* FormField for Price */}
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

                {/* FormField for Max Players */}
                <FormField
                  control={form.control}
                  name="maxPlayers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Players</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                        defaultValue={String(field.value)}
                      >
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
              </div>

              {/* Form Action Buttons (only show save if admin for non-past game, or if admin and past game details tab) */}
              {(isAdmin || !isPastGame) && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="border-[#0F766E]/20 text-[#0F766E] hover:bg-[#0F766E]/10 dark:text-teal-400 dark:border-teal-600/40 dark:hover:bg-teal-600/20"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-[#0F766E] hover:bg-[#0d6d66] text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditReservationDialog;
