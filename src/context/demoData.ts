
import { Reservation, Pitch } from './ReservationContext';
import { addDays, format, subDays } from 'date-fns';

// Get today's date and format it for reservations
const today = new Date();
const formatDateString = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

// Create an array of upcoming dates for reservations
const upcomingDates = [
  formatDateString(today),
  formatDateString(addDays(today, 1)),
  formatDateString(addDays(today, 2)),
  formatDateString(addDays(today, 3)),
  formatDateString(addDays(today, 4)),
  formatDateString(addDays(today, 5)),
  formatDateString(addDays(today, 6)),
];

// Create an array of past dates for reservations
const pastDates = [
  formatDateString(subDays(today, 1)),
  formatDateString(subDays(today, 3)),
  formatDateString(subDays(today, 5)),
  formatDateString(subDays(today, 7)),
  formatDateString(subDays(today, 10)),
  formatDateString(subDays(today, 14)),
];

// Demo pitches data
export const demoPitches: Pitch[] = [
  {
    id: 1,
    name: "Green Valley FC",
    location: "123 Sports Ave, Central Park",
    imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68",
    availability: "Mon-Sun, 8AM-10PM",
    hours: "08:00 - 22:00",
    capacity: "5v5, 7v7",
    price: 60,
    description: "State-of-the-art artificial turf pitch with excellent drainage. Perfect for 5-a-side and 7-a-side games. Includes floodlights for evening play.",
    amenities: ["Changing Rooms", "Showers", "Free Parking", "Floodlights", "Equipment Rental"]
  },
  {
    id: 2,
    name: "Urban Soccer Center",
    location: "456 Downtown Blvd, Riverside",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b",
    availability: "Mon-Sun, 7AM-11PM",
    hours: "07:00 - 23:00",
    capacity: "5v5, 7v7, 11v11",
    price: 75,
    description: "Multi-purpose soccer facility in the heart of downtown. Features three 5-a-side courts, one 7-a-side field, and a full-size 11-a-side pitch.",
    amenities: ["Pro Shop", "Café", "Changing Rooms", "Showers", "Floodlights", "Coaching Available"]
  },
  {
    id: 3,
    name: "Sunset Fields",
    location: "789 Beachside Road, West End",
    imageUrl: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f",
    availability: "Mon-Sun, 9AM-9PM",
    hours: "09:00 - 21:00",
    capacity: "7v7, 11v11",
    price: 85,
    description: "Beautiful natural grass pitches with stunning sunset views. Well-maintained grounds perfect for larger team formats and tournaments.",
    amenities: ["Spectator Seating", "Changing Rooms", "Showers", "Free Parking", "Clubhouse"]
  },
  {
    id: 4,
    name: "Metro Indoor Arena",
    location: "101 Stadium Way, Eastside",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d",
    availability: "Mon-Sun, 24 hours",
    hours: "00:00 - 24:00",
    capacity: "5v5, Futsal",
    price: 90,
    description: "Climate-controlled indoor facility with professional-grade futsal courts. Play year-round regardless of weather conditions.",
    amenities: ["Air Conditioning", "Pro Shop", "Changing Rooms", "Showers", "24/7 Access", "Video Analysis"]
  },
  {
    id: 5,
    name: "Community Sports Hub",
    location: "202 Local Street, Northside",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
    availability: "Mon-Sun, 8AM-8PM",
    hours: "08:00 - 20:00",
    capacity: "5v5, 7v7",
    price: 45,
    description: "Affordable community pitch with recently renovated facilities. Great for local teams and casual games.",
    amenities: ["Free Parking", "Basic Changing Rooms", "Water Fountains", "Community Programs"]
  }
];

