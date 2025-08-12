// src/types.ts
export enum WSStatus {
  CONNECTING = "connecting",
  OPEN = "open",
  CLOSED = "closed",
  ERROR = "error",
}

export type Team = {
  id: string;
  name: string;
  color: string;
  members?: string[]; // daftar anggota
};

export type Event = {
  id: string;
  name: string;
  weight: number; // skor maksimum
};

export type Scores = Record<string, Record<string, number>>; // eventId -> teamId -> nilai

export type BoardState = {
  version: number;
  title?: string; // << tambahkan ini agar object literal yang punya `title` valid
  teams: Team[];
  events: Event[];
  scores: Scores;
};
