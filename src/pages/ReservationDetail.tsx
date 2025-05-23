
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User, 
  ArrowLeft, 
  Trophy,
  Star,
  Goal,
  Award,
  Shield,
  FileText,
  Loader
} from "lucide-react";
import { useReservation } from '@/context/ReservationContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import AddReservationSummary from '@/components/reservations/AddReservationSummary';

const ReservationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    reservations, 
    joinGame, 
    cancelReservation, 
    isUserJoined, 
    updateReservationStatus,
    addReservationSummary 
  } = useReservation();
  
  const [isLoading, setIsLoading] = useState(true);
  const [reservation, setReservation] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'player' | null>(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  
  // Fetch reservation data and user info
  useEffect(() => {
    const fetchData = () => {
      try {
        if (!id) {
          toast({
            title: "Error",
            description: "Reservation ID not found",
            variant: "destructive",
          });
          navigate('/reservations');
          return;
        }
        
        const reservationId = parseInt(id);
        const foundReservation = reservations.find(r => r.id === reservationId);
        
        if (!foundReservation) {
          toast({
            title: "Reservation Not Found",
            description: "The reservation you're looking for doesn't exist",
            variant: "destructive",
          });
          navigate('/reservations');
          return;
        }
        
        setReservation(foundReservation);
        
        // Get current user info
        const storedUser = localStorage.getItem('currentUser');
        const role = localStorage.getItem('userRole') as 'admin' | 'player' | null;
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setCurrentUserId(userData.id);
        }
        
        setUserRole(role);
      } catch (error) {
        console.error("Error fetching reservation:", error);
        toast({
          title: "Error",
          description: "Failed to load reservation details",
          variant: "destructive",
        });
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    
    fetchData();
  }, [id, reservations, navigate, toast]);

  // Format date with error handling
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEEE, MMMM d, yyyy');
    } catch (error) {
      console.error("Error parsing date:", error);
      return dateString;
    }
  };
  
  // Handle joining a game
  const handleJoinGame = () => {
    if (!currentUserId || !reservation) return;
    
    joinGame(reservation.id, undefined, currentUserId);
    
    toast({
      title: "Success!",
      description: "You've joined the game",
    });
  };
  
  // Handle leaving a game
  const handleLeaveGame = () => {
    if (!currentUserId || !reservation) return;
    
    cancelReservation(reservation.id, currentUserId);
    
    toast({
      title: "Reservation cancelled",
      description: "You've left the game",
    });
  };
  
  // Handle opening summary dialog for a complete reservation
  const handleOpenSummaryDialog = () => {
    setShowSummaryDialog(true);
  };

  // Handle submitting a reservation summary
  const handleSubmitSummary = (summaryData: any) => {
    if (!currentUserId || userRole !== 'admin' || !reservation) {
      toast({ 
        title: "Permission Denied", 
        description: "Only admins can add summaries.", 
        variant: "destructive"
      });
      return;
    }
    
    try {
      addReservationSummary(summaryData);
      
      // Update our local state
      setReservation(prev => ({
        ...prev,
        summary: summaryData,
      }));
      
      toast({
        title: "Summary Added",
        description: "Game summary has been successfully added."
      });
      
      // Mark the reservation as completed if it wasn't already
      if (reservation.status !== "completed") {
        updateReservationStatus(reservation.id, "completed");
        setReservation(prev => ({
          ...prev,
          status: "completed"
        }));
      }
    } catch (error) {
      console.error("Error adding summary:", error);
      toast({
        title: "Error",
        description: "Failed to add game summary.",
        variant: "destructive"
      });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-500 hover:bg-green-600";
      case "full": return "bg-amber-500 hover:bg-amber-600";
      case "completed": return "bg-blue-500 hover:bg-blue-600";
      case "cancelled": return "bg-red-500 hover:bg-red-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="h-8 w-8 text-teal-500 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading reservation details...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Reservation Not Found</h2>
        <p className="text-muted-foreground mt-2">The reservation you're looking for doesn't exist</p>
        <Button 
          onClick={() => navigate('/reservations')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reservations
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        onClick={() => navigate('/reservations')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Reservations
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Reservation Details */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">
                    {reservation.title || reservation.pitchName}
                  </CardTitle>
                  <CardDescription>{formatDate(reservation.date)}</CardDescription>
                </div>
                <Badge className={getStatusColor(reservation.status)}>
                  {reservation.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Pitch image */}
              {reservation.imageUrl && (
                <div className="rounded-md overflow-hidden">
                  <img 
                    src={reservation.imageUrl} 
                    alt={reservation.title || reservation.pitchName}
                    className="w-full h-52 object-cover"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{reservation.time}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{reservation.location || reservation.pitchName}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{reservation.city || "N/A"}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>Players: {reservation.playersJoined} / {reservation.maxPlayers}</span>
                  </div>
                </div>
                
                {reservation.summary && (
                  <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg">
                    <h3 className="font-semibold flex items-center mb-2">
                      <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                      Game Summary
                    </h3>
                    
                    <div className="space-y-2">
                      {reservation.summary.finalScore && (
                        <p className="text-sm font-medium">Final Score: {reservation.summary.finalScore}</p>
                      )}
                      
                      <div className="mt-3 space-y-2">
                        {reservation.summary.mvpPlayerId && (
                          <div className="flex items-start">
                            <Star className="h-4 w-4 mr-2 text-amber-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">MVP:</p>
                              <p className="text-sm">
                                {reservation.lineup?.find(p => p.userId === reservation.summary.mvpPlayerId)?.playerName || "Unknown Player"}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {reservation.summary.mostGoalsPlayerId && (
                          <div className="flex items-start">
                            <Goal className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Top Scorer:</p>
                              <p className="text-sm">
                                {reservation.lineup?.find(p => p.userId === reservation.summary.mostGoalsPlayerId)?.playerName || "Unknown Player"}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {reservation.summary.mostAssistsPlayerId && (
                          <div className="flex items-start">
                            <Award className="h-4 w-4 mr-2 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Most Assists:</p>
                              <p className="text-sm">
                                {reservation.lineup?.find(p => p.userId === reservation.summary.mostAssistsPlayerId)?.playerName || "Unknown Player"}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {reservation.summary.bestDefenderPlayerId && (
                          <div className="flex items-start">
                            <Shield className="h-4 w-4 mr-2 text-purple-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Best Defender:</p>
                              <p className="text-sm">
                                {reservation.lineup?.find(p => p.userId === reservation.summary.bestDefenderPlayerId)?.playerName || "Unknown Player"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {reservation.summary.matchNotes && (
                        <div className="mt-4">
                          <p className="text-xs text-muted-foreground">Match Notes:</p>
                          <p className="text-sm mt-1">{reservation.summary.matchNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Players Section */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Players</h3>
                
                {reservation.lineup && reservation.lineup.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {reservation.lineup.map((player: any) => (
                      <div 
                        key={player.userId} 
                        className="flex items-center p-2 border rounded-md"
                      >
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback>
                            {player.playerName?.[0] || player.userId.substring(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{player.playerName || "Player"}</p>
                          <p className="text-xs text-muted-foreground">Joined: {
                            player.joinedAt ? format(new Date(player.joinedAt), 'MMM d') : 'Unknown'
                          }</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No players have joined this game yet.</p>
                )}
              </div>
              
              {/* Waiting list */}
              {reservation.waitingList && reservation.waitingList.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-3">Waiting List</h3>
                  <div className="space-y-2">
                    {reservation.waitingList.map((userId: string) => (
                      <div 
                        key={userId} 
                        className="flex items-center p-2 bg-amber-50 dark:bg-amber-900/10 rounded-md"
                      >
                        <User className="h-4 w-4 mr-2 text-amber-600" />
                        <span className="text-sm">User: {userId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-wrap justify-between gap-2">
              {/* Game action buttons based on status and user role */}
              {reservation.status === 'open' || reservation.status === 'full' ? (
                <>
                  {userRole === 'player' && (
                    currentUserId && isUserJoined(reservation.id, currentUserId) ? (
                      <Button 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700"
                        onClick={handleLeaveGame}
                      >
                        Leave Game
                      </Button>
                    ) : (
                      <Button 
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={handleJoinGame}
                      >
                        Join Game
                      </Button>
                    )
                  )}
                  
                  {userRole === 'admin' && !reservation.summary && (
                    <Button 
                      onClick={handleOpenSummaryDialog}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Add Game Summary
                    </Button>
                  )}
                </>
              ) : (
                userRole === 'admin' && (
                  <Button 
                    onClick={handleOpenSummaryDialog}
                    variant={reservation.summary ? "outline" : "default"}
                    className={!reservation.summary ? "bg-teal-600 hover:bg-teal-700" : ""}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {reservation.summary ? "Edit Summary" : "Add Summary"}
                  </Button>
                )
              )}
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/reservations')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Reservations
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Game Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Pitch</h4>
                <p className="text-sm">{reservation.pitchName}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Format</h4>
                <p className="text-sm">{reservation.maxPlayers/2}v{reservation.maxPlayers/2}</p>
              </div>
              
              {reservation.price && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Price</h4>
                  <p className="text-sm">${reservation.price} per player</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-1">Location</h4>
                <p className="text-sm">{reservation.location || "N/A"}</p>
                {reservation.city && (
                  <p className="text-xs text-muted-foreground mt-1">{reservation.city}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialogs */}
      {reservation && (
        <AddReservationSummary
          reservation={reservation}
          open={showSummaryDialog}
          onOpenChange={setShowSummaryDialog}
          onSubmitSummary={handleSubmitSummary}
        />
      )}
    </div>
  );
};

export default ReservationDetail;
