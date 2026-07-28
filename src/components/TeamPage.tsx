import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGeneration } from "../data/generations";
import { useTeam } from "../hooks/useTeam";
import { fetchGenerationPokemon } from "../api/pokeapi";
import type { Pokemon } from "../data/types";
import { TeamBox } from "./TeamBox";
import { PokemonPickerModal } from "./PokemonPickerModal";
import { ExportCard } from "./ExportCard";
import { exportNodeAsImage } from "../utils/exportImage";

export function TeamPage() {
  const { genId } = useParams();
  const navigate = useNavigate();
  const generation = getGeneration(Number(genId));
  const { slots, setSlot, clearSlot } = useTeam(Number(genId));
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!generation) return;
    let cancelled = false;
    setListLoading(true);
    setListError(null);
    fetchGenerationPokemon(generation.range)
      .then((data) => {
        if (!cancelled) setPokemonList(data);
      })
      .catch(() => {
        if (!cancelled) setListError("Impossible de charger les Pokémon. Vérifie ta connexion.");
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [generation?.id]);

  if (!generation) {
    return (
      <div className="page">
        <p>Génération introuvable.</p>
        <button className="btn" onClick={() => navigate("/")}>Retour à l'accueil</button>
      </div>
    );
  }

  function handleSelect(pokemon: Pokemon) {
    if (activeSlot === null) return;
    setSlot(activeSlot, pokemon);
    setActiveSlot(null);
  }

  async function handleExport() {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      await exportNodeAsImage(exportRef.current, `equipe-${generation!.region.toLowerCase()}.png`);
    } catch {
      alert("L'export a échoué, réessaie.");
    } finally {
      setExporting(false);
    }
  }

  const filledCount = slots.filter(Boolean).length;

  return (
    <div className="page team-page">
      <header className="team-header">
        <button className="btn btn--ghost" onClick={() => navigate("/")}>← Générations</button>
        <div className="team-header__title">
          <h1>{generation.name}</h1>
          <span className="team-header__region">{generation.region}</span>
        </div>
        <button className="btn btn--export" onClick={handleExport} disabled={filledCount === 0 || exporting}>
          {exporting ? "Export..." : "📸 Exporter l'équipe"}
        </button>
      </header>

      <div className="team-grid">
        {slots.map((slot, i) => (
          <TeamBox
            key={i}
            slot={slot}
            onAdd={() => setActiveSlot(i)}
            onEdit={() => setActiveSlot(i)}
            onRemove={() => clearSlot(i)}
          />
        ))}
      </div>

      <div className="export-card-offscreen">
        <ExportCard ref={exportRef} generation={generation} slots={slots} />
      </div>

      {activeSlot !== null && (
        <PokemonPickerModal
          generation={generation}
          pokemonList={pokemonList}
          loading={listLoading}
          error={listError}
          onSelect={handleSelect}
          onClose={() => setActiveSlot(null)}
        />
      )}
    </div>
  );
}
