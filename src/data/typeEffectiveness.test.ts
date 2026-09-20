import { describe, expect, it } from "vitest";
import { analyzeTeamDefense, defenseMultiplier } from "./typeEffectiveness";

describe("defenseMultiplier", () => {
  it("double damage faible face au type fort", () => {
    expect(defenseMultiplier(["grass"], "fire")).toBe(2);
  });

  it("multiplie les faiblesses pour un pokémon bi-type (x4)", () => {
    expect(defenseMultiplier(["grass", "flying"], "fire")).toBe(2);
    expect(defenseMultiplier(["grass", "ice"], "fire")).toBe(4);
  });

  it("renvoie 0 pour une immunité", () => {
    expect(defenseMultiplier(["ghost"], "normal")).toBe(0);
  });

  it("calcule correctement les cas simples faible/résistant", () => {
    expect(defenseMultiplier(["normal"], "fighting")).toBe(2);
    expect(defenseMultiplier(["water"], "grass")).toBe(2);
    expect(defenseMultiplier(["fire"], "water")).toBe(2);
    expect(defenseMultiplier(["dragon"], "ice")).toBe(2);
  });
});

describe("analyzeTeamDefense", () => {
  it("détecte une faiblesse partagée par toute l'équipe", () => {
    const analysis = analyzeTeamDefense([["grass"], ["grass"]]);
    expect(analysis.weaknesses.fire).toBe(2);
    expect(analysis.teamWeakSpots).toContain("fire");
  });

  it("ne signale pas de trou de couverture quand l'équipe est vide", () => {
    const analysis = analyzeTeamDefense([]);
    expect(analysis.teamWeakSpots).toEqual([]);
  });

  it("liste les types sans aucune faiblesse", () => {
    const analysis = analyzeTeamDefense([["normal"]]);
    expect(analysis.noWeakness).toContain("normal");
    expect(analysis.weaknesses.fighting).toBe(1);
  });
});
