
import { Player, Highlight, Reservation, Pitch } from "./ReservationContext";
import { faker } from '@faker-js/faker';

// Generate a random lineup for games
export function generateRandomLineup(count: number): Player[] {
  const lineup: Player[] = [];
  for (let i = 0; i < count; i++) {
    const player: Player = {
      userId: faker.string.uuid(),
      playerName: faker.person.fullName(),
      position: faker.helpers.arrayElement(['Forward', 'Midfielder', 'Defender', 'Goalkeeper']),
      avatarUrl: faker.image.avatar(),
    };
    lineup.push(player);
  }
  return lineup;
}

// Generate random game highlights
export function generateRandomHighlights(count: number, lineup: Player[]): Highlight[] {
  if (lineup.length === 0) return [];
  
  const highlights: Highlight[] = [];
  for (let i = 0; i < count; i++) {
    const player = faker.helpers.arrayElement(lineup);
    const assistPlayer = faker.helpers.arrayElement(lineup.filter(p => p.userId !== player.userId));
    
    const highlight: Highlight = {
      id: faker.string.uuid(),
      type: faker.helpers.arrayElement(['goal', 'assist', 'yellowCard', 'redCard']),
      minute: faker.number.int({ min: 1, max: 90 }),
      playerId: player.userId,
      description: faker.lorem.sentence(3),
    };
    
    // Add assist player for goals sometimes
    if (highlight.type === 'goal' && faker.datatype.boolean()) {
      highlight.assistPlayerId = assistPlayer.userId;
    }
    
    // Make some goals penalties
    if (highlight.type === 'goal' && faker.datatype.boolean(0.2)) {
      highlight.isPenalty = true;
    }
    
    highlights.push(highlight);
  }
  return highlights;
}

// Sample pitch data
export const pitches: Pitch[] = [
  {
    id: 1,
    name: "Downtown Arena",
    location: "123 Main St, Downtown",
    imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68",
    availability: "Mon-Fri: 8am-10pm",
    hours: "8:00 AM - 10:00 PM",
    capacity: "5v5, 7v7",
    price: 60,
    description: "Modern indoor facility with high-quality turf and excellent lighting. Perfect for small-sided games.",
    amenities: ["Changing Rooms", "Showers", "Free Parking"],
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68"
  },
  {
    id: 2,
    name: "Riverside Fields",
    location: "45 River Rd, East Side",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b",
    availability: "7 days a week",
    hours: "7:00 AM - 11:00 PM",
    capacity: "11v11",
    price: 120,
    description: "Professional-grade outdoor pitch with natural grass and stunning riverside views.",
    amenities: ["Changing Rooms", "Showers", "Floodlights", "Equipment Rental"],
    image: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b"
  },
  {
    id: 3,
    name: "Community Center",
    location: "78 Park Lane, North End",
    imageUrl: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f",
    availability: "Weekends only",
    hours: "10:00 AM - 8:00 PM",
    capacity: "5v5, 7v7",
    price: 40,
    description: "Community indoor facility perfect for recreational games and training sessions.",
    amenities: ["Free Parking", "Equipment Rental"],
    image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f"
  },
  {
    id: 4,
    name: "Sports Academy",
    location: "12 Academy Way, West Hill",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d",
    availability: "Mon-Sat: 6am-9pm",
    hours: "6:00 AM - 9:00 PM",
    capacity: "5v5, 7v7, 11v11",
    price: 90,
    description: "Premium sports complex with multiple pitches and professional facilities.",
    amenities: ["Changing Rooms", "Showers", "Free Parking", "Floodlights", "Equipment Rental", "Refreshments"],
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d"
  },
  {
    id: 5,
    name: "Central Park",
    location: "1 Park Ave, City Center",
    imageUrl: "https://images.unsplash.com/photo-1536122985607-4fe00b283652",
    availability: "7 days a week",
    hours: "6:00 AM - 10:00 PM",
    capacity: "7v7, 11v11",
    price: 70,
    description: "Beautiful open-air pitch located in the heart of the city with natural grass.",
    amenities: ["Free Parking", "Spectator Seating", "Refreshments"],
    image: "https://images.unsplash.com/photo-1536122985607-4fe00b283652"
  }
];

// Sample game/reservation data
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 7);

