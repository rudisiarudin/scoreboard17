export type Team = { id: string; name: string; color: string; members?: string[] };
export type Event = { id: string; name: string; weight: number };
export type Scores = Record<string, Record<string, number>>;

export type BoardState = {
  version: number;
  title?: string; // penting supaya error TS2353 hilang
  teams: Team[];
  events: Event[];
  scores: Scores;
};
