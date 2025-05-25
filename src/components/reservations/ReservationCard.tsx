
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
  UserX
} from "lucide-react";
import { Reservation } from "@/context/ReservationContext";
import { format, parseISO } from 'date-fns';

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
  onViewDetails
}) => {
  const [maxPlayersInput, setMaxPlayersInput] = useState(reservation.maxPlayers);
  const currentPlayers = reservation.lineup?.length || 0;
  const actualMaxPlayers = maxPlayersInput + 2; // Allow 2 extra players
  const progressPercentage = Math.min((currentPlayers / actualMaxPlayers) * 100, 100);
  
  const userHasJoined = isUserJoined(reservation.id, userId);
  const isInWaitingList = reservation.waitingList?.some(player => player.userId === userId) || false;
  
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-teal-500">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {reservation.pitchName}
            </h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="truncate">{reservation.location}</span>
            </div>
          </div>
          {userRole === 'admin' && onDeleteReservation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteReservation(reservation.id);
              }}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{currentPlayers} joined</span>
              <span>{actualMaxPlayers} max (inc. +2)</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant={reservation.status === "upcoming" ? "default" : "secondary"}
              className={
                reservation.status === "upcoming" 
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" 
                  : ""
              }
            >
              {reservation.status}
            </Badge>
            
            {/* Waiting List Info */}
            {reservation.waitingList && reservation.waitingList.length > 0 && (
              <div className="text-xs text-orange-600 dark:text-orange-400">
                {reservation.waitingList.length} waiting
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(reservation);
              }}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
            
            {userRole === 'player' && (
              <>
                {!userHasJoined && !isInWaitingList && !isFull && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onJoin(reservation.id);
                    }}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Join
                  </Button>
                )}
                
                {userHasJoined && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(reservation.id, userId);
                    }}
                    className="flex-1"
                  >
                    <UserMinus className="h-4 w-4 mr-1" />
                    Leave
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
                    className="flex-1"
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
                    className="flex-1"
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
  );
};

export default ReservationCard;
