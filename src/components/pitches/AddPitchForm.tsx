
// AddPitchForm.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Camera, Settings, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ImageUpload from "@/components/ui/image-upload";

const CLOUD_NAME = "dsmuk27ce";
const UPLOAD_PRESET = "bokit_preset";

// Upload image to Cloudinary
const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Upload failed");
  return data.secure_url;
};

const facilityOptions = [
  { value: "wifi", label: "WiFi" },
  { value: "parking", label: "Parking" },
  { value: "cafeteria", label: "Cafeteria" },
  { value: "lockers", label: "Lockers" },
  { value: "bathrooms", label: "Bathrooms" },
  { value: "water", label: "Water" },
];

interface FormData {
  name: string;
  location: string;
  city: string;
  playersPerSide: string;
  type: string;
  description: string;
  backgroundImage: File | null;
  additionalImages: File[];
  facilities: string[];
}

const AddPitchForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    city: "",
    playersPerSide: "5",
    type: "",
    description: "",
    backgroundImage: null,
    additionalImages: [],
    facilities: [],
  });

  const [bgPreview, setBgPreview] = useState("");
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFacilityToggle = (facility: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      facilities: checked
        ? [...prev.facilities, facility]
        : prev.facilities.filter((f) => f !== facility),
    }));
  };

  const handleImageSelect = (file: File, isBackground = false) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (isBackground) {
        setBgPreview(e.target?.result as string);
        setFormData((prev) => ({ ...prev, backgroundImage: file }));
      } else {
        setFormData((prev) => ({
          ...prev,
          additionalImages: [...prev.additionalImages, file],
        }));
        setAdditionalPreviews((prev) => [...prev, e.target?.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setFormData((prev) => ({ ...prev, backgroundImage: null }));
    setBgPreview("");
  };

  const handleAdditionalImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, location, city, type, backgroundImage } = formData;
    
    // Improved validation - check both File object and preview URL
    if (!name.trim()) {
      toast({
        title: "Missing Field",
        description: "Please enter a pitch name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!location.trim()) {
      toast({
        title: "Missing Field", 
        description: "Please enter the pitch location.",
        variant: "destructive",
      });
      return;
    }
    
    if (!city.trim()) {
      toast({
        title: "Missing Field",
        description: "Please enter the city.",
        variant: "destructive",
      });
      return;
    }
    
    if (!type) {
      toast({
        title: "Missing Field",
        description: "Please select a pitch type.",
        variant: "destructive",
      });
      return;
    }
    
    // Fixed validation: check both backgroundImage file and bgPreview URL
    if (!backgroundImage && !bgPreview) {
      toast({
        title: "Missing Field",
        description: "Please upload a background image.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        return;
      }

      // Upload background image only if it's a File object
      let bgUrl = bgPreview;
      if (backgroundImage instanceof File) {
        bgUrl = await uploadToCloudinary(backgroundImage);
      }
      
      // Upload additional images
      const imageUrls = await Promise.all(
        formData.additionalImages.map(uploadToCloudinary)
      );

      const services: Record<string, boolean | string> = { type };
      facilityOptions.forEach((opt) => {
        services[opt.value] = formData.facilities.includes(opt.value);
      });

      const res = await fetch("http://127.0.0.1:3000/pitches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          location,
          city,
          backgroundImage: bgUrl,
          images: imageUrls,
          playersPerSide: parseInt(formData.playersPerSide),
          description: formData.description,
          services,
        }),
      });

      const result = await res.json();
      if (result.status !== "success") {
        throw new Error(result.message || "Failed to create pitch");
      }

      toast({
        title: "Success",
        description: "Pitch created successfully!",
      });
      navigate("/pitches");
    } catch (err: unknown) {
      console.error("Error creating pitch:", err);
      let message = "Failed to create pitch.";
      if (err instanceof Error) {
        message = err.message;
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Add New Pitch</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                <FileText className="h-5 w-5 mr-2" /> Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Pitch Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                required
              />
              <Input
                placeholder="Full Address"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                required
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
              <Select
                value={formData.playersPerSide}
                onValueChange={(v) => handleChange("playersPerSide", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Players per side" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 6, 7, 8, 9, 10, 11].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} vs {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.type}
                onValueChange={(v) => handleChange("type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pitch Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Indoor">Indoor</SelectItem>
                  <SelectItem value="Outdoor">Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Camera className="h-5 w-5 mr-2" /> Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                onImageSelect={(f) => handleImageSelect(f, true)}
                onImageRemove={handleImageRemove}
                preview={bgPreview}
                placeholder="Upload background image"
              />
              <ImageUpload
                onImageSelect={(f) => handleImageSelect(f)}
                placeholder="Add more images"
              />
              {additionalPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {additionalPreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={src}
                        alt="Extra"
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleAdditionalImageRemove(i)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Settings className="h-5 w-5 mr-2" /> Facilities
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {facilityOptions.map((f) => (
                <div
                  key={f.value}
                  className="flex items-center space-x-3 p-3 border rounded"
                >
                  <Checkbox
                    id={f.value}
                    checked={formData.facilities.includes(f.value)}
                    onCheckedChange={(checked) =>
                      handleFacilityToggle(f.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={f.value}
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {f.label}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/pitches")}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create Pitch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPitchForm;
