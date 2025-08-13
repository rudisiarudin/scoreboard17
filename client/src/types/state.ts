// src/types/state.ts

// Kembalikan WSStatus biar kompatibel dengan komponen lama
export type WSStatus = "online" | "connecting" | "offline";

export type Team = {
  id: string;
  name: string;
  color: string;
  members?: string[];
  groupNo?: number; // opsional; kalau id 'kelX' tetap auto ke-detect
};

export type Event = {
  id: string;
  name: string;
  weight: number;
};

export type Scores = Record<string, Record<string, number>>;

// State untuk Spin Wheel (urutan Yel-Yel) – sekali generate → urutan penuh
export type WheelState = {
  mode: "yelyel";
  seed: number;
  startedAt: string;   // ISO timestamp
  queueIds: string[];  // semua team id dalam urutan tampil
  activeIndex: number; // pointer urutan saat ini
};

export type BoardState = {
  version: number;
  title?: string;
  currentEventId?: string | null;

  teams: Team[];
  events: Event[];
  scores: Scores;

  wheel?: WheelState | null;
};
