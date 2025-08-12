import type { Team, Event, Scores } from "@/types";

export function computeTotals(teams: Team[], events: Event[], scores: Scores) {
  const totals: Record<string, number> = {};
  for (const t of teams) totals[t.id] = 0;
  for (const ev of events) {
    const row = scores[ev.id] || {};
    for (const t of teams) {
      totals[t.id] += row[t.id] || 0;
    }
  }
  return totals;
}
