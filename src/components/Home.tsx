import { GENERATIONS } from "../data/generations";
import { GenerationCard } from "./GenerationCard";
import { Pokeball } from "./Pokeball";

export function Home() {
  return (
    <div className="page home-page">
      <header className="home-header">
        <Pokeball className="home-header__pokeball" />
        <h1 className="home-title">Pokéquipe</h1>
        <p className="home-subtitle">Choisis une génération et compose ton équipe de 6 !</p>
      </header>
      <div className="gen-grid">
        {GENERATIONS.map((gen) => (
          <GenerationCard key={gen.id} generation={gen} />
        ))}
      </div>
    </div>
  );
}
