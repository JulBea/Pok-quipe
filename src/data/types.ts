export interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  spriteUrl: string;
  thumbSpriteUrl: string;
  types: string[];
}

export interface Generation {
  id: number;
  romanNumeral: string;
  name: string;
  region: string;
  range: [number, number];
  available: boolean;
  special?: boolean;
}

export type TeamSlot = Pokemon | null;
