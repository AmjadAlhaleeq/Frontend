
import { faker } from "@faker-js/faker";

export type Player = {
  id: number;
  name: string;
  avatar: string;
  points: number;
  wins: number;
  losses: number;
  goalsScored: number;
  assists: number;
  gamesPlayed: number;
  achievements: string[];
  mvps: number;
  winRate: number;
  cleanSheets: number;
  tackles: number;
  status: "active" | "inactive";
};

/**
 * Generates a specified number of random player profiles
 * @param count Number of players to generate
 * @returns Array of player objects
 */
export function generateRandomPlayers(count: number): Player[] {
  return Array.from({ length: count }).map((_, index) => {
    const gamesPlayed = faker.number.int({ min: 10, max: 50 });
    const wins = faker.number.int({ min: 0, max: gamesPlayed });
    const losses = faker.number.int({ min: 0, max: gamesPlayed - wins });
    const winRate = Math.round((wins / gamesPlayed) * 100);
    
    return {
      id: index + 1,
      name: faker.person.fullName(),
      avatar: faker.image.urlLoremFlickr({ category: 'people', width: 128, height: 128 }),
      points: faker.number.int({ min: 100, max: 1000 }),
      wins,
      losses,
      goalsScored: faker.number.int({ min: 0, max: 30 }),
      assists: faker.number.int({ min: 0, max: 25 }),
      gamesPlayed,
      achievements: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }).map(() => 
        faker.helpers.arrayElement(['Top Scorer', 'MVP', 'Clean Sheet', 'Hat-trick', 'Team Captain', 'Best Defender'])
      ),
      mvps: faker.number.int({ min: 0, max: 10 }),
      winRate,
      cleanSheets: faker.number.int({ min: 0, max: 15 }),
      tackles: faker.number.int({ min: 5, max: 50 }),
      status: faker.helpers.arrayElement(['active', 'inactive']) as "active" | "inactive"
    };
  });
}
