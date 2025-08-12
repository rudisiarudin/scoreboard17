// src/types/state.ts
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
  members?: string[];
};

export type Event = {
  id: string;
  name: string;
  weight: number;
};

export type Scores = Record<string, Record<string, number>>;

export type BoardState = {
  version: number;
  title?: string; // ← tambahkan properti opsional ini
  teams: Team[];
  events: Event[];
  scores: Scores;
};
