import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MoreVertical, UserX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BanIcon } from "lucide-react";
import { useReservation, Reservation, Player } from "@/context/ReservationContext";
import SuspendPlayerDialog from "./SuspendPlayerDialog";

interface ReservationCardProps {
  reservation: Reservation;
  userId: string;
  userRole?: string;
  onJoin: (id: number, playerName?: string, userId?: string) => void;
  onCancel: (id: number, userId: string) => void;
  onJoinWaitingList: (id: number, userId: string) => void;
  onLeaveWaitingList: (id: number, userId: string) => void;
  isUserJoined: (reservationId: number, userId: string) => boolean;
  isFull: boolean;
  suspendPlayer?: (userId: string, reason: string, duration: number) => void;
  kickPlayerFromGame?: (reservationId: number, userId: string) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  userId,
  userRole = "player",
  onJoin,
  onCancel,
  onJoinWaitingList,
  onLeaveWaitingList,
  isUserJoined,
  isFull,
  suspendPlayer,
  kickPlayerFromGame,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [attendance, setAttendance] = useState<{ [userId: string]: boolean }>({});
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedPlayerName, setSelectedPlayerName] = useState("");
  const [selectedPlayerEmail, setSelectedPlayerEmail] = useState("");
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [kickDialogOpen, setKickDialogOpen] = useState(false);
  const { updateGameSummary, updatePlayerStats } = useReservation();
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [mvpPlayerId, setMvpPlayerId] = useState("");
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [editLineupDialogOpen, setEditLineupDialogOpen] = useState(false);
  const [editedLineup, setEditedLineup] = useState<Player[]>([]);

  const isGameCompleted = reservation.status === "completed";
  const isGameCancelled = reservation.status === "cancelled";
  const isAdmin = userRole === "admin";

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      onJoin(reservation.id, playerName, userId);
      toast({
        title: "Joined Game",
        description: "You have successfully joined the game!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Join",
        description: "There was an error joining the game. Please try again.",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      onCancel(reservation.id, userId);
      toast({
        title: "Cancelled Reservation",
        description: "You have cancelled your reservation.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Cancel",
        description: "There was an error cancelling your reservation. Please try again.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleJoinWaitingList = () => {
    onJoinWaitingList(reservation.id, userId);
    toast({
      title: "Joined Waiting List",
      description: "You have joined the waiting list for this game.",
    });
  };

  const handleLeaveWaitingList = () => {
    onLeaveWaitingList(reservation.id, userId);
    toast({
      title: "Left Waiting List",
      description: "You have left the waiting list for this game.",
    });
  };

  const isUserInWaitingList = reservation.waitingList?.includes(userId);

  const getPlayerAvatar = (player: Player) => {
    const nameParts = player.playerName.split(" ");
    const initials = nameParts.map((part) => part[0].toUpperCase()).join("");

    return (
      <Avatar className="h-8 w-8">
        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.playerName}`} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    );
  };

  const toggleAttendance = (player: Player) => {
    setAttendance((prevAttendance) => ({
      ...prevAttendance,
      [player.userId]: !prevAttendance[player.userId],
    }));
  };

  const handleShowAttendance = () => {
    // Initialize attendance state based on the current lineup
    const initialAttendance = reservation.lineup?.reduce((acc, player) => {
      acc[player.userId] = true; // Default to true (attended)
      return acc;
    }, {});
    setAttendance(initialAttendance || {});
    setShowAttendance(true);
  };

  const handleCloseAttendance = () => {
    setShowAttendance(false);
  };

  const handleOpenSuspendDialog = (player: Player) => {
    setSelectedPlayerId(player.userId);
    setSelectedPlayerName(player.playerName);
    setSelectedPlayerEmail(player.email || '');
    setSuspendDialogOpen(true);
  };

  const handleOpenKickDialog = (player: Player) => {
    setSelectedPlayerId(player.userId);
    setSelectedPlayerName(player.playerName);
    setKickDialogOpen(true);
  };

  const handleKickPlayer = () => {
    if (kickPlayerFromGame && selectedPlayerId) {
      kickPlayerFromGame(reservation.id, selectedPlayerId);
      setKickDialogOpen(false);
      toast({
        title: "Player Kicked",
        description: `Player ${selectedPlayerName} has been kicked from the game.`,
      });
    }
  };

  const handlePlayerSuspension = (userId: string, reason: string, duration: number) => {
    if (suspendPlayer && typeof suspendPlayer === 'function') {
      suspendPlayer(userId, reason, duration);
      setSuspendDialogOpen(false);
      toast({
        title: "Player Suspended",
        description: `Player has been suspended for ${duration} days.`,
      });
    }
  };

  const handleSaveSummary = () => {
    // Prepare player stats based on attendance
    const playerStats = reservation.lineup?.map(player => ({
      ...player,
      attended: attendance[player.userId] === undefined ? true : attendance[player.userId],
    })) || [];
    
    // Update game summary and player stats
    updateGameSummary(
      reservation.id,
      {
        homeScore,
        awayScore,
        completed: true,
        completedAt: new Date().toISOString(),
      },
      playerStats
    );
    
    setShowSummaryForm(false);
    toast({
      title: "Game Summary Saved",
      description: "The game summary has been saved.",
    });
  };

  const handleEditLineup = () => {
    setEditedLineup(reservation.lineup || []);
    setEditLineupDialogOpen(true);
  };

  const handleLineupChange = (userId: string, value: string) => {
    setEditedLineup(prevLineup =>
      prevLineup.map(player =>
        player.userId === userId ? { ...player, status: value } : player
      )
    );
  };

  const handleSaveLineup = () => {
    // Save the edited lineup to the reservation
    updateGameSummary(
      reservation.id,
      {
        homeScore,
        awayScore,
        completed: true,
        completedAt: new Date().toISOString(),
      },
      editedLineup
    );
    setEditLineupDialogOpen(false);
    toast({
      title: "Lineup Saved",
      description: "The edited lineup has been saved.",
    });
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{reservation.pitchName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{reservation.date} at {reservation.time}</p>
            <Badge variant="secondary" className="mt-2">{reservation.status}</Badge>
            {isGameCompleted && reservation.summary && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Final Score: {reservation.summary.homeScore} - {reservation.summary.awayScore}
              </p>
            )}
          </div>
          {isAdmin && !isGameCompleted && !isGameCancelled && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleShowAttendance}>
                  Mark Attendance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSummaryForm(true)}>
                  Add Game Summary
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEditLineup}>
                  Edit Lineup
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="text-red-500 focus-visible:bg-red-50 dark:focus-visible:bg-red-900/20">
                        Cancel Game
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently cancel the game.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            updateGameSummary(
                              reservation.id,
                              {
                                homeScore: 0,
                                awayScore: 0,
                                completed: false,
                                completedAt: new Date().toISOString(),
                              },
                              []
                            );
                            toast({
                              title: "Game Cancelled",
                              description: "The game has been cancelled.",
                            });
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <Separator className="my-2 dark:bg-gray-700" />
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Players Joined:</h3>
          {reservation.lineup && reservation.lineup.length > 0 ? (
            <ScrollArea className="h-[150px] rounded-md border dark:border-gray-700">
              <div className="p-2">
                {reservation.lineup.map((player) => (
                  <div key={player.userId} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      {getPlayerAvatar(player)}
                      <p className="text-sm text-gray-800 dark:text-gray-100">{player.playerName}</p>
                      {player.mvp && <Badge className="ml-1">MVP</Badge>}
                    </div>
                    {isAdmin && !isGameCompleted && !isGameCancelled && player.userId !== userId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-7 w-7 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenSuspendDialog(player)}>
                            Suspend Player
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenKickDialog(player)}>
                            Kick Player
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No players have joined yet.</p>
          )}
        </div>
        {/* Action Buttons */}
        {!isGameCompleted && !isGameCancelled && (
          <CardFooter className="flex justify-between items-center">
            {isUserJoined(reservation.id, userId) ? (
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isCancelling ? "Cancelling..." : "Cancel Reservation"}
              </Button>
            ) : isFull ? (
              !isUserInWaitingList ? (
                <Button variant="secondary" onClick={handleJoinWaitingList}>
                  Join Waiting List
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleLeaveWaitingList}>
                  Leave Waiting List
                </Button>
              )
            ) : (
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="max-w-[150px]"
                />
                <Button onClick={handleJoin} disabled={isJoining} className="bg-green-500 hover:bg-green-600 text-white">
                  {isJoining ? "Joining..." : "Join Game"}
                </Button>
              </div>
            )}
          </CardFooter>
        )}
      </CardContent>

      {/* Attendance Dialog */}
      <Dialog open={showAttendance} onOpenChange={setShowAttendance}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>
              Mark the attendance of players for this game.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {reservation.lineup?.map((player) => (
                <div key={player.userId} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    {getPlayerAvatar(player)}
                    <p className="text-sm font-medium leading-none text-gray-800 dark:text-gray-100">{player.playerName}</p>
                  </div>
                  <Checkbox
                    id={`attendance-${player.userId}`}
                    checked={attendance[player.userId] === undefined ? true : attendance[player.userId]}
                    onCheckedChange={() => toggleAttendance(player)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" onClick={handleCloseAttendance}>
              Save Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Form Dialog */}
      <Dialog open={showSummaryForm} onOpenChange={setShowSummaryForm}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Add Game Summary</DialogTitle>
            <DialogDescription>
              Enter the final score and MVP for this game.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="home-score">Home Team Score</Label>
                <Input
                  id="home-score"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value))}
                  type="number"
                  min="0"
                  className="col-span-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="away-score">Away Team Score</Label>
                <Input
                  id="away-score"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value))}
                  type="number"
                  min="0"
                  className="col-span-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mvp">MVP Player ID (optional)</Label>
              <Input
                id="mvp"
                value={mvpPlayerId}
                onChange={(e) => setMvpPlayerId(e.target.value)}
                placeholder="Player ID of the MVP"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowSummaryForm(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveSummary}>
              Save Summary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lineup Dialog */}
      <Dialog open={editLineupDialogOpen} onOpenChange={setEditLineupDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Edit Lineup</DialogTitle>
            <DialogDescription>
              Edit the status of players in the lineup.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {editedLineup.map((player) => (
                <div key={player.userId} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    {getPlayerAvatar(player)}
                    <p className="text-sm font-medium leading-none text-gray-800 dark:text-gray-100">{player.playerName}</p>
                  </div>
                  <Select value={player.status} onValueChange={(value) => handleLineupChange(player.userId, value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joined">Joined</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="maybe">Maybe</SelectItem>
                      <SelectItem value="not-attending">Not Attending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setEditLineupDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveLineup}>
              Save Lineup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Player Dialog */}
      <SuspendPlayerDialog
        isOpen={suspendDialogOpen}
        onClose={() => setSuspendDialogOpen(false)}
        players={[{ 
          userId: selectedPlayerId, 
          playerName: selectedPlayerName, 
          email: selectedPlayerEmail 
        }]}
        onSuspend={handlePlayerSuspension}
      />

      {/* Kick Player Dialog */}
      <AlertDialog open={kickDialogOpen} onOpenChange={setKickDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kick Player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to kick {selectedPlayerName} from this game?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setKickDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleKickPlayer} className="bg-red-500 hover:bg-red-600 text-white">
              Kick Player
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ReservationCard;
