import type { Team } from "@/types";

export default function AudienceRoster({ teams }: { teams: Team[] }) {
  return (
    <div className="grid justify-items-center gap-6 mx-auto grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {teams.map((t) => {
        const groupNo =
          (t as any).groupNo ??
          (typeof t.id === "string"
            ? Number(/^kel(\d+)$/i.exec(t.id)?.[1]) || undefined
            : undefined);

        const members = t.members?.length ? t.members : [];

        return (
          <div
            key={t.id}
            className="w-[360px] rounded-2xl border border-red-200 bg-white/92 backdrop-blur-[2px] shadow p-6"
          >
            {/* Judul & subjudul tengah */}
            <div className="text-center">
              <div className="font-extrabold text-red-700 leading-tight"
                   style={{ fontSize: "clamp(18px, 2.1vw, 22px)" }}>
                {t.name}
              </div>
              {groupNo ? (
                <div className="mt-0.5 text-neutral-800"
                     style={{ fontSize: "clamp(13px, 1.6vw, 15px)" }}>
                  Kelompok {groupNo}
                </div>
              ) : null}
            </div>

            {/* Daftar anggota: 2 kolom, agak besar, bukan bold */}
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1">
              {members.length ? (
                members.map((m, i) => (
                  <div
                    key={i}
                    className="text-neutral-900 whitespace-normal break-words"
                    style={{ fontSize: "clamp(14px, 1.8vw, 17px)" }}
                  >
                    {m}
                  </div>
                ))
              ) : (
                <div className="col-span-2 italic text-black/50"
                     style={{ fontSize: "clamp(14px, 1.6vw, 16px)" }}>
                  Belum ada anggota
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