// Create more realistic reservations data
export const games: Reservation[] = [
  {
    id: 1,
    date: today.toISOString().split('T')[0],
    time: "18:00",
    pitchName: "Downtown Arena",
    location: "123 Main St, Downtown",
    maxPlayers: 10,
    playersJoined: 8,
    status: "open",
    price: 60,
    title: "Evening 5-a-side",
    lineup: generateRandomLineup(8),
    waitingList: [],
    imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68",
    highlights: [],
  },
  {
    id: 2,
    date: tomorrow.toISOString().split('T')[0],
    time: "19:30",
    pitchName: "Riverside Fields",
    location: "45 River Rd, East Side",
    maxPlayers: 22,
    playersJoined: 22,
    status: "full",
    price: 120,
    title: "Full 11v11 Match",
    lineup: generateRandomLineup(22),
    waitingList: ["user123", "user456", "user789"],
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b",
    highlights: [],
  },
  {
    id: 3,
    date: yesterday.toISOString().split('T')[0],
    time: "17:00",
    pitchName: "Community Center",
    location: "78 Park Lane, North End",
    maxPlayers: 10,
    playersJoined: 10,
    status: "completed",
    price: 40,
    lineup: generateRandomLineup(10),
    waitingList: [],
    imageUrl: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f",
    highlights: generateRandomHighlights(8, generateRandomLineup(10)),
    finalScore: { home: 3, away: 2 },
    mvp: "PlayerA123",
  },
  {
    id: 4,
    date: today.toISOString().split('T')[0],
    time: "20:00",
    pitchName: "Sports Academy",
    location: "12 Academy Way, West Hill",
    maxPlayers: 14,
    playersJoined: 14,
    status: "full",
    price: 90,
    title: "Evening 7v7",
    lineup: generateRandomLineup(14),
    waitingList: ["user234", "user567"],
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d",
    highlights: [],
  },
  {
    id: 5,
    date: twoDaysAgo.toISOString().split('T')[0],
    time: "16:00",
    pitchName: "Central Park",
    location: "1 Park Ave, City Center",
    maxPlayers: 22,
    playersJoined: 20,
    status: "completed",
    price: 70,
    lineup: generateRandomLineup(20),
    waitingList: [],
    imageUrl: "https://images.unsplash.com/photo-1536122985607-4fe00b283652",
    highlights: generateRandomHighlights(12, generateRandomLineup(20)),
    finalScore: { home: 2, away: 2 },
    mvp: "PlayerB456",
  },
  {
    id: 6,
    date: dayAfterTomorrow.toISOString().split('T')[0],
    time: "09:00",
    pitchName: "Downtown Arena",
    location: "123 Main St, Downtown",
    maxPlayers: 10,
    playersJoined: 6,
    status: "open",
    price: 60,
    title: "Morning 5-a-side",
    lineup: generateRandomLineup(6),
    waitingList: [],
    imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68",
    highlights: [],
  },
  {
    id: 7,
    date: nextWeek.toISOString().split('T')[0],
    time: "18:30",
    pitchName: "Riverside Fields",
    location: "45 River Rd, East Side",
    maxPlayers: 22,
    playersJoined: 15,
    status: "open",
    price: 120,
    title: "Evening 11v11",
    lineup: generateRandomLineup(15),
    waitingList: [],
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b",
    highlights: [],
  },
  {
    id: 8,
    date: lastWeek.toISOString().split('T')[0],
    time: "17:30",
    pitchName: "Community Center",
    location: "78 Park Lane, North End",
    maxPlayers: 10,
    playersJoined: 10,
    status: "completed",
    price: 40,
    lineup: generateRandomLineup(10),
    waitingList: [],
    imageUrl: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f",
    highlights: generateRandomHighlights(7, generateRandomLineup(10)),
    finalScore: { home: 5, away: 3 },
    mvp: "PlayerC789",
  },
  {
    id: 9,
    date: today.toISOString().split('T')[0],
    time: "10:00",
    pitchName: "Sports Academy",
    location: "12 Academy Way, West Hill",
    maxPlayers: 14,
    playersJoined: 9,
    status: "open",
    price: 90,
    title: "Morning 7v7",
    lineup: generateRandomLineup(9),
    waitingList: [],
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d",
    highlights: [],
  },
  {
    id: 10,
    date: tomorrow.toISOString().split('T')[0],
    time: "15:00",
    pitchName: "Central Park",
    location: "1 Park Ave, City Center",
    maxPlayers: 14,
    playersJoined: 14,
    status: "full",
    price: 70,
    title: "Afternoon 7v7",
    lineup: generateRandomLineup(14),
    waitingList: ["user345", "user678", "user901"],
    imageUrl: "https://images.unsplash.com/photo-1536122985607-4fe00b283652",
    highlights: [],
  },
  {
    id: 11,
    date: today.toISOString().split('T')[0],
    time: "15:00",
    pitchName: "Downtown Arena",
    location: "123 Main St, Downtown",
    maxPlayers: 10,
    playersJoined: 3,
    status: "open",
    price: 60,
    title: "Afternoon Kick-around",
    lineup: generateRandomLineup(3),
    waitingList: [],
    imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68",
    highlights: [],
  },
  {
    id: 12,
    date: yesterday.toISOString().split('T')[0],
    time: "19:00",
    pitchName: "Riverside Fields",
    location: "45 River Rd, East Side",
    maxPlayers: 22,
    playersJoined: 22,
    status: "completed",
    price: 120,
    lineup: generateRandomLineup(22),
    waitingList: [],
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b",
    highlights: generateRandomHighlights(14, generateRandomLineup(22)),
    finalScore: { home: 4, away: 2 },
    mvp: "PlayerD012",
  }
];
