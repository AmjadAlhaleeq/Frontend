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
  const [loading, setLoading] = useState(false);
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

    const missingFields = [];
    if (!formData.name) missingFields.push("Pitch Name");
    if (!formData.location) missingFields.push("Location");
    if (!formData.city) missingFields.push("City");
    if (!formData.type) missingFields.push("Pitch Type");
    if (!formData.backgroundImage) missingFields.push("Background Image");

    if (missingFields.length > 0) {
      toast({
        title: "Missing Fields",
        description: `Please provide: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication Error: Please log in.");

      const multipartForm = new FormData();
      multipartForm.append("name", formData.name);
      multipartForm.append("location", formData.location);
      multipartForm.append("city", formData.city);
      multipartForm.append("playersPerSide", formData.playersPerSide);
      multipartForm.append("description", formData.description);
      multipartForm.append("backgroundImage", formData.backgroundImage!);

      formData.additionalImages.forEach((file) => {
        multipartForm.append("images", file);
      });

      const services = {
        type: formData.type,
        ...Object.fromEntries(
          facilityOptions.map((opt) => [
            opt.value,
            formData.facilities.includes(opt.value),
          ])
        ),
      };
      multipartForm.append("services", JSON.stringify(services));

      const res = await fetch("http://127.0.0.1:3000/pitches", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set content-type manually for FormData
        },
        body: multipartForm,
      });

      const result = await res.json();
      if (result.status !== "success") {
        throw new Error(result.message || "Unknown error");
      }

      toast({
        title: "Pitch Created",
        description: "Pitch added successfully.",
      });
      navigate("/pitches");
    } catch (err: unknown) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create pitch.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Add New Pitch</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              />
              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
              <Input
                placeholder="Full Address"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
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

          <div className="flex justify-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/pitches")}
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "creating..." : "Create Pitch"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPitchForm;
