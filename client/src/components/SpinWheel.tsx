import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Team } from "@/types";

type PendingSpin =
  | {
      targetIndex: number; // index di QUEUE (urutan hasil)
      startedAt: number;
      durationMs: number;
      nonce?: number;
    }
  | null;

type WheelState =
  | {
      seed: number;
      queueIds: string[]; // urutan hasil (diacak saat reset)
      activeIndex: number; // index terakhir di QUEUE, -1 = belum ada hasil
      isOpen: boolean;
      pendingSpin: PendingSpin;
    }
  | null;

export default function SpinWheel({
  open,
  onClose,
  teams,
  wheel,
  readonly,
  onGenerate,
  onSpin,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  teams: Team[];
  wheel: WheelState;
  readonly: boolean;
  onGenerate: (seed?: number) => void;
  onSpin: () => void;
  onReset: () => void;
}) {
  if (!open || !wheel) return null;

  // === 1) PISAHKAN URUTAN TAMPIL (display) vs URUTAN HASIL (queue) ===
  const displayIds = useMemo(() => teams.map((t) => t.id), [teams]); // roda digambar pakai ini (stabil)
  const queueIds = wheel.queueIds?.length ? wheel.queueIds : displayIds; // hasil keluar mengikuti ini (acak saat reset)

  const N = Math.max(1, displayIds.length);
  const STEP = 360 / N;

  const byId = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams]);

  // berapa banyak hasil yang sudah keluar (berdasar QUEUE)
  const revealedCount = Math.max(0, (wheel.activeIndex ?? -1) + 1);
  const revealedIds = queueIds.slice(0, revealedCount);

  const isSpinning = !!wheel.pendingSpin;

  // === 2) MAP index QUEUE -> index DISPLAY untuk rotasi roda ===
  const qIdxToDisplayIdx = (qIdx: number) => {
    const id = queueIds[qIdx];
    const di = displayIds.indexOf(id);
    return di >= 0 ? di : 0;
  };

  const currentQIdx = Math.max(-1, wheel.activeIndex ?? -1);
  const currentDisplayIdx = currentQIdx >= 0 ? qIdxToDisplayIdx(currentQIdx) : -1;

  const targetDisplayIdx = isSpinning
    ? qIdxToDisplayIdx(wheel.pendingSpin!.targetIndex)
    : currentDisplayIdx;

  // ====== ALIGNMENT: pusat irisan tepat di panah (12 o’clock) ======
  const angleForDisplayIndex = (idx: number) => -(idx * STEP + STEP / 2);

  const fromRot = currentDisplayIdx < 0 ? 0 : angleForDisplayIndex(currentDisplayIdx);
  const toRotBase = targetDisplayIdx < 0 ? 0 : angleForDisplayIndex(targetDisplayIdx);
  const toRot = isSpinning ? toRotBase - 360 * 5 : toRotBase; // 5 putaran penuh

  const durSec = isSpinning ? (wheel.pendingSpin!.durationMs ?? 4200) / 1000 : 0.001;

  function GroupPill({ idx, id, now }: { idx: number; id: string; now?: boolean }) {
    const t = byId[id];
    const no =
      (t as any)?.groupNo ??
      (typeof t?.id === "string" ? Number(/^kel(\d+)$/i.exec(t.id)?.[1]) || undefined : undefined);
    const dot = ["#ef4444", "#10b981", "#3b82f6", "#f59e0b", "#a78bfa", "#22c55e"][idx % 6];
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs bg-white ${
          now ? "border-red-300 text-red-700" : "border-neutral-200 text-neutral-700"
        }`}
      >
        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
        <span className="opacity-70">#{idx + 1}</span>
        <span className="font-medium">{no ? `Kelompok ${no}` : t?.name ?? "Kelompok"}</span>
        {now ? <span className="ml-1 text-[11px] text-red-600">– sekarang</span> : null}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full max-w-[1120px] mx-3 rounded-2xl bg-white shadow-2xl border border-red-200">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="font-semibold text-red-700">Spin Wheel — Urutan Penampilan Yel-Yel</div>
          <div className="flex items-center gap-2">
            {!readonly && (
              <button
                onClick={onReset}
                className="px-3 py-1.5 rounded-xl border border-red-200 bg-white text-red-700 hover:bg-red-50"
              >
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50"
              disabled={readonly}
            >
              Tutup
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[520px_1fr] gap-6 p-6">
          {/* roda */}
          <div className="relative mx-auto">
            {/* PANAH — runcing keluar */}
            <div className="absolute left-1/2 -top-2 -translate-x-1/2 z-20">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-red-600 drop-shadow" />
            </div>

            <motion.div
              key={`wheel-${wheel.pendingSpin?.nonce ?? "idle"}-${wheel.activeIndex ?? -1}`}
              className="relative w-[420px] h-[420px] rounded-full shadow-xl border-[6px] border-white overflow-hidden"
              animate={{ rotate: toRot }}
              initial={{ rotate: fromRot }}
              transition={{ duration: durSec, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: "transform" }}
            >
              {/* BACKGROUND: offset STEP/2 supaya warna pas di tengah label */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: buildWheelBackground(N),
                  transform: `rotate(${STEP / 2}deg)`,
                }}
              />

              {/* label irisan — digambar pakai DISPLAY order */}
              {displayIds.map((id, i) => {
                const t = byId[id];
                const no =
                  (t as any).groupNo ??
                  (typeof t?.id === "string"
                    ? Number(/^kel(\d+)$/i.exec(t.id)?.[1]) || undefined
                    : undefined);

                const centerDeg = i * STEP + STEP / 2; // 0° di atas
                const r = 140;
                const x = 210 + r * Math.sin((centerDeg * Math.PI) / 180);
                const y = 210 - r * Math.cos((centerDeg * Math.PI) / 180);

                return (
                  <div
                    key={id}
                    className="absolute"
                    style={{
                      left: x,
                      top: y,
                      transform: `translate(-50%,-50%)`,
                      width: 130,
                      textAlign: "center",
                    }}
                  >
                    <div className="text-[14px] md:text-[15px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] tracking-wide">
                      {no ? `Kelompok ${no}` : t?.name ?? "Kelompok"}
                    </div>
                  </div>
                );
              })}

              {/* center */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-red-200 shadow-inner" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full shadow" />
            </motion.div>

            {!readonly && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={onSpin}
                  disabled={
                    isSpinning || displayIds.length === 0 || (wheel.activeIndex ?? -1) >= queueIds.length - 1
                  }
                  className="px-4 py-2 rounded-xl border border-red-300 bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
                >
                  Putar Lagi
                </button>
                <button
                  onClick={() => onGenerate(Date.now())}
                  disabled={isSpinning}
                  className="px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-40"
                >
                  Reset Undian
                </button>
              </div>
            )}
            <div className="mt-3 text-center text-[11px] text-black/60">
              Urutan akan tampil <b>setelah roda berhenti</b>.
            </div>
          </div>

          {/* hasil + roster */}
          <RightPane
            byId={byId}
            isSpinning={isSpinning}
            revealedIds={revealedIds}
            readonly={readonly}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}

/* ===== Right Pane kecil (biar file ringkas) ===== */
function RightPane({
  byId,
  revealedIds,
  isSpinning,
  readonly,
  onClose,
}: {
  byId: Record<string, Team | undefined>;
  revealedIds: string[];
  isSpinning: boolean;
  readonly: boolean;
  onClose: () => void;
}) {
  function splitMembers(list: string[], cols: number) {
    const per = Math.ceil(list.length / cols) || 1;
    const out: string[][] = [];
    for (let i = 0; i < cols; i++) out.push(list.slice(i * per, (i + 1) * per));
    return out;
  }

  return (
    <div className="space-y-4">
      <div className="text-[13px] font-semibold text-neutral-700">Hasil Undian</div>
      <div className="flex flex-wrap gap-2">
        {revealedIds.length === 0 ? (
          <span className="text-xs text-black/50">Belum ada — silakan putar roda.</span>
        ) : (
          revealedIds.map((id, idx) => {
            const dot = ["#ef4444", "#10b981", "#3b82f6", "#f59e0b", "#a78bfa", "#22c55e"][idx % 6];
            const t = byId[id];
            const no =
              (t as any)?.groupNo ??
              (typeof t?.id === "string" ? Number(/^kel(\d+)$/i.exec(t!.id)?.[1]) || undefined : undefined);
            const now = idx === revealedIds.length - 1 && !isSpinning;
            return (
              <div
                key={id}
                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs bg-white ${
                  now ? "border-red-300 text-red-700" : "border-neutral-200 text-neutral-700"
                }`}
              >
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
                <span className="opacity-70">#{idx + 1}</span>
                <span className="font-medium">{no ? `Kelompok ${no}` : t?.name ?? "Kelompok"}</span>
                {now ? <span className="ml-1 text-[11px] text-red-600">– sekarang</span> : null}
              </div>
            );
          })
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="px-4 py-3 border-b text-[13px] text-neutral-700 font-semibold">Kelompok Dimulai</div>
        <div className="p-4">
          {revealedIds.length === 0 ? (
            <div className="text-sm text-black/60">Belum ada hasil.</div>
          ) : (
            (() => {
              const currentId = revealedIds[revealedIds.length - 1];
              const t = byId[currentId];
              const no =
                (t as any)?.groupNo ??
                (typeof t?.id === "string" ? Number(/^kel(\d+)$/i.exec(t!.id)?.[1]) || undefined : undefined);
              const cols = splitMembers(t?.members ?? [], 2);
              return (
                <div>
                  <div className="text-center text-red-700 font-bold text-lg">
                    {no ? `Kelompok ${no}` : t?.name ?? "Kelompok"}
                  </div>
                  <div className="text-center text-[11px] text-black/60 mb-3">Urutan #{revealedIds.length}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1 text-[14px]">
                    {cols.map((col, i) => (
                      <div key={i} className="space-y-1">
                        {col.map((m, j) => (
                          <div key={j}>{m}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>

      {!readonly && (
        <div className="pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow disabled:opacity-40"
            disabled={isSpinning}
          >
            Selesai (Tutup & Bersihkan)
          </button>
        </div>
      )}
    </div>
  );
}

/* ===== helpers ===== */
function buildWheelBackground(n: number) {
  const colors = ["#22c55e", "#6366f1", "#ef4444", "#10b981", "#a855f7", "#f59e0b"];
  const seg = 360 / n;
  const stops: string[] = [];
  for (let i = 0; i < n; i++) {
    const c = colors[i % colors.length];
    const a0 = i * seg;
    const a1 = (i + 1) * seg;
    stops.push(`${c} ${a0}deg ${a1}deg`);
  }
  // 0° di atas (sinkron dengan posisi label); offset setengah langkah diberikan di layer background
  return `conic-gradient(from -90deg, ${stops.join(",")})`;
}
