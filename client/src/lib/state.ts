// src/lib/state.ts
import type { BoardState } from "@/types";
import { initialState } from "@/lib/seed";

const KEY = "state";

export function loadState(): BoardState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<BoardState>;
    return {
      version: parsed.version ?? 1,
      title: parsed.title,
      currentEventId: parsed.currentEventId ?? null,
      teams: parsed.teams ?? initialState.teams,
      events: parsed.events ?? initialState.events,
      scores: parsed.scores ?? {},
      wheel: parsed.wheel ?? null, // ikut dipersist
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
