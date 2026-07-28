import type { Generation } from "./types";

export const GENERATIONS: Generation[] = [
  { id: 1, romanNumeral: "I", name: "Génération 1", region: "Kanto", range: [1, 151], available: true },
  { id: 2, romanNumeral: "II", name: "Génération 2", region: "Johto", range: [152, 251], available: true },
  { id: 3, romanNumeral: "III", name: "Génération 3", region: "Hoenn", range: [252, 386], available: true },
  { id: 4, romanNumeral: "IV", name: "Génération 4", region: "Sinnoh", range: [387, 493], available: true },
  { id: 5, romanNumeral: "V", name: "Génération 5", region: "Unys", range: [494, 649], available: true },
  { id: 6, romanNumeral: "VI", name: "Génération 6", region: "Kalos", range: [650, 721], available: true },
  { id: 7, romanNumeral: "VII", name: "Génération 7", region: "Alola", range: [722, 809], available: true },
  { id: 8, romanNumeral: "VIII", name: "Génération 8", region: "Galar", range: [810, 905], available: true },
  { id: 9, romanNumeral: "IX", name: "Génération 9", region: "Paldea", range: [906, 1025], available: true },
  {
    id: 100,
    romanNumeral: "★",
    name: "DreamTeam",
    region: "Toutes générations",
    range: [1, 1025],
    available: true,
    special: true,
  },
];

export function getGeneration(id: number): Generation | undefined {
  return GENERATIONS.find((g) => g.id === id);
}
