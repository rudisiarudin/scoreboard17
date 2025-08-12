// src/components/AudienceMatrix.tsx
import type { Team, Event, Scores } from "@/types";

const nameToGroupNo: Record<string, number> = {
  "Merdeka": 1,
  "Bersatu": 2,
  "Berjuang": 3,
  "Bangkit": 4,
  "Berdaulat": 5,
  "Indonesia Jaya": 6,
};

export default function AudienceMatrix({
  ranked, events, scores,
}: { ranked: Array<Team & { total: number }>; events: Event[]; scores: Scores; }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-[720px] w-full border-separate border-spacing-y-2">
        <thead>…</thead>
        <tbody>
          {ranked.map((t) => {
            const groupNo =
              (t as any).groupNo ??
              (typeof t.id === "string" ? Number(/^kel(\d+)$/i.exec(t.id)?.[1]) || undefined : undefined) ??
              nameToGroupNo[t.name]; // 👈 fallback by name

            return (
              <tr key={t.id}>
                <td className="bg-white/90 backdrop-blur border border-red-200 rounded-l-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <div className="leading-tight">
                      <div className="font-medium" style={{ color: t.color }}>{t.name}</div>
                      {groupNo ? <div className="text-[11px] text-black/60">kelompok {groupNo}</div> : null}
                    </div>
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
