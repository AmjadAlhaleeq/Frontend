
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Clock, 
  Users, 
  Calendar,
  Trash2,
  UserPlus,
  UserMinus,
  Eye,
  UserX,
  ClipboardCheck,
  AlertTriangle,
  ImageIcon
} from "lucide-react";
import { Reservation } from "@/context/ReservationContext";
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import ActionConfirmationDialog from "./ActionConfirmationDialog";

interface ReservationCardProps {
  reservation: Reservation;
  userId: string;
  userRole: 'admin' | 'player';
  onJoin: (id: number, playerName?: string) => void;
  onCancel: (id: number, userId: string) => void;
  onJoinWaitingList: (id: number, userId: string) => void;
  onLeaveWaitingList: (id: number, userId: string) => void;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  isFull: boolean;
  onDeleteReservation?: (id: number) => void;
  onViewDetails: (reservation: Reservation) => void;
  onAddSummary?: (reservation: Reservation) => void;
  pitchImage?: string;
  isUserLoggedIn: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  userId,
  userRole,
  onJoin,
  onCancel,
  onJoinWaitingList,
  onLeaveWaitingList,
  isUserJoined,
  isFull,
  onDeleteReservation,
  onViewDetails,
  onAddSummary,
  pitchImage,
  isUserLoggedIn
}) => {
  const { toast } = useToast();
  const [maxPlayersInput, setMaxPlayersInput] = useState(reservation.maxPlayers);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [joinConfirmation, setJoinConfirmation] = useState(false);
  const [leaveConfirmation, setLeaveConfirmation] = useState(false);
  
  const currentPlayers = reservation.lineup?.length || 0;
  const actualMaxPlayers = maxPlayersInput + 2;
  const progressPercentage = Math.min((currentPlayers / actualMaxPlayers) * 100, 100);
  
  const userHasJoined = isUserJoined(reservation.id, userId);
  const isInWaitingList = reservation.waitingList?.includes(userId) || false;
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "EEE, MMM d");
    } catch {
      return format(new Date(dateString), "EEE, MMM d");
    }
  };

  const handleMaxPlayersChange = (newMax: number) => {
    if (newMax >= 6 && newMax <= 22) {
      setMaxPlayersInput(newMax);
      // Update localStorage
      try {
        const storedReservations = localStorage.getItem('reservations');
        if (storedReservations) {
          const reservations = JSON.parse(storedReservations);
          const updatedReservations = reservations.map((res: Reservation) => 
            res.id === reservation.id ? { ...res, maxPlayers: newMax } : res
          );
          localStorage.setItem('reservations', JSON.stringify(updatedReservations));
        }
      } catch (error) {
        console.error("Error updating max players:", error);
      }
    }
  };

  const handleJoinClick = () => {
    if (!isUserLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to join a game.",
        variant: "destructive",
      });
      return;
    }
    setJoinConfirmation(true);
  };

  const confirmJoin = () => {
    onJoin(reservation.id);
    setJoinConfirmation(false);
  };

  const handleLeaveClick = () => {
    setLeaveConfirmation(true);
  };

  const confirmLeave = () => {
    onCancel(reservation.id, userId);
    setLeaveConfirmation(false);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (onDeleteReservation) {
      onDeleteReservation(reservation.id);
    }
    setDeleteConfirmation(false);
  };

  const getCardImage = () => {
    if (pitchImage) return pitchImage;
    if (reservation.backgroundImage) return reservation.backgroundImage;
    return `https://source.unsplash.com/400x200/?football,pitch,${reservation.pitchName.split(" ").join(",")}`;
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-teal-500 bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          {/* Pitch Image */}
          <div className="h-32 w-full rounded-md overflow-hidden mb-3 relative group">
            <img 
              src={getCardImage()}
              alt={reservation.pitchName}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://source.unsplash.com/400x200/?football,soccer`;
              }}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                {reservation.title || reservation.pitchName}
              </h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{reservation.location}</span>
              </div>
            </div>
            
            {userRole === 'admin' && (
              <div className="flex gap-1 ml-2">
                {reservation.status === 'upcoming' && onDeleteReservation && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick();
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                
                {reservation.status === 'completed' && onAddSummary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSummary(reservation);
                    }}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <ClipboardCheck className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Date and Time */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(reservation.date)}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  {reservation.startTime && reservation.endTime 
                    ? `${reservation.startTime} - ${reservation.endTime}`
                    : reservation.time
                  }
                </span>
              </div>
            </div>

            {/* Price Display */}
            {reservation.price && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  ${reservation.price} per player
                </span>
              </div>
            )}

            {/* Players Progress with Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-teal-600" />
                  <span className="text-sm font-medium">Players</span>
                </div>
                {userRole === 'admin' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Max:</span>
                    <Input
                      type="number"
                      min="6"
                      max="22"
                      value={maxPlayersInput}
                      onChange={(e) => handleMaxPlayersChange(parseInt(e.target.value) || 6)}
                      className="w-16 h-6 text-xs text-center"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-teal-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>{currentPlayers} joined</span>
                <span>{actualMaxPlayers} max (inc. +2)</span>
              </div>
            </div>

            {/* Status Badge and Waiting List */}
            <div className="flex items-center justify-between">
              <Badge 
                variant={reservation.status === "upcoming" ? "default" : "secondary"}
                className={
                  reservation.status === "upcoming" 
                    ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" 
                    : reservation.status === "completed"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }
              >
                {reservation.status}
              </Badge>
              
              {/* Waiting List Info */}
              {reservation.waitingList && reservation.waitingList.length > 0 && (
                <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {reservation.waitingList.length} waiting
                </div>
              )}
            </div>

            {/* Login Warning for Players */}
            {!isUserLoggedIn && userRole === 'player' && (
              <div className="flex items-center text-amber-600 text-xs p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>Please log in to join games</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(reservation);
                }}
                className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
              
              {userRole === 'player' && isUserLoggedIn && (
                <>
                  {!userHasJoined && !isInWaitingList && !isFull && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinClick();
                      }}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Join Game
                    </Button>
                  )}
                  
                  {userHasJoined && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeaveClick();
                      }}
                      className="flex-1"
                    >
                      <UserMinus className="h-4 w-4 mr-1" />
                      Leave Game
                    </Button>
                  )}
                  
                  {!userHasJoined && isFull && !isInWaitingList && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJoinWaitingList(reservation.id, userId);
                      }}
                      className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Join Waitlist
                    </Button>
                  )}
                  
                  {isInWaitingList && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLeaveWaitingList(reservation.id, userId);
                      }}
                      className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Leave Waitlist
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <ActionConfirmationDialog
        open={deleteConfirmation}
        onOpenChange={setDeleteConfirmation}
        onConfirm={confirmDelete}
        title="Delete Reservation"
        description="Are you sure you want to delete this reservation? This action cannot be undone and all players will be notified."
        confirmButtonText="Delete Reservation"
        confirmButtonVariant="destructive"
      />

      <ActionConfirmationDialog
        open={joinConfirmation}
        onOpenChange={setJoinConfirmation}
        onConfirm={confirmJoin}
        title="Join Game"
        description={`Are you sure you want to join "${reservation.title || reservation.pitchName}"? You'll be added to the player lineup.`}
        confirmButtonText="Join Game"
        confirmButtonVariant="default"
      />

      <ActionConfirmationDialog
        open={leaveConfirmation}
        onOpenChange={setLeaveConfirmation}
        onConfirm={confirmLeave}
        title="Leave Game"
        description="Are you sure you want to leave this game? Your spot will be available for other players."
        confirmButtonText="Leave Game"
        confirmButtonVariant="destructive"
      />
    </>
  );
};

export default ReservationCard;
