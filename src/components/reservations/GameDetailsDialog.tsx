
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { MapPin, Calendar, Clock, Users, X, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Reservation } from "@/context/ReservationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface GameDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  isAdmin?: boolean;
  onStatusChange?: (status: 'upcoming' | 'completed' | 'cancelled') => void;
  currentUserId: string;
  actualMaxPlayers: number;
  showAdminControls?: boolean;
}

/**
 * GameDetailsDialog component
 * Displays detailed information about a game reservation
 */
const GameDetailsDialog: React.FC<GameDetailsDialogProps> = ({
  isOpen,
  onClose,
  reservation,
  isAdmin = false,
  currentUserId,
  actualMaxPlayers,
  showAdminControls = false
}) => {
  const formattedDate = format(parseISO(reservation.date), "EEEE, MMMM d, yyyy");
  const joinedPlayers = reservation.lineup?.filter(p => p.status === 'joined') || [];

  // Get initials from player name
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {reservation.title || reservation.pitchName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="mt-2">
            Game details and players
          </DialogDescription>
        </DialogHeader>

        {/* Game image */}
        <div className="relative h-48 w-full">
          <img
            src={reservation.imageUrl || `https://source.unsplash.com/800x400/?football,pitch,${reservation.pitchName.split(" ").join(",")}`}
            alt={reservation.pitchName}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6">
          {/* Game details */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">Game Information</h3>
              <Badge className={`${
                reservation.status === 'upcoming' ? 'bg-green-500' : 
                reservation.status === 'completed' ? 'bg-blue-500' :
                'bg-red-500'
              }`}>
                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{reservation.time}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{`${reservation.playersJoined}/${actualMaxPlayers} players`}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>{reservation.city || reservation.location}</span>
                  {reservation.location && (
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(reservation.location)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center text-xs"
                    >
                      View on Maps <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center mt-1 text-sm">
              <span className="font-medium mr-1">Price:</span>
              <span>${reservation.price} per player</span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Players tab */}
          <Tabs defaultValue="players">
            <TabsList className="mb-4">
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="waiting">Waiting List ({reservation.waitingList?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="players">
              <h3 className="text-sm font-medium mb-2">Joined Players ({joinedPlayers.length}/{actualMaxPlayers})</h3>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {joinedPlayers.length > 0 ? (
                  <div className="space-y-2">
                    {joinedPlayers.map((player, index) => (
                      <div key={player.userId || index} className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{getInitials(player.playerName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{player.playerName || `Player ${player.userId.substring(0, 4)}`}</p>
                            {player.joinedAt && (
                              <p className="text-xs text-muted-foreground">
                                Joined: {format(new Date(player.joinedAt), "MMM d, h:mm a")}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {isAdmin && player.userId === currentUserId && (
                          <Badge className="bg-blue-500">You</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">No players have joined yet.</p>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="waiting">
              <h3 className="text-sm font-medium mb-2">Waiting List ({reservation.waitingList?.length || 0})</h3>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {reservation.waitingList && reservation.waitingList.length > 0 ? (
                  <div className="space-y-2">
                    {reservation.waitingList.map((userId, index) => (
                      <div key={userId} className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{(index + 1).toString()}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium">
                            {`Player ${userId.substring(0, 6)}`}
                          </p>
                        </div>
                        
                        {userId === currentUserId && (
                          <Badge variant="outline" className="border-amber-500 text-amber-500">You</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">The waiting list is empty.</p>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsDialog;
