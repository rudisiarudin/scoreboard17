import type { Event, Scores, Team } from "@/types";
export function computeTotals(teams: Team[], events: Event[], scores: Scores) {
  const perTeam: Record<string,number> = {}; for (const t of teams) perTeam[t.id]=0;
  for (const e of events) { const max=e.weight??0; for (const t of teams) {
    const raw = scores[e.id]?.[t.id] ?? 0; perTeam[t.id] += Math.max(0, Math.min(Math.floor(raw), max));
  }} return perTeam;
}
