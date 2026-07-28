import { useCallback, useEffect, useState } from "react";
import type { TeamSlot } from "../data/types";

const TEAM_SIZE = 6;

function storageKey(genId: number): string {
  return `poke-team-gen-${genId}-v2`;
}

function isValidSlot(slot: unknown): slot is TeamSlot {
  if (slot === null) return true;
  return typeof slot === "object" && slot !== null && "displayName" in slot && "thumbSpriteUrl" in slot;
}

function loadTeam(genId: number): TeamSlot[] {
  try {
    const raw = localStorage.getItem(storageKey(genId));
    if (!raw) return Array(TEAM_SIZE).fill(null);
    const parsed = JSON.parse(raw) as TeamSlot[];
    if (Array.isArray(parsed) && parsed.length === TEAM_SIZE && parsed.every(isValidSlot)) return parsed;
    return Array(TEAM_SIZE).fill(null);
  } catch {
    return Array(TEAM_SIZE).fill(null);
  }
}

export function useTeam(genId: number) {
  const [slots, setSlots] = useState<TeamSlot[]>(() => loadTeam(genId));

  useEffect(() => {
    setSlots(loadTeam(genId));
  }, [genId]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(genId), JSON.stringify(slots));
    } catch {
      // stockage plein ou indisponible : la session reste fonctionnelle sans persistance
    }
  }, [slots, genId]);

  const setSlot = useCallback((index: number, pokemon: TeamSlot) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = pokemon;
      return next;
    });
  }, []);

  const clearSlot = useCallback((index: number) => {
    setSlot(index, null);
  }, [setSlot]);

  return { slots, setSlot, clearSlot };
}
