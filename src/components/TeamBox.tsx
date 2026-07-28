import type { TeamSlot } from "../data/types";
import { typeColor, typeLabel } from "../utils/typeColors";

interface TeamBoxProps {
  slot: TeamSlot;
  onAdd: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

export function TeamBox({ slot, onAdd, onEdit, onRemove }: TeamBoxProps) {
  if (!slot) {
    return (
      <button className="team-box team-box--empty" onClick={onAdd}>
        <span className="team-box__plus">+</span>
        <span className="team-box__label">Ajouter</span>
      </button>
    );
  }

  const mainType = slot.types[0];
  const glow = typeColor(mainType);

  return (
    <div className="team-box team-box--filled" style={{ "--type-glow": glow } as React.CSSProperties}>
      <div className="team-box__actions">
        <button className="team-box__action" onClick={onEdit} title="Changer de Pokémon" aria-label="Changer">
          ✎
        </button>
        <button className="team-box__action team-box__action--remove" onClick={onRemove} title="Retirer" aria-label="Retirer">
          ✕
        </button>
      </div>
      <img className="team-box__sprite" src={slot.spriteUrl} alt={slot.displayName} loading="lazy" />
      <span className="team-box__name">{slot.displayName}</span>
      <div className="team-box__types">
        {slot.types.map((t) => (
          <span key={t} className="type-badge" style={{ backgroundColor: typeColor(t) }}>
            {typeLabel(t)}
          </span>
        ))}
      </div>
    </div>
  );
}
