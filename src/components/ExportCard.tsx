import { forwardRef } from "react";
import type { Generation, TeamSlot } from "../data/types";
import { typeColor, typeLabel } from "../utils/typeColors";
import { Pokeball } from "./Pokeball";

interface ExportCardProps {
  generation: Generation;
  slots: TeamSlot[];
}

export const ExportCard = forwardRef<HTMLDivElement, ExportCardProps>(function ExportCard({ generation, slots }, ref) {
  const [start, end] = generation.range;

  return (
    <div className="export-card" ref={ref}>
      <div className="export-card__header">
        <Pokeball className="export-card__pokeball" />
        <div>
          <h2 className="export-card__title">Mon équipe {generation.region}</h2>
          <p className="export-card__subtitle">
            {generation.name} · Pokédex #{start}–#{end}
          </p>
        </div>
      </div>

      <div className="export-card__grid">
        {slots.map((slot, i) =>
          slot ? (
            <div
              key={i}
              className="export-card__slot export-card__slot--filled"
              style={{ "--type-glow": typeColor(slot.types[0]) } as React.CSSProperties}
            >
              <img src={slot.spriteUrl} alt={slot.displayName} className="export-card__sprite" />
              <span className="export-card__name">{slot.displayName}</span>
              <div className="export-card__types">
                {slot.types.map((t) => (
                  <span key={t} className="type-badge" style={{ backgroundColor: typeColor(t) }}>
                    {typeLabel(t)}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div key={i} className="export-card__slot export-card__slot--empty">
              <Pokeball className="export-card__empty-ball" />
              <span>Emplacement libre</span>
            </div>
          )
        )}
      </div>

      <div className="export-card__footer">
        <Pokeball />
        <span>Créé avec Pokéquipe</span>
      </div>
    </div>
  );
});
