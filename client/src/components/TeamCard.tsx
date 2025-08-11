import type { Event, Scores, Team } from "@/types";
import ScoreCell from "./ScoreCell";

export default function TeamCard({ team, events, scores, rankLabel }: {
  team: Team & { total: number }, events: Event[], scores: Scores, rankLabel: string
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-white/90 shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
          <span className="font-semibold" style={{ color: team.color }}>{team.name}</span>
        </div>
        <span className="text-sm px-2 py-0.5 rounded-lg border border-red-200 bg-red-50">{rankLabel}</span>
      </div>
      <div className="text-5xl font-extrabold tabular-nums mb-3" style={{ color: team.color }}>{team.total}</div>
      <ul className="text-sm space-y-1">
        {events.map(e=>(
          <li key={e.id} className="flex items-center justify-between border-b border-red-100 last:border-none py-1">
            <span className="truncate pr-3">{e.name} <span className="opacity-60">(maks {e.weight})</span></span>
            <ScoreCell value={Math.min(scores[e.id]?.[team.id] ?? 0, e.weight)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
