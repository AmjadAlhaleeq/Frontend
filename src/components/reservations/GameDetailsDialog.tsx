
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  X,
  ChevronRight,
  Award,
  Star,
  UserX,
  AlertTriangle,
  Trash2,
  Edit,
  Goal,
  Check,
  Trophy,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Reservation, Highlight } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";
import SuspendPlayerForm from "./SuspendPlayerForm";
import HighlightForm from "./HighlightForm";
import CancelConfirmationDialog from "./CancelConfirmationDialog";
import TransferReservationDialog from "./TransferReservationDialog";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface GameDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation;
  isAdmin: boolean;
  onStatusChange: (status: 'open' | 'full' | 'completed' | 'cancelled') => void;
  currentUserId: string;
  actualMaxPlayers: number;
}

const GameDetailsDialog: React.FC<GameDetailsDialogProps> = ({
  open,
  onOpenChange,
  reservation,
  isAdmin,
  onStatusChange,
  currentUserId,
  actualMaxPlayers
}) => {
  const { toast } = useToast();
  const [isPlayerSuspensionOpen, setIsPlayerSuspensionOpen] = useState(false);
  const [isHighlightFormOpen, setIsHighlightFormOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>(reservation.highlights || []);
  const [finalScore, setFinalScore] = useState<{home: number, away: number}>({home: 0, away: 0});
  const [mvp, setMvp] = useState<string>("");
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [waitingListNotified, setWaitingListNotified] = useState<string[]>([]);

  // Initialize final score from reservation if available
  useEffect(() => {
    if (reservation.finalScore) {
      setFinalScore(reservation.finalScore);
    }
    if (reservation.mvp) {
      setMvp(reservation.mvp);
    }
  }, [reservation]);

  const handleOpenSuspendPlayer = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setIsPlayerSuspensionOpen(true);
  };

  const handlePlayerSuspension = (playerId: string, reason: string) => {
    // Implement suspension logic here
    toast({
      title: "Player Suspended",
      description: `Player ${playerId} has been suspended for: ${reason}`,
    });
    setIsPlayerSuspensionOpen(false);
  };

  const handleRemovePlayer = (playerId: string) => {
    // Implement remove player logic here
    toast({
      title: "Player Removed",
      description: `Player ${playerId} has been removed from the game.`,
    });
  };

  const handleCancelReservation = () => {
    // Implement cancel reservation logic here
    onStatusChange('cancelled');
    toast({
      title: "Reservation Cancelled",
      description: "This reservation has been cancelled.",
    });
    onOpenChange(false);
  };

  const handleTransferReservation = (newReservationId: string) => {
    // Implement transfer reservation logic here
    toast({
      title: "Reservation Transferred",
      description: `Reservation has been transferred to ${newReservationId}.`,
    });
    setIsTransferDialogOpen(false);
    onOpenChange(false);
  };

  const handleAddHighlight = (data: Highlight) => {
    const newHighlight = {
      ...data,
      id: Date.now().toString(),
    };
    setHighlights([...highlights, newHighlight]);
    toast({
      title: "Highlight Added",
      description: "The game highlight has been recorded.",
    });
    setIsHighlightFormOpen(false);
  };

  const handleCompleteGame = () => {
    setShowScoreInput(true);
  };

  const handleSaveGameResult = () => {
    // Save final score and MVP
    onStatusChange('completed');
    toast({
      title: "Game Completed",
      description: `Final score: ${finalScore.home}-${finalScore.away}, MVP: ${mvp || 'Not selected'}`,
    });
    setShowScoreInput(false);
  };

  const handleNotifyWaitingList = (playerId: string) => {
    if (!waitingListNotified.includes(playerId)) {
      setWaitingListNotified([...waitingListNotified, playerId]);
      toast({
        title: "Player Notified",
        description: `Player ${playerId} has been notified of an open spot.`,
      });
    }
  };

  const isPastGame = reservation.status === 'completed' || new Date(reservation.date) < new Date();
  const formattedDate = format(parseISO(reservation.date), 'EEEE, MMMM d, yyyy');

  // Filter highlights by type to show statistics
  const goals = highlights.filter(h => h.type === 'goal');
  const assists = highlights.filter(h => h.type === 'assist');
  const yellowCards = highlights.filter(h => h.type === 'yellowCard');
  const redCards = highlights.filter(h => h.type === 'redCard');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {isPastGame ? "Game Details" : "Game Management"}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Game Info */}
          <div>
            {reservation.imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden mb-4">
                <img 
                  src={reservation.imageUrl} 
                  alt={reservation.pitchName} 
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2 mb-3">
              <CalendarDays className="h-5 w-5 text-gray-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <span>{reservation.time}</span>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span>{reservation.location}</span>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <Users className="h-5 w-5 text-gray-500" />
              <span>
                {reservation.playersJoined} / {actualMaxPlayers} Players
              </span>
            </div>

            {reservation.finalScore && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-3 text-center">
                <div className="text-sm text-gray-500 mb-1">Final Score</div>
                <div className="text-2xl font-bold">
                  {reservation.finalScore.home} - {reservation.finalScore.away}
                </div>
              </div>
            )}

            {reservation.mvp && (
              <div className="flex items-center space-x-2 mb-3">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span>MVP: {reservation.mvp}</span>
              </div>
            )}

            <Separator className="my-4" />

            <h3 className="text-md font-semibold mb-2">Players Joined</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {reservation.lineup.map((player) => (
                <div key={player.userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${player.playerName}`} />
                      <AvatarFallback>{player.playerName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{player.playerName}</span>
                  </div>
                  {isAdmin && !isPastGame && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenSuspendPlayer(player.userId)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemovePlayer(player.userId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Waiting list section */}
            {reservation.waitingList && reservation.waitingList.length > 0 && (
              <>
                <h3 className="text-md font-semibold mt-4 mb-2">Waiting List</h3>
                <div className="space-y-3">
                  {reservation.waitingList.map((playerId) => (
                    <div key={playerId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${playerId}`} />
                          <AvatarFallback>{playerId?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{playerId}</span>
                      </div>
                      {isAdmin && !isPastGame && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNotifyWaitingList(playerId)}
                          disabled={waitingListNotified.includes(playerId)}
                        >
                          {waitingListNotified.includes(playerId) ? (
                            <>
                              <Check className="h-4 w-4 mr-1" /> Notified
                            </>
                          ) : (
                            "Notify"
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Column: Game Management or Details */}
          <div>
            {!isPastGame && isAdmin && !showScoreInput && (
              <>
                <h3 className="text-md font-semibold mb-2">Game Management</h3>
                <div className="space-y-3">
                  <Button onClick={() => setIsHighlightFormOpen(true)} className="w-full">
                    Add Highlight
                  </Button>
                  <Button 
                    onClick={handleCompleteGame} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Complete Game
                  </Button>
                  <Button onClick={() => setIsTransferDialogOpen(true)} className="w-full">
                    Transfer Reservation
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setIsCancelDialogOpen(true)}
                    className="w-full"
                  >
                    Cancel Game
                  </Button>
                </div>
              </>
            )}

            {showScoreInput && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Complete Game</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="space-y-1">
                      <Label htmlFor="homeScore">Home</Label>
                      <Input 
                        id="homeScore" 
                        type="number" 
                        value={finalScore.home}
                        onChange={(e) => setFinalScore({...finalScore, home: parseInt(e.target.value) || 0})}
                        min="0"
                      />
                    </div>
                    <div className="flex justify-center items-center text-xl font-bold">
                      vs
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="awayScore">Away</Label>
                      <Input 
                        id="awayScore" 
                        type="number" 
                        value={finalScore.away}
                        onChange={(e) => setFinalScore({...finalScore, away: parseInt(e.target.value) || 0})}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="mvp">MVP Player</Label>
                    <Input 
                      id="mvp" 
                      type="text" 
                      value={mvp}
                      onChange={(e) => setMvp(e.target.value)}
                      placeholder="Enter MVP player name"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowScoreInput(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveGameResult}>
                      Save Result
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator className="my-4" />

            <h3 className="text-md font-semibold mb-2">Game Highlights</h3>
            
            {/* Game statistics */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded text-center">
                <div className="text-green-600 dark:text-green-400 flex justify-center mb-1">
                  <Goal className="h-5 w-5" />
                </div>
                <div className="text-lg font-bold">{goals.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Goals</div>
              </div>
              
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-center">
                <div className="text-blue-600 dark:text-blue-400 flex justify-center mb-1">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="text-lg font-bold">{assists.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Assists</div>
              </div>
              
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded text-center">
                <div className="text-yellow-600 dark:text-yellow-400 flex justify-center mb-1">
                  <Award className="h-5 w-5" />
                </div>
                <div className="text-lg font-bold">{yellowCards.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Yellow</div>
              </div>
              
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded text-center">
                <div className="text-red-600 dark:text-red-400 flex justify-center mb-1">
                  <Star className="h-5 w-5" />
                </div>
                <div className="text-lg font-bold">{redCards.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Red</div>
              </div>
            </div>
            
            {/* Highlight list */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {highlights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No highlights recorded yet
                </div>
              ) : (
                highlights.map((highlight) => (
                  <div 
                    key={highlight.id} 
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center"
                  >
                    <div className="mr-3">
                      {highlight.type === 'goal' && <Goal className="h-5 w-5 text-green-500" />}
                      {highlight.type === 'assist' && <Zap className="h-5 w-5 text-blue-500" />}
                      {highlight.type === 'yellowCard' && <Award className="h-5 w-5 text-yellow-500" />}
                      {highlight.type === 'redCard' && <Star className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {highlight.playerId} 
                          {highlight.type === 'goal' && highlight.assistPlayerId && 
                            <span className="font-normal text-sm"> (assist: {highlight.assistPlayerId})</span>
                          }
                        </span>
                        {highlight.isPenalty && (
                          <Badge variant="outline" className="ml-2">Penalty</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {highlight.minute}' - {highlight.description}
                      </div>
                    </div>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="ml-2">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Highlight Form Dialog */}
        <HighlightForm
          open={isHighlightFormOpen}
          onOpenChange={setIsHighlightFormOpen}
          onClose={() => setIsHighlightFormOpen(false)}
          onSubmit={handleAddHighlight}
          reservationId={reservation.id}
        />

        {/* Suspend Player Dialog */}
        <SuspendPlayerForm
          open={isPlayerSuspensionOpen}
          onOpenChange={setIsPlayerSuspensionOpen}
          playerId={selectedPlayerId}
          onSuspend={handlePlayerSuspension}
        />

        {/* Cancel Confirmation Dialog */}
        <CancelConfirmationDialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          onConfirm={handleCancelReservation}
          pitchName={reservation.pitchName}
          date={formattedDate}
          time={reservation.time}
        />

        {/* Transfer Reservation Dialog */}
        <TransferReservationDialog
          open={isTransferDialogOpen}
          onOpenChange={setIsTransferDialogOpen}
          onConfirm={handleTransferReservation}
        />
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsDialog;
