import type { BoardState } from "@/types";
import { initialState } from "@/lib/seed";

const KEY = "state";

export function loadState(): BoardState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as BoardState;
    // fallback ringan jika struktur berubah
    return {
      version: parsed.version ?? 1,
      teams: parsed.teams ?? initialState.teams,
      events: parsed.events ?? initialState.events,
      scores: parsed.scores ?? {},
    };
  } catch {
    return initialState;
  }
}

export function saveState(next: BoardState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}
