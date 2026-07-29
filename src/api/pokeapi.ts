import type { Pokemon, PokemonVariant } from "../data/types";
import { formatPokemonName } from "../utils/format";

const GRAPHQL_URL = "https://beta.pokeapi.co/graphql/v1beta";

export function officialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function smallSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

const VARIANT_FORM_LABELS: Record<string, string> = {
  mega: "Méga",
  "mega-x": "Méga X",
  "mega-y": "Méga Y",
  alola: "Alola",
  galar: "Galar",
  hisui: "Hisui",
  paldea: "Paldea",
  gmax: "Gigamax",
};

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
  is_default: boolean;
  pokemon_v2_pokemontypes: { pokemon_v2_type: { name: string } }[];
}

interface GraphQLSpeciesRow {
  id: number;
  pokemon_v2_pokemonspeciesnames: { name: string }[];
  pokemon_v2_pokemons: GraphQLPokemonRow[];
}

const GENERATION_QUERY = `
  query GenerationPokemon($start: Int!, $end: Int!) {
    pokemon_v2_pokemonspecies(where: {id: {_gte: $start, _lte: $end}}, order_by: {id: asc}) {
      id
      pokemon_v2_pokemonspeciesnames(where: {pokemon_v2_language: {name: {_eq: "fr"}}}) {
        name
      }
      pokemon_v2_pokemons(order_by: {id: asc}) {
        id
        name
        is_default
        pokemon_v2_pokemontypes {
          pokemon_v2_type { name }
        }
      }
    }
  }
`;

function parseVariant(row: GraphQLPokemonRow, baseName: string, baseDisplayName: string): PokemonVariant | null {
  const suffix = row.name.startsWith(`${baseName}-`) ? row.name.slice(baseName.length + 1) : null;
  if (!suffix) return null;
  const formLabel = VARIANT_FORM_LABELS[suffix];
  if (!formLabel) return null;

  return {
    id: row.id,
    name: row.name,
    displayName: `${baseDisplayName} (${formLabel})`,
    formLabel,
    spriteUrl: officialArtworkUrl(row.id),
    thumbSpriteUrl: smallSpriteUrl(row.id),
    types: row.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
  };
}

export async function fetchGenerationPokemon(range: [number, number]): Promise<Pokemon[]> {
  const [start, end] = range;
  const cacheKey = `pokegen-v3-${start}-${end}`;
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

  const species: GraphQLSpeciesRow[] = json.data.pokemon_v2_pokemonspecies;
  const list: Pokemon[] = species.map((sp) => {
    const defaultRow = sp.pokemon_v2_pokemons.find((p) => p.is_default) ?? sp.pokemon_v2_pokemons[0];
    const displayName = sp.pokemon_v2_pokemonspeciesnames?.[0]?.name ?? formatPokemonName(defaultRow.name);

    const variants = sp.pokemon_v2_pokemons
      .filter((p) => p.id !== defaultRow.id)
      .map((p) => parseVariant(p, defaultRow.name, displayName))
      .filter((v): v is PokemonVariant => v !== null);

    return {
      id: defaultRow.id,
      name: defaultRow.name,
      displayName,
      spriteUrl: officialArtworkUrl(defaultRow.id),
      thumbSpriteUrl: smallSpriteUrl(defaultRow.id),
      types: defaultRow.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
      variants,
    };
  });

  writeCache(cacheKey, list);
  return list;
}
