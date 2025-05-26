
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation } from "@/context/ReservationContext";
import { Pitch } from "@/types/reservation";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import PitchCard from "@/components/pitches/PitchCard";
import PitchDetailsDialog from "@/components/pitches/PitchDetailsDialog";
import { fetchPitches, deletePitchById } from "@/lib/api";

const Pitches = () => {
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<"admin" | "player" | null>(null);
  const [selectedPitchForDetails, setSelectedPitchForDetails] =
    useState<Pitch | null>(null);
  const { pitches, navigateToReservation, deletePitch, setPitches } =
    useReservation();
  const navigate = useNavigate();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pitchToDelete, setPitchToDelete] = useState<Pitch | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as "admin" | "player" | null;
    setUserRole(role);

    const loadPitches = async () => {
      try {
        const apiPitches = await fetchPitches();
        setPitches(apiPitches);
      } catch (error) {
        console.error("Failed to load pitches:", error);
        toast({
          title: "Error",
          description: "Could not load pitches. Please try again later.",
          variant: "destructive",
        });
      }
    };

    loadPitches();
    const interval = setInterval(loadPitches, 2000);
    return () => clearInterval(interval);
  }, [setPitches, toast]);

  const filteredPitches = pitches.filter(
    (pitch) =>
      pitch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pitch.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPitch = () => {
    if (userRole !== "admin") {
      toast({
        title: "Access Denied",
        description: "Only administrators can add new pitches.",
        variant: "destructive",
      });
      return;
    }
    navigate("/admin/add-pitch");
  };

  const handleOpenDeleteDialog = (pitch: Pitch) => {
    setPitchToDelete(pitch);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!pitchToDelete) return;

    try {
      setLoading(true);
      await deletePitchById(pitchToDelete._id);
      toast({
        title: "Pitch Deleted",
        description: `The pitch "${pitchToDelete.name}" has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Error",
        description: "Failed to delete pitch.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }

    setPitchToDelete(null);
    setShowDeleteDialog(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Available Pitches
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search pitches..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {userRole === "admin" && (
            <Button
              onClick={handleAddPitch}
              className="bg-[#0F766E] hover:bg-[#0d6d66]"
            >
              <Plus size={18} className="mr-2" />
              Add Pitch
            </Button>
          )}
        </div>
      </div>

      {filteredPitches.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
          <div className="p-3 bg-teal-500/10 dark:bg-teal-400/10 rounded-full mb-4 mx-auto w-fit">
            <Search className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">
            No pitches found
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6 max-w-xs sm:max-w-md mx-auto">
            Try adjusting your search or add a new pitch if you have admin
            privileges.
          </p>
          {userRole === "admin" && (
            <Button
              onClick={handleAddPitch}
              className="bg-teal-600 hover:bg-teal-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 text-sm"
            >
              Add New Pitch
              <Plus className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPitches.map((pitch) => (
            <PitchCard
              key={pitch._id}
              pitch={pitch}
              isAdmin={userRole === "admin"}
              onViewDetails={() => setSelectedPitchForDetails(pitch)}
              onDeleteClick={() => handleOpenDeleteDialog(pitch)}
            />
          ))}
        </div>
      )}

      {selectedPitchForDetails && (
        <PitchDetailsDialog
          pitch={selectedPitchForDetails}
          onBookPitch={() =>
            navigateToReservation(selectedPitchForDetails.name)
          }
          onClose={() => setSelectedPitchForDetails(null)}
          userRole={userRole}
        />
      )}

      {pitchToDelete && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleConfirmDelete}
          itemName={pitchToDelete.name}
          itemType="pitch"
        />
      )}
    </div>
  );
};

export default Pitches;
