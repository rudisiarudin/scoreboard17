// src/components/SpinWheel.tsx
import { useMemo } from "react";
import type { CSSProperties } from "react";
import type { Team, WheelState } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;

  teams: Team[];
  wheel: WheelState | null | undefined;

  readonly?: boolean;                      // audience = true
  onGenerate?: (seed: number) => void;     // buat urutan penuh
  onAdvance?: () => void;                  // ke urutan berikutnya
  onReset?: () => void;                    // hapus wheel
};

function getGroupNo(t: Team): number | undefined {
  if (typeof t.groupNo === "number") return t.groupNo;
  if (typeof t.id === "string") {
    const m = /^kel(\d+)$/i.exec(t.id);
    if (m) return Number(m[1]) || undefined;
  }
  return undefined;
}

export default function SpinWheel({
  open,
  onClose,
  teams,
  wheel,
  readonly = false,
  onGenerate,
  onAdvance,
  onReset,
}: Props) {
  if (!open) return null;

  const mapTeam = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const queueTeams = useMemo(
    () => (wheel?.queueIds ?? []).map((id) => mapTeam.get(id)).filter(Boolean) as Team[],
    [wheel?.queueIds, mapTeam]
  );
  const currentTeam =
    wheel && wheel.queueIds[wheel.activeIndex]
      ? mapTeam.get(wheel.queueIds[wheel.activeIndex]!)
      : null;

  // tampilan roda statis (visual ring)
  const n = Math.max(queueTeams.length || teams.length, 1);
  const seg = 360 / n;
  const cx = 160, cy = 160, r = 140;

  const toRad = (a: number) => (a - 90) * (Math.PI / 180);
  const arcPath = (start: number, end: number) => {
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const labelStyle: CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    fill: "rgba(0,0,0,0.7)",
    textAnchor: "middle",
    dominantBaseline: "middle",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* modal */}
      <div className="relative z-[61] w-[min(92vw,920px)] max-w-[920px] rounded-2xl bg-white shadow-2xl border border-red-200 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="font-bold text-red-700">Spin Wheel — Urutan Penampilan Yel-Yel</div>
          <div className="flex items-center gap-2">
            {!readonly && wheel && (
              <button
                onClick={onReset}
                className="px-3 py-1.5 rounded-xl border bg-white hover:bg-red-50 text-red-700 border-red-200"
              >
                Reset
              </button>
            )}
            <button onClick={onClose} className="px-3 py-1.5 rounded-xl border bg-white hover:bg-red-50 text-red-700 border-red-200">
              Tutup
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
          {/* roda visual */}
          <div className="relative mx-auto">
            <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 z-10">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[18px] border-l-transparent border-r-transparent border-b-red-600 drop-shadow" />
            </div>

            <svg viewBox="0 0 320 320" width={320} height={320} className="drop-shadow">
              <defs>
                <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.25" />
                </filter>
              </defs>

              <circle cx={cx} cy={cy} r={r + 1} fill="#fff" filter="url(#soft)" />

              <g transform={`translate(0 0)`}>
                {(queueTeams.length ? queueTeams : teams).map((t, i) => {
                  const start = i * seg;
                  const end = start + seg;
                  const mid = start + seg / 2;
                  const labelR = r * 0.65;
                  const lx = cx + labelR * Math.cos(toRad(mid));
                  const ly = cy + labelR * Math.sin(toRad(mid));
                  const isFirst = !!wheel && i === 0;

                  return (
                    <g key={t.id}>
                      <path
                        d={arcPath(start, end)}
                        fill={t.color || "#F1F5F9"}
                        stroke={isFirst ? "#ef4444" : "#fff"}
                        strokeWidth={isFirst ? 3 : 2}
                      />
                      <text x={lx} y={ly} style={labelStyle} transform={`rotate(${mid}, ${lx}, ${ly})`}>
                        {t.name}
                      </text>
                    </g>
                  );
                })}
              </g>

              <circle cx={cx} cy={cy} r={26} fill="#fff" stroke="#fecaca" strokeWidth={2} />
              <circle cx={cx} cy={cy} r={8} fill="#ef4444" />
            </svg>

            {!readonly && (
              <div className="mt-3 flex items-center justify-center gap-2">
                {!wheel ? (
                  <button
                    onClick={() => onGenerate?.(((Math.random() * 2 ** 31) ^ Date.now()) >>> 0)}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white shadow hover:bg-red-700"
                  >
                    Buat Urutan (Putar Semua)
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onAdvance}
                      disabled={wheel.activeIndex >= (wheel.queueIds.length - 1)}
                      className={`px-4 py-2 rounded-xl text-white shadow ${
                        wheel.activeIndex >= (wheel.queueIds.length - 1)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      Berikutnya
                    </button>
                    <button
                      onClick={onReset}
                      className="px-4 py-2 rounded-xl border bg-white hover:bg-red-50 text-red-700 border-red-200"
                    >
                      Reset Urutan
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* panel kanan */}
          <div className="flex flex-col gap-4">
            {/* Urutan Penampilan */}
            <div>
              <div className="text-xs uppercase tracking-wide text-black/60">Urutan Penampilan</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(queueTeams.length ? queueTeams : teams).map((t, i) => {
                  const isCurrent = !!wheel && i === wheel.activeIndex;
                  const no = getGroupNo(t);
                  return (
                    <span
                      key={t.id}
                      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${isCurrent ? "bg-red-50 border-red-200" : "bg-white"}`}
                      style={{ borderColor: isCurrent ? "#fecaca" : "#e5e7eb", color: isCurrent ? "#b91c1c" : "#374151" }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="font-semibold tabular-nums">#{i + 1}</span>
                      <span>{t.name}{no ? ` (Kelompok ${no})` : ""}</span>
                      {isCurrent ? <span className="ml-1 text-[10px] text-red-700">· sekarang</span> : null}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Kelompok sekarang (roster) */}
            {currentTeam && (
              <div className="mt-1">
                <div className="text-xs uppercase tracking-wide text-black/60 text-center">Kelompok Dimulai</div>
                <div className="mt-2 rounded-xl border border-red-200 bg-white p-3">
                  <div className="text-center">
                    <div className="text-lg font-extrabold" style={{ color: currentTeam.color }}>
                      {currentTeam.name}
                    </div>
                    {(() => {
                      const gn = getGroupNo(currentTeam);
                      return gn ? <div className="text-[12px] text-black/60">Kelompok {gn} · Urutan #{(wheel?.activeIndex ?? 0) + 1}</div> : null;
                    })()}
                  </div>

                  {Array.isArray(currentTeam.members) && currentTeam.members.length > 0 && (
                    <div className="mt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[15px] leading-6">
                        {currentTeam.members.map((m, i) => (
                          <div key={i} className="truncate">{m}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between">
          <div className="text-[11px] text-black/50">
            Urutan dibuat sekali (deterministik dengan seed) agar identik di semua device.
          </div>
          {!readonly && wheel && wheel.activeIndex >= (wheel.queueIds.length - 1) && (
            <button onClick={onReset} className="px-3 py-1.5 rounded-xl bg-red-600 text-white shadow hover:bg-red-700">
              Selesai (Tutup & Bersihkan)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
