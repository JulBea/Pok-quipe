import { useNavigate } from "react-router-dom";
import type { Generation } from "../data/types";
import { Pokeball } from "./Pokeball";

interface GenerationCardProps {
  generation: Generation;
}

export function GenerationCard({ generation }: GenerationCardProps) {
  const navigate = useNavigate();
  const [start, end] = generation.range;

  return (
    <button
      className={`gen-card${generation.available ? "" : " gen-card--locked"}${generation.special ? " gen-card--dream" : ""}`}
      onClick={() => generation.available && navigate(`/gen/${generation.id}`)}
      disabled={!generation.available}
    >
      <span className="gen-card__numeral">{generation.romanNumeral}</span>
      <Pokeball className="gen-card__pokeball" />
      <span className="gen-card__name">{generation.name}</span>
      <span className="gen-card__region">{generation.region}</span>
      <span className="gen-card__range">
        {generation.special ? "Pokédex national complet" : `#${start} - #${end}`}
      </span>
      {!generation.available && <span className="gen-card__badge">Bientôt</span>}
    </button>
  );
}
