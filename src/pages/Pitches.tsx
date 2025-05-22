
// This is the Pitches.tsx page. It handles UI and logic for Pitches.

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Plus, Edit3, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservation, Pitch } from "@/context/ReservationContext";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import PitchCard from "@/components/pitches/PitchCard";
import PitchDetailsDialog from "@/components/pitches/PitchDetailsDialog";

/**
 * Pitches page component
 * Displays all available pitches with search functionality
 * Admin users can add, edit, and delete pitches
 * Regular users can only view pitch details
 */
const Pitches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'admin' | 'player' | null>(null);
  const [selectedPitchForDetails, setSelectedPitchForDetails] = useState<Pitch | null>(null);
  const {
    pitches,
    navigateToReservation,
    deletePitch,
    setPitches, // Added to initialize from localStorage
  } = useReservation();
  const navigate = useNavigate();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pitchToDelete, setPitchToDelete] = useState<Pitch | null>(null);

  // Get user role from localStorage and initialize pitches on component mount
  useEffect(() => {
    const role = localStorage.getItem('userRole') as 'admin' | 'player' | null;
    setUserRole(role);
    
    // Initialize pitches from localStorage
    try {
      const storedPitches = localStorage.getItem('pitches');
      if (storedPitches) {
        const parsedPitches = JSON.parse(storedPitches);
        if (Array.isArray(parsedPitches) && parsedPitches.length > 0) {
          console.log("Loading pitches from localStorage:", parsedPitches);
          setPitches(parsedPitches);
        }
      }
    } catch (error) {
      console.error("Error loading pitches from localStorage:", error);
    }
  }, [setPitches]);

  // Filter pitches based on search term
  const filteredPitches = pitches.filter(
    (pitch) =>
      pitch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pitch.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPitch = () => {
    if (userRole !== 'admin') {
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

  const handleConfirmDelete = () => {
    if (pitchToDelete) {
      // Delete from context
      deletePitch(pitchToDelete.id);
      
      // Also update localStorage
      try {
        const storedPitches = localStorage.getItem('pitches');
        if (storedPitches) {
          const parsedPitches = JSON.parse(storedPitches);
          const updatedPitches = parsedPitches.filter((p: Pitch) => p.id !== pitchToDelete.id);
          localStorage.setItem('pitches', JSON.stringify(updatedPitches));
          console.log("Updated pitches in localStorage after deletion:", updatedPitches);
        }
      } catch (error) {
        console.error("Error updating pitches in localStorage:", error);
      }
      
      toast({
        title: "Pitch Deleted",
        description: `The pitch "${pitchToDelete.name}" has been successfully deleted.`,
      });
      setPitchToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleEditPitch = (pitchId: number) => {
    if (userRole !== 'admin') {
      toast({ title: "Access Denied", description: "Only admins can edit pitches.", variant: "destructive" });
      return;
    }
    navigate(`/admin/edit-pitch/${pitchId}`);
    toast({ title: "Edit Pitch", description: `Navigating to edit page for pitch ID: ${pitchId}.`});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Available Pitches</h1>

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

          {userRole === 'admin' && (
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
          <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">No pitches found</h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6 max-w-xs sm:max-w-md mx-auto">
            Try adjusting your search or add a new pitch if you have admin privileges.
          </p>
          {userRole === 'admin' && (
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
              key={pitch.id}
              pitch={pitch}
              isAdmin={userRole === 'admin'}
              onViewDetails={() => setSelectedPitchForDetails(pitch)}
              onBookPitch={() => navigateToReservation(pitch.name)}
              onEditClick={() => handleEditPitch(pitch.id)}
              onDeleteClick={() => handleOpenDeleteDialog(pitch)}
            />
          ))}
        </div>
      )}

      {selectedPitchForDetails && (
        <PitchDetailsDialog
          pitch={selectedPitchForDetails}
          onBookPitch={() => navigateToReservation(selectedPitchForDetails.name)}
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
