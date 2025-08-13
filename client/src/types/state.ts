// src/types/state.ts
export type Team = {
  id: string;
  name: string;
  color: string;
  members?: string[];
  groupNo?: number; // opsional (kalau pakai id 'kelX' tetap auto terdeteksi)
};

export type Event = {
  id: string;
  name: string;
  weight: number;
};

export type Scores = Record<string, Record<string, number>>;

// Wheel (urutan tampil Yel-Yel) — SEKLALI PUTAR → URUTAN LENGKAP
export type WheelState = {
  mode: "yelyel";
  seed: number;              // RNG deterministik (sama di semua device)
  startedAt: string;         // timestamp mulai
  queueIds: string[];        // urutan penuh (semua kelompok)
  activeIndex: number;       // pointer sedang tampil (0..queueIds.length-1)
};

export type BoardState = {
  version: number;
  title?: string;
  currentEventId?: string | null;
  teams: Team[];
  events: Event[];
  scores: Scores;
  wheel?: WheelState | null; // state roda
};
