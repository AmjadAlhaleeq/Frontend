
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useReservation, NewReservationData } from "@/context/ReservationContext";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Slider } from "@/components/ui/slider";

/**
 * Form schema for reservation data validation
 */
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  date: z.date({ required_error: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  pitchName: z.string().min(1, { message: "Pitch is required" }),
  maxPlayers: z.number().min(2, { message: "At least 2 players required" }).max(22, { message: "Maximum 22 players allowed" }),
  price: z.number().nonnegative({ message: "Price cannot be negative" }),
  description: z.string().optional(),
  location: z.string().optional(),
  locationLink: z.string().optional(),
  city: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * AddReservationDialog component
 * Allows admins to create new game reservations
 */
const AddReservationDialog = () => {
  const [open, setOpen] = useState(false);
  const { addReservation } = useReservation();
  const { toast } = useToast();
  
  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      pitchName: "",
      location: "",
      locationLink: "",
      city: "",
      price: 0,
      maxPlayers: 10,
      time: "",
      description: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Submitting reservation data:", data);
    
    const newReservationData: NewReservationData = {
      title: data.title,
      pitchName: data.pitchName,
      date: data.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      time: data.time,
      location: data.location,
      locationLink: data.locationLink,
      city: data.city,
      price: data.price, // Already a number from the form schema
      maxPlayers: data.maxPlayers, // Already a number from the form schema
      imageUrl: imagePreview || undefined, // Use uploaded image
    };
    
    addReservation(newReservationData);
    
    toast({
      title: "Reservation Added",
      description: `New reservation for ${data.pitchName} has been created.`,
      duration: 3000,
    });
    
    form.reset();
    setImagePreview(null);
    setOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    
    if (!file) {
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size should be less than 5MB");
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      setImageError("Please upload an image file");
      return;
    }
    
    // Simulate upload with progress
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create a data URL for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setImagePreview(result);
          setIsUploading(false);
          toast({
            title: "Upload Complete",
            description: "Image has been uploaded successfully.",
          });
        }
      }, 200);
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0F766E] hover:bg-[#0d6d66]" id="add-reservation-dialog-trigger">
          <Plus size={18} className="mr-2" />
          Add Reservation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Reservation</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="imageUpload" className="text-sm font-medium">Reservation Image (optional)</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img 
                      src={imagePreview} 
                      alt="Reservation preview" 
                      className="max-h-60 mx-auto rounded-md object-cover"
                    />
                    {isUploading && (
                      <div className="w-full space-y-2">
                        <Slider 
                          value={[uploadProgress]} 
                          max={100}
                          step={1}
                          className="w-full"
                          disabled
                        />
                        <p className="text-xs text-center text-muted-foreground">{uploadProgress}% uploaded</p>
                      </div>
                    )}
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mt-2" 
                      onClick={() => setImagePreview(null)}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                      SVG, PNG, JPG or GIF (Max 5MB)
                    </p>
                    {imageError && (
                      <p className="text-xs text-red-500 mt-2">{imageError}</p>
                    )}
                    <Input 
                      id="imageUpload" 
                      type="file" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => document.getElementById('imageUpload')?.click()}
                    >
                      Select Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Title field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reservation Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Friday Night Football" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pitchName"
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

            <div className="grid grid-cols-2 gap-4">
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
                name="maxPlayers"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Maximum Number of Players</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={2}
                        max={22}
                        placeholder="Enter max players"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the total number of players allowed in the game
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                            "w-full pl-3 text-left font-normal",
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
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Disable past dates
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
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
                  <FormControl>
                    <Input 
                      placeholder="e.g., 18:00 - 19:30" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Player</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="25" 
                        value={field.value} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="locationLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps Link (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://maps.google.com/?q=..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => { form.reset(); setOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F766E] hover:bg-[#0d6d66]">Create Reservation</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReservationDialog;
