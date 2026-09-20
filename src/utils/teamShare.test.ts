import { describe, expect, it } from "vitest";
import { buildTeamFromIds, decodeShareCode, encodeTeamToShareCode } from "./teamShare";
import type { Pokemon, TeamSlot } from "../data/types";

function makePokemon(id: number): Pokemon {
  return {
    id,
    name: `poke-${id}`,
    displayName: `Poke ${id}`,
    spriteUrl: "",
    thumbSpriteUrl: "",
    types: ["normal"],
    variants: [],
  };
}

describe("encodeTeamToShareCode / decodeShareCode", () => {
  it("encode les slots vides comme 0 et fait l'aller-retour", () => {
    const slots: TeamSlot[] = [makePokemon(1), null, makePokemon(25)];
    const code = encodeTeamToShareCode(slots);
    expect(code).toBe("1-0-25");
    expect(decodeShareCode(code)).toEqual([1, 0, 25]);
  });

  it("ignore les segments non numériques au décodage", () => {
    expect(decodeShareCode("1-oops-3")).toEqual([1, 3]);
  });
});

describe("buildTeamFromIds", () => {
  const pokemonList = [makePokemon(1), makePokemon(4), makePokemon(7)];

  it("reconstruit les slots dans l'ordre des ids fournis", () => {
    const slots = buildTeamFromIds([4, 0, 1], pokemonList);
    expect(slots[0]?.id).toBe(4);
    expect(slots[1]).toBeNull();
    expect(slots[2]?.id).toBe(1);
  });

  it("renvoie null pour un id introuvable dans la liste", () => {
    const slots = buildTeamFromIds([999], pokemonList);
    expect(slots[0]).toBeNull();
  });
});
