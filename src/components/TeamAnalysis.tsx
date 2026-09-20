import { useMemo } from "react";
import type { TeamSlot } from "../data/types";
import { analyzeTeamDefense, ALL_TYPES } from "../data/typeEffectiveness";
import { typeColor, typeLabel } from "../utils/typeColors";

interface TeamAnalysisProps {
  slots: TeamSlot[];
}

export function TeamAnalysis({ slots }: TeamAnalysisProps) {
  const teamTypes = useMemo(() => slots.filter((s): s is NonNullable<TeamSlot> => s !== null).map((s) => s.types), [slots]);

  const analysis = useMemo(() => analyzeTeamDefense(teamTypes), [teamTypes]);

  if (teamTypes.length === 0) {
    return null;
  }

  const exposedTypes = ALL_TYPES.filter((t) => analysis.weaknesses[t] > 0).sort((a, b) => analysis.weaknesses[b] - analysis.weaknesses[a]);

  return (
    <div className="team-analysis">
      <h2 className="team-analysis__title">Analyse défensive de l'équipe</h2>

      {analysis.teamWeakSpots.length > 0 && (
        <div className="team-analysis__alert">
          <span>⚠️ Trou de couverture : la moitié ou plus de l'équipe est faible face à</span>
          <div className="team-analysis__chip-row">
            {analysis.teamWeakSpots.map((t) => (
              <span key={t} className="type-badge" style={{ backgroundColor: typeColor(t) }}>
                {typeLabel(t)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="team-analysis__section">
        <h3>Faiblesses par type</h3>
        <div className="team-analysis__grid">
          {exposedTypes.length === 0 && <p className="team-analysis__empty">Aucune faiblesse détectée, belle équipe !</p>}
          {exposedTypes.map((t) => (
            <div key={t} className="weakness-row">
              <span className="type-badge type-badge--wide" style={{ backgroundColor: typeColor(t) }}>
                {typeLabel(t)}
              </span>
              <div className="weakness-row__dots">
                {Array.from({ length: analysis.weaknesses[t] }).map((_, i) => (
                  <span key={i} className="weakness-row__dot" />
                ))}
              </div>
              <span className="weakness-row__count">
                {analysis.weaknesses[t]}/{teamTypes.length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {analysis.noWeakness.length > 0 && (
        <div className="team-analysis__section">
          <h3>Couverture solide (aucune faiblesse d'équipe)</h3>
          <div className="team-analysis__chip-row">
            {analysis.noWeakness.map((t) => (
              <span key={t} className="type-badge" style={{ backgroundColor: typeColor(t) }}>
                {typeLabel(t)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
