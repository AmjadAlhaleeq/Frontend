
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Calendar, Clock } from "lucide-react";

interface JoinGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gameName: string;
  gameDate: string;
  gameTime: string;
  location: string;
  price: number;
  currentPlayers: number;
  maxPlayers: number;
}

const JoinGameDialog: React.FC<JoinGameDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  gameName,
  gameDate,
  gameTime,
  location,
  price,
  currentPlayers,
  maxPlayers
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Join Game</DialogTitle>
          <DialogDescription>
            Confirm your participation in this game
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-3">{gameName}</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{gameDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{gameTime}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{location}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{currentPlayers + 1}/{maxPlayers} players (after joining)</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-teal-600">
              {price} JD per player
            </div>
            <p className="text-sm text-muted-foreground">
              Payment will be collected at the venue
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-teal-500 hover:bg-teal-600">
            Join Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGameDialog;
