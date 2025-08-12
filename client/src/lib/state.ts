// src/lib/state.ts
import type { BoardState, Event } from "@/types";
import { initialState } from "@/lib/seed";

const KEY = "state";

function clampScore(v: any, ev: Event) {
  let n = Number.isFinite(v) ? Math.floor(v) : 0;
  if (n < 0) n = 0;
  if (n > ev.weight) n = ev.weight;
  return n;
}

function sanitizeScores(
  scores: Record<string, Record<string, number>> | undefined,
  events: Event[],
  teams: BoardState["teams"],
) {
  const out: Record<string, Record<string, number>> = {};
  for (const ev of events) {
    const row = scores?.[ev.id] ?? {};
    const rowOut: Record<string, number> = {};
    for (const t of teams) {
      rowOut[t.id] = clampScore(row?.[t.id], ev);
    }
    out[ev.id] = rowOut;
  }
  return out;
}

export function loadState(): BoardState {
  let parsed: Partial<BoardState> | null = null;

  try {
    const raw = localStorage.getItem(KEY);
    if (raw) parsed = JSON.parse(raw) as Partial<BoardState>;
  } catch {
    // ignore parse error → fallback ke initialState di bawah
  }

  // Pakai data tersimpan kalau ada; kalau tidak, fallback ke seed
  const teams = Array.isArray(parsed?.teams) && parsed!.teams.length ? parsed!.teams : initialState.teams;
  const events = Array.isArray(parsed?.events) && parsed!.events.length ? parsed!.events : initialState.events;

  // currentEventId harus valid terhadap daftar events
  let currentEventId = (parsed as any)?.currentEventId ?? initialState.currentEventId ?? null;
  if (currentEventId && !events.some((e) => e.id === currentEventId)) currentEventId = null;

  const scores = sanitizeScores(parsed?.scores ?? {}, events, teams);

  const version = typeof parsed?.version === "number" ? parsed!.version : 1;
  const title = (parsed as any)?.title ?? initialState.title;

  return {
    version,
    title,
    currentEventId,
    teams,
    events,
    scores,
  };
}

export function saveState(next: BoardState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}
