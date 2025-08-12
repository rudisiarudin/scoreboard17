// src/components/TeamCard.tsx
import type { Team, Event, Scores } from "@/types";

export default function TeamCard({
  team,
  events,
  scores,
  rankLabel,
}: { team: Team; events: Event[]; scores: Scores; rankLabel?: string }) {
  const total = events.reduce((sum, ev) => sum + (scores[ev.id]?.[team.id] ?? 0), 0);

  // nomor kelompok: prioritaskan team.groupNo, fallback dari id 'kelX'
  const groupNo =
    (team as any).groupNo ??
    (typeof team.id === "string" ? Number(/^kel(\d+)$/i.exec(team.id)?.[1]) || undefined : undefined);

  return (
    <div className="rounded-2xl border border-red-200 bg-white/92 backdrop-blur-[2px] shadow p-5 w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
          <div className="leading-tight">
            <div className="font-semibold" style={{ color: team.color }}>
              {team.name}
            </div>
            {groupNo ? (
              <div className="text-[11px] text-black/60">Kelompok {groupNo}</div>
            ) : null}
          </div>
        </div>
        {rankLabel ? (
          <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            {rankLabel}
          </span>
        ) : null}
      </div>

      <div className="text-4xl font-extrabold text-red-700">{total}</div>

      {team.members?.length ? (
        <div className="mt-3">
          <div className="uppercase text-[10px] tracking-wide text-black/50 font-semibold mb-1">Anggota</div>
          <ul className="text-sm leading-tight space-y-1 max-h-28 overflow-y-auto pr-1">
            {team.members.map((m, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-black/20" />
                <span className="truncate">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
