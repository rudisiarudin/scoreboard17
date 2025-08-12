// src/types/state.ts

// Gunakan union + konstanta, bukan enum
export type WSStatus = "connecting" | "open" | "closed" | "error";
export const WSStatus = {
  CONNECTING: "connecting",
  OPEN: "open",
  CLOSED: "closed",
  ERROR: "error",
} as const;

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
  title?: string; // tetap ada biar literal dengan title lolos
  teams: Team[];
  events: Event[];
  scores: Scores;
};
