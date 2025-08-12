export type Team = {
  id: string;
  name: string;
  color: string;
  members?: string[]; // daftar anggota (opsional)
};

export type Event = {
  id: string;
  name: string;
  weight: number; // skor maksimum event
};

export type Scores = Record<string, Record<string, number>>; // eventId -> teamId -> nilai

export type BoardState = {
  version: number;
  teams: Team[];
  events: Event[];
  scores: Scores;
};
