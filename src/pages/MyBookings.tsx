import React, { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Calendar, Loader, MapPin, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { useReservation } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";

const MyBookings = () => {
  const { reservations } = useReservation();
  const { toast } = useToast();

  // Current user
  const storedUser = localStorage.getItem("currentUser");
  const userId = storedUser ? JSON.parse(storedUser)?.id : null;

  const userReservations = useMemo(() => {
    if (!userId) return [];
    return reservations.filter((res) =>
      res.lineup?.some(
        (player) => player.userId === userId && player.status === "joined"
      )
    );
  }, [reservations, userId]);

  const handleReservationClick = (reservationId: number) => {
    // Route to /reservations, could use query param if needed or scroll to card
    window.location.href = `/reservations#reservation-${reservationId}`;
  };

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-lg text-muted-foreground">
          Please login to view your bookings
        </span>
      </div>
    );
  }

  if (!reservations) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-teal-500 mr-3" />
        <span className="text-lg text-muted-foreground">
          Loading your bookings...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">
          Manage your upcoming and past games
        </p>
      </header>

      <div className="space-y-6">
        {userReservations.length === 0 ? (
          <div className="text-center py-12 bg-muted/40 rounded-lg">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Bookings Found</h2>
            <p className="text-muted-foreground mb-6">
              You haven't joined any games yet
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {userReservations.map((reservation) => (
              <Card
                key={reservation.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleReservationClick(reservation.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {reservation.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {reservation.pitchName || "Football Pitch"}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-teal-600">
                        {reservation.price} JD
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.gameFormat || "7v7"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(reservation.date), "PPP")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.startTime} - {reservation.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Players</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.lineup?.length || 0} /{" "}
                          {reservation.maxPlayers}
                        </p>
                      </div>
                    </div>
                  </div>

                  {reservation.location && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        click here to see the reservation
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
