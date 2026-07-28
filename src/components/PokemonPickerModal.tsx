import { useMemo, useState } from "react";
import type { Generation, Pokemon } from "../data/types";
import { Pokeball } from "./Pokeball";

interface PokemonPickerModalProps {
  generation: Generation;
  pokemonList: Pokemon[];
  loading: boolean;
  error: string | null;
  onSelect: (pokemon: Pokemon) => void;
  onClose: () => void;
}

export function PokemonPickerModal({ generation, pokemonList, loading, error, onSelect, onClose }: PokemonPickerModalProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pokemonList;
    return pokemonList.filter(
      (p) => p.displayName.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || String(p.id).includes(q)
    );
  }, [pokemonList, query]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{generation.name} · {generation.region}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <input
          className="modal__search"
          type="text"
          placeholder="Rechercher un Pokémon (nom ou numéro)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        {loading && (
          <div className="modal__loading">
            <Pokeball spinning />
            <span>Chargement des Pokémon...</span>
          </div>
        )}

        {error && <div className="modal__error">{error}</div>}

        {!loading && !error && (
          <div className="picker-grid">
            {filtered.map((p) => (
              <button key={p.id} className="picker-item" onClick={() => onSelect(p)}>
                <img src={p.thumbSpriteUrl} alt={p.displayName} width={64} height={64} loading="lazy" decoding="async" />
                <span className="picker-item__id">#{p.id}</span>
                <span className="picker-item__name">{p.displayName}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="picker-grid__empty">Aucun Pokémon ne correspond à "{query}".</p>}
          </div>
        )}
      </div>
    </div>
  );
}
