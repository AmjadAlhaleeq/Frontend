import { useState } from "react";
import PlayerLineup from "./PlayerLineup";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  AlertCircle,
  CheckCircle,
  X,
  ArrowRight,
  Info,
  Trophy,
  Timer,
  Star,
  User,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReservation, Reservation } from "@/context/ReservationContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PitchLineup from "@/components/PitchLineup";
import { format } from "date-fns";
import AddReservationDialog from "@/components/reservations/AddReservationDialog";
import EnhancedDatePicker from "@/components/reservations/EnhancedDatePicker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import EditReservationDialog from "@/components/reservations/EditReservationDialog";
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
import { AlertTriangle, XCircle } from "lucide-react";

// Inside your ReservationCard component
// const [showCancelDialog, setShowCancelDialog] = useState(false);
const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  type,
  onJoinGame,
  onCancelReservation,
  onJoinWaitingList,
  isUserJoined,
  hasUserJoinedOnDate,
  onShowLineup,
  showLineupButton,
}) => {
  const { toast } = useToast();
  const { deleteReservation } = useReservation();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const userAlreadyJoinedOnDate =
    hasUserJoinedOnDate && !isUserJoined
      ? hasUserJoinedOnDate(reservation.date)
      : false;
  const slotsLeft = reservation.maxPlayers - reservation.playersJoined;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden bg-white border border-[#0F766E]/20">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-48 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0F766E]/20 to-[#0F766E]/40" />
            <img
              src={`https://source.unsplash.com/random/400x400/?football,soccer,pitch&${reservation.id}`}
              alt={reservation.pitchName}
              className="w-full h-full object-cover"
            />
            <Badge
              className={cn(
                "absolute top-4 right-4",
                reservation.status === "open"
                  ? "bg-[#0F766E]"
                  : reservation.status === "full"
                  ? "bg-orange-500"
                  : "bg-gray-500"
              )}
            >
              {reservation.status.charAt(0).toUpperCase() +
                reservation.status.slice(1)}
            </Badge>
          </div>

          <div className="flex-1 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-[#0F766E] mb-1">
                  {reservation.pitchName}
                </h3>
                <p className="text-sm text-gray-600">Game #{reservation.id}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowEditDialog(true)}
                  className="text-[#0F766E] border-[#0F766E]/20 hover:bg-[#0F766E]/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this reservation?"
                      )
                    ) {
                      deleteReservation(reservation.id);
                    }
                  }}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* ... other card content ... */}

              <div className="flex items-center col-span-2">
                <Users className="h-4 w-4 text-[#0F766E] mr-2" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">
                      {reservation.playersJoined}/{reservation.maxPlayers}{" "}
                      players
                    </p>
                    <span className="text-xs text-gray-500">
                      {slotsLeft} spots left
                    </span>
                  </div>
                  <Progress
                    value={
                      (reservation.playersJoined / reservation.maxPlayers) * 100
                    }
                    className="h-1 mt-2 bg-[#0F766E]/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#0F766E]/10">
              <div className="text-xs text-gray-500">
                {isUserJoined && (
                  <div className="flex items-center text-[#0F766E]">
                    <Users className="h-3 w-3 mr-1" />
                    You're in this game
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                {isUserJoined && type === "upcoming" && (
                  <Button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to cancel your reservation?"
                        )
                      ) {
                        onCancelReservation?.(reservation.id);
                        toast({
                          title: "Reservation Cancelled",
                          description: "You've successfully left the game",
                          duration: 3000,
                          className: "bg-red-100 text-red-700",
                        });
                      }
                    }}
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    style={{
                      margin: "0 auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "180px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel Reservation
                  </Button>
                )}
                <Button
                  onClick={
                    type === "upcoming" &&
                    !isUserJoined &&
                    !userAlreadyJoinedOnDate
                      ? onJoinGame
                      : () => {}
                  }
                  variant={type === "past" ? "outline" : "default"}
                  className={cn(
                    type === "past"
                      ? ""
                      : isUserJoined
                      ? "bg-gray-400 cursor-not-allowed"
                      : userAlreadyJoinedOnDate
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-bokit-500 hover:bg-bokit-600",
                    "transition-colors duration-200"
                  )}
                  disabled={
                    type === "upcoming" &&
                    (isUserJoined || userAlreadyJoinedOnDate)
                  }
                >
                  {type === "past"
                    ? "View Details"
                    : isUserJoined
                    ? "Already Joined"
                    : userAlreadyJoinedOnDate
                    ? "Already Booked Today"
                    : reservation.status === "full"
                    ? "Join Waiting List"
                    : "Join Game"}
                </Button>
                {type === "upcoming" && showLineupButton && (
                  <Button
                    variant="outline"
                    onClick={onShowLineup}
                    className="ml-2 border-bokit-500 text-bokit-600 hover:bg-bokit-50 hover:text-bokit-700 transition-colors"
                  >
                    Show Lineup
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {showEditDialog && (
        <EditReservationDialog
          reservation={reservation}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
        />
      )}
    </Card>
  );
};
const Reservations = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const [isAdmin] = useState(true); // For demo purposes
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedPastGame, setSelectedPastGame] = useState<Reservation | null>(
    null
  );
  const [isGameDetailsOpen, setIsGameDetailsOpen] = useState(false);
  const [showLineupFor, setShowLineupFor] = useState<number | null>(null);
  const [showLineupDialogFor, setShowLineupDialogFor] = useState<number | null>(
    null
  );
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const {
    reservations,
    joinGame,
    cancelReservation,
    joinWaitingList,
    isUserJoined,
    hasUserJoinedOnDate,
    getReservationsForDate,
    deleteReservation,
  } = useReservation();

  const currentUser = "user1"; // Same as ReservationContext

  const dateReservations = date ? getReservationsForDate(date) : [];
  const hasReservationsForDate = dateReservations.length > 0;

  const upcomingReservations = reservations.filter(
    (res) => res.status === "open" || res.status === "full"
  );

  const pastReservations = reservations.filter(
    (res) => res.status === "completed"
  );

  const handleViewPastGameDetails = (reservation: Reservation) => {
    setSelectedPastGame(reservation);
    setIsGameDetailsOpen(true);
  };

  const handleSelectPosition = (
    reservationId: number,
    positionIdx: number,
    positionName: string
  ) => {
    setSelectedPosition(positionIdx);
    setShowLineupFor(null);
    joinGame(reservationId, positionIdx);
    toast({
      title: "Position Selected",
      description: `You've joined as ${positionName}!`,
      duration: 2500,
    });
  };

  const handleCloseLineupDialog = () => {
    setShowLineupFor(null);
  };

  const checkHasReservations = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return reservations.some((r) => r.date === dateStr);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reservations</h1>
          <p className="text-muted-foreground mt-1">
            Book and manage your football pitch reservations
          </p>
        </div>

        {isAdmin && <AddReservationDialog />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <EnhancedDatePicker
            date={date}
            onDateChange={setDate}
            hasReservations={checkHasReservations}
          />

          {hasReservationsForDate && date && (
            <Card className="mt-4 bg-white dark:bg-gray-800 border border-bokit-100 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-bokit-700 dark:text-bokit-300">
                  Games on {format(date, "MMMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dateReservations.map((res, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">{res.pitchName}</p>
                        <p className="text-xs text-muted-foreground">
                          {res.time}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          res.status === "open"
                            ? "bg-green-500"
                            : res.status === "full"
                            ? "bg-orange-500"
                            : "bg-gray-500"
                        )}
                      >
                        {res.playersJoined}/{res.maxPlayers}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Tabs
            defaultValue="upcoming"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upcoming">
                <CheckCircle className="h-4 w-4 mr-2" />
                Upcoming Games
              </TabsTrigger>
              <TabsTrigger value="past">
                <Clock className="h-4 w-4 mr-2" />
                Past Games
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingReservations.length === 0 ? (
                <EmptyState
                  title="No upcoming games"
                  description="You don't have any upcoming reservations."
                  actionText="Book a Pitch"
                />
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-muted-foreground">
                      Showing {upcomingReservations.length} upcoming games
                    </div>
                    <div className="flex space-x-2">
                      <Badge className="bg-green-500">Open</Badge>
                      <Badge className="bg-orange-500">Full</Badge>
                    </div>
                  </div>

                  {upcomingReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      type="upcoming"
                      onJoinGame={() => setShowLineupFor(reservation.id)}
                      onCancelReservation={cancelReservation}
                      onJoinWaitingList={joinWaitingList}
                      isUserJoined={isUserJoined(reservation.id)}
                      hasUserJoinedOnDate={hasUserJoinedOnDate}
                      onShowLineup={() =>
                        setShowLineupDialogFor(reservation.id)
                      }
                      showLineupButton
                    />
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastReservations.length === 0 ? (
                <EmptyState
                  title="No past games"
                  description="You don't have any past reservations."
                  actionText="Book a Pitch"
                />
              ) : (
                <>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border mb-4">
                    <h3 className="font-medium mb-3">Game Stats Summary</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {pastReservations.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Games Played
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-bokit-500">15</p>
                        <p className="text-xs text-muted-foreground">
                          Goals Scored
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-500">2</p>
                        <p className="text-xs text-muted-foreground">
                          MVP Awards
                        </p>
                      </div>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Venue</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Players
                        </TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastReservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell>
                            <div className="font-medium">
                              {formatDate(reservation.date)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {reservation.pitchName}
                            </div>
                          </TableCell>
                          <TableCell>{reservation.time}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>
                                {reservation.playersJoined}/
                                {reservation.maxPlayers}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleViewPastGameDetails(reservation)
                              }
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog
        open={!!showLineupFor}
        onOpenChange={() => setShowLineupFor(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Your Position</DialogTitle>
            <DialogDescription>
              Choose where you want to play in the lineup for this game.
            </DialogDescription>
          </DialogHeader>
          {showLineupFor &&
            (() => {
              const reservation = reservations.find(
                (r) => r.id === showLineupFor
              );
              if (!reservation) return null;

              const pickedPlayers = Array(reservation.maxPlayers).fill(null);

              reservation.joinedPlayers.forEach((p, idx) => {
                if (p) {
                  const positionIndex =
                    p.position !== undefined ? p.position : idx;
                  pickedPlayers[positionIndex] =
                    p.userId === currentUser ? "You" : `Player ${idx + 1}`;
                }
              });

              return (
                <div>
                  <PlayerLineup
                    maxPlayers={reservation.maxPlayers}
                    currentPlayers={reservation.playersJoined}
                    onSelect={(pos, posName) =>
                      handleSelectPosition(reservation.id, pos, posName)
                    }
                    onCancel={handleCloseLineupDialog}
                    pickedPosition={selectedPosition}
                    joinedPlayers={pickedPlayers}
                  />
                  <div className="mt-3">
                    <PitchLineup
                      maxPlayers={reservation.maxPlayers}
                      players={pickedPlayers}
                    />
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!showLineupDialogFor}
        onOpenChange={() => setShowLineupDialogFor(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Player Lineup</DialogTitle>
            <DialogDescription>
              Visual team lineup with names in positions.
            </DialogDescription>
          </DialogHeader>
          {showLineupDialogFor &&
            (() => {
              const reservation = reservations.find(
                (r) => r.id === showLineupDialogFor
              );
              if (!reservation) return null;

              const playerList = Array(reservation.maxPlayers).fill(null);

              reservation.joinedPlayers.forEach((p) => {
                if (p) {
                  const positionIndex =
                    p.position !== undefined ? p.position : 0;
                  playerList[positionIndex] =
                    p.userId === currentUser
                      ? "You"
                      : `Player ${positionIndex + 1}`;
                }
              });

              return (
                <PitchLineup
                  maxPlayers={reservation.maxPlayers}
                  players={playerList}
                />
              );
            })()}
        </DialogContent>
      </Dialog>

      <Dialog open={isGameDetailsOpen} onOpenChange={setIsGameDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Game Details</DialogTitle>
            <DialogDescription>
              {selectedPastGame && formatDate(selectedPastGame.date)}
            </DialogDescription>
          </DialogHeader>

          {selectedPastGame && (
            <div className="space-y-4">
              <div className="bg-bokit-50 dark:bg-bokit-900/20 p-4 rounded-lg shadow-md">
                <h3 className="font-medium mb-2 text-bokit-700 dark:text-bokit-300">
                  {selectedPastGame.pitchName}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-bokit-500 mr-2" />
                    <span>{selectedPastGame.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-bokit-500 mr-2" />
                    <span>{selectedPastGame.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-bokit-500 mr-2" />
                    <span>{selectedPastGame.playersJoined} players</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                    <span>Final Score: 3-2</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Game Highlights</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <div className="w-24 text-muted-foreground">14'</div>
                    <div>Goal by John D.</div>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-24 text-muted-foreground">32'</div>
                    <div>Yellow card for Michael S.</div>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-24 text-muted-foreground">47'</div>
                    <div>Goal by Sarah L.</div>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-24 text-muted-foreground">63'</div>
                    <div>Goal by Alex P.</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">MVP and Top Players</h4>
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-lg flex items-center mb-3">
                  <div className="bg-amber-200 dark:bg-amber-700 rounded-full p-2 mr-3">
                    <Star className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div>
                    <div className="font-medium">Sarah L.</div>
                    <div className="text-xs text-muted-foreground">
                      MVP with 2 goals and 1 assist
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg flex items-center">
                    <User className="h-4 w-4 text-bokit-500 mr-2" />
                    <div className="text-sm">
                      <div>John D.</div>
                      <div className="text-xs text-muted-foreground">
                        1 goal
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg flex items-center">
                    <User className="h-4 w-4 text-bokit-500 mr-2" />
                    <div className="text-sm">
                      <div>Alex P.</div>
                      <div className="text-xs text-muted-foreground">
                        1 goal, 1 assist
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                <p>
                  Game completed on{" "}
                  {new Date(selectedPastGame.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EmptyState = ({
  title,
  description,
  actionText,
}: {
  title: string;
  description: string;
  actionText: string;
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="p-3 bg-bokit-100 dark:bg-bokit-900/20 rounded-full mb-4">
      <Calendar className="h-8 w-8 text-bokit-500" />
    </div>
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
    <Button>
      {actionText}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
);

interface ReservationCardProps {
  reservation: Reservation;
  type: "upcoming" | "past";
  onJoinGame?: () => void;
  onCancelReservation?: (id: number) => void;
  onJoinWaitingList?: (id: number) => void;
  isUserJoined?: boolean;
  hasUserJoinedOnDate?: (date: string) => boolean;
  onShowLineup?: () => void;
  showLineupButton?: boolean;
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

export default Reservations;
