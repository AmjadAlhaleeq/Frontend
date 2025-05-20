
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, CalendarCheck, Loader } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReservation } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";
import PlayerReservations from "@/components/profile/PlayerReservations";

/**
 * MyBookings Page Component
 * Shows a player's upcoming game reservations
 * 
 * Features:
 * - List of upcoming games the player has joined
 * - Cancel reservation functionality
 * - Integration with user profile data
 */
const MyBookings = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const { reservations } = useReservation();

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem("currentUser");
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (e) {
        console.error("Error parsing user data:", e);
        toast({
          title: "Error",
          description: "Could not load user profile data",
          variant: "destructive",
        });
      }
    } else {
      // If no user data found, show message
      toast({
        title: "Not logged in",
        description: "Please login to view your bookings",
        variant: "destructive",
      });
    }
    
    // Simulate API loading time for better UX
    setTimeout(() => setIsLoading(false), 800);
  }, [toast]);

  // If still loading data, show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-teal-500 mr-3" />
        <span className="text-lg text-muted-foreground">Loading your bookings...</span>
      </div>
    );
  }
  
  // If no user data found, show login prompt
  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center py-12 bg-muted/40 rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Profile Found</h2>
          <p className="text-muted-foreground mb-6">Please log in to view your bookings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">Manage your upcoming games and reservations</p>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="upcoming" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Upcoming Games</span>
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center">
            <CalendarCheck className="h-4 w-4 mr-2" />
            <span>Past Games</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-6">
          <PlayerReservations userId={currentUser?.id || ""} />
        </TabsContent>
        
        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Game History</CardTitle>
              <CardDescription>Previous games you've participated in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Game history feature will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyBookings;
