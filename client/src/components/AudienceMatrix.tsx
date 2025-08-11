import type { Event, Scores, Team } from "@/types";

export default function AudienceMatrix({
  ranked, events, scores,
}: { ranked: Array<Team & { total: number }>; events: Event[]; scores: Scores; }) {
  const teams = ranked; // sudah urut
  const totalMax = events.reduce((a, e) => a + e.weight, 0);
  return (
    <div className="rounded-2xl border border-red-200 bg-white/90 shadow p-4 overflow-auto">
      <div className="text-red-800 font-semibold mb-3">Detail Skor Semua Kelompok</div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-red-200 text-red-700">
            <th className="text-left p-2">Lomba</th>
            {teams.map((t) => (
              <th key={t.id} className="p-2 text-center whitespace-nowrap">
                <div className="inline-flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="font-semibold">{t.name}</span>
                </div>
              </th>
            ))}
            <th className="p-2 text-center">Maks</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} className="border-b border-red-100">
              <td className="p-2 whitespace-nowrap font-medium">{e.name}</td>
              {teams.map((t) => (
                <td key={t.id} className="p-2 text-center tabular-nums">
                  {Math.min(scores[e.id]?.[t.id] ?? 0, e.weight)}
                </td>
              ))}
              <td className="p-2 text-center text-red-700 font-semibold">{e.weight}</td>
            </tr>
          ))}
          <tr>
            <td className="p-2 text-right font-semibold text-red-800">TOTAL</td>
            {teams.map((t) => (
              <td key={t.id} className="p-2 text-center font-bold tabular-nums" style={{ color: t.color }}>
                {t.total}
              </td>
            ))}
            <td className="p-2 text-center font-bold">{totalMax}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
