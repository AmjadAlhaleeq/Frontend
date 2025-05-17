import { faker } from "@faker-js/faker";

export interface Player {
  id: number;
  name: string;
  avatar: string;
  points: number;
  wins: number;
  losses: number;
  goalsScored: number;
  assists: number;
  gamesPlayed: number; // total matches
  achievements: string[];
  mvps: number;
  winRate: number;
  cleanSheets: number; // NEW
  tackles: number; // NEW
  status: "active" | "inactive"; // NEW
}

const achievements = [
  "MVP",
  "Top Scorer",
  "Hat-trick Hero",
  "Top Assists",
  "Team Player",
  "Defensive Rock",
  "Iron Man",
  "Rising Star",
  "Most Improved",
  "Golden Boot",
  "Playmaker",
  "Clean Sheet King",
  "Goal Machine",
  "Midfield Maestro",
  "Speed Demon",
];

export const generateRandomPlayers = (count: number): Player[] => {
  return Array.from({ length: count }, (_, index) => {
    const wins = faker.number.int({ min: 10, max: 45 });
    const losses = faker.number.int({ min: 5, max: 20 });
    const gamesPlayed = wins + losses;
    const winRate = Number(((wins / gamesPlayed) * 100).toFixed(1));

    return {
      id: index + 1,
      name: faker.person.fullName(),
      avatar: faker.image.avatar(),
      points: faker.number.int({ min: 500, max: 2000 }),
      wins,
      losses,
      goalsScored: faker.number.int({ min: 5, max: 50 }),
      assists: faker.number.int({ min: 3, max: 40 }),
      gamesPlayed,
      achievements: faker.helpers.arrayElements(achievements, {
        min: 0,
        max: 3,
      }),
      mvps: faker.number.int({ min: 0, max: 15 }),
      winRate,
      cleanSheets: faker.number.int({ min: 0, max: 20 }), // random clean sheets
      tackles: faker.number.int({ min: 10, max: 100 }), // random tackles
      status: Math.random() > 0.2 ? "active" : "inactive", // 80% active
    };
  }).sort((a, b) => b.points - a.points);
};
