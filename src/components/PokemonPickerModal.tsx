import { useEffect, useMemo, useState } from "react";
import type { Generation, Pokemon, PokemonVariant } from "../data/types";
import { Pokeball } from "./Pokeball";
import { TYPE_COLORS, typeColor, typeLabel } from "../utils/typeColors";

interface PokemonPickerModalProps {
  generation: Generation;
  pokemonList: Pokemon[];
  loading: boolean;
  error: string | null;
  onSelect: (pokemon: Pokemon) => void;
  onClose: () => void;
}

const ALL_TYPES = Object.keys(TYPE_COLORS);

function variantAsPokemon(variant: PokemonVariant): Pokemon {
  return {
    id: variant.id,
    name: variant.name,
    displayName: variant.displayName,
    spriteUrl: variant.spriteUrl,
    thumbSpriteUrl: variant.thumbSpriteUrl,
    types: variant.types,
    variants: [],
  };
}

export function PokemonPickerModal({ generation, pokemonList, loading, error, onSelect, onClose }: PokemonPickerModalProps) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Pokemon | null>(null);

  useEffect(() => {
    setExpanded(null);
  }, [query, activeType]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pokemonList.filter((p) => {
      if (activeType && !p.types.includes(activeType)) return false;
      if (!q) return true;
      return p.displayName.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || String(p.id).includes(q);
    });
  }, [pokemonList, query, activeType]);

  function handleItemClick(p: Pokemon) {
    if (p.variants.length === 0) {
      onSelect(p);
      return;
    }
    setExpanded((prev) => (prev?.id === p.id ? null : p));
  }

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

        <div className="type-filter">
          <button
            className={`type-filter__chip${activeType === null ? " type-filter__chip--active" : ""}`}
            style={{ "--chip-color": "#5a5f8a" } as React.CSSProperties}
            onClick={() => setActiveType(null)}
          >
            Tous
          </button>
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              className={`type-filter__chip${activeType === t ? " type-filter__chip--active" : ""}`}
              style={{ "--chip-color": typeColor(t) } as React.CSSProperties}
              onClick={() => setActiveType((prev) => (prev === t ? null : t))}
            >
              {typeLabel(t)}
            </button>
          ))}
        </div>

        {expanded && (
          <div className="variant-bar">
            <div className="variant-bar__header">
              <span>Choisis une forme pour {expanded.displayName} :</span>
              <button className="variant-bar__close" onClick={() => setExpanded(null)} aria-label="Fermer">✕</button>
            </div>
            <div className="variant-bar__options">
              <button className="variant-option" onClick={() => onSelect(expanded)}>
                <img src={expanded.thumbSpriteUrl} alt={expanded.displayName} width={56} height={56} />
                <span className="variant-option__label">Normale</span>
              </button>
              {expanded.variants.map((v) => (
                <button key={v.id} className="variant-option" onClick={() => onSelect(variantAsPokemon(v))}>
                  <img src={v.thumbSpriteUrl} alt={v.displayName} width={56} height={56} />
                  <span className="variant-option__label">{v.formLabel}</span>
                </button>
              ))}
            </div>
          </div>
        )}

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
              <button
                key={p.id}
                className={`picker-item${expanded?.id === p.id ? " picker-item--expanded" : ""}`}
                onClick={() => handleItemClick(p)}
              >
                {p.variants.length > 0 && <span className="picker-item__variant-badge">✦</span>}
                <img src={p.thumbSpriteUrl} alt={p.displayName} width={64} height={64} loading="lazy" decoding="async" />
                <span className="picker-item__id">#{p.id}</span>
                <span className="picker-item__name">{p.displayName}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="picker-grid__empty">
                Aucun Pokémon ne correspond {query ? `à "${query}"` : "à ce filtre"}.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
