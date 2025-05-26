
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, Loader, MapPin, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMyBookings } from "@/lib/userApi";
import { format } from "date-fns";

const MyBookings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      const authToken = localStorage.getItem("authToken");
      
      if (!authToken) {
        toast({
          title: "Not logged in",
          description: "Please login to view your bookings",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await getMyBookings();
        
        if (response.status === "success" && response.data?.reservations) {
          setReservations(response.data.reservations);
        } else {
          throw new Error('Failed to fetch bookings');
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Could not load your bookings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-teal-500 mr-3" />
        <span className="text-lg text-muted-foreground">Loading your bookings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">Manage your upcoming games and reservations</p>
      </header>
      
      <div className="space-y-6">
        {reservations.length === 0 ? (
          <div className="text-center py-12 bg-muted/40 rounded-lg">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Bookings Found</h2>
            <p className="text-muted-foreground mb-6">You haven't joined any games yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reservations.map((reservation) => (
              <Card key={reservation._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{reservation.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {reservation.pitch?.name || 'Football Pitch'}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-teal-600">
                        ${reservation.price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.pitch?.format || '7v7'}
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
                          {format(new Date(reservation.date), 'PPP')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(reservation.startTime), 'HH:mm')} - {format(new Date(reservation.endTime), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Players</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.currentPlayers?.length || 0} / {reservation.maxPlayers}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {reservation.pitch?.location && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {reservation.pitch.location}, {reservation.pitch.city}
                      </p>
                      {reservation.pitch.services && reservation.pitch.services.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Services: {reservation.pitch.services.join(', ')}
                        </p>
                      )}
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
