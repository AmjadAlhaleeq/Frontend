import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useReservation, Reservation } from "@/context/ReservationContext";
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

const formSchema = z.object({
  pitchName: z.string().min(2, "Pitch name must be at least 2 characters"),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time slot",
  }),
  location: z.string().min(2, "Location must be at least 2 characters"),
  price: z.number().min(1, "Price is required"),
  maxPlayers: z.number().min(2, "At least 2 players are required"),
});

interface EditReservationDialogProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
}

const EditReservationDialog: React.FC<EditReservationDialogProps> = ({
  reservation,
  isOpen,
  onClose,
}) => {
  const { editReservation } = useReservation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pitchName: reservation.pitchName,
      date: new Date(reservation.date),
      time: reservation.time,
      location: reservation.location,
      price: reservation.price,
      maxPlayers: reservation.maxPlayers,
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    editReservation(reservation.id, {
      ...data,
      date: data.date.toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#0F766E]">Edit Reservation</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="pitchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pitch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter pitch name" {...field} className="border-[#0F766E]/20" />
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
                            "w-full pl-3 text-left font-normal border-[#0F766E]/20",
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
                    <PopoverContent className="w-auto p-0" align="start">
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
                      <SelectTrigger className="border-[#0F766E]/20">
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                    <Input placeholder="Enter location" {...field} className="border-[#0F766E]/20" />
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
                      <Input type="number" placeholder="25" {...field} className="border-[#0F766E]/20" />
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
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger className="border-[#0F766E]/20">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-[#0F766E]/20 text-[#0F766E] hover:bg-[#0F766E]/10"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#0F766E] hover:bg-[#0d6d66] text-white"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReservationDialog;
