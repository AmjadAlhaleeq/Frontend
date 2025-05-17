import { useState } from "react";
import PlayerLineup from "./PlayerLineup";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  ArrowRight,
  Users,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
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
import ReservationCard from "@/components/reservations/ReservationCard";

const Reservations = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const [isAdmin] = useState(true); // For demo purposes
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedPastGame, setSelectedPastGame] = useState<Reservation | null>(
    null
  );
  const [isGameDetailsOpen, setIsGameDetailsOpen] = useState(false);
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
  } = useReservation();

  const currentUser = "user1"; // Same as ReservationContext

  const dateReservations = date ? getReservationsForDate(date) : [];
  const hasReservationsForDate = dateReservations.length > 0;

  const upcomingReservations = reservations.filter(
    (res) => res.status === "open" || res.status === "full"
  );

  const pastReservations = reservations.filter(
    (res) => res.status === "completed"
  ).slice(0, 3); // Only show last 3 reservations

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
    joinGame(reservationId, positionIdx);
    toast({
      title: "Position Selected",
      description: `You've joined as ${positionName}!`,
      duration: 2500,
    });
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
            <Card className="mt-4 bg-white dark:bg-gray-800 border border-[#0F766E]/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-[#0F766E] dark:text-[#0F766E]/80">
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
                        <p className="font-medium">{res.pitchName} Game #{res.id}</p>
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
                      onJoinGame={() => {
                        joinGame(reservation.id);
                      }}
                      onCancelReservation={cancelReservation}
                      onJoinWaitingList={joinWaitingList}
                      isUserJoined={isUserJoined(reservation.id)}
                      hasUserJoinedOnDate={hasUserJoinedOnDate}
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
                        <p className="text-2xl font-bold text-[#0F766E]">15</p>
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
                              {reservation.pitchName} Game #{reservation.id}
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
        open={showLineupDialogFor !== null}
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
              <div className="bg-[#0F766E]/10 dark:bg-[#0F766E]/20 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-[#0F766E]">
                  {selectedPastGame.pitchName} Game #{selectedPastGame.id}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-[#0F766E] mr-2" />
                    <span>{selectedPastGame.time}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-[#0F766E] mr-2" />
                    <span>{selectedPastGame.playersJoined} players</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Game Highlights</h4>
                <HighlightsList 
                  reservationId={selectedPastGame.id}
                  isAdmin={isAdmin}
                />
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
    <div className="p-3 bg-[#0F766E]/10 dark:bg-[#0F766E]/20 rounded-full mb-4">
      <CalendarIcon className="h-8 w-8 text-[#0F766E]" />
    </div>
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
    <Button className="bg-[#0F766E] hover:bg-[#0F766E]/90">
      {actionText}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
);

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

import HighlightsList from "../components/reservations/HighlightsList";

export default Reservations;
