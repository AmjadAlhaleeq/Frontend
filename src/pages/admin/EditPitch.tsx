import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useReservation, Pitch } from "@/context/ReservationContext";
import { useNavigate, useParams } from "react-router-dom";
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
  name: z.string().min(2, "Pitch name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  image: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  playersPerSide: z.string().refine(val => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num > 0;
  }, {
    message: "Players per side must be a valid number"
  }),
  facilities: z.string().optional(),
  pitchType: z.enum(["indoor", "outdoor"]),
});

/**
 * EditPitch component
 * Allows admins to edit details of an existing pitch
 */
const EditPitch = () => {
  const { pitchId } = useParams();
  const { toast } = useToast();
  const { pitches, updatePitch } = useReservation();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      image: "",
      description: "",
      city: "",
      playersPerSide: "5",
      facilities: "",
      pitchType: "outdoor",
    },
  });

  useEffect(() => {
    // Load pitch details if we have pitches and an id
    if (pitches.length > 0 && pitchId) {
      const existingPitch = pitches.find(p => p.id === Number(pitchId));
      if (existingPitch) {
        form.reset({
          name: existingPitch.name || '',
          location: existingPitch.location || '',
          image: existingPitch.image || '',
          description: existingPitch.description || '',
          city: existingPitch.city || '',
          playersPerSide: existingPitch.playersPerSide.toString() || '5',
          facilities: existingPitch.facilities?.join(', ') || '',
          pitchType: existingPitch.pitchType || 'outdoor',
        });
      } else {
        navigate('/admin/pitches');
      }
    }
  }, [pitches, pitchId, form, navigate]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!pitchId) return;
    
    // Update pitch
    const updatedPitch = {
      name: values.name,
      location: values.location,
      image: values.image,
      description: values.description,
      city: values.city,
      playersPerSide: parseInt(values.playersPerSide),
      pitchType: values.pitchType as "indoor" | "outdoor",
      facilities: values.facilities ? values.facilities.split(',').map(f => f.trim()) : [],
    };
    
    updatePitch(Number(pitchId), updatedPitch);
    
    toast({
      title: "Success",
      description: "Pitch updated successfully"
    });
    
    // Navigate back to pitches
    navigate("/admin/pitches");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Edit Pitch</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pitch Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter pitch name" {...field} />
                </FormControl>
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
                  <Input placeholder="Enter location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter description" {...field} />
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
                  <Input placeholder="Enter city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="playersPerSide"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Players per Side</FormLabel>
                <FormControl>
                  <Input placeholder="Enter players per side" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facilities (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter facilities" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pitchType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pitch Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pitch type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Update Pitch</Button>
        </form>
      </Form>
    </div>
  );
};

export default EditPitch;
