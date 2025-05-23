import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useReservation } from "@/context/ReservationContext";
import { ImageIcon, MapPinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const pitchSchema = z.object({
  name: z.string().min(2, {
    message: "Pitch name must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  image: z.string().url({
    message: "Please enter a valid URL.",
  }),
  playersPerSide: z.coerce.number().min(1, {
    message: "Players per side must be at least 1.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.coerce.number().min(1, {
    message: "Price must be at least 1.",
  }),
  facilities: z.array(z.string()).optional(),
  type: z.enum(["indoor", "outdoor"]).optional(),
  openingHours: z.string().optional(),
  address: z.string().optional(),
});

const EditPitch = () => {
  const router = useRouter();
  const { pitchId } = router.query;
  const { pitches, addPitch, updatePitch, deletePitch } = useReservation();
  const { toast } = useToast();
  const [isNewPitch, setIsNewPitch] = useState(true);
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    if (pitchId && pitches) {
      const id = parseInt(pitchId as string, 10);
      const pitch = pitches.find((p) => p.id === id);
      if (pitch) {
        setIsNewPitch(false);
        setInitialValues({
          name: pitch.name,
          location: pitch.location,
          city: pitch.city,
          image: pitch.image,
          playersPerSide: pitch.playersPerSide,
          description: pitch.description,
          price: pitch.price,
          facilities: pitch.facilities,
          type: pitch.type || "outdoor",
          openingHours: pitch.openingHours || "",
          address: pitch.details?.address || "",
        });
      }
    } else {
      setIsNewPitch(true);
      setInitialValues(null);
    }
  }, [pitchId, pitches]);

  const form = useForm({
    resolver: zodResolver(pitchSchema),
    defaultValues: initialValues || {
      name: "",
      location: "",
      city: "",
      image: "",
      playersPerSide: 5,
      description: "",
      price: 25,
      facilities: [],
      type: "outdoor",
      openingHours: "",
      address: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);

  const onSubmit = (values: z.infer<typeof pitchSchema>) => {
    const facilities = Array.isArray(values.facilities) ? values.facilities : [];
    const pitchData = {
      ...values,
      facilities: facilities,
      details: {
        address: values.address,
      },
    };

    if (pitchId) {
      const id = parseInt(pitchId as string, 10);
      updatePitch({ id, ...pitchData } as any);
      toast({
        title: "Pitch updated successfully!",
      });
    } else {
      addPitch(pitchData);
      toast({
        title: "Pitch added successfully!",
      });
    }
    router.push('/admin/Pitches');
  };

  const onDelete = () => {
    if (pitchId) {
      const id = parseInt(pitchId as string, 10);
      deletePitch(id);
      toast({
        title: "Pitch deleted successfully!",
      });
      router.push('/admin/Pitches');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {isNewPitch ? "Add New Pitch" : "Edit Pitch"}
        </h1>
        <p className="text-muted-foreground">
          {isNewPitch
            ? "Create a new pitch for reservations."
            : "Edit the details of an existing pitch."}
        </p>
      </div>
      <Separator className="my-4" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="playersPerSide"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Players per Side</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter players per side"
                      {...field}
                    />
                  </FormControl>
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
                    <Input
                      type="number"
                      placeholder="Enter price per player"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
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
          <FormField
            control={form.control}
            name="openingHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Hours (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter opening hours" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel>Facilities</FormLabel>
            <div className="flex flex-wrap gap-2">
              <div>
                <FormField
                  control={form.control}
                  name="facilities"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value?.includes("parking")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), "parking"]);
                              } else {
                                field.onChange(
                                  field.value?.filter((v) => v !== "parking")
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Parking</FormLabel>
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="facilities"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value?.includes("changing_rooms")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([
                                  ...(field.value || []),
                                  "changing_rooms",
                                ]);
                              } else {
                                field.onChange(
                                  field.value?.filter((v) => v !== "changing_rooms")
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Changing Rooms
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="facilities"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value?.includes("showers")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), "showers"]);
                              } else {
                                field.onChange(
                                  field.value?.filter((v) => v !== "showers")
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Showers</FormLabel>
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="facilities"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value?.includes("cafe")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), "cafe"]);
                              } else {
                                field.onChange(
                                  field.value?.filter((v) => v !== "cafe")
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Cafe</FormLabel>
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      {!isNewPitch && (
        <Button
          variant="destructive"
          className="mt-4"
          onClick={onDelete}
        >
          Delete Pitch
        </Button>
      )}
    </div>
  );
};

export default EditPitch;
