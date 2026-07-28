interface PokeballProps {
  className?: string;
  spinning?: boolean;
}

export function Pokeball({ className, spinning }: PokeballProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`pokeball-icon${spinning ? " pokeball-spin" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="46" fill="#fff" stroke="#222" strokeWidth="6" />
      <path d="M4 50a46 46 0 0 1 92 0z" fill="#EE1515" stroke="#222" strokeWidth="6" />
      <line x1="4" y1="50" x2="96" y2="50" stroke="#222" strokeWidth="6" />
      <circle cx="50" cy="50" r="16" fill="#fff" stroke="#222" strokeWidth="6" />
      <circle cx="50" cy="50" r="7" fill="#fff" stroke="#222" strokeWidth="4" />
    </svg>
  );
}
