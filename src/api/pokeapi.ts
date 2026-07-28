import type { Pokemon } from "../data/types";
import { formatPokemonName } from "../utils/format";

const GRAPHQL_URL = "https://beta.pokeapi.co/graphql/v1beta";

export function officialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function smallSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage indisponible ou plein : on continue sans cache
  }
}

interface GraphQLPokemonRow {
  id: number;
  name: string;
  pokemon_v2_pokemontypes: { pokemon_v2_type: { name: string } }[];
  pokemon_v2_pokemonspecy: {
    pokemon_v2_pokemonspeciesnames: { name: string }[];
  } | null;
}

const GENERATION_QUERY = `
  query GenerationPokemon($start: Int!, $end: Int!) {
    pokemon_v2_pokemon(where: {id: {_gte: $start, _lte: $end}}, order_by: {id: asc}) {
      id
      name
      pokemon_v2_pokemontypes {
        pokemon_v2_type { name }
      }
      pokemon_v2_pokemonspecy {
        pokemon_v2_pokemonspeciesnames(where: {pokemon_v2_language: {name: {_eq: "fr"}}}) {
          name
        }
      }
    }
  }
`;

export async function fetchGenerationPokemon(range: [number, number]): Promise<Pokemon[]> {
  const [start, end] = range;
  const cacheKey = `pokegen-v2-${start}-${end}`;
  const cached = readCache<Pokemon[]>(cacheKey);
  if (cached) return cached;

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: GENERATION_QUERY, variables: { start, end } }),
  });
  if (!res.ok) throw new Error(`Erreur PokeAPI (${res.status})`);

  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0]?.message ?? "Erreur GraphQL");

  const rows: GraphQLPokemonRow[] = json.data.pokemon_v2_pokemon;
  const list: Pokemon[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    displayName: row.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames?.[0]?.name ?? formatPokemonName(row.name),
    spriteUrl: officialArtworkUrl(row.id),
    thumbSpriteUrl: smallSpriteUrl(row.id),
    types: row.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
  }));

  writeCache(cacheKey, list);
  return list;
}
