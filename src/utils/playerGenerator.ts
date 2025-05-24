
// We're just adding code here at the end of the file to modify the Player type to include interceptions

import { faker } from '@faker-js/faker';

// Define a Player interface
export interface Player {
  id: string;
  name: string;
  avatar: string;
  gamesPlayed: number;
  goalsScored: number;
  assists: number;
  mvps: number;
  cleanSheets: number;
  interceptions: number;
  wins: number; // <-- Added
  points: number;
}

// Function to generate a random player
export const generateRandomPlayer = (): Player => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const gamesPlayed = faker.number.int({ min: 15, max: 50 });
  const goalsScored = faker.number.int({ min: 0, max: 25 });
  const assists = faker.number.int({ min: 0, max: 20 });
  const mvps = faker.number.int({ min: 0, max: 10 });
  const cleanSheets = faker.number.int({ min: 0, max: 15 });
  const interceptions = faker.number.int({ min: 0, max: 30 });
  const wins = faker.number.int({ min: 0, max: gamesPlayed }); // wins <= games played

  return {
    id: faker.string.uuid(),
    name: `${firstName} ${lastName}`,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}%20${lastName}`,
    gamesPlayed,
    goalsScored,
    assists,
    mvps,
    cleanSheets,
    interceptions,
    wins,
    points: goalsScored * 2 + assists + mvps * 3 + cleanSheets
  };
};

// Function to generate multiple random players
export const generateRandomPlayers = (count: number): Player[] => {
  const players = [];
  for (let i = 0; i < count; i++) {
    players.push(generateRandomPlayer());
  }
  return players;
};
