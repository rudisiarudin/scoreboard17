export type Team = { id: string; name: string; color: string };
export type Event = { id: string; name: string; weight: number }; // weight = skor maksimum
export type Scores = Record<string, Record<string, number>>;      // scores[eventId][teamId]
export type BoardState = {
  title: string;
  version: number;
  teams: Team[];
  events: Event[];
  scores: Scores;
  schema?: number;
};
export type WSStatus = "offline" | "connecting" | "online";
