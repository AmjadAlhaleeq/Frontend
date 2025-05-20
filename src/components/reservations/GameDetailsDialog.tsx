import { useState } from "react";
import { format, parseISO } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Trophy, 
  Star, 
  AlertTriangle,
  UserCheck,
  UserX,
  Edit,
  Trash,
  Send,
  CheckCircle,
  XCircle,
  Goal,
  User,
  ShieldAlert,
  ShieldX,
  Whistle,
  MessageCircle,
  Zap,
  HandMetal
} from "lucide-react";
import { Reservation, LineupPlayer, Highlight, useReservation } from "@/context/ReservationContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
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
import HighlightForm from "./HighlightForm";

interface GameDetailsDialogProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onStatusChange?: (status: 'open' | 'full' | 'completed' | 'cancelled') => void;
  currentUserId: string;
  actualMaxPlayers: number;
}

/**
 * GameDetailsDialog component
 * Shows detailed information about a game reservation
 * Allows admins to manage the game, add highlights, and update status
 * Players can view their status and game details
 */
const GameDetailsDialog = ({
  reservation,
  isOpen,
  onClose,
  isAdmin = false,
  onStatusChange,
  currentUserId,
  actualMaxPlayers
}: GameDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState("lineup");
  const { toast } = useToast();
  const { 
    updateReservationStatus, 
    addHighlight, 
    deleteHighlight, 
    editReservation,
    deleteReservation,
    removePlayerFromReservation,
    notifyWaitingListPlayers
  } = useReservation();
  
  // States for delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSuspendConfirmation, setShowSuspendConfirmation] = useState(false);
  const [playerToSuspend, setPlayerToSuspend] = useState<LineupPlayer | null>(null);
  const [showNotifyConfirmation, setShowNotifyConfirmation] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  
  // States for transferring to past games
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [finalScore, setFinalScore] = useState("");
  const [mvpPlayerId, setMvpPlayerId] = useState("");
  const [showHighlightForm, setShowHighlightForm] = useState(false);
  
  // Format date for display
  const formattedDate = format(parseISO(reservation.date), 'EEEE, MMMM d, yyyy');
  
  // Handle highlight deletion
  const handleDeleteHighlight = (highlightId: number) => {
    if (isAdmin) {
      deleteHighlight(reservation.id, highlightId);
      toast({
        title: "Highlight Deleted",
        description: "The highlight has been removed",
      });
    }
  };
  
  // Handle highlight addition
  const handleAddHighlight = (highlight: Highlight) => {
    if (isAdmin) {
      addHighlight(reservation.id, highlight);
      toast({
        title: "Highlight Added",
        description: "New highlight has been added to the game",
      });
      setShowHighlightForm(false);
    }
  };
  
  // Handle reservation deletion (for admins)
  const handleDeleteReservation = () => {
    if (isAdmin) {
      deleteReservation(reservation.id);
      setShowDeleteConfirmation(false);
      onClose();
      
      toast({
        title: "Reservation Deleted",
        description: "The reservation has been permanently deleted",
      });
    }
  };
  
  // Handle player suspension and removal (for admins)
  const handleSuspendPlayer = () => {
    if (isAdmin && playerToSuspend) {
      // Remove player from the reservation
      removePlayerFromReservation(reservation.id, playerToSuspend.userId);
      
      // In a real application, you would also update the player's suspension status
      setShowSuspendConfirmation(false);
      
      toast({
        title: "Player Suspended",
        description: `${playerToSuspend.playerName} has been suspended and removed from this game`,
      });
    }
  };
  
  // Handle notification to players (for admins)
  const handleNotifyPlayers = () => {
    if (isAdmin && notificationMessage) {
      // In a real application, you would send emails to all players
      // For now we just show a toast notification
      setShowNotifyConfirmation(false);
      setNotificationMessage("");
      
      toast({
        title: "Notification Sent",
        description: "All players have been notified by email",
      });
    }
  };

  // Handle notifying waiting list players when a spot opens
  const handleNotifyWaitingList = () => {
    if (isAdmin && reservation.waitingList.length > 0) {
      notifyWaitingListPlayers(reservation.id);
      toast({
        title: "Waiting List Notified",
        description: `${reservation.waitingList.length} players on the waiting list have been notified of an open spot`,
      });
    }
  };
  
  // Handle transferring to past games (for admins)
  const handleTransferToPast = () => {
    if (isAdmin) {
      if (!finalScore) {
        toast({
          title: "Final Score Required",
          description: "Please enter the final score",
          variant: "destructive"
        });
        return;
      }
      
      // Update the reservation status and add final score
      editReservation(reservation.id, {
        status: 'completed',
        finalScore: finalScore,
        mvpPlayerId: mvpPlayerId || undefined
      });
      
      setShowTransferDialog(false);
      onClose();
      
      toast({
        title: "Game Completed",
        description: "The game has been moved to past games",
      });
    }
  };
  
  // Navigate to edit reservation page
  const handleNavigateToEditPage = () => {
    if (isAdmin) {
      // Close the dialog, navigation would happen in a real implementation
      onClose();
      toast({
        title: "Edit Reservation",
        description: "Navigating to edit reservation page",
      });
    }
  };
  
  // Find MVP player name
  const getMvpPlayerName = () => {
    if (!reservation.mvpPlayerId) return 'None selected';
    
    const mvpPlayer = reservation.lineup.find(p => p.userId === reservation.mvpPlayerId);
    return mvpPlayer ? mvpPlayer.playerName || 'Unknown Player' : 'Unknown Player';
  };
  
  // Check if a user is the current user
  const isCurrentUser = (userId: string) => {
    return userId === currentUserId;
  };

  // Get icon for highlight type
  const getHighlightIcon = (highlight: Highlight) => {
    switch (highlight.type) {
      case 'goal':
        return highlight.isPenalty ? 
          <Whistle className="h-4 w-4 text-amber-500" /> : 
          <Goal className="h-4 w-4 text-green-500" />;
      case 'assist':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'yellowCard':
        return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
      case 'redCard':
        return <ShieldX className="h-4 w-4 text-red-500" />;
      case 'save':
        return <HandMetal className="h-4 w-4 text-purple-500" />;
      default:
        return <Star className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Admin action buttons
  const renderAdminActions = () => {
    if (!isAdmin) return null;
    
    return (
      <div className="flex flex-col space-y-2 mt-4">
        <div className="flex justify-between space-x-2">
          <Button
            onClick={() => setShowDeleteConfirmation(true)}
            variant="destructive"
            size="sm"
            className="flex-1"
          >
            <Trash className="h-4 w-4 mr-1.5" />
            Delete Reservation
          </Button>
          
          <Button
            onClick={() => setShowNotifyConfirmation(true)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-1.5" />
            Notify Players
          </Button>
        </div>
        
        <div className="flex justify-between space-x-2">
          <Button
            onClick={handleNavigateToEditPage}
            variant="outline"
            size="sm"
            className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit className="h-4 w-4 mr-1.5" />
            Edit Reservation
          </Button>
          
          {reservation.status !== 'completed' && (
            <Button
              onClick={() => setShowTransferDialog(true)}
              variant="outline"
              size="sm"
              className="flex-1 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Complete & Transfer
            </Button>
          )}
        </div>

        {reservation.waitingList.length > 0 && (
          <Button
            onClick={handleNotifyWaitingList}
            variant="outline"
            size="sm"
            className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            Notify Waiting List ({reservation.waitingList.length})
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {reservation.title || reservation.pitchName}
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center mt-2">
                <MapPin className="h-4 w-4 text-gray-500 mr-1.5" />
                <span className="text-gray-700 dark:text-gray-300">{reservation.location}</span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-gray-500">{reservation.time}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Users className="h-4 w-4 text-gray-500 mr-2" />
              <div>
                <p className="text-sm font-medium">Players</p>
                <p className="text-sm text-gray-500">{reservation.playersJoined}/{actualMaxPlayers}</p>
              </div>
            </div>
          </div>

          {reservation.status === 'completed' && (
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-md font-medium text-blue-700 dark:text-blue-400">Final Score</h3>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-300">{reservation.finalScore}</p>
                </div>
                
                {reservation.mvpPlayerId && (
                  <div className="text-right">
                    <h3 className="text-md font-medium text-amber-700 dark:text-amber-400">MVP</h3>
                    <p className="text-md font-semibold text-amber-800 dark:text-amber-300">{getMvpPlayerName()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Tabs defaultValue="lineup" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lineup">
                <Users className="h-4 w-4 mr-2" />
                Players
              </TabsTrigger>
              <TabsTrigger value="highlights">
                <Star className="h-4 w-4 mr-2" />
                Highlights
              </TabsTrigger>
            </TabsList>
            
            {/* Players Tab */}
            <TabsContent value="lineup" className="h-[300px] overflow-y-auto">
              {reservation.lineup.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">No players have joined this game yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservation.lineup.map((player) => (
                      <TableRow key={player.userId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback>
                                {player.playerName?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className={isCurrentUser(player.userId) ? "font-semibold text-teal-600" : ""}>
                              {player.playerName || `Player ${player.userId.substring(0, 4)}`}
                              {isCurrentUser(player.userId) && " (You)"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={player.status === 'joined' ? "default" : "secondary"}>
                            {player.status === 'joined' ? 'Joined' : player.status === 'left' ? 'Left' : 'Invited'}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setPlayerToSuspend(player);
                                setShowSuspendConfirmation(true);
                              }}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {/* Waiting List Section */}
              {reservation.waitingList.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 mr-1.5" />
                    Waiting List ({reservation.waitingList.length})
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {reservation.waitingList.map((userId, index) => (
                      <li key={userId} className="text-gray-600 dark:text-gray-400">
                        {index + 1}. Player {userId.substring(0, 4)}
                        {isCurrentUser(userId) && " (You)"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
            
            {/* Highlights Tab */}
            <TabsContent value="highlights" className="h-[300px] overflow-y-auto">
              {/* Current Highlights List */}
              {reservation.highlights.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">No highlights recorded for this game yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservation.highlights.map((highlight) => (
                    <div 
                      key={highlight.id} 
                      className="p-3 border rounded-md flex justify-between items-start"
                    >
                      <div>
                        <div className="flex items-center">
                          <span className="mr-2">
                            {getHighlightIcon(highlight)}
                          </span>
                          <Badge variant={
                            highlight.type === 'goal' ? "default" : 
                            highlight.type === 'assist' ? "outline" : 
                            highlight.type === 'yellowCard' ? "secondary" : 
                            highlight.type === 'redCard' ? "destructive" : "outline"
                          }>
                            {highlight.type === 'goal' ? (highlight.isPenalty ? 'Penalty Goal' : 'Goal') : 
                             highlight.type === 'assist' ? 'Assist' : 
                             highlight.type === 'yellowCard' ? 'Yellow Card' : 
                             highlight.type === 'redCard' ? 'Red Card' : 
                             highlight.type === 'save' ? 'Save' : 'Highlight'}
                          </Badge>
                          <span className="ml-2 text-sm font-medium">{highlight.playerName}</span>
                          <span className="ml-2 text-xs text-gray-500">{highlight.minute}'</span>
                        </div>
                        {highlight.assistPlayerName && (
                          <div className="mt-1 text-xs text-blue-600 flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            Assist: {highlight.assistPlayerName}
                          </div>
                        )}
                        {highlight.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {highlight.description}
                          </p>
                        )}
                      </div>
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteHighlight(highlight.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Highlight Form (Admins only) */}
              {isAdmin && !showHighlightForm && (
                <div className="mt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setShowHighlightForm(true)}
                    className="w-full"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Add New Highlight
                  </Button>
                </div>
              )}
              
              {isAdmin && showHighlightForm && (
                <div className="mt-4 p-3 border rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Add Game Highlight</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowHighlightForm(false)}
                      className="h-7 w-7 p-0"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <HighlightForm 
                    reservationId={reservation.id}
                    onSave={handleAddHighlight}
                    onCancel={() => setShowHighlightForm(false)}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Admin Actions Section */}
          {renderAdminActions()}
          
          <DialogFooter>
            {!isAdmin && reservation.status === 'open' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic mr-auto">
                Note: Players can join or leave games up to 2 hours before start time.
              </p>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reservation? All players will be notified by email.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReservation} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Suspend Player Dialog */}
      <AlertDialog open={showSuspendConfirmation} onOpenChange={setShowSuspendConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {playerToSuspend?.playerName || 'this player'}?
              They will be removed from this game and restricted from joining future games.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspendPlayer} className="bg-red-600 text-white hover:bg-red-700">
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Notify Players Dialog */}
      <AlertDialog open={showNotifyConfirmation} onOpenChange={setShowNotifyConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notify Players</AlertDialogTitle>
            <AlertDialogDescription>
              Send a notification to all players in this game. This will be delivered via email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Type your message here..."
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              className="w-full resize-none"
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleNotifyPlayers} disabled={!notificationMessage.trim()}>
              Send Notification
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Transfer to Past Games Dialog */}
      <AlertDialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Game</AlertDialogTitle>
            <AlertDialogDescription>
              Complete this game and move it to past games. Add the final score and other details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Final Score</label>
              <Input
                placeholder="e.g., 3-2"
                value={finalScore}
                onChange={(e) => setFinalScore(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">MVP (Optional)</label>
              <Select
                value={mvpPlayerId}
                onValueChange={setMvpPlayerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select MVP player" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-mvp">No MVP selected</SelectItem>
                  {reservation.lineup
                    .filter(player => player.status === 'joined')
                    .map((player) => (
                      <SelectItem key={player.userId} value={player.userId || "player-default"}>
                        {player.playerName || `Player ${player.userId.substring(0, 4)}`}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // Save the score and MVP, then show highlight form
                  if (!finalScore) {
                    toast({
                      title: "Final Score Required",
                      description: "Please enter the final score before adding highlights",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  setShowTransferDialog(false);
                  setShowHighlightForm(true);
                }}
              >
                <Star className="h-4 w-4 mr-2" />
                Add Highlights First
              </Button>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTransferToPast}>
              Complete & Transfer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GameDetailsDialog;