// Demo reservations data with more variety of states
export const demoReservations: Reservation[] = [
  // UPCOMING GAMES - OPEN
  {
    id: 1,
    pitchName: "Green Valley FC",
    title: "Monday Night Football",
    date: upcomingDates[1],
    time: "19:00 - 20:00",
    location: "123 Sports Ave, Central Park",
    status: "open",
    maxPlayers: 10,
    playersJoined: 6,
    waitingList: [],
    price: 60,
    imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68",
    lineup: [
      { userId: "user1", playerName: "John Smith", status: "joined" },
      { userId: "user2", playerName: "Mike Johnson", status: "joined" },
      { userId: "user3", playerName: "David Lee", status: "joined" },
      { userId: "user4", playerName: "Chris Wilson", status: "joined" },
      { userId: "user5", playerName: "James Brown", status: "joined" },
      { userId: "user6", playerName: "Alex Turner", status: "joined" },
    ],
    highlights: []
  },
  {
    id: 2,
    pitchName: "Urban Soccer Center",
    title: "Weekday Morning Game",
    date: upcomingDates[2],
    time: "10:00 - 11:00",
    location: "456 Downtown Blvd, Riverside",
    status: "open",
    maxPlayers: 10,
    playersJoined: 4,
    waitingList: [],
    price: 75,
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b",
    lineup: [
      { userId: "user1", playerName: "John Smith", status: "joined" },
      { userId: "user7", playerName: "Daniel Green", status: "joined" },
      { userId: "user8", playerName: "Robert Garcia", status: "joined" },
      { userId: "user9", playerName: "Steven Jackson", status: "joined" },
    ],
    highlights: []
  },
  
  // UPCOMING GAMES - FULL WITH WAITING LIST
  {
    id: 3,
    pitchName: "Sunset Fields",
    title: "Weekend Tournament Qualifier",
    date: upcomingDates[3],
    time: "15:00 - 16:30",
    location: "789 Beachside Road, West End",
    status: "full",
    maxPlayers: 10,
    playersJoined: 12,
    waitingList: ["user13", "user14"],
    price: 85,
    imageUrl: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f",
    lineup: [
      { userId: "user1", playerName: "John Smith", status: "joined" },
      { userId: "user2", playerName: "Mike Johnson", status: "joined" },
      { userId: "user3", playerName: "David Lee", status: "joined" },
      { userId: "user4", playerName: "Chris Wilson", status: "joined" },
      { userId: "user5", playerName: "James Brown", status: "joined" },
      { userId: "user6", playerName: "Alex Turner", status: "joined" },
      { userId: "user7", playerName: "Daniel Green", status: "joined" },
      { userId: "user8", playerName: "Robert Garcia", status: "joined" },
      { userId: "user9", playerName: "Steven Jackson", status: "joined" },
      { userId: "user10", playerName: "Kevin Martinez", status: "joined" },
      { userId: "user11", playerName: "Brian Taylor", status: "joined" },
      { userId: "user12", playerName: "Eric Wright", status: "joined" },
    ],
    highlights: []
  },
  
  // UPCOMING GAMES - ALMOST FULL
  {
    id: 4,
    pitchName: "Metro Indoor Arena",
    title: "Evening Indoor 5v5",
    date: upcomingDates[2],
    time: "20:00 - 21:00",
    location: "101 Stadium Way, Eastside",
    status: "open",
    maxPlayers: 10,
    playersJoined: 9,
    waitingList: [],
    price: 90,
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d",
    lineup: [
      { userId: "user3", playerName: "David Lee", status: "joined" },
      { userId: "user4", playerName: "Chris Wilson", status: "joined" },
      { userId: "user5", playerName: "James Brown", status: "joined" },
      { userId: "user6", playerName: "Alex Turner", status: "joined" },
      { userId: "user7", playerName: "Daniel Green", status: "joined" },
      { userId: "user8", playerName: "Robert Garcia", status: "joined" },
      { userId: "user9", playerName: "Steven Jackson", status: "joined" },
      { userId: "user10", playerName: "Kevin Martinez", status: "joined" },
      { userId: "user12", playerName: "Eric Wright", status: "joined" },
    ],
    highlights: []
  },
  
  // UPCOMING GAMES - BARELY ANY PLAYERS
  {
    id: 5,
    pitchName: "Community Sports Hub",
    title: "Casual Friday Game",
    date: upcomingDates[4],
    time: "18:00 - 19:00",
    location: "202 Local Street, Northside",
    status: "open",
    maxPlayers: 10,
    playersJoined: 2,
    waitingList: [],
    price: 45,
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
    lineup: [
      { userId: "user11", playerName: "Brian Taylor", status: "joined" },
      { userId: "user12", playerName: "Eric Wright", status: "joined" },
    ],
    highlights: []
  },
  
  // PAST GAMES - COMPLETED WITH FULL DETAILS
  {
    id: 6,
    pitchName: "Green Valley FC",
    title: "Premier League",
    date: pastDates[0],
    time: "18:00 - 19:00",
    location: "123 Sports Ave, Central Park",
    status: "completed",
    maxPlayers: 10,
    playersJoined: 10,
    waitingList: [],
    price: 60,
    finalScore: "3-2",
    mvpPlayerId: "user1",
    imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68",
    lineup: [
      { userId: "user1", playerName: "John Smith", status: "joined" },
      { userId: "user2", playerName: "Mike Johnson", status: "joined" },
      { userId: "user3", playerName: "David Lee", status: "joined" },
      { userId: "user4", playerName: "Chris Wilson", status: "joined" },
      { userId: "user5", playerName: "James Brown", status: "joined" },
      { userId: "user6", playerName: "Alex Turner", status: "joined" },
      { userId: "user7", playerName: "Daniel Green", status: "joined" },
      { userId: "user8", playerName: "Robert Garcia", status: "joined" },
      { userId: "user9", playerName: "Steven Jackson", status: "joined" },
      { userId: "user10", playerName: "Kevin Martinez", status: "joined" },
    ],
    highlights: [
      { id: 101, type: "goal", minute: 12, playerId: "user1", playerName: "John Smith", description: "Amazing free kick from 25 yards" },
      { id: 102, type: "assist", minute: 12, playerId: "user3", playerName: "David Lee", description: "Smart lay-off for the free kick" },
      { id: 103, type: "goal", minute: 25, playerId: "user5", playerName: "James Brown", description: "Header from corner" },
      { id: 104, type: "assist", minute: 25, playerId: "user2", playerName: "Mike Johnson", description: "Perfect corner delivery" },
      { id: 105, type: "yellowCard", minute: 35, playerId: "user6", playerName: "Alex Turner", description: "Late tackle" },
      { id: 106, type: "goal", minute: 43, playerId: "user1", playerName: "John Smith", description: "Penalty kick", isPenalty: true },
      { id: 107, type: "save", minute: 65, playerId: "user10", playerName: "Kevin Martinez", description: "Great diving save" },
    ]
  },
  {
    id: 7,
    pitchName: "Urban Soccer Center",
    title: "Weekend League",
    date: pastDates[1],
    time: "16:00 - 17:00",
    location: "456 Downtown Blvd, Riverside",
    status: "completed",
    maxPlayers: 10,
    playersJoined: 10,
    waitingList: [],
    price: 75,
    finalScore: "2-2",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b",
    lineup: [
      { userId: "user1", playerName: "John Smith", status: "joined" },
      { userId: "user2", playerName: "Mike Johnson", status: "joined" },
      { userId: "user3", playerName: "David Lee", status: "joined" },
      { userId: "user4", playerName: "Chris Wilson", status: "joined" },
      { userId: "user5", playerName: "James Brown", status: "joined" },
      { userId: "user6", playerName: "Alex Turner", status: "joined" },
      { userId: "user7", playerName: "Daniel Green", status: "joined" },
      { userId: "user8", playerName: "Robert Garcia", status: "joined" },
      { userId: "user9", playerName: "Steven Jackson", status: "joined" },
      { userId: "user10", playerName: "Kevin Martinez", status: "joined" },
    ],
    highlights: [
      { id: 201, type: "goal", minute: 10, playerId: "user7", playerName: "Daniel Green", description: "Great solo run" },
      { id: 202, type: "yellowCard", minute: 22, playerId: "user4", playerName: "Chris Wilson", description: "Shirt pulling" },
      { id: 203, type: "goal", minute: 37, playerId: "user3", playerName: "David Lee", description: "Long range shot" },
      { id: 204, type: "assist", minute: 37, playerId: "user1", playerName: "John Smith", description: "Smart pass" },
      { id: 205, type: "redCard", minute: 55, playerId: "user4", playerName: "Chris Wilson", description: "Second yellow card" },
    ]
  },
  {
    id: 8,
    pitchName: "Sunset Fields",
    title: "Sunday Cup Final",
    date: pastDates[2],
    time: "14:00 - 15:30",
    location: "789 Beachside Road, West End",
    status: "completed",
    maxPlayers: 10,
    playersJoined: 10,
    waitingList: [],
    price: 85,
    finalScore: "0-0 (5-4 penalties)",
    mvpPlayerId: "user10",
    imageUrl: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f",
    lineup: [
      { userId: "user1", playerName: "John Smith", status: "joined" },
      { userId: "user2", playerName: "Mike Johnson", status: "joined" },
      { userId: "user3", playerName: "David Lee", status: "joined" },
      { userId: "user4", playerName: "Chris Wilson", status: "joined" },
      { userId: "user5", playerName: "James Brown", status: "joined" },
      { userId: "user6", playerName: "Alex Turner", status: "joined" },
      { userId: "user7", playerName: "Daniel Green", status: "joined" },
      { userId: "user8", playerName: "Robert Garcia", status: "joined" },
      { userId: "user9", playerName: "Steven Jackson", status: "joined" },
      { userId: "user10", playerName: "Kevin Martinez", status: "joined" },
    ],
    highlights: [
      { id: 301, type: "save", minute: 15, playerId: "user10", playerName: "Kevin Martinez", description: "Fingertip save onto the crossbar" },
      { id: 302, type: "yellowCard", minute: 34, playerId: "user8", playerName: "Robert Garcia", description: "Tactical foul" },
      { id: 303, type: "save", minute: 56, playerId: "user10", playerName: "Kevin Martinez", description: "One-on-one save" },
      { id: 304, type: "save", minute: 78, playerId: "user10", playerName: "Kevin Martinez", description: "Penalty save" },
      { id: 305, type: "other", minute: 90, playerId: "user10", playerName: "Kevin Martinez", description: "Saved 2 penalties in the shootout" },
    ]
  },
  {
    id: 9,
    pitchName: "Metro Indoor Arena",
    title: "Thursday Night League",
    date: pastDates[3],
    time: "20:00 - 21:00",
    location: "101 Stadium Way, Eastside",
    status: "completed",
    maxPlayers: 10,
    playersJoined: 8,
    waitingList: [],
    price: 90,
    finalScore: "7-3",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d",
    lineup: [
      { userId: "user1", playerName: "John Smith", status: "joined" },
      { userId: "user3", playerName: "David Lee", status: "joined" },
      { userId: "user5", playerName: "James Brown", status: "joined" },
      { userId: "user6", playerName: "Alex Turner", status: "joined" },
      { userId: "user7", playerName: "Daniel Green", status: "joined" },
      { userId: "user8", playerName: "Robert Garcia", status: "joined" },
      { userId: "user9", playerName: "Steven Jackson", status: "joined" },
      { userId: "user10", playerName: "Kevin Martinez", status: "joined" },
    ],
    highlights: [
      { id: 401, type: "goal", minute: 5, playerId: "user1", playerName: "John Smith", description: "Toe poke finish" },
      { id: 402, type: "goal", minute: 12, playerId: "user1", playerName: "John Smith", description: "Volley from close range" },
      { id: 403, type: "assist", minute: 12, playerId: "user7", playerName: "Daniel Green", description: "Cross from the wing" },
      { id: 404, type: "goal", minute: 18, playerId: "user5", playerName: "James Brown", description: "Counter attack finish" },
      { id: 405, type: "assist", minute: 18, playerId: "user1", playerName: "John Smith", description: "Through ball" },
      { id: 406, type: "goal", minute: 24, playerId: "user3", playerName: "David Lee", description: "Backheeled finish" },
      { id: 407, type: "assist", minute: 24, playerId: "user6", playerName: "Alex Turner", description: "Short pass" },
      { id: 408, type: "goal", minute: 31, playerId: "user1", playerName: "John Smith", description: "Hat-trick goal" },
      { id: 409, type: "assist", minute: 31, playerId: "user8", playerName: "Robert Garcia", description: "Long ball over the top" },
      { id: 410, type: "goal", minute: 38, playerId: "user7", playerName: "Daniel Green", description: "Powerful shot" },
      { id: 411, type: "goal", minute: 45, playerId: "user9", playerName: "Steven Jackson", description: "Tap-in" },
      { id: 412, type: "assist", minute: 45, playerId: "user1", playerName: "John Smith", description: "Squared ball across goal" },
    ]
  },
  {
    id: 10,
    pitchName: "Community Sports Hub",
    title: "Friendly Match",
    date: pastDates[4],
    time: "11:00 - 12:00",
    location: "202 Local Street, Northside",
    status: "completed",
    maxPlayers: 10,
    playersJoined: 6,
    waitingList: [],
    price: 45,
    finalScore: "2-1",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
    lineup: [
      { userId: "user1", playerName: "John Smith", status: "joined" },
      { userId: "user2", playerName: "Mike Johnson", status: "joined" },
      { userId: "user5", playerName: "James Brown", status: "joined" },
      { userId: "user7", playerName: "Daniel Green", status: "joined" },
      { userId: "user8", playerName: "Robert Garcia", status: "joined" },
      { userId: "user10", playerName: "Kevin Martinez", status: "joined" },
    ],
    highlights: [
      { id: 501, type: "goal", minute: 22, playerId: "user2", playerName: "Mike Johnson", description: "Header from corner" },
      { id: 502, type: "assist", minute: 22, playerId: "user7", playerName: "Daniel Green", description: "Corner kick" },
      { id: 503, type: "goal", minute: 37, playerId: "user5", playerName: "James Brown", description: "Free kick goal" },
      { id: 504, type: "goal", minute: 55, playerId: "user1", playerName: "John Smith", description: "Late winner" },
      { id: 505, type: "assist", minute: 55, playerId: "user10", playerName: "Kevin Martinez", description: "Long throw-in" },
    ]
  }
];
