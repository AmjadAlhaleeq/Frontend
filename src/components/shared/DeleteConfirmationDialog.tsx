import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from "lucide-react"; // Using AlertTriangle for warning

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string; // Name of the item to be deleted (e.g., pitch name)
  itemType: string; // Type of item (e.g., "pitch", "reservation")
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  itemType,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border-0 shadow-lg max-w-md mx-auto">
        <AlertDialogHeader>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-red-600">
              Confirm Deletion
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-center px-4 py-2">
            Are you sure you want to delete the {itemType}{" "}
            <span className="font-semibold text-gray-800">{itemName}</span>?
            <div className="mt-2 text-sm text-gray-500">
              This action cannot be undone.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
          <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-800 transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:scale-105"
          >
            <Trash2 className="mr-2" />
            Delete {itemType}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;
