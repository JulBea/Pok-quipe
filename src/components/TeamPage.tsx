import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getGeneration } from "../data/generations";
import { useTeam } from "../hooks/useTeam";
import { fetchGenerationPokemon } from "../api/pokeapi";
import type { Pokemon } from "../data/types";
import { TeamBox } from "./TeamBox";
import { PokemonPickerModal } from "./PokemonPickerModal";
import { ExportCard } from "./ExportCard";
import { TeamAnalysis } from "./TeamAnalysis";
import { exportNodeAsImage } from "../utils/exportImage";
import { buildTeamFromIds, decodeShareCode, encodeTeamToShareCode } from "../utils/teamShare";

export function TeamPage() {
  const { genId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const generation = getGeneration(Number(genId));
  const { slots, setSlot, clearSlot, reorderSlots } = useTeam(Number(genId));
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const importedShareCode = useRef<string | null>(null);

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

  useEffect(() => {
    const code = searchParams.get("team");
    if (!code || listLoading || pokemonList.length === 0) return;
    if (importedShareCode.current === code) return;
    importedShareCode.current = code;

    const ids = decodeShareCode(code);
    const importedSlots = buildTeamFromIds(ids, pokemonList);
    importedSlots.forEach((pokemon, i) => {
      if (pokemon) setSlot(i, pokemon);
    });

    const next = new URLSearchParams(searchParams);
    next.delete("team");
    setSearchParams(next, { replace: true });
  }, [searchParams, listLoading, pokemonList, setSlot, setSearchParams]);

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

  async function handleShare() {
    const code = encodeTeamToShareCode(slots);
    const url = new URL(window.location.href);
    url.searchParams.set("team", code);
    try {
      await navigator.clipboard.writeText(url.toString());
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      window.prompt("Copie ce lien pour partager ton équipe :", url.toString());
    }
  }

  function handleDrop(targetIndex: number) {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    reorderSlots(draggedIndex, targetIndex);
    setDraggedIndex(null);
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
        <div className="team-header__actions">
          <button className="btn" onClick={handleShare} disabled={filledCount === 0}>
            {shareCopied ? "✓ Lien copié !" : "🔗 Partager"}
          </button>
          <button className="btn btn--export" onClick={handleExport} disabled={filledCount === 0 || exporting}>
            {exporting ? "Export..." : "📸 Exporter l'équipe"}
          </button>
        </div>
      </header>

      <div className="team-grid">
        {slots.map((slot, i) => (
          <TeamBox
            key={i}
            slot={slot}
            onAdd={() => setActiveSlot(i)}
            onEdit={() => setActiveSlot(i)}
            onRemove={() => clearSlot(i)}
            draggable={slot !== null}
            isDragging={draggedIndex === i}
            onDragStart={() => setDraggedIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            onDragEnd={() => setDraggedIndex(null)}
          />
        ))}
      </div>

      <TeamAnalysis slots={slots} />

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
