import type { Team } from "@/types";

export default function AudienceRoster({ teams }: { teams: Team[] }) {
  return (
    <div className="grid justify-items-center gap-6 mx-auto grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {teams.map((t) => {
        const groupNo =
          (t as any).groupNo ??
          (typeof t.id === "string" ? Number(/^kel(\d+)$/i.exec(t.id)?.[1]) || undefined : undefined);

        return (
          <div
            key={t.id}
            className="w-[320px] rounded-2xl border border-red-200 bg-white/92 backdrop-blur-[2px] shadow p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
              <div className="leading-tight">
                <div className="font-semibold" style={{ color: t.color }}>
                  {t.name}
                </div>
                {groupNo ? (
                  <div className="text-[11px] text-black/60">Kelompok {groupNo}</div>
                ) : null}
              </div>
            </div>

            {t.members?.length ? (
              <ul className="text-sm leading-tight space-y-1 whitespace-normal break-words">
                {t.members.map((m, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-black/20" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs italic text-black/50">Belum ada anggota</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
