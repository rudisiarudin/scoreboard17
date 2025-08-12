import type { Team, Event, Scores } from "@/types";

export default function AudienceMatrix({ ranked, events, scores }: { ranked: Array<Team & { total: number }>; events: Event[]; scores: Scores }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-[720px] w-full border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th className="text-left text-xs uppercase tracking-wide text-black/60 px-3 py-2">Kelompok</th>
            {events.map((e) => (
              <th key={e.id} className="text-center text-xs uppercase tracking-wide text-black/60 px-3 py-2">
                {e.name}
              </th>
            ))}
            <th className="text-center text-xs uppercase tracking-wide text-black/60 px-3 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((t) => (
            <tr key={t.id} className="">
              <td className="bg-white/90 backdrop-blur border border-red-200 rounded-l-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="font-medium" style={{ color: t.color }}>{t.name}</span>
                </div>
              </td>
              {events.map((e) => (
                <td key={e.id} className="bg-white/90 backdrop-blur border-t border-b border-red-200 text-center px-3 py-2">
                  {scores[e.id]?.[t.id] ?? 0}
                </td>
              ))}
              <td className="bg-white/90 backdrop-blur border border-red-200 rounded-r-xl text-center font-semibold px-3 py-2">
                {t.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
