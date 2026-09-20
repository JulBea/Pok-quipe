import type { Pokemon, TeamSlot } from "../data/types";
import { officialArtworkUrl, smallSpriteUrl } from "../api/pokeapi";

/**
 * Encode l'équipe dans un paramètre d'URL compact : liste d'ids séparés par des tirets,
 * "0" pour un slot vide. Le nom/sprite est reconstruit depuis la liste de la génération
 * au chargement (fetchTeamFromShareCode), donc pas besoin d'encoder plus que les ids.
 */
export function encodeTeamToShareCode(slots: TeamSlot[]): string {
  return slots.map((s) => (s ? s.id : 0)).join("-");
}

export function decodeShareCode(code: string): number[] {
  return code
    .split("-")
    .map((part) => Number(part))
    .filter((n) => Number.isFinite(n));
}

/**
 * Reconstruit les slots d'équipe à partir d'ids en cherchant chaque pokémon (et ses variantes)
 * dans la liste de la génération déjà chargée.
 */
export function buildTeamFromIds(ids: number[], pokemonList: Pokemon[]): TeamSlot[] {
  const byId = new Map<number, Pokemon>();
  for (const p of pokemonList) {
    byId.set(p.id, p);
    for (const v of p.variants) {
      byId.set(v.id, {
        id: v.id,
        name: v.name,
        displayName: v.displayName,
        spriteUrl: officialArtworkUrl(v.id),
        thumbSpriteUrl: smallSpriteUrl(v.id),
        types: v.types,
        variants: [],
      });
    }
  }

  return ids.map((id) => (id > 0 ? byId.get(id) ?? null : null));
}
