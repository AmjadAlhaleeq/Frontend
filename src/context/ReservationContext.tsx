
// Interface for data required when creating a new reservation
export interface NewReservationData {
  pitchName: string;
  date: string; 
  time: string;
  location: string;
  price: number;
  maxPlayers: number;
  imageUrl?: string;
  title?: string;
}
